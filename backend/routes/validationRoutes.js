import express from 'express';
import upload from './config/multer.js';
import { analyzeDocument } from '../services/gemini.js';

const router = express.Router();

router.post('/validate-document', upload.single('documentFile'), async (req, res, next) => {
    console.log("-> POST /api/validate-document");

    if (!req.file) {
        console.log("No file uploaded.");
        return res.status(400).json({ success: false, error: 'Nenhum arquivo de documento enviado.' });
    }

    try {
        const analysisResult = await analyzeDocument(req.file.buffer, req.file.mimetype);
        console.log("Document analysis successful.");
        res.json({ success: true, analysis: analysisResult });

    } catch (error)
    {
        console.error("Error in /validate-document route:", error.message);
        next(error);
    }
});

export default router;