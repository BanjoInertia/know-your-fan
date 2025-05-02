import express from 'express';
import { scrapeNews } from './services/scraper.js';

const router = express.Router();

router.get('/news', async (req, res, next) => {
    console.log("-> GET /api/news");
    const { game } = req.query;

    if (!game || typeof game !== 'string' || game.trim() === '') {
        console.log("Missing 'game' query parameter.");
        return res.status(400).json({ success: false, error: 'Parâmetro "game" (jogo favorito) é obrigatório.' });
    }

    try {
        const articles = await scrapeNews(game);
        res.json({ success: true, articles: articles });
    } catch (error) {
        console.error("Error in /news route:", error);
        next(error);
    }
});

export default router;