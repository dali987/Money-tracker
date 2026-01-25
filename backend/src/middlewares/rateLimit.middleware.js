import rateLimit from 'express-rate-limit';

/**
 * API Limiter
 * Standard limits for general API endpoints.
 * Allows 200 requests per minute to ensure smooth user experience while preventing abuse.
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // Limit each IP to 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        status: 'fail',
        message: 'Too many requests. Please slow down.',
    },
    // Optional: You could skip rate limiting for specific trusted IPs or internal services
    skip: (req) => {
        if (req.method === 'OPTIONS') return true;
        return false;
    },
});
