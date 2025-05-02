// import 'dotenv/config';
// import process from 'node:process';
// import crypto from 'node:crypto';
// import express from 'express';
// import multer from 'multer';
// import cors from 'cors';
// import session from 'express-session';
// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
// import axios from 'axios';
// import * as cheerio from 'cheerio';

// // --- Environment Variables & Configuration ---

// const {
//     PORT = 3001,
//     GEMINI_API_KEY,
//     FRONTEND_URL,
//     TWITCH_CLIENT_ID,
//     TWITCH_CLIENT_SECRET,
//     TWITCH_REDIRECT_URI,
//     SESSION_SECRET = 'fallback_secret',
//     NODE_ENV,
//     MOCK_TWITCH_FOLLOW_API: MOCK_TWITCH_FOLLOW_API_ENV = 'true',
//     MOCK_FOLLOW_RESULT: MOCK_FOLLOW_RESULT_ENV = 'true'
// } = process.env;

// const MOCK_TWITCH_FOLLOW_API = MOCK_TWITCH_FOLLOW_API_ENV.toLowerCase() === 'true';
// const MOCK_FOLLOW_RESULT = MOCK_FOLLOW_RESULT_ENV.toLowerCase() === 'true';

// if (!GEMINI_API_KEY) {
//     console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env file.");
//     process.exit(1);
// }

// if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET || !TWITCH_REDIRECT_URI) {
//     console.error("FATAL ERROR: Twitch environment variables (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI) are not defined in .env file.");
//     process.exit(1);
// }
// if (!FRONTEND_URL) {
//     console.warn("Warning: FRONTEND_URL not set in .env, CORS might block requests from frontend.");
// }
// if (SESSION_SECRET === 'fallback_secret') {
//     console.warn("Warning: SESSION_SECRET not set, using a default. Session management might be insecure.");
// }
// if (MOCK_TWITCH_FOLLOW_API) {
//     console.warn("***********************************************************");
//     console.warn("*** WARNING: Twitch follow API is being MOCKED!         ***");
//     console.warn(`*** Mocked Follow Result: ${MOCK_FOLLOW_RESULT}                        ***`);
//     console.warn("***********************************************************");
// }


// // --- Express App Initialization ---

// const app = express();

// // --- Middleware Setup ---

// const corsOptions = {
//     origin: FRONTEND_URL,
//     credentials: true,
//     optionsSuccessStatus: 200
// };

// const sessionOptions = {
//     secret: SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true, // Consider setting to false if you only want sessions for logged-in users
//     cookie: {
//         secure: NODE_ENV === 'production', // Use secure cookies in production
//         httpOnly: true, // Prevent client-side JS access
//         sameSite: 'lax', // Good default for CSRF protection
//         maxAge: 24 * 60 * 60 * 1000 // Example: 1 day session expiry
//     }
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(session(sessionOptions));


// // --- Multer Setup (File Uploads) ---

// const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
//         if (allowedTypes.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error('Invalid file type. Only PNG, JPG, or PDF allowed.'), false);
//         }
//     }
// });

// // --- Google Gemini Setup ---

// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// const geminiGenerationConfig = {
//     temperature: 0.2,
//     topK: 32,
//     topP: 1,
//     maxOutputTokens: 4096,
// };

// const geminiSafetySettings = [
//     { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
// ];

// function bufferToGenerativePart(buffer, mimeType) {
//     return {
//         inlineData: {
//             data: buffer.toString("base64"),
//             mimeType
//         },
//     };
// }


// // --- Twitch Helper Functions ---

// async function getTwitchUserId(username, accessToken) {
//     try {
//         console.log(`Fetching Twitch ID for username: ${username}`);
//         const response = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Client-Id': TWITCH_CLIENT_ID
//             }
//         });

//         const user = response.data?.data?.[0];
//         if (user) {
//             console.log(`Found Twitch ID: ${user.id} for username: ${username}`);
//             return user.id;
//         } else {
//             console.error(`Twitch user not found for username: ${username}`);
//             return null;
//         }
//     } catch (error) {
//         console.error(`Error fetching Twitch user ID for ${username}:`, error.response?.data || error.message);
//         if (error.response?.status === 401) {
//             console.error("The user access token might be expired or invalid.");
//         }
//         // Re-throw or handle specific errors if needed, otherwise return null
//         return null;
//     }
// }

// async function refreshTwitchToken(req) {
//     const refreshToken = req.session?.twitchTokens?.refresh_token;
//     if (!refreshToken) {
//         console.error("Attempted to refresh token, but no refresh_token found in session.");
//         return false;
//     }

//     console.log("Attempting to refresh Twitch token...");
//     const params = new URLSearchParams({
//         grant_type: 'refresh_token',
//         refresh_token: refreshToken,
//         client_id: TWITCH_CLIENT_ID,
//         client_secret: TWITCH_CLIENT_SECRET,
//     });

//     try {
//         const response = await axios.post('https://id.twitch.tv/oauth2/token', params, {
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//         });

//         const { access_token, refresh_token, expires_in } = response.data;
//         req.session.twitchTokens = { access_token, refresh_token, expires_in };

//         // Using async/await with session.save() for clarity
//         await new Promise((resolve) => {
//             req.session.save(saveErr => {
//                 if (saveErr) {
//                     console.error("Error saving session after token refresh:", saveErr);
//                     resolve(); // Resolve the promise on success
//                 }
//                 console.log("Successfully refreshed Twitch tokens and saved to session.");
//             });
//         });
//         return true;

//     } catch (err) {
//         console.error("Error refreshing Twitch token:", err.response?.data || err.message);
//         // Clear invalid tokens if refresh fails with auth-related errors
//         if (err.response?.status === 400 || err.response?.status === 401) {
//             req.session.twitchTokens = null;
//             req.session.twitchUserId = null; // Also clear user ID if tokens are invalid
//             try {
//                 await new Promise((resolve) => {
//                     req.session.save(saveErr => {
//                         if (saveErr) console.error("Error saving session after clearing invalid tokens:", saveErr);
//                         // Resolve even if save fails, as the tokens are already cleared in memory
//                         resolve();
//                     });
//                 });
//                 console.log("Cleared invalid Twitch tokens from session due to refresh failure.");
//             } catch (saveError) {
//                 // Handle potential error during session save after clearing
//                 console.error("Critical error during session save after clearing invalid tokens:", saveError);
//             }
//         }
//         return false;
//     }
// }

// async function performTwitchFollowCheck(req, targetChannelName) {
//     const loggedInUserId = req.session.twitchUserId;
//     const accessToken = req.session.twitchTokens.access_token;

//     console.log(`[Backend] Attempting follow check: User ${loggedInUserId} -> Channel ${targetChannelName}`);

//     if (MOCK_TWITCH_FOLLOW_API) {
//         console.warn(`[Backend] MOCKING Twitch API response for /users/follows.`);
//         await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
//         console.log(`[Backend] MOCK RESULT: User follows = ${MOCK_FOLLOW_RESULT}`);
//         return { follows: MOCK_FOLLOW_RESULT }; // Return the data structure expected by the route
//     }

//     console.log(`[Backend] Attempting REAL Twitch API call...`);
//     try {
//         const targetChannelId = await getTwitchUserId(targetChannelName, accessToken);
//         if (!targetChannelId) {
//             console.error(`[Backend] Could not find Twitch ID for channel: ${targetChannelName}`);
//             const error = new Error(`Canal Twitch "${targetChannelName}" não encontrado.`);
//             error.statusCode = 404;
//             throw error;
//         }
//         console.log(`[Backend] Found Target Channel ID: ${targetChannelId}`);

//         console.log(`[Backend] Calling REAL Twitch API: /users/follows?from_id=${loggedInUserId}&to_id=${targetChannelId}`);
//         const followResponse = await axios.get(`https://api.twitch.tv/helix/users/follows`, {
//             params: { from_id: loggedInUserId, to_id: targetChannelId },
//             headers: { 'Authorization': `Bearer ${accessToken}`, 'Client-Id': TWITCH_CLIENT_ID }
//         });

//         const follows = followResponse.data?.total === 1;
//         console.log(`[Backend] REAL Twitch API Success. User follows: ${follows} (Total: ${followResponse.data?.total})`);
//         return { follows: follows };

//     } catch (error) {
//         console.error("[Backend] Error during REAL performTwitchFollowCheck:", error.message);
//         // Enhance error propagation
//         if (axios.isAxiosError(error) && error.response) {
//             console.error("[Backend] REAL Twitch API Error Status:", error.response.status);
//             console.error("[Backend] REAL Twitch API Error Data:", error.response.data);
//             // Create a new error object preserving status code
//             const apiError = new Error(error.response.data?.message || `Twitch API Error ${error.response.status}`);
//             apiError.statusCode = error.response.status;
//             throw apiError; // Throw the enhanced error
//         } else {
//             // Throw a generic error if it's not an Axios error
//             console.error("[Backend] Non-API Error during REAL follow check:", error);
//             const genericError = new Error('Erro interno ao contatar a API da Twitch.');
//             genericError.statusCode = 500; // Assign a default status code
//             throw genericError;
//         }
//     }
// }


// // --- API Endpoints ---

// app.post('/api/validate-document', upload.single('documentFile'), async (req, res) => {
//     console.log("Received request to /api/validate-document");

//     if (!req.file) {
//         console.log("No file uploaded.");
//         return res.status(400).json({ success: false, error: 'No document file uploaded.' });
//     }

//     try {
//         const imagePart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);

//         const prompt = `
//           **Instrução:** Analise a imagem deste documento de identidade brasileiro.
//           1.  **Tipo de Documento:** Identifique (Ex: RG, CNH).
//           2.  **Extração de Texto:** Extraia todo o texto visível.
//           3.  **Nome Completo:** Encontre o nome completo.
//           4.  **Data de Nascimento:** Encontre a data de nascimento no formato DD/MM/AAAA ou DD/MON/YYYY.
//           5.  **CPF (11 dígitos):** Encontre o número do CPF. Procure por um número de 11 dígitos associado à sigla CPF. **Se o texto extraído mostrar 9 dígitos seguidos por /00 (ex: 123456789/00), você DEVE usar '00' como os dois últimos dígitos no formato final.** O formato final DEVE ser XXX.XXX.XXX-XX. Ignore quaisquer outros caracteres após os 11 dígitos ou o padrão /00. Se não encontrar 11 dígitos ou o padrão /00, retorne "Não encontrado".
//           6.  **Considerações:** Avalie clareza e possíveis adulterações.

//             **Exemplo de como tratar o CPF com /00:**
//             Texto Extraído contém: CPF 987654321/00
//             CPF Encontrado: 987.654.321-00

//           **Formato da Resposta Esperada (Use EXATAMENTE este formato):**
//           Tipo: [Tipo Identificado ou Não Identificado]
//           Texto Extraído: [Lista do texto encontrado]
//           Nome Encontrado: [Nome Completo ou "Não encontrado"]
//           Data de Nascimento Encontrada: [Data DD/MM/AAAA ou DD/MON/YYYY ou "Não encontrada"]
//           CPF Encontrado: [CPF XXX.XXX.XXX-XX (11 dígitos) ou "Não encontrado"]
//           Observações Visuais: [Comentários]
//         `;

//         console.log("Sending request to Gemini API...");
//         const result = await geminiModel.generateContent({
//             contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
//             generationConfig: geminiGenerationConfig,
//             safetySettings: geminiSafetySettings,
//         });

//         const responseText = result?.response?.text?.();
//         if (!responseText) {
//             console.error("Invalid or empty response structure from Gemini API:", result?.response);
//             throw new Error('Received an unexpected or empty response from the validation service.');
//         }

//         console.log("Gemini Response received.");
//         console.log("Analysis Result:\n", responseText);

//         res.json({ success: true, analysis: responseText });

//     } catch (error) {
//         console.error("Error during Gemini validation:", error);
//         let errorMessage = 'Failed to validate document due to an internal error.';
//         let statusCode = 500;

//         if (error.message?.includes('quota')) {
//             errorMessage = 'Validation service quota exceeded.';
//             statusCode = 429;
//         } else if (error.message?.includes('SAFETY')) {
//             errorMessage = 'Content blocked due to safety settings.';
//             statusCode = 400;
//         } else if (error.message?.includes('unexpected response')) {
//             errorMessage = 'Received an unexpected response from the validation service.';
//             statusCode = 502;
//         }
//         res.status(statusCode).json({ success: false, error: errorMessage });
//     }
// });

// app.get('/api/news', async (req, res) => {
//     console.log("--- Request Received: /api/news (using SCRAPER for game/team) ---");
//     const { game } = req.query;

//     if (!game || typeof game !== 'string' || game.trim() === '') {
//         console.log("[Backend /news] Bad Request: 'game' query parameter missing or invalid.");
//         return res.status(400).json({ error: 'Parâmetro "game" (jogo favorito) é obrigatório.' });
//     }

//     const sanitizedGame = game.trim().toLowerCase();
//     const team = "furia";

//     const targetUrls = [
//         'https://draft5.gg/',
//         'https://www.thespike.gg/br/valorant/news',
//     ];

//     console.log(`[Backend /news] Scraping targets for game: "${sanitizedGame}" and team: "${team}"`);
//     console.log(`[Backend /news] Target URLs: ${targetUrls.join(', ')}`);

//     let scrapedArticles = [];
//     const MAX_ARTICLES_PER_SOURCE = 3;

//     const scrapeSingleArticlePage = async (articleUrl, sourceHostname) => {
//         console.log(`[Scraper Step 2] Fetching individual article: ${articleUrl}`);
//         try {
//             const { data: articleHtml } = await axios.get(articleUrl, {
//                 headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
//                 timeout: 15000
//             });
//             const $article = cheerio.load(articleHtml);
//             console.log(`[Scraper Step 2] Parsing: ${articleUrl}`);

//             let publishedAt = null;
//             let description = null;
//             let title = null;

//             let titleSelector = 'h1';
//             let dateElementSelector = '';
//             let subtitleSelector = '';
//             let contentContainerSelector = '';

//             if (sourceHostname.includes('draft5.gg') || sourceHostname.includes('gamersclub.gg')) {
//                 // Assumindo estrutura similar para páginas de notícia em ambos
//                 titleSelector = 'div.NewsDetail__ArticleHeader-sc-19m6s5w-4 h1';
//                 dateElementSelector = 'div.NewsDetail__ArticleHeader-sc-19m6s5w-4 small span:nth-of-type(2)';
//                 subtitleSelector = 'div.NewsDetail__ArticleHeader-sc-19m6s5w-4 h3';
//                 contentContainerSelector = 'div.NewsDetail__PostContent-sc-19m6s5w-3';
//             } else if (sourceHostname.includes('thespike.gg')) {
//                 console.log('[Scraper Step 2] Applying selectors for thespike.gg (Article Page)');
//                 titleSelector = 'h1.news_newsTitle__DHSK1';
//                 dateElementSelector = 'div.author_publishedOn__CX4lz span:nth-of-type(2)';
//                 subtitleSelector = 'div.news_newsItemTitlePublished__PvqfV span';
//                 contentContainerSelector = 'div.news_newsBody__371jM';
//             }

//             if (contentContainerSelector) {
//                 console.log(`[Scraper Step 2] Attempting to extract first paragraph for description.`);
//                 const contentContainer = $article(contentContainerSelector).first();
//                 if (contentContainer.length > 0) {
//                     const firstParagraphElement = contentContainer.find('p').first();
//                     if (firstParagraphElement.length > 0) {
//                         const clonedP = firstParagraphElement.clone();
//                         clonedP.find('a, strong, span.MuiTouchRipple-root').remove();
//                         description = clonedP.text().trim();

//                         if (description) {
//                             console.log(`[Scraper Step 2] Extracted Description (from Cleaned First Paragraph): ${description.substring(0, 100)}... from ${articleUrl}`);
//                         } else {
//                             console.warn(`[Scraper Step 2] First paragraph element text is empty AFTER cleaning tags within "${contentContainerSelector}" for ${articleUrl}`);
//                         }
//                     } else {
//                         console.warn(`[Scraper Step 2] No <p> tags found within content container "${contentContainerSelector}" for ${articleUrl}`);
//                     }
//                 } else {
//                     console.warn(`[Scraper Step 2] Content container for fallback description not found using selector "${contentContainerSelector}" for ${articleUrl}`);
//                 }
//             }

//             if (titleSelector) {
//                 title = $article(titleSelector).first().text().trim();
//                 if (title) console.log(`[Scraper Step 2] Extracted Title: ${title} from ${articleUrl}`);
//                 else console.warn(`[Scraper Step 2] Title element not found using selector "${titleSelector}" for ${articleUrl}`);
//             }

//             const dateElement = $article(dateElementSelector).first();

//             console.log(`[Scraper Step 2 - DEBUG DATE] Trying selector: "${dateElementSelector}" for ${articleUrl}`);
//             console.log(`[Scraper Step 2 - DEBUG DATE] Found elements length: ${dateElement.length}`);
//             if (dateElement.length > 0) {
//                 publishedAt = dateElement.text().trim();
//                 console.log(`[Scraper Step 2] Extracted Date String: ${publishedAt} from ${articleUrl}`);
//                 if (!publishedAt) {
//                     console.warn(`[Scraper Step 2 - DEBUG DATE] Date element found, but text is empty. HTML:`, dateElement.html());
//                     publishedAt = null;
//                 }
//             } else {
//                 console.warn(`[Scraper Step 2] Date element not found using selector "${dateElementSelector}" for ${articleUrl}`);
//                 publishedAt = null;
//             }

//             if (subtitleSelector) {
//                 console.log(`[Scraper Step 2 - ${sourceHostname}] Attempting to extract subtitle using selector: ${subtitleSelector}`);
//                 const subtitleElement = $article(subtitleSelector).first();
//                 if (subtitleElement.length > 0) {
//                     const subtitleText = subtitleElement.text().trim();
//                     if (subtitleText) {
//                         description = subtitleText;
//                         console.log(`[Scraper Step 2 - ${sourceHostname}] Found and assigned Subtitle as Description: ${description.substring(0, 100)}...`);
//                     } else {
//                         console.warn(`[Scraper Step 2 - ${sourceHostname}] Subtitle element found but text is empty using selector "${subtitleSelector}" for ${articleUrl}`);
//                     }
//                 } else {
//                     console.warn(`[Scraper Step 2 - ${sourceHostname}] Subtitle element not found using selector "${subtitleSelector}" for ${articleUrl}`);
//                 }
//             } else {
//                 console.log(`[Scraper Step 2 - ${sourceHostname}] No subtitle selector defined.`);
//             }

//             // Fallback: Se não encontrou subtítulo, pega o primeiro parágrafo do conteúdo
//             if (!description && contentContainerSelector) {
//                 console.log(`[Scraper Step 2] Subtitle not found or empty. Attempting fallback to first paragraph.`);
//                 const contentContainer = $article(contentContainerSelector).first();
//                 if (contentContainer.length > 0) {
//                     const firstParagraph = contentContainer.find('p').first().text().trim();
//                     if (firstParagraph) {
//                         description = firstParagraph.text().trim();
//                         console.log(`[Scraper Step 2] Extracted Description (from First Paragraph): ${description.substring(0, 100)}... from ${articleUrl}`);
//                     } else {
//                         console.warn(`[Scraper Step 2] Content container found, but no first paragraph text within "${contentContainerSelector}" for ${articleUrl}`);
//                     }
//                 } else {
//                     console.warn(`[Scraper Step 2] Content container for fallback description not found using selector "${contentContainerSelector}" for ${articleUrl}`);
//                 }
//             }

//             return { title: title || null, publishedAt, description: description || null };

//         } catch (error) {
//             console.error(`[Scraper Step 2] Failed to scrape individual article ${articleUrl}:`, error.message);
//             return { title: null, publishedAt: null, description: null, error: true };
//         }
//     };

//     const scrapeUrl = async (url) => {
//         let initialArticlesData = [];
//         let finalArticles = [];
//         const siteHostname = new URL(url).hostname;
//         let isSingleArticlePage = false;

//         try {
//             console.log(`[Scraper Step 1] Fetching list/page: ${url}`);
//             const { data: html } = await axios.get(url, {
//                 headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
//                 timeout: 10000
//             });
//             const $ = cheerio.load(html);
//             console.log(`[Scraper Step 1] Parsing: ${url}`);

//             let itemSelector = '';
//             let titleSelector = '';
//             let linkSelector = '';
//             let isLinkContainer = false;
//             let singlePageTitleSelector = '';



//             // --- Lógica de Seletores Específica por Site ---
//             if (siteHostname.includes('draft5.gg')) {
//                 console.log('[Scraper Step 1] Applying selectors for draft5.gg (List Page)');
//                 itemSelector = 'a.NewsCard__NewsCardContainer-sc-3os0ad-1';
//                 titleSelector = 'h2.NewsCard__Title-sc-3os0ad-0';
//                 linkSelector = null;
//                 isLinkContainer = true;
//                 isSingleArticlePage = false;
//             } else if (siteHostname.includes('thespike.gg')) {
//                 console.log('[Scraper Step 1] Applying selectors for thespike.gg (List Page)');
//                 itemSelector = 'li.news_newsItem__sWvm_';
//                 titleSelector = 'span.news_newsTitle__DHSK1';
//                 linkSelector = 'div.news_newsItemTitlePublished__PvqfV a';
//                 isLinkContainer = false;
//                 isSingleArticlePage = false;
//             } else {
//                 console.warn(`[Scraper Step 1] No specific selectors defined for ${siteHostname}.`);
//                 return [];
//             }
//             // -------------------------------------------

//             if (isSingleArticlePage) {
//                 // --- Lógica para página única ---
//                 console.log(`[Scraper Step 1] Processing as single article page: ${url}`);
//                 const pageContext = $('body').first(); // Ou outro container geral
//                 const pageText = pageContext.text().toLowerCase();

//                 // 5. VERIFICAÇÃO DE KEYWORDS TAMBÉM NA PÁGINA ÚNICA (OPCIONAL, mas recomendado)
//                 if (pageText.includes(team) && pageText.includes(sanitizedGame)) {
//                     console.log(`[Scraper Step 1] Single page ${url} contains keywords. Proceeding to extract details.`);
//                     const articleDetails = await scrapeSingleArticlePage(url, siteHostname);
//                     let title = '';
//                     if (singlePageTitleSelector) { title = $(singlePageTitleSelector).first().text().trim(); }
//                     if (articleDetails.title) title = articleDetails.title;

//                     if (title) {
//                         finalArticles.push({
//                             title: title, url: url, source: { name: siteHostname },
//                             publishedAt: articleDetails.publishedAt, description: articleDetails.description,
//                             urlToImage: null, content: null
//                         });
//                     } else {
//                         console.warn(`[Scraper Step 1] Could not extract title for single article page ${url} even though keywords matched.`);
//                     }
//                 } else {
//                     console.log(`[Scraper Step 1] Single page ${url} did NOT contain both keywords.`);
//                 }

//             } else {
//                 // --- Processa como página de lista ---
//                 console.log(`[Scraper Step 1] Processing as list page: ${url}`);
//                 $(itemSelector).each((index, element) => {
//                     if (initialArticlesData.length >= MAX_ARTICLES_PER_SOURCE) {
//                         return false;
//                     }

//                     const item = $(element);
//                     const itemText = item.text().toLowerCase();

//                     // Verifica apenas a keyword do time
//                     if (itemText.includes(team)) {

//                         // --- Extração de Título e Link (AJUSTADA) ---
//                         let title = item.find(titleSelector).first().text().trim();
//                         let link = null;

//                         if (isLinkContainer) {
//                             // Se o próprio item é o link (ex: draft5)
//                             link = item.attr('href');
//                             // Se o título específico não foi encontrado, tenta o texto do próprio link
//                             if (!title) title = item.text().trim();
//                         } else if (linkSelector) {
//                             // Se temos um seletor específico para o link dentro do item (ex: thespike)
//                             const linkElement = item.find(linkSelector).first();
//                             link = linkElement.attr('href');
//                             // Se o título específico não foi encontrado, tenta o texto do link
//                             if (!title) title = linkElement.text().trim();
//                         } else {
//                             // Fallback genérico: tenta encontrar o primeiro link dentro do item
//                             const firstLink = item.find('a').first();
//                             link = firstLink.attr('href');
//                             // Se o título específico não foi encontrado, tenta o texto do primeiro link
//                             if (!title) title = firstLink.text().trim();
//                         }

//                         // Fallback final para título, caso nenhum dos métodos acima funcione
//                         if (!title) {
//                             title = item.text().trim().substring(0, 100) + "...";
//                         }
//                         // ---------------------------------------------

//                         // Resolução de link relativo (inalterada)
//                         if (link && link.startsWith('/')) {
//                             try {
//                                 const baseUrl = new URL(url);
//                                 link = `${baseUrl.protocol}//${baseUrl.hostname}${link}`;
//                             } catch (e) { link = undefined; }
//                         } else if (link && !link.startsWith('http')) {
//                             link = undefined;
//                         }

//                         // Adiciona dados iniciais
//                         if (title && link && !initialArticlesData.some(a => a.url === link)) {
//                             console.log(`[Scraper Step 1] Found relevant list item (${siteHostname}): Title: ${title.substring(0, 50)}... URL: ${link}`);
//                             initialArticlesData.push({ title, url: link, source: { name: siteHostname } });
//                         }
//                     } // Fim do IF da keyword
//                 });

//                 // --- Etapa 2: Buscar detalhes para cada artigo da lista ---
//                 if (initialArticlesData.length > 0) {
//                     console.log(`[Scraper Step 1 -> 2] Found ${initialArticlesData.length} potential articles from list. Fetching details...`);
//                     const detailPromises = initialArticlesData.map(initialData =>
//                         scrapeSingleArticlePage(initialData.url, initialData.source.name)
//                             .then(details => ({ ...initialData, ...details })) // Combina dados iniciais com detalhes
//                             .catch(err => ({ ...initialData, publishedAt: null, description: null, error: true })) // Mantém dados iniciais em caso de erro
//                     );

//                     const settledDetails = await Promise.allSettled(detailPromises);

//                     settledDetails.forEach(result => {
//                         if (result.status === 'fulfilled') {
//                             if (result.value.title && initialArticlesData.find(a => a.url === result.value.url)) {
//                                 const originalTitle = initialArticlesData.find(a => a.url === result.value.url)?.title;
//                                 if (!originalTitle || originalTitle.endsWith('...') || (result.value.title.length > originalTitle.length)) {
//                                     result.value.title = originalTitle;
//                                 }
//                             } else if (!result.value.title) {
//                                 const originalData = initialArticlesData.find(a => a.url === result.value.url);
//                                 result.value.title = originalData?.title;
//                             }
//                             finalArticles.push(result.value);
//                         } else {
//                             console.error(`[Scraper Step 2 Promise] Failed for one article: ${result.reason}`);
//                         }
//                     });
//                 }
//             }

//         } catch (error) {
//             console.error(`[Scraper Step 1] Failed to process ${url}:`, error.message);
//             if (axios.isAxiosError(error) && error.response) {
//                 console.error(`[Scraper Step 1] Status code: ${error.response.status}`);
//             }
//         }
//         return finalArticles;
//     };

//     const results = await Promise.allSettled(targetUrls.map(scrapeUrl));

//     results.forEach(result => {
//         if (result.status === 'fulfilled' && result.value.length > 0) {
//             const validArticles = result.value.filter(article => !article.error && article.url && article.title);
//             scrapedArticles = scrapedArticles.concat(validArticles);
//         } else if (result.status === 'rejected') {
//             console.error(`[Scraper] A scraping promise was rejected: ${result.reason}`)
//         }
//     });

//     const uniqueArticlesMap = new Map(scrapedArticles.map(item => [item.url, item]));
//     let uniqueArticles = Array.from(uniqueArticlesMap.values());

//     uniqueArticles.sort((a, b) => {
//         const parseDate = (dateString) => {
//             if (!dateString || typeof dateString !== 'string') return null;

//             const monthsPt = {
//                 'jan': 0, 'janeiro': 0, 'fev': 1, 'fevereiro': 1, 'mar': 2, 'março': 2,
//                 'abr': 3, 'abril': 3, 'mai': 4, 'maio': 4, 'jun': 5, 'junho': 5,
//                 'jul': 6, 'julho': 6, 'ago': 7, 'agosto': 7, 'set': 8, 'setembro': 8,
//                 'out': 9, 'outubro': 9, 'nov': 10, 'novembro': 10, 'dez': 11, 'dezembro': 11
//             };

//             // 1. Tentar formato "DD de Mês AAAA - HH:MM" (Ex: "29 de abr 2025 - 16:00")
//             let match = dateString.match(/^(\d{1,2})\s+de\s+(\w+)\s+(\d{4})\s+-\s+(\d{1,2}):(\d{2})$/i);
//             if (match) {
//                 const day = parseInt(match[1], 10);
//                 const monthName = match[2].toLowerCase();
//                 const year = parseInt(match[3], 10);
//                 const hour = parseInt(match[4], 10);
//                 const minute = parseInt(match[5], 10);
//                 const monthNum = monthsPt[monthName];

//                 if (monthNum !== undefined && !isNaN(day) && !isNaN(year) && !isNaN(hour) && !isNaN(minute)) {
//                     const parsed = new Date(Date.UTC(year, monthNum, day, hour, minute));
//                     if (!isNaN(parsed.getTime())) return parsed;
//                 }
//             }

//             // 2. Tentar formato "Mês DD, YYYY at HH:MMPM" (Ex: "maio 1, 2025 at 03:00PM")
//             match = dateString.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})\s+at\s+(\d{1,2}):(\d{2})(AM|PM)$/i);
//             if (match) {
//                 const monthName = match[1].toLowerCase();
//                 const day = parseInt(match[2], 10);
//                 const year = parseInt(match[3], 10);
//                 let hour = parseInt(match[4], 10);
//                 const minute = parseInt(match[5], 10);
//                 const ampm = match[6].toUpperCase();
//                 const monthNum = monthsPt[monthName];

//                 if (monthNum !== undefined && !isNaN(day) && !isNaN(year) && !isNaN(hour) && !isNaN(minute)) {
//                     if (ampm === 'PM' && hour < 12) hour += 12;
//                     if (ampm === 'AM' && hour === 12) hour = 0;

//                     const parsed = new Date(Date.UTC(year, monthNum, day, hour, minute));
//                     if (!isNaN(parsed.getTime())) return parsed;
//                 }
//             }

//             if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
//                 const date = new Date(dateString);
//                 if (!isNaN(date.getTime())) return date;
//             }

//             const lowerCaseDate = dateString.toLowerCase();
//             const now = new Date();
//             if (lowerCaseDate.includes('agora') || lowerCaseDate.includes('recentemente') || lowerCaseDate.includes('just now')) return now;
//             if (lowerCaseDate.includes('ontem') || lowerCaseDate.includes('yesterday')) {
//                 const yesterday = new Date(now);
//                 yesterday.setUTCDate(now.getUTCDate() - 1);
//                 yesterday.setUTCHours(12, 0, 0, 0);
//                 return yesterday;
//             }
//             const hoursMatch = lowerCaseDate.match(/(?:há|about)\s*(\d+)\s*hora(?:s)?\s*(?:atrás|ago)?/);
//             if (hoursMatch && hoursMatch[1]) {
//                 const hoursAgo = parseInt(hoursMatch[1], 10);
//                 if (!isNaN(hoursAgo)) return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
//             }
//             const daysMatch = lowerCaseDate.match(/(?:há|about)\s*(\d+)\s*dia(?:s)?\s*(?:atrás|ago)?/);
//             if (daysMatch && daysMatch[1]) {
//                 const daysAgo = parseInt(daysMatch[1], 10);
//                 if (!isNaN(daysAgo)) {
//                     const pastDate = new Date(now);
//                     pastDate.setUTCDate(now.getUTCDate() - daysAgo);
//                     pastDate.setUTCHours(12, 0, 0, 0);
//                     return pastDate;
//                 }
//             }

//             let genericDate = new Date(dateString);
//             if (!isNaN(genericDate.getTime())) {
//                 console.warn(`[Date Sort] Using generic Date parse for ambiguous format: "${dateString}" -> Result: ${genericDate.toISOString()}`);
//                 return genericDate;
//             }

//             console.warn(`[Date Sort] Could not parse date string: "${dateString}"`);
//             return null;
//         };

//         const dateA = parseDate(a.publishedAt);
//         const dateB = parseDate(b.publishedAt);

//         const timeA = dateA ? dateA.getTime() : 0;
//         const timeB = dateB ? dateB.getTime() : 0;

//         return timeB - timeA;
//     });


//     const finalArticles = uniqueArticles.slice(0, 10);
//     console.log(`[Backend /news] Total relevant articles found after scraping: ${finalArticles.length}`);

//     res.json({ success: true, articles: finalArticles });

//     console.log("--- Request Processed: /api/news (scraper) ---");
// });

// async function scrapeFuriaMatches() {
//     const targetUrl = 'https://www.vlr.gg/team/matches/2406/furia/?group=completed';
//     const baseVlrUrl = 'https://www.vlr.gg';
//     const MAX_MATCHES_TO_SCRAPE = 4;

//     console.log(`[Scraper] Fetching matches from: ${targetUrl}`);
//     console.log(`[Scraper] Limiting results to: ${MAX_MATCHES_TO_SCRAPE}`);

//     try {
//         const { data: html } = await axios.get(targetUrl, {
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//             }
//         });
//         const $ = cheerio.load(html);
//         console.log('[Scraper] HTML fetched and loaded into Cheerio.');

//         const matches = [];

//         $('a.wf-card.fc-flex.m-item').each((index, element) => {
//             if (matches.length >= MAX_MATCHES_TO_SCRAPE) {
//                 console.log(`[Scraper] Reached match limit (${MAX_MATCHES_TO_SCRAPE}). Stopping.`);
//                 return false;
//             }

//             const matchCard = $(element);

//             if (matchCard.find('.m-item-team').length === 0) {
//                 return;
//             }

//             const matchData = {};

//             // --- Extract Tournament Info ---
//             const eventElement = matchCard.find('.m-item-event');
//             matchData.tournamentName = eventElement.find('div[style*="font-weight: 700"]').text().trim();
//             // Extract stage/round text, removing the tournament name part and cleaning
//             let stageText = eventElement.text().trim();
//             stageText = stageText.replace(matchData.tournamentName, '').replace(/[\n\t⋅]/g, '').trim(); // Remove dots and extra whitespace
//             // Refine stage extraction - split by lines, take the last non-empty line
//             const lines = stageText.split('\n').map(line => line.trim()).filter(line => line);
//             matchData.stage = lines.pop() || stageText || 'N/A'; // Use last line, fallback to cleaned text


//             // --- Extract Team Info ---
//             const teams = matchCard.find('.m-item-team');
//             const team1Element = $(teams[0]); // Assume first is always Furia based on screenshot context
//             const team2Element = matchCard.find('.m-item-team.mod-right'); // The right-aligned one is the opponent

//             matchData.team1 = {
//                 name: team1Element.find('.m-item-team-name').text().trim(),
//                 tag: team1Element.find('.m-item-team-tag').text().trim(),
//             };
//             matchData.team2 = {
//                 name: team2Element.find('.m-item-team-name').text().trim(),
//                 tag: team2Element.find('.m-item-team-tag').text().trim(),
//             };

//             // Identify which team is FURIA and which is the opponent
//             if (matchData.team1.name.toLowerCase() === 'furia') {
//                 matchData.furia = matchData.team1;
//                 matchData.opponent = matchData.team2;
//             } else if (matchData.team2.name.toLowerCase() === 'furia') {
//                 matchData.furia = matchData.team2;
//                 matchData.opponent = matchData.team1;
//                 // Swap scores later if needed based on Furia's position
//             } else {
//                 // Fallback if 'furia' name isn't exact match (less likely with this structure)
//                 console.warn("[Scraper] Could not definitively identify FURIA in match:", matchData.team1.name, "vs", matchData.team2.name);
//                 // Assign based on position as fallback
//                 matchData.furia = matchData.team1;
//                 matchData.opponent = matchData.team2;
//             }


//             // --- Extract Score & Result ---
//             const resultElement = matchCard.find('.m-item-result');
//             const scoreSpans = resultElement.find('span');
//             let score1 = $(scoreSpans[0]).text().trim();
//             let score2 = $(scoreSpans[scoreSpans.length - 1]).text().trim(); // Get the last span for the second score

//             // Assign scores correctly based on who Furia is
//             if (matchData.furia === matchData.team1) {
//                 matchData.furiaScore = parseInt(score1, 10);
//                 matchData.opponentScore = parseInt(score2, 10);
//             } else {
//                 matchData.furiaScore = parseInt(score2, 10);
//                 matchData.opponentScore = parseInt(score1, 10);
//             }

//             // Determine win/loss based on the class *and* Furia's position
//             if (resultElement.hasClass('mod-win')) {
//                 matchData.result = (matchData.furia === matchData.team1) ? 'Win' : 'Loss'; // Win if Furia is team1 and mod-win class exists
//             } else if (resultElement.hasClass('mod-loss')) {
//                 matchData.result = (matchData.furia === matchData.team1) ? 'Loss' : 'Win'; // Loss if Furia is team1 and mod-loss class exists
//             } else {
//                 matchData.result = 'Draw/Unknown'; // Should ideally not happen in VCT Bo3/Bo5
//             }
//             // Ensure correct result if Furia was team2
//             if (matchData.furia === matchData.team2) {
//                 matchData.result = (matchData.result === 'Win') ? 'Loss' : (matchData.result === 'Loss' ? 'Win' : matchData.result);
//             }


//             // --- Extract Date & Time ---
//             const dateElement = matchCard.find('.m-item-date');
//             const dateText = dateElement.text().trim().split(/[\n\t]+/).map(s => s.trim()).filter(s => s); // Split by newline/tab, trim, filter empty
//             matchData.date = dateText[0] || 'N/A';
//             matchData.time = dateText[1] || 'N/A';

//             // --- Check for VOD ---
//             matchData.vodAvailable = matchCard.find('.m-item-vods .wf-tag.mod-yt').length > 0 || matchCard.find('.m-item-vods .wf-tag.mod-twitch').length > 0;

//             // --- Get Match Link ---
//             const relativeLink = matchCard.attr('href');
//             matchData.matchLink = relativeLink ? `${baseVlrUrl}${relativeLink}` : null;


//             // --- (Optional) Extract Map Details ---
//             // Find the corresponding game details div (might need adjustment if ID doesn't match perfectly)
//             const matchId = relativeLink?.match(/\/(\d+)\//)?.[1]; // Extract ID from link
//             matchData.maps = [];
//             if (matchId) {
//                 const gamesContainer = $(`.m-item-games.match-id-${matchId}`); // Use class with match ID
//                 if (gamesContainer.length > 0) {
//                     gamesContainer.find('.m-item-games-item').each((mapIndex, mapElement) => {
//                         const mapItem = $(mapElement);
//                         const mapResultDiv = mapItem.find('.m-item-games-result');
//                         const mapName = mapItem.find('.map').text().trim();
//                         const mapScoreText = mapItem.find('.score').text().trim();
//                         const mapScores = mapScoreText.split('-').map(s => parseInt(s.trim(), 10));
//                         const mapResult = mapResultDiv.hasClass('mod-win') ? 'Win' : (mapResultDiv.hasClass('mod-loss') ? 'Loss' : 'Unknown');

//                         // Adjust map result based on Furia's position in the main match
//                         const furiaMapResult = (matchData.furia === matchData.team1) ? mapResult : (mapResult === 'Win' ? 'Loss' : (mapResult === 'Loss' ? 'Win' : 'Unknown'));
//                         const furiaMapScore = (matchData.furia === matchData.team1) ? mapScores[0] : mapScores[1];
//                         const opponentMapScore = (matchData.furia === matchData.team1) ? mapScores[1] : mapScores[0];


//                         matchData.maps.push({
//                             name: mapName,
//                             furiaScore: furiaMapScore,
//                             opponentScore: opponentMapScore,
//                             result: furiaMapResult,
//                             scoreText: mapScoreText // Keep original score text if needed
//                         });
//                     });
//                 } else {
//                     console.log(`[Scraper] Map details container not found for match ID ${matchId}`);
//                 }
//             } else {
//                 console.log("[Scraper] Could not extract match ID from link:", relativeLink);
//             }


//             // Add the extracted data to our results array
//             matches.push(matchData);
//         });

//         console.log(`[Scraper] Successfully scraped ${matches.length} matches.`);
//         return matches;

//     } catch (error) {
//         console.error(`[Scraper] Error scraping matches:`, error.message);
//         if (axios.isAxiosError(error) && error.response) {
//             console.error(`[Scraper] Status: ${error.response.status}`);
//             console.error(`[Scraper] Data:`, error.response.data);
//         }
//         const scrapeError = new Error(`Falha ao buscar dados dos jogos da Furia. Status: ${error.response?.status || 'N/A'}`);
//         scrapeError.statusCode = error.response?.status || 500;
//         throw scrapeError;
//     }
// }

// app.get('/api/furia-matches', async (req, res) => {
//     console.log("--- Request Received: /api/furia-matches ---");
//     try {
//         const matches = await scrapeFuriaMatches();
//         res.json({ success: true, matches: matches });
//     } catch (error) {
//         console.error("Error in /api/furia-matches route:", error.message);
//         res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Erro interno do servidor ao buscar partidas.' });
//     }
//     console.log("--- Request Processed: /api/furia-matches ---");
// });

// app.get('/auth/twitch', (req, res) => {
//     console.log("Initiating Twitch Auth");
//     const twitchScopes = 'user:read:email user:read:follows';
//     const state = crypto.randomBytes(16).toString('hex');

//     req.session.oauth_state = state;

//     req.session.save(err => {
//         if (err) {
//             console.error("Error saving session before Twitch auth redirect:", err);
//             return res.status(500).send("Failed to initiate Twitch login. Please try again.");
//         }

//         const authorizationUrl = new URL('https://id.twitch.tv/oauth2/authorize');
//         authorizationUrl.searchParams.append('client_id', TWITCH_CLIENT_ID);
//         authorizationUrl.searchParams.append('redirect_uri', TWITCH_REDIRECT_URI);
//         authorizationUrl.searchParams.append('response_type', 'code');
//         authorizationUrl.searchParams.append('scope', twitchScopes);
//         authorizationUrl.searchParams.append('state', state);

//         res.redirect(authorizationUrl.toString());
//     });
// });

// app.get('/auth/twitch/callback', async (req, res) => {
//     console.log("----- TWITCH CALLBACK START -----");
//     console.log("Received Twitch Callback. Query:", req.query);
//     const { code, state, error, error_description } = req.query;
//     const savedState = req.session?.oauth_state;

//     // --- Validation ---
//     if (error) {
//         console.error(`Twitch Auth Error (Callback): ${error} - ${error_description}`);
//         return res.redirect(`${FRONTEND_URL}/profile?twitch_error=${encodeURIComponent(error_description || error)}`);
//     }

//     // Clear state regardless of success/failure after checking it
//     if (req.session) req.session.oauth_state = null;

//     if (!state || !savedState || state !== savedState) {
//         console.error('Invalid state parameter. Received:', state, "Saved:", savedState);
//         // Save session explicitly after modifying it
//         req.session.save(err => {
//             if (err) console.error("Error saving session after clearing invalid state:", err);
//             res.redirect(`${FRONTEND_URL}/profile?twitch_error=invalid_state`);
//         });
//         return;
//     }

//     if (!code) {
//         console.error('Missing authorization code in Twitch callback.');
//         // Save session explicitly after modifying it (though state was already cleared)
//         req.session.save(err => {
//             if (err) console.error("Error saving session after missing code:", err);
//             res.redirect(`${FRONTEND_URL}/profile?twitch_error=missing_code`);
//         });
//         return;
//     }
//     console.log("State check passed. Proceeding to token exchange...");

//     // --- Token Exchange ---
//     const tokenUrl = 'https://id.twitch.tv/oauth2/token';
//     const params = new URLSearchParams({
//         client_id: TWITCH_CLIENT_ID,
//         client_secret: TWITCH_CLIENT_SECRET,
//         code: code,
//         grant_type: 'authorization_code',
//         redirect_uri: TWITCH_REDIRECT_URI,
//     });

//     try {
//         console.log("Attempting POST to Twitch for token...");
//         const tokenResponse = await axios.post(tokenUrl, params, {
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//         });
//         console.log("Token exchange SUCCESS.");
//         const { access_token, refresh_token, expires_in } = tokenResponse.data;

//         if (!access_token) {
//             console.error("Access token missing in Twitch response!");
//             throw new Error("Twitch did not return an access token.");
//         }

//         // --- Fetch User Info ---
//         console.log("Attempting GET to Twitch for user info...");
//         const userInfoResponse = await axios.get('https://api.twitch.tv/helix/users', {
//             headers: {
//                 'Authorization': `Bearer ${access_token}`,
//                 'Client-Id': TWITCH_CLIENT_ID
//             }
//         });
//         console.log("User info fetch SUCCESS.");
//         const twitchUser = userInfoResponse.data?.data?.[0];

//         if (!twitchUser || !twitchUser.id || !twitchUser.login) {
//             console.error("Unexpected structure in Twitch user info response:", userInfoResponse.data);
//             throw new Error("Failed to retrieve valid user information from Twitch.");
//         }

//         // --- Update Session ---
//         req.session.twitchTokens = { access_token, refresh_token, expires_in };
//         req.session.twitchUserId = twitchUser.id;
//         console.log(`[Backend /callback] Session data SET for User ID: ${twitchUser.id}`);

//         // --- Save Session and Redirect ---
//         req.session.save(err => {
//             if (err) {
//                 console.error("----- FATAL ERROR: Failed to save session in /auth/twitch/callback -----", err);
//                 // Redirect with an error even if save fails, but log the critical failure
//                 return res.redirect(`${FRONTEND_URL}/profile?twitch_error=session_save_failed`);
//             }

//             console.log(`[Backend /callback] Session SAVED successfully. SID: ${req.sessionID}`);
//             console.log("Preparing SUCCESS redirect...");
//             const redirectUrl = new URL(`${FRONTEND_URL}/profile`);
//             redirectUrl.searchParams.append('twitch_linked', 'true');
//             redirectUrl.searchParams.append('twitch_id', twitchUser.id);
//             redirectUrl.searchParams.append('twitch_login', twitchUser.login);
//             if (twitchUser.profile_image_url) {
//                 redirectUrl.searchParams.append('twitch_avatar_url', twitchUser.profile_image_url); // No need to encode here, URL constructor handles it
//             }
//             res.redirect(redirectUrl.toString());
//             console.log("----- TWITCH CALLBACK SUCCESS REDIRECT SENT -----");
//         });

//     } catch (err) {
//         console.error("----- ERROR in Twitch Callback TRY block -----");
//         const errorMessage = err.response?.data?.message || err.message || 'token_exchange_or_user_fetch_failed';
//         console.error("Error details:", err.response?.data || err);
//         console.log("Redirecting due to error in try block...");
//         // Ensure session is saved if potentially modified before error
//         req.session.save(saveErr => {
//             if (saveErr) console.error("Error saving session during error handling in callback:", saveErr);
//             res.redirect(`${FRONTEND_URL}/profile?twitch_error=${encodeURIComponent(errorMessage)}`);
//             console.log("----- TWITCH CALLBACK ERROR REDIRECT SENT -----");
//         });
//     }
// });

// // 4. Twitch Follow Status Check Endpoint
// app.get('/api/check-twitch-follow', async (req, res) => {
//     console.log("--- Request Received: /api/check-twitch-follow ---");
//     console.log(`[Backend /check-follow] Session ID: ${req.sessionID}`);

//     // Check authentication status first
//     if (!req.session?.twitchTokens?.access_token || !req.session?.twitchUserId) {
//         console.log("[Backend] Unauthorized: No valid session/tokens OR userId found.");
//         return res.status(401).json({ error: 'Usuário não autenticado ou Twitch não vinculada.' });
//     }
//     console.log(`[Backend] Session found for User ID: ${req.session.twitchUserId}`);

//     const targetChannelName = req.query.channelName;
//     if (!targetChannelName || typeof targetChannelName !== 'string' || targetChannelName.trim() === '') {
//         console.log("[Backend] Bad Request: Target channel name missing or invalid.");
//         return res.status(400).json({ error: 'Nome do canal alvo inválido ou não fornecido.' });
//     }
//     console.log(`[Backend] Target Channel Name: ${targetChannelName}`);

//     try {
//         console.log("[Backend] First attempt using current token.");
//         const result = await performTwitchFollowCheck(req, targetChannelName);
//         console.log("[Backend] First attempt successful.");
//         res.json(result); // Send the result { follows: boolean }

//     } catch (error) {
//         console.log(`[Backend] Initial API call failed. Status: ${error.statusCode || 'N/A'}, Message: ${error.message}`);

//         // Handle specific error codes
//         if (error.statusCode === 404) {
//             console.log("[Backend /check-follow] Received 404 (Channel likely not found).");
//             return res.status(404).json({ error: error.message || `Canal Twitch "${targetChannelName}" não encontrado.` });
//         }

//         if (error.statusCode === 410) { // Handle 410 Gone (API endpoint removed/deprecated)
//             console.error("[Backend /check-follow] Received 410 Gone from Twitch API.");
//             req.session.destroy(err => { // Destroy session on 410
//                 if (err) console.error("Error destroying session after 410 error:", err);
//                 return res.status(401).json({ error: 'A API da Twitch não está mais disponível ou a autorização é inválida. Por favor, vincule novamente.' });
//             });
//             return; // Stop execution here
//         }


//         if (error.statusCode === 401) { // Unauthorized - Token likely expired
//             console.log("[Backend /check-follow] Received 401. Attempting token refresh...");
//             const refreshed = await refreshTwitchToken(req);

//             if (refreshed && req.session.twitchTokens?.access_token) {
//                 console.log("[Backend /check-follow] Token refresh successful. Retrying follow check...");
//                 try {
//                     const retryResult = await performTwitchFollowCheck(req, targetChannelName);
//                     console.log("[Backend /check-follow] Retry successful.");
//                     return res.json(retryResult);
//                 } catch (retryError) {
//                     console.error("[Backend /check-follow] Error checking follow status AFTER successful refresh:", retryError.message);
//                     // Handle errors even after refresh
//                     if (retryError.statusCode === 410) {
//                         console.error("[Backend /check-follow] Received 410 Gone AFTER refresh.");
//                         req.session.destroy(err => {
//                             if (err) console.error("Error destroying session after 410 error (retry):", err);
//                             return res.status(401).json({ error: 'A API da Twitch não está mais disponível ou a autorização é inválida. Por favor, vincule novamente.' });
//                         });
//                         return;
//                     }
//                     if (retryError.statusCode === 404) {
//                         return res.status(404).json({ error: retryError.message || `Canal Twitch "${targetChannelName}" não encontrado (após refresh).` });
//                     }
//                     // Handle other errors after refresh
//                     const status = retryError.statusCode || 500;
//                     const message = retryError.message || 'Erro ao verificar follow após renovar token.';
//                     return res.status(status).json({ error: message });
//                 }
//             } else {
//                 console.error("[Backend /check-follow] Token refresh failed or resulted in no valid token.");
//                 // Session tokens might have been cleared by refreshTwitchToken on failure
//                 return res.status(401).json({ error: 'Falha ao renovar autorização da Twitch. Por favor, vincule novamente.' });
//             }
//         }
//         else { // Handle other unexpected errors from the first attempt
//             console.error("[Backend /check-follow] Unhandled error during initial follow check:", error);
//             return res.status(error.statusCode || 500).json({ error: error.message || 'Erro interno ao verificar o status de follow.' });
//         }
//     } finally {
//         console.log("--- Request Processed: /api/check-twitch-follow ---");
//     }
// });


// // --- Global Error Handling Middleware ---
// // Should be placed after all routes

// app.use((err, req, res, next) => {
//     // Multer specific error handling
//     if (err instanceof multer.MulterError) {
//         console.error("Multer error:", err);
//         let message = `File upload error: ${err.message}`;
//         if (err.code === 'LIMIT_FILE_SIZE') {
//             message = 'File is too large. Maximum size is 10MB.';
//         }
//         return res.status(400).json({ success: false, error: message });
//     }
//     // Handle errors from fileFilter
//     else if (err.message === 'Invalid file type. Only PNG, JPG, or PDF allowed.') {
//         console.error("File type error:", err);
//         return res.status(400).json({ success: false, error: err.message });
//     }
//     // Generic error handler
//     else if (err) {
//         console.error("Unhandled application error:", err);
//         // Avoid leaking stack traces in production
//         const message = NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message;
//         return res.status(err.status || err.statusCode || 500).json({
//             success: false,
//             error: message
//         });
//     }
//     // If no error, pass to the next middleware (if any) or 404 handler
//     next();
// });

// // --- 404 Handler ---
// // If no route matched and no error occurred before this point
// app.use((req, res) => {
//     res.status(404).json({ success: false, error: 'Not Found' });
// });


// // --- Server Start ---

// app.listen(PORT, () => {
//     console.log(`Backend server running on http://localhost:${PORT}`);
//     console.log(`Environment: ${NODE_ENV || 'development'}`);
//     console.log(`Accepting requests from: ${FRONTEND_URL || 'Not Specified (CORS issues likely)'}`);
//     if (MOCK_TWITCH_FOLLOW_API) {
//         console.log("--- TWITCH API MOCKING IS ENABLED ---");
//     }
// });

import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import sessionMiddleware from './config/session.js';
import mainRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

// --- Express App Initialization ---
const app = express();

// --- Core Middleware Setup ---
const corsOptions = {
    origin: config.frontendUrl, // Use config
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(sessionMiddleware); // Use the configured session middleware

// --- Application Routes ---
app.use('/', mainRouter);


app.use((req, res) => {
    res.status(404).json({ success: false, error: `Not Found - ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Backend server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Accepting requests from: ${config.frontendUrl || 'Not Specified (CORS issues likely)'}`);
    if (config.twitch.mockApi) {
        console.log("--- TWITCH API MOCKING IS ENABLED ---");
    }
});