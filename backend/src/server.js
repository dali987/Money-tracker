import express from 'express';
import next from 'next';
import { ENV } from './lib/env.js';
import connectToDatabase from './database/mongodb.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import accountRouter from './routes/account.router.js';
import transactionRouter from './routes/transaction.router.js';
import userRouter from './routes/user.router.js';
import exchangeRouter from './routes/exchange.router.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { fetchAndSaveExchangeRates } from './controllers/exchange.controller.js';

const dev = ENV.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: '../frontend' });
const handle = nextApp.getRequestHandler();

const PORT = ENV.PORT;

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 150, // Limit each IP to 150 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    skip: (req, res) => {
        // Skip OPTIONS requests
        if (req.method === 'OPTIONS') return true;
        // Skip health check routes
        if (req.path === '/api/health') return true;
        return false;
    },
});

nextApp.prepare().then(async () => {
    // Connect to database BEFORE creating the app
    // This is required because Better Auth needs the mongoose connection
    await connectToDatabase();

    const app = express();

    app.use(cookieParser());

    /**
     * Better Auth handler - mounted BEFORE express.json() middleware.
     * Better Auth handles its own body parsing for auth routes.
     * Uses Express 5 compatible wildcard pattern.
     */
    app.all('/api/auth/{*path}', toNodeHandler(auth));

    // JSON body parsing for non-auth routes
    app.use(express.json());

    // Rate limiting (disabled for development)
    // app.use(limiter);

    // Security headers (disabled for development)
    // app.use(helmet({
    //     contentSecurityPolicy: {
    //         useDefaults: true,
    //         directives: {
    //             "default-src": ["'self'"],
    //             "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    //             "connectSrc": ["'self'", "http://localhost:3000"],
    //             "styleSrc": ["'self'", "'unsafe-inline'"],
    //             "imgSrc": ["'self'", "data:", "https:"],
    //         },
    //     },
    // }));

    // API routes (protected by auth middleware in individual routers)
    const apiRouter = express.Router();
    apiRouter.use('/account', accountRouter);
    apiRouter.use('/transaction', transactionRouter);
    apiRouter.use('/user', userRouter);
    apiRouter.use('/exchange', exchangeRouter);

    app.use('/api/v1', apiRouter);

    // Error handling middleware
    app.use(errorMiddleware);

    // Next.js handler for all other routes
    app.all(/.*/, (req, res) => {
        return handle(req, res);
    });

    app.listen(PORT, async () => {
        console.log('Server is up, port:', PORT);

        // Schedule weekly exchange rate updates (Every Sunday at midnight)
        cron.schedule('0 0 * * 0', async () => {
            console.log('Running weekly exchange rate update...');
            try {
                await fetchAndSaveExchangeRates();
                console.log('Exchange rates updated successfully via scheduler.');
            } catch (error) {
                console.error('Failed to update exchange rates in scheduler:', error);
            }
        });
    });
});
