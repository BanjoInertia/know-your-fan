import axios from 'axios';
import * as cheerio from 'cheerio';

const scrapeSingleArticlePageForNews = async (articleUrl, sourceHostname) => {
    console.log(`[News Scraper Service - Step 2] Fetching individual article: ${articleUrl}`);
    try {
        const { data: articleHtml } = await axios.get(articleUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 15000
        });
        const $article = cheerio.load(articleHtml);
        console.log(`[News Scraper Service - Step 2] Parsing: ${articleUrl}`);

        let publishedAt = null;
        let description = null;
        let title = null;

        let titleSelector = 'h1';
        let dateElementSelector = '';
        let subtitleSelector = '';
        let contentContainerSelector = 'article, .post-content, .entry-content, .news-content, div[role="main"]';

        if (sourceHostname.includes('draft5.gg') || sourceHostname.includes('gamersclub.gg')) {
            titleSelector = 'div.NewsDetail__ArticleHeader-sc-19m6s5w-4 h1';
            dateElementSelector = 'div.NewsDetail__ArticleHeader-sc-19m6s5w-4 small span:nth-of-type(2)';
            subtitleSelector = 'div.NewsDetail__ArticleHeader-sc-19m6s5w-4 h3';
            contentContainerSelector = 'div.NewsDetail__PostContent-sc-19m6s5w-3';
        } else if (sourceHostname.includes('thespike.gg')) {
            console.log('[News Scraper Service - Step 2] Applying selectors for thespike.gg (Article Page)');
            titleSelector = 'h1.news_newsTitle__DHSK1';
            dateElementSelector = 'div.author_publishedOn__CX4lz span:nth-of-type(2)';
            subtitleSelector = 'news_newsDescription__P6JCa';
            contentContainerSelector = 'div.news_newsBody__371jM';
        }

        title = $article(titleSelector).first().text().trim();
        if (title) console.log(`[News Scraper Service - Step 2] Extracted Title: ${title} from ${articleUrl}`);
        else console.warn(`[News Scraper Service - Step 2] Title element not found using selector "${titleSelector}" for ${articleUrl}`);

        if (dateElementSelector) {
            const dateElement = $article(dateElementSelector).first();
            if (dateElement.length > 0) {
                publishedAt = dateElement.text().trim();
                console.log(`[News Scraper Service - Step 2] Extracted Date String: "${publishedAt}" from ${articleUrl}`);
                if (!publishedAt) publishedAt = null;
            } else {
                console.warn(`[News Scraper Service - Step 2] Date element not found using selector "${dateElementSelector}" for ${articleUrl}`);
                publishedAt = null;
            }
        } else {
            console.log(`[News Scraper Service - Step 2] No specific date selector for ${sourceHostname}.`);
            publishedAt = null;
        }

        if (subtitleSelector) {
            const subtitleElement = $article(subtitleSelector).first();
            if (subtitleElement.length > 0) {
                const subtitleText = subtitleElement.text().trim();
                if (subtitleText && subtitleText.toLowerCase() !== title?.toLowerCase()) {
                    description = subtitleText;
                    console.log(`[News Scraper Service - Step 2] Found and assigned Subtitle as Description: ${description.substring(0, 100)}...`);
                }
            }
        }

        if (!description && contentContainerSelector) {
            console.log(`[News Scraper Service - Step 2] Subtitle not found/empty/identical. Attempting fallback to first paragraph using: "${contentContainerSelector}"`);
            const contentContainer = $article(contentContainerSelector).first();
            if (contentContainer.length > 0) {
                const firstParagraphElement = contentContainer.find('p').filter((i, el) => $article(el).text().trim().length > 20).first();
                if (firstParagraphElement.length > 0) {
                    const clonedP = firstParagraphElement.clone();
                    clonedP.find('a, strong, span, em, i, b, script, style, figure, img').remove();
                    description = clonedP.text().trim();
                    if (description && description.length > 30 && !description.toLowerCase().includes('leia mais')) {
                        console.log(`[News Scraper Service - Step 2] Extracted Description (from Cleaned First Paragraph): ${description.substring(0, 100)}...`);
                    } else {
                        description = null;
                    }
                } else {
                    console.warn(`[News Scraper Service - Step 2] No suitable <p> tags found within content container "${contentContainerSelector}" for ${articleUrl}`);
                }
            } else {
                console.warn(`[News Scraper Service - Step 2] Content container for fallback description not found using selector "${contentContainerSelector}" for ${articleUrl}`);
            }
        } else if (!description) {
            console.warn(`[News Scraper Service - Step 2] Could not find description for ${articleUrl}`);
        }

        return { title: title || null, publishedAt: publishedAt || null, description: description || null };

    } catch (error) {
        console.error(`[News Scraper Service - Step 2] Failed to scrape individual article ${articleUrl}:`, error.message);
        return { title: null, publishedAt: null, description: null, error: true, errorMessage: error.message };
    }
};

const scrapeNewsListOrPage = async (url, gameKeyword) => {
    let initialArticlesData = [];
    let finalArticles = [];
    const siteHostname = new URL(url).hostname;
    const teamKeyword = "furia";
    const MAX_ARTICLES_PER_SOURCE_INITIAL = 5;

    try {
        console.log(`[News Scraper Service - Step 1] Fetching list page: ${url}`);
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 10000
        });
        const $ = cheerio.load(html);
        console.log(`[News Scraper Service - Step 1] Parsing list page: ${url}`);

        let itemSelector = '';
        let titleSelector = '';
        let linkSelector = '';
        let isLinkContainer = false;

        if (siteHostname.includes('draft5.gg')) {
            console.log('[News Scraper Service - Step 1] Applying selectors for draft5.gg (List Page)');
            itemSelector = 'a.NewsCard__NewsCardContainer-sc-3os0ad-1';
            titleSelector = 'h2.NewsCard__Title-sc-3os0ad-0';
            linkSelector = null;
            isLinkContainer = true;
        } else if (siteHostname.includes('thespike.gg')) {
            console.log('[News Scraper Service - Step 1] Applying selectors for thespike.gg (List Page)');
            itemSelector = 'li.news_newsItem__sWvm_';
            titleSelector = 'span.news_newsTitle__DHSK1';
            linkSelector = 'a';
            isLinkContainer = false;
        } else {
            console.warn(`[News Scraper Service - Step 1] No specific list selectors defined for ${siteHostname}. Skipping.`);
            return [];
        }

        $(itemSelector).each((index, element) => {
            if (initialArticlesData.length >= MAX_ARTICLES_PER_SOURCE_INITIAL) return false;

            const item = $(element);
            const itemText = item.text().toLowerCase();

            if (itemText.includes(teamKeyword) && itemText.includes(gameKeyword)) {
                let title = item.find(titleSelector).first().text().trim();
                let link = null;

                if (isLinkContainer) {
                    link = item.attr('href');
                    if (!title) title = item.text().trim().split('\n')[0] || item.text().trim();
                } else if (linkSelector) {
                    const linkElement = item.find(linkSelector).first();
                    link = linkElement.attr('href');
                    if (!title) title = linkElement.text().trim() || item.find('h2, h3, .title').first().text().trim();
                } else {
                    const firstLink = item.find('a').first();
                    link = firstLink.attr('href');
                    if (!title) title = firstLink.text().trim() || item.text().trim().split('\n')[0];
                }

                if (!title) title = "Título Indisponível";

                if (link && link.startsWith('/')) {
                    try {
                        const baseUrl = new URL(url);
                        link = `${baseUrl.protocol}//${baseUrl.hostname}${link}`;
                    } catch { link = undefined; }
                } else if (link && !link.startsWith('http')) { link = undefined; }

                if (link && !initialArticlesData.some(a => a.url === link)) {
                    console.log(`[News Scraper Service - Step 1] Found relevant list item (${siteHostname}): Title: ${title.substring(0, 50)}... URL: ${link}`);
                    initialArticlesData.push({ title: (title === "Título Indisponível" ? null : title), url: link, source: { name: siteHostname } });
                }
            }
        });

        if (initialArticlesData.length > 0) {
            console.log(`[News Scraper Service - Step 1 -> 2] Found ${initialArticlesData.length} potential articles from list. Fetching details...`);
            const detailPromises = initialArticlesData.map(initialData =>
                scrapeSingleArticlePageForNews(initialData.url, initialData.source.name)
                    .then(details => ({ ...initialData, ...details }))
                    .catch(err => ({ ...initialData, publishedAt: null, description: null, error: true, errorMessage: err.message }))
            );

            const settledDetails = await Promise.allSettled(detailPromises);

            settledDetails.forEach(result => {
                if (result.status === 'fulfilled' && result.value && !result.value.error) {
                    if (!result.value.title && initialArticlesData.find(a => a.url === result.value.url)?.title) {
                        result.value.title = initialArticlesData.find(a => a.url === result.value.url).title;
                    }
                    if (result.value.title) {
                        finalArticles.push(result.value);
                    } else {
                        console.warn(`[News Scraper Service - Step 2 Result] Article from ${result.value.url} discarded because final title is missing.`);
                    }
                } else if (result.status === 'fulfilled' && result.value && result.value.error) {
                    console.warn(`[News Scraper Service - Step 2 Result] Failed to get details for URL: ${result.value?.url}. Error: ${result.value?.errorMessage}`);
                } else if (result.status === 'rejected') {
                    console.error(`[News Scraper Service - Step 2 Promise] A detail scraping promise was rejected: ${result.reason}`);
                }
            });
        } else {
            console.log(`[News Scraper Service - Step 1] No relevant items found matching keywords on ${url}`);
        }

    } catch (error) {
        console.error(`[News Scraper Service - Step 1] Failed to process list page ${url}:`, error.message);
        if (axios.isAxiosError(error) && error.response) {
            console.error(`[News Scraper Service - Step 1] Status code: ${error.response.status}`);
        }
    }
    return finalArticles;
};

const parseSortableDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    const monthsPt = {
        'jan': 0, 'janeiro': 0, 'fev': 1, 'fevereiro': 1, 'mar': 2, 'março': 2,
        'abr': 3, 'abril': 3, 'mai': 4, 'maio': 4, 'jun': 5, 'junho': 5,
        'jul': 6, 'julho': 6, 'ago': 7, 'agosto': 7, 'set': 8, 'setembro': 8,
        'out': 9, 'outubro': 9, 'nov': 10, 'novembro': 10, 'dez': 11, 'dezembro': 11
    };
    try {
        let match = dateString.match(/^(\d{1,2})\s+de\s+(\w+)\s+(\d{4})\s+-\s+(\d{1,2}):(\d{2})$/i);
        if (match) {
            const day = parseInt(match[1], 10), monthName = match[2].toLowerCase(), year = parseInt(match[3], 10), hour = parseInt(match[4], 10), minute = parseInt(match[5], 10), monthNum = monthsPt[monthName];
            if (monthNum !== undefined && !isNaN(day) && !isNaN(year) && !isNaN(hour) && !isNaN(minute)) { const parsed = new Date(Date.UTC(year, monthNum, day, hour, minute)); if (!isNaN(parsed.getTime())) return parsed; }
        }
        match = dateString.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})\s+at\s+(\d{1,2}):(\d{2})(AM|PM)$/i);
        if (match) {
            const monthName = match[1].toLowerCase(), day = parseInt(match[2], 10), year = parseInt(match[3], 10); let hour = parseInt(match[4], 10); const minute = parseInt(match[5], 10), ampm = match[6].toUpperCase(), monthNum = monthsPt[monthName];
            if (monthNum !== undefined && !isNaN(day) && !isNaN(year) && !isNaN(hour) && !isNaN(minute)) { if (ampm === 'PM' && hour < 12) hour += 12; if (ampm === 'AM' && hour === 12) hour = 0; const parsed = new Date(Date.UTC(year, monthNum, day, hour, minute)); if (!isNaN(parsed.getTime())) return parsed; }
        }
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) { const date = new Date(dateString); if (!isNaN(date.getTime())) return date; }
        const lowerCaseDate = dateString.toLowerCase(), now = new Date();
        if (lowerCaseDate.includes('agora') || lowerCaseDate.includes('recentemente') || lowerCaseDate.includes('just now')) return now;
        if (lowerCaseDate.includes('ontem') || lowerCaseDate.includes('yesterday')) { const yesterday = new Date(now); yesterday.setUTCDate(now.getUTCDate() - 1); yesterday.setUTCHours(12, 0, 0, 0); return yesterday; }
        const hoursMatch = lowerCaseDate.match(/(?:há|about)\s*(\d+)\s*hora(?:s)?\s*(?:atrás|ago)?/); if (hoursMatch && hoursMatch[1]) { const hoursAgo = parseInt(hoursMatch[1], 10); if (!isNaN(hoursAgo) && hoursAgo >= 0) return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000); }
        const daysMatch = lowerCaseDate.match(/(?:há|about)\s*(\d+)\s*dia(?:s)?\s*(?:atrás|ago)?/); if (daysMatch && daysMatch[1]) { const daysAgo = parseInt(daysMatch[1], 10); if (!isNaN(daysAgo) && daysAgo >= 0) { const pastDate = new Date(now); pastDate.setUTCDate(now.getUTCDate() - daysAgo); pastDate.setUTCHours(12, 0, 0, 0); return pastDate; } }
        let genericDate = new Date(dateString); if (!isNaN(genericDate.getTime())) { console.warn(`[Date Sort] Using generic Date parse for ambiguous format: "${dateString}" -> Result: ${genericDate.toISOString()}`); return genericDate; }
    } catch (parseError) { console.error(`[Date Sort] Error during date parsing for "${dateString}": ${parseError.message}`); }
    console.warn(`[Date Sort] Could not parse date string: "${dateString}"`); return null;
};

async function scrapeNews(game) {
    const sanitizedGame = game.trim().toLowerCase();
    const team = "furia";
    const targetUrls = ['https://draft5.gg/', 'https://www.thespike.gg/br/valorant/news'];

    console.log(`[News Scraper Service] Starting scrape for game: "${sanitizedGame}" and team: "${team}"`);
    let allScrapedArticles = [];

    const results = await Promise.allSettled(
        targetUrls.map(url => scrapeNewsListOrPage(url, sanitizedGame))
    );

    results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            const validArticles = result.value.filter(article => article && article.url && article.title);
            allScrapedArticles = allScrapedArticles.concat(validArticles);
        } else if (result.status === 'rejected') {
            console.error(`[News Scraper Service] A scraping promise rejected: ${result.reason}`);
        }
    });

    console.log(`[News Scraper Service] Collected before deduplication: ${allScrapedArticles.length}`);
    const uniqueArticlesMap = new Map(allScrapedArticles.map(item => [item.url, item]));
    let uniqueArticles = Array.from(uniqueArticlesMap.values());
    console.log(`[News Scraper Service] Total unique articles: ${uniqueArticles.length}`);

    uniqueArticles.sort((a, b) => {
        const dateA = parseSortableDate(a.publishedAt);
        const dateB = parseSortableDate(b.publishedAt);
        if (!dateB) return -1; if (!dateA) return 1;
        return dateB.getTime() - dateA.getTime();
    });

    const finalArticles = uniqueArticles.slice(0, 10);
    console.log(`[News Scraper Service] Returning ${finalArticles.length} sorted articles.`);
    return finalArticles;
}

async function scrapeFuriaMatches() {
    const targetUrl = 'https://www.vlr.gg/team/matches/2406/furia/?group=completed';
    const baseVlrUrl = 'https://www.vlr.gg';
    const MAX_MATCHES_TO_SCRAPE = 4;

    console.log(`[Scraper] Fetching matches from: ${targetUrl}`);
    console.log(`[Scraper] Limiting results to: ${MAX_MATCHES_TO_SCRAPE}`);

    try {
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(html);
        console.log('[Scraper] HTML fetched and loaded into Cheerio.');

        const matches = [];

        $('a.wf-card.fc-flex.m-item').each((index, element) => {
            if (matches.length >= MAX_MATCHES_TO_SCRAPE) {
                console.log(`[Scraper] Reached match limit (${MAX_MATCHES_TO_SCRAPE}). Stopping.`);
                return false;
            }

            const matchCard = $(element);

            if (matchCard.find('.m-item-team').length === 0) {
                console.log("[Scraper] Skipping card: No .m-item-team found.");
                return;
            }

            const matchData = {};

            const eventElement = matchCard.find('.m-item-event');
            matchData.tournamentName = eventElement.find('div[style*="font-weight: 700"]').text().trim();
            let stageText = eventElement.text().trim();
            stageText = stageText.replace(matchData.tournamentName, '').replace(/[\n\t⋅]/g, '').trim();
            const lines = stageText.split('\n').map(line => line.trim()).filter(line => line);
            matchData.stage = lines.pop() || stageText || 'N/A';


            const teams = matchCard.find('.m-item-team');
            const team1Element = $(teams[0]);
            const team2Element = matchCard.find('.m-item-team.mod-right');

            matchData.team1 = {
                name: team1Element.find('.m-item-team-name').text().trim(),
                tag: team1Element.find('.m-item-team-tag').text().trim(),
            };
            if (team2Element.length > 0) {
                matchData.team2 = {
                    name: team2Element.find('.m-item-team-name').text().trim(),
                    tag: team2Element.find('.m-item-team-tag').text().trim(),
                };
            } else if (teams.length > 1) {
                console.warn("[Scraper] Team 2 not found using .mod-right, using second .m-item-team element as fallback.");
                const fallbackTeam2Element = $(teams[1]);
                matchData.team2 = {
                    name: fallbackTeam2Element.find('.m-item-team-name').text().trim(),
                    tag: fallbackTeam2Element.find('.m-item-team-tag').text().trim(),
                };
            } else {
                console.error("[Scraper] FATAL: Could not find team 2 for match card. Skipping match.");
                return;
            }

            if (matchData.team1.name.toLowerCase() === 'furia') {
                matchData.furia = matchData.team1;
                matchData.opponent = matchData.team2;
            } else if (matchData.team2.name.toLowerCase() === 'furia') {
                matchData.furia = matchData.team2;
                matchData.opponent = matchData.team1;
            } else {
                console.warn("[Scraper] Could not definitively identify FURIA by name (using 'furia'). Assuming team1:", matchData.team1.name, "vs", matchData.team2.name);
                matchData.furia = matchData.team1;
                matchData.opponent = matchData.team2;
            }

            const resultElement = matchCard.find('.m-item-result');
            const scoreSpans = resultElement.find('span');
            if (scoreSpans.length < 2) {
                console.warn("[Scraper] Skipping card: Less than 2 score spans found.");
                return;
            }
            let score1 = $(scoreSpans[0]).text().trim();
            let score2 = $(scoreSpans[scoreSpans.length - 1]).text().trim();

            if (matchData.furia === matchData.team1) {
                matchData.furiaScore = parseInt(score1, 10);
                matchData.opponentScore = parseInt(score2, 10);
            } else {
                matchData.furiaScore = parseInt(score2, 10);
                matchData.opponentScore = parseInt(score1, 10);
            }
            if (isNaN(matchData.furiaScore)) matchData.furiaScore = 0;
            if (isNaN(matchData.opponentScore)) matchData.opponentScore = 0;


            if (resultElement.hasClass('mod-win')) {
                matchData.result = (matchData.furia === matchData.team1) ? 'Win' : 'Loss';
            } else if (resultElement.hasClass('mod-loss')) {
                matchData.result = (matchData.furia === matchData.team1) ? 'Loss' : 'Win';
            } else {
                if (matchData.furiaScore === matchData.opponentScore) {
                    matchData.result = 'Draw';
                } else {
                    matchData.result = 'Draw/Unknown';
                }
            }

            if (resultElement.hasClass('mod-win')) {
                matchData.result = (matchData.furia === matchData.team1) ? 'Win' : 'Loss';
            } else if (resultElement.hasClass('mod-loss')) {
                matchData.result = (matchData.furia === matchData.team1) ? 'Loss' : 'Win';
            } else {
                matchData.result = (matchData.furiaScore === matchData.opponentScore) ? 'Draw' : 'Unknown';
            }

            const dateElement = matchCard.find('.m-item-date');
            const dateText = dateElement.text().trim().split(/[\n\t]+/).map(s => s.trim()).filter(s => s);
            matchData.date = dateText[0] || 'N/A';
            matchData.time = dateText[1] || 'N/A';



            const relativeLink = matchCard.attr('href');
            matchData.matchLink = relativeLink ? `${baseVlrUrl}${relativeLink}` : null;

            matches.push(matchData);
        });

        console.log(`[Scraper] Successfully scraped ${matches.length} matches (using original logic).`);
        return matches;

    } catch (error) {
        console.error(`[Scraper] Error scraping matches (original logic block):`, error.message);
        if (axios.isAxiosError(error) && error.response) {
            console.error(`[Scraper] Status: ${error.response.status}`);
        }
        const scrapeError = new Error(`Falha ao buscar dados dos jogos da Furia (original). Status: ${error.response?.status || 'N/A'}`);
        scrapeError.statusCode = error.response?.status || 500;
        throw scrapeError;
    }
}


// Exporta as funções do serviço
export { scrapeNews, scrapeFuriaMatches };