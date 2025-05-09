import express from 'express';
import crypto from 'node:crypto';
import config from '../config/index.js';
import {
    refreshTwitchToken,
    performTwitchFollowCheck,
    getTwitchUserInfo,
    exchangeCodeForTokens
} from '../services/twitch.js';

const router = express.Router();

router.get('/twitch', (req, res, next) => {
    console.log("-> GET /auth/twitch");
    try {
        const twitchScopes = 'user:read:email user:read:follows';
        const csrfState = crypto.randomBytes(16).toString('hex');
        req.session.oauth_state_csrf = csrfState;

        req.session.save(err => {
            if (err) {
                console.error("Error saving session before Twitch auth redirect:", err);
                return res.status(500).send("Failed to initiate Twitch login. Please try again.");
            }

            const authorizationUrl = new URL('https://id.twitch.tv/oauth2/authorize');
            authorizationUrl.searchParams.append('client_id', config.twitch.clientId);
            authorizationUrl.searchParams.append('redirect_uri', config.twitch.redirectUri);
            authorizationUrl.searchParams.append('response_type', 'code');
            authorizationUrl.searchParams.append('scope', twitchScopes);
            authorizationUrl.searchParams.append('state', csrfState);

            console.log(`Redirecting to Twitch for authorization with CSRF state: ${csrfState} and return path in session: ${originalFrontendPath}`);
            res.redirect(authorizationUrl.toString());
        });
    } catch (error) {
        console.error("Unexpected error in /auth/twitch route:", error);
        next(error);
    }
});

router.get('/twitch/callback', async (req, res, next) => {
    console.log("-> GET /auth/twitch/callback");
    console.log("Callback Query:", req.query);
    const { code, state: receivedCsrfState, error: twitchError, error_description } = req.query;
    const savedCsrfState = req.session?.oauth_state_csrf;

    const frontendReturnPath = '/profile';

    if (req.session) {
        req.session.oauth_state_csrf = null;
    }

    if (twitchError) {
        console.error(`Twitch Auth Error (Callback): ${twitchError} - ${error_description}`);
        const errorRedirectUrl = new URL(config.frontendUrl);
        errorRedirectUrl.pathname = frontendReturnPath;
        errorRedirectUrl.searchParams.append('twitch_error', encodeURIComponent(error_description || twitchError));
        return res.redirect(errorRedirectUrl.toString());
    }

    if (!receivedCsrfState || !savedCsrfState || receivedCsrfState !== savedCsrfState) {
        console.error('Invalid CSRF state parameter. Received:', receivedCsrfState, "Expected:", savedCsrfState);
        const errorRedirectUrl = new URL(config.frontendUrl);
        errorRedirectUrl.pathname = frontendReturnPath;
        errorRedirectUrl.searchParams.append('twitch_error', 'invalid_state');
        return req.session.save(err => {
            if (err) console.error("Error saving session after clearing invalid state:", err);
            res.redirect(errorRedirectUrl.toString());
        });
    }

    if (!code) {
        console.error('Missing authorization code in Twitch callback.');
        const errorRedirectUrl = new URL(config.frontendUrl);
        errorRedirectUrl.pathname = frontendReturnPath;
        errorRedirectUrl.searchParams.append('twitch_error', 'missing_code');
        return req.session.save(err => {
            if (err) console.error("Error saving session after missing code:", err);
            res.redirect(errorRedirectUrl.toString());
        });
    }
    console.log("CSRF State check passed. Proceeding...");

    try {
        const tokens = await exchangeCodeForTokens(code);

        const twitchUser = await getTwitchUserInfo(tokens.access_token);

        req.session.twitchTokens = tokens;
        req.session.twitchUserId = twitchUser.id;
        req.session.twitchLogin = twitchUser.login;
        req.session.twitchAvatarUrl = twitchUser.profile_image_url;

        req.session.save(err => {
            if (err) {
                console.error("----- FATAL ERROR: Failed to save session in /auth/twitch/callback -----", err);
                const errorRedirectUrl = new URL(config.frontendUrl);
                errorRedirectUrl.pathname = frontendReturnPath;
                errorRedirectUrl.searchParams.append('twitch_error', 'session_save_failed');
                return res.redirect(errorRedirectUrl.toString());
            }

            console.log(`Session SAVED successfully. SID: ${req.sessionID}`);
            console.log("Preparing SUCCESS redirect to Frontend...");

            const redirectUrl = new URL(config.frontendUrl);
            redirectUrl.pathname = frontendReturnPath;

            redirectUrl.searchParams.append('twitch_linked', 'true');
            redirectUrl.searchParams.append('twitch_id', twitchUser.id);
            redirectUrl.searchParams.append('twitch_login', twitchUser.login);
            if (twitchUser.profile_image_url) {
                redirectUrl.searchParams.append('twitch_avatar_url', twitchUser.profile_image_url);
            }
            res.redirect(redirectUrl.toString());
            console.log("----- TWITCH CALLBACK SUCCESS REDIRECT SENT -----");
        });

    } catch (serviceError) {
        console.error("----- ERROR in Twitch Callback TRY block (from Service) -----");
        console.error("Error details:", serviceError.message, "Status:", serviceError.statusCode);
        const errorMessage = serviceError.message || 'twitch_callback_failed';

        const errorRedirectUrl = new URL(config.frontendUrl);
        errorRedirectUrl.pathname = frontendReturnPath;
        errorRedirectUrl.searchParams.append('twitch_error', encodeURIComponent(errorMessage));

        req.session.save(saveErr => {
            if (saveErr) console.error("Error saving session during error handling in callback:", saveErr);
            res.redirect(errorRedirectUrl.toString());
            console.log("----- TWITCH CALLBACK ERROR REDIRECT SENT TO:", errorRedirectUrl.toString(), "-----");
        });
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