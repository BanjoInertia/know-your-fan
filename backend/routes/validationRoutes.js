import express from 'express';
import upload from '../config/multer.js';
import { analyzeDocument } from '../services/gemini.js';

const router = express.Router();

router.post('/validate-document', upload.single('documentFile'), async (req, res, next) => {
    console.log("-> POST /api/validate-document received on backend");

    if (!req.file) {
        console.log("Backend: No file uploaded.");
        return res.status(400).json({ success: false, error: 'Nenhum arquivo de documento enviado.' });
    }

    try {
        console.log("VALIDATION_ROUTE: Recebido request para /api/validate-document");
        console.log("VALIDATION_ROUTE: Chamando analyzeDocument...");

        console.log("VALIDATION_ROUTE: req.file details:", {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        const analysisResult = await analyzeDocument(fileBuffer, mimeType);
        console.log("VALIDATION_ROUTE: analyzeDocument retornou.");
        res.json({ analysis: analysisResult });

    } catch (error) {
        console.error("Backend: Error in /validate-document route:", error.message);
        next(error);
    }
});

export default router;