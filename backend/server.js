import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import sessionMiddleware from './config/session.js';
import mainRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS: Origin '${origin}' not allowed.`);
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
    console.log(`CORS: Allowing requests from: ${allowedOrigins.join(', ')}`);
    if (config.twitch.mockApi) {
        console.log("--- TWITCH API MOCKING IS ENABLED ---");
    }
});