import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import sessionMiddleware from './config/session.js';
import mainRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        const allowed = [config.frontendUrl, ...config.allowedOrigins];
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

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