import multer from 'multer';
import config from '../backend/config/index.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    console.error("--- GLOBAL ERROR HANDLER ---");

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'An unexpected internal server error occurred.';

    if (err instanceof multer.MulterError) {
        console.error("Multer error:", err.code, err.message);
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'Arquivo muito grande. O tamanho máximo é 10MB.';
        } else {
            message = `Erro no upload do arquivo: ${err.message}`;
        }
    }
    else if (err.message === 'Invalid file type. Only PNG, JPG, or PDF allowed.') {
        console.error("File type error:", err.message);
        statusCode = 400;
        message = err.message;
    }
    else if (statusCode >= 500) {
        console.error("Error Stack:", err.stack);
    } else {
        console.log(`Client Error (${statusCode}): ${message}`);
    }


    if (config.isProduction && statusCode >= 500 && !err.isOperational) {
        message = 'Erro interno inesperado no servidor.';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(config.isProduction ? {} : { code: err.code, name: err.name })
    });
};

export default errorHandler;