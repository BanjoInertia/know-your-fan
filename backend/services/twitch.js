import axios from 'axios';
import config from '../backend/config/index.js';

const TWITCH_API_BASE = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_BASE = 'https://id.twitch.tv/oauth2';

function getTwitchApiHeaders(accessToken) {
    return {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': config.twitch.clientId
    };
}

async function getTwitchUserId(username, accessToken) {
    try {
        console.log(`[Twitch Service] Fetching Twitch ID for username: ${username}`);
        const response = await axios.get(`${TWITCH_API_BASE}/users?login=${username}`, {
            headers: getTwitchApiHeaders(accessToken)
        });

        const user = response.data?.data?.[0];
        if (user) {
            console.log(`[Twitch Service] Found Twitch ID: ${user.id} for username: ${username}`);
            return user.id;
        } else {
            console.error(`[Twitch Service] Twitch user not found for username: ${username}`);
            return null;
        }
    } catch (error) {
        console.error(`[Twitch Service] Error fetching Twitch user ID for ${username}:`, error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.error("[Twitch Service] The user access token might be expired or invalid during ID fetch.");
        }
        return null;
    }
}

async function refreshTwitchToken(req) {
    const refreshToken = req.session?.twitchTokens?.refresh_token;
    if (!refreshToken) {
        console.error("[Twitch Service] Attempted to refresh token, but no refresh_token found in session.");
        return false;
    }

    console.log("[Twitch Service] Attempting to refresh Twitch token...");
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.twitch.clientId,
        client_secret: config.twitch.clientSecret,
    });

    try {
        const response = await axios.post(`${TWITCH_AUTH_BASE}/token`, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        req.session.twitchTokens = { access_token, refresh_token, expires_in };

        await new Promise(resolve => {
            req.session.save(saveErr => {
                if (saveErr) {
                    console.error("[Twitch Service] Error saving session after token refresh:", saveErr);
                }
                console.log("[Twitch Service] Successfully refreshed Twitch tokens and saved to session.");
                resolve();
            });
        });
        return true;

    } catch (err) {
        console.error("[Twitch Service] Error refreshing Twitch token:", err.response?.data || err.message);
        if (err.response?.status === 400 || err.response?.status === 401) {
            req.session.twitchTokens = null;
            req.session.twitchUserId = null;
            try {
                await new Promise(resolve => {
                    req.session.save(saveErr => {
                        if (saveErr) {
                           console.error("[Twitch Service] Error saving session after clearing invalid tokens:", saveErr);
                        }
                        console.log("[Twitch Service] Cleared invalid Twitch tokens from session due to refresh failure.");
                        resolve();
                    });
                });
            } catch (saveError) {
                 console.error("[Twitch Service] Critical error during session save after clearing invalid tokens:", saveError);
            }
        }
        return false;
    }
}

async function performTwitchFollowCheck(req, targetChannelName) {
    const loggedInUserId = req.session.twitchUserId;
    const accessToken = req.session.twitchTokens.access_token;

    console.log(`[Twitch Service] Attempting follow check: User ${loggedInUserId} -> Channel ${targetChannelName}`);

    if (config.twitch.mockApi) {
        console.warn(`[Twitch Service] MOCKING Twitch API response for /users/follows.`);
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log(`[Twitch Service] MOCK RESULT: User follows = ${config.twitch.mockResult}`);
        return { follows: config.twitch.mockResult };
    }

    console.log(`[Twitch Service] Attempting REAL Twitch API call...`);
    try {
        const targetChannelId = await getTwitchUserId(targetChannelName, accessToken);
        if (!targetChannelId) {
            console.error(`[Twitch Service] Could not find Twitch ID for channel: ${targetChannelName}`);
            const error = new Error(`Canal Twitch "${targetChannelName}" não encontrado.`);
            error.statusCode = 404;
            throw error;
        }
        console.log(`[Twitch Service] Found Target Channel ID: ${targetChannelId}`);

        console.log(`[Twitch Service] Calling REAL Twitch API: /users/follows?from_id=${loggedInUserId}&to_id=${targetChannelId}`);
        const followResponse = await axios.get(`${TWITCH_API_BASE}/users/follows`, {
            params: { from_id: loggedInUserId, to_id: targetChannelId },
            headers: getTwitchApiHeaders(accessToken)
        });

        const follows = followResponse.data?.total === 1;
        console.log(`[Twitch Service] REAL Twitch API Success. User follows: ${follows} (Total: ${followResponse.data?.total})`);
        return { follows: follows };

    } catch (error) {
        console.error("[Twitch Service] Error during REAL performTwitchFollowCheck:", error.message);
        if (axios.isAxiosError(error) && error.response) {
            console.error("[Twitch Service] REAL Twitch API Error Status:", error.response.status);
            console.error("[Twitch Service] REAL Twitch API Error Data:", error.response.data);
            const apiError = new Error(error.response.data?.message || `Twitch API Error ${error.response.status}`);
            apiError.statusCode = error.response.status;
            throw apiError;
        } else {
            console.error("[Twitch Service] Non-API Error during REAL follow check:", error);
            const genericError = new Error('Erro interno ao contatar a API da Twitch.');
            genericError.statusCode = 500;
            throw genericError;
        }
    }
}

async function getTwitchUserInfo(accessToken) {
    try {
        console.log("[Twitch Service] Attempting GET to Twitch for user info...");
        const userInfoResponse = await axios.get(`${TWITCH_API_BASE}/users`, {
            headers: getTwitchApiHeaders(accessToken)
        });
        console.log("[Twitch Service] User info fetch SUCCESS.");
        const twitchUser = userInfoResponse.data?.data?.[0];

        if (!twitchUser || !twitchUser.id || !twitchUser.login) {
            console.error("[Twitch Service] Unexpected structure in Twitch user info response:", userInfoResponse.data);
            throw new Error("Failed to retrieve valid user information from Twitch.");
        }
        return twitchUser;
    } catch (error) {
        console.error("[Twitch Service] Error fetching Twitch User Info:", error.response?.data || error.message);
         const serviceError = new Error(error.response?.data?.message || "Failed to fetch user info from Twitch");
         serviceError.statusCode = error.response?.status || 500;
         throw serviceError;
    }
}

async function exchangeCodeForTokens(code) {
     const tokenUrl = `${TWITCH_AUTH_BASE}/token`;
     const params = new URLSearchParams({
         client_id: config.twitch.clientId,
         client_secret: config.twitch.clientSecret,
         code: code,
         grant_type: 'authorization_code',
         redirect_uri: config.twitch.redirectUri,
     });

     try {
         console.log("[Twitch Service] Attempting POST to Twitch for token exchange...");
         const tokenResponse = await axios.post(tokenUrl, params, {
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         });
         console.log("[Twitch Service] Token exchange SUCCESS.");
         const { access_token, refresh_token, expires_in } = tokenResponse.data;

         if (!access_token) {
             console.error("[Twitch Service] Access token missing in Twitch response!");
             throw new Error("Twitch did not return an access token during code exchange.");
         }
         return { access_token, refresh_token, expires_in };
     } catch (error) {
        console.error("[Twitch Service] Error during token exchange:", error.response?.data || error.message);
        const serviceError = new Error(error.response?.data?.message || "Failed to exchange code for Twitch tokens");
        serviceError.statusCode = error.response?.status || 500;
        throw serviceError;
     }
}

export {
    getTwitchUserId,
    refreshTwitchToken,
    performTwitchFollowCheck,
    getTwitchUserInfo,
    exchangeCodeForTokens
};