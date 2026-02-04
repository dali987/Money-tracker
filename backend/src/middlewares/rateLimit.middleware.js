import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        status: 'fail',
        message: 'Too many requests. Please slow down.',
    },
    skip: (req) => {
        if (req.method === 'OPTIONS') return true;
        return false;
    },
});
