import 'dotenv/config';
import process from 'node:process';

console.log("--- Variáveis de Ambiente Carregadas (do .env global) ---");
console.log("GEMINI_API_KEY_FROM_ENV:", process.env.GEMINI_API_KEY);
console.log("PORT_FROM_ENV:", process.env.PORT);
console.log("FRONTEND_URL_FROM_ENV:", process.env.FRONTEND_URL);
console.log("-------------------------------------------------------");

const {
    PORT = 3001,
    GEMINI_API_KEY,
    FRONTEND_URL,
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_REDIRECT_URI,
    SESSION_SECRET = 'fallback_secret_backend_default',
    NODE_ENV = 'development',
    MOCK_TWITCH_FOLLOW_API: MOCK_TWITCH_FOLLOW_API_ENV = 'false',
    MOCK_FOLLOW_RESULT: MOCK_FOLLOW_RESULT_ENV = 'false',
    NEWS_API_KEY
} = process.env;

const IS_PRODUCTION = NODE_ENV === 'production';
const MOCK_TWITCH_FOLLOW_API = MOCK_TWITCH_FOLLOW_API_ENV.toLowerCase() === 'true';
const MOCK_FOLLOW_RESULT = MOCK_FOLLOW_RESULT_ENV.toLowerCase() === 'true';

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
    process.exit(1);
}

if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET || !TWITCH_REDIRECT_URI) {
    console.error("FATAL ERROR: Twitch environment variables (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI) are not defined in .env file.");
    process.exit(1);
}

if (!FRONTEND_URL) {
    console.warn("Warning: FRONTEND_URL not set in .env, CORS might block requests from frontend.");
}
if (SESSION_SECRET === 'fallback_secret_please_change') {
    console.warn("-------------------------------------------------------------------");
    console.warn("WARNING: SESSION_SECRET is not set in .env or uses the default.");
    console.warn("         Session management will be insecure. Set a strong secret!");
    console.warn("-------------------------------------------------------------------");
}
if (MOCK_TWITCH_FOLLOW_API) {
    console.warn("***********************************************************");
    console.warn("*** WARNING: Twitch follow API is being MOCKED!         ***");
    console.warn(`*** Mocked Follow Result: ${MOCK_FOLLOW_RESULT}         ***`);
    console.warn("***********************************************************");
}

export default {
    port: PORT,
    geminiApiKey: GEMINI_API_KEY,
    frontendUrl: FRONTEND_URL,
    twitch: {
        clientId: TWITCH_CLIENT_ID,
        clientSecret: TWITCH_CLIENT_SECRET,
        redirectUri: TWITCH_REDIRECT_URI,
        mockApi: MOCK_TWITCH_FOLLOW_API,
        mockResult: MOCK_FOLLOW_RESULT,
    },
    sessionSecret: SESSION_SECRET,
    nodeEnv: NODE_ENV,
    isProduction: IS_PRODUCTION,
    newsApiKey: NEWS_API_KEY,
};