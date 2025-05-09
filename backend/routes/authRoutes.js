import express from 'express';
import crypto from 'node:crypto';
import config from '../config/index.js';
import {
    exchangeCodeForTokens,
    getTwitchUserInfo
} from '../services/twitch.js';

const router = express.Router();

router.get('/twitch', (req, res, next) => {
    console.log("-> GET /auth/twitch");
    try {
        const csrfState = crypto.randomBytes(16).toString('hex');
        req.session.twitch_oauth_csrf_state = csrfState;

        req.session.save(err => {
            if (err) {
                console.error("[Auth /twitch] Error saving session before Twitch redirect:", err);
                return res.status(500).send("Failed to initiate Twitch login. Session save error.");
            }

            const twitchAuthUrl = new URL('https://id.twitch.tv/oauth2/authorize');
            twitchAuthUrl.searchParams.append('client_id', config.twitch.clientId);
            twitchAuthUrl.searchParams.append('redirect_uri', config.twitch.redirectUri);
            twitchAuthUrl.searchParams.append('response_type', 'code');
            twitchAuthUrl.searchParams.append('scope', 'user:read:email user:read:follows');
            twitchAuthUrl.searchParams.append('state', csrfState);

            console.log(`[Auth /twitch] Redirecting to Twitch with CSRF state: ${csrfState}`);
            res.redirect(twitchAuthUrl.toString());
        });

    } catch (error) {
        console.error("[Auth /twitch] Unexpected error:", error);
        next(error);
    }
});

router.get('/twitch/callback', async (req, res, next) => {
    console.log("-> GET /auth/twitch/callback (Backend)");
    console.log("[Auth Callback] Query params received from Twitch:", req.query);

    const { code, state: receivedQueryState, error: twitchError, error_description } = req.query;
    const savedSessionCsrfState = req.session?.twitch_oauth_csrf_state;

    if (req.session) {
        req.session.twitch_oauth_csrf_state = null;
    }

    const frontendProfileUrl = new URL(config.frontendUrl);
    frontendProfileUrl.pathname = '/profile';

    if (twitchError) {
        console.error(`[Auth Callback] Error from Twitch: ${twitchError} - ${error_description}`);
        frontendProfileUrl.searchParams.append('twitch_error', encodeURIComponent(error_description || twitchError));
        return req.session.save(() => res.redirect(frontendProfileUrl.toString()));
    }

    if (!receivedQueryState || !savedSessionCsrfState || receivedQueryState !== savedSessionCsrfState) {
        console.error('[Auth Callback] Invalid CSRF state. Received from Twitch:', receivedQueryState, "Expected from session:", savedSessionCsrfState);
        frontendProfileUrl.searchParams.append('twitch_error', 'invalid_state');
        return req.session.save(() => res.redirect(frontendProfileUrl.toString()));
    }

    if (!code) {
        console.error('[Auth Callback] Missing authorization code.');
        frontendProfileUrl.searchParams.append('twitch_error', 'missing_code');
        return req.session.save(() => res.redirect(frontendProfileUrl.toString()));
    }

    console.log("[Auth Callback] CSRF state check passed. Proceeding to exchange code for tokens.");

    try {
        const tokens = await exchangeCodeForTokens(code);
        const twitchUser = await getTwitchUserInfo(tokens.access_token);

        req.session.twitchTokens = tokens;
        req.session.twitchUserId = twitchUser.id;
        req.session.twitchLogin = twitchUser.login;
        req.session.twitchAvatarUrl = twitchUser.profile_image_url;

        console.log(`[Auth Callback] Twitch user info (${twitchUser.login}, ID: ${twitchUser.id}) saved to session.`);

        req.session.save(err => {
            if (err) {
                console.error("[Auth Callback] FATAL: Error saving session after fetching Twitch data:", err);
                frontendProfileUrl.searchParams.append('twitch_error', 'session_save_failed');
                return res.redirect(frontendProfileUrl.toString());
            }

            frontendProfileUrl.searchParams.append('twitch_linked', 'true');
            frontendProfileUrl.searchParams.append('twitch_id', twitchUser.id);
            frontendProfileUrl.searchParams.append('twitch_login', twitchUser.login);
            if (twitchUser.profile_image_url) {
                frontendProfileUrl.searchParams.append('twitch_avatar_url', encodeURIComponent(twitchUser.profile_image_url));
            }

            console.log(`[Auth Callback] Successfully processed. Redirecting to: ${frontendProfileUrl.toString()}`);
            res.redirect(frontendProfileUrl.toString());
        });

    } catch (serviceError) {
        console.error("[Auth Callback] Error during token exchange or fetching user info:", serviceError.message, "Status:", serviceError.statusCode);
        frontendProfileUrl.searchParams.append('twitch_error', encodeURIComponent(serviceError.message || 'twitch_processing_failed'));
        req.session.save(() => res.redirect(frontendProfileUrl.toString()));
    }
}); 

router.get('/check-twitch-follow', async (req, res, next) => {
    console.log("-> GET /api/check-twitch-follow");
    console.log(`Session ID: ${req.sessionID}`);

    if (!req.session?.twitchTokens?.access_token || !req.session?.twitchUserId) {
        console.log("Unauthorized: No valid session/tokens OR userId found.");
        return res.status(401).json({ success: false, error: 'Usuário não autenticado ou Twitch não vinculada.' });
    }
    console.log(`Session found for User ID: ${req.session.twitchUserId}`);

    const targetChannelName = req.query.channelName;
    if (!targetChannelName || typeof targetChannelName !== 'string' || targetChannelName.trim() === '') {
        console.log("Bad Request: Target channel name missing or invalid.");
        return res.status(400).json({ success: false, error: 'Nome do canal alvo inválido ou não fornecido.' });
    }
    console.log(`Target Channel Name: ${targetChannelName}`);

    try {
        console.log("First attempt using current token.");
        const result = await performTwitchFollowCheck(req, targetChannelName);
        console.log("First attempt successful.");
        res.json({ success: true, follows: result.follows });

    } catch (error) {
        console.log(`Initial API call failed. Status: ${error.statusCode || 'N/A'}, Message: ${error.message}`);

        if (error.statusCode === 404) {
            console.log("Received 404 (Channel likely not found).");
            return res.status(404).json({ success: false, error: error.message || `Canal Twitch "${targetChannelName}" não encontrado.` });
        }
        if (error.statusCode === 410) {
            console.error("Received 410 Gone from Twitch API.");
            req.session.destroy(err => {
                if (err) console.error("Error destroying session after 410 error:", err);
                return res.status(401).json({ success: false, error: 'A API da Twitch não está mais disponível ou a autorização é inválida. Por favor, vincule novamente.' });
            });
            return;
        }

        if (error.statusCode === 401) {
            console.log("Received 401. Attempting token refresh...");
            try {
                const refreshed = await refreshTwitchToken(req);

                if (refreshed && req.session.twitchTokens?.access_token) {
                    console.log("Token refresh successful. Retrying follow check...");
                    const retryResult = await performTwitchFollowCheck(req, targetChannelName);
                    console.log("Retry successful.");
                    return res.json({ success: true, follows: retryResult.follows });
                } else {
                    console.error("Token refresh failed or resulted in no valid token.");
                    return res.status(401).json({ success: false, error: 'Falha ao renovar autorização da Twitch. Por favor, vincule novamente.' });
                }
            } catch (refreshOrRetryError) {
                console.error("Error checking follow status AFTER initial 401:", refreshOrRetryError.message);
                if (refreshOrRetryError.statusCode === 410) {
                    req.session.destroy(err => {
                        if (err) console.error("Error destroying session after 410 error:", err);
                        return res.status(401).json({ success: false, error: 'API da Twitch indisponível (após refresh). Vincule novamente.' });
                    });
                }
                if (refreshOrRetryError.statusCode === 404) {
                    return res.status(404).json({ success: false, error: refreshOrRetryError.message || `Canal ${targetChannelName} não encontrado (após refresh).` });
                }
                next(refreshOrRetryError);
            }
        } else {
            console.error("Unhandled error during initial follow check:", error);
            next(error);
        }
    }
});


export default router;