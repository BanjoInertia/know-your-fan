import express from 'express';
import { scrapeFuriaMatches } from '../services/scraper.js';

const router = express.Router();

router.get('/furia-matches', async (req, res, next) => {
    console.log("-> GET /api/furia-matches");
    try {
        const matches = await scrapeFuriaMatches();
        res.json({ success: true, matches: matches });
    } catch (error) {
        console.error("Error in /furia-matches route:", error);
        next(error);
    }
});

export default router;