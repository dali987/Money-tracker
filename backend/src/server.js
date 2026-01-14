import express from 'express';
import next from 'next';
import { ENV } from './lib/env.js';
import connectToDatabase from './database/mongodb.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
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
  max: 150, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests, please try again later.",
  skip: (req, res) => {
    // Skip OPTIONS requests
    if (req.method === 'OPTIONS') return true;
    
    // Optional: Skip specific "lightweight" health check routes
    if (req.path === '/api/health') return true;
    
    return false;
  }
});

nextApp.prepare().then(() => {
    const app = express();

    app.use(cookieParser());
    app.use(express.json());
    // app.use(limiter)
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
    // }))

    const apiRouter = express.Router(); //

    apiRouter.use('/auth', authRouter);
    apiRouter.use('/account', accountRouter);
    apiRouter.use('/transaction', transactionRouter);
    apiRouter.use('/user', userRouter);
    apiRouter.use('/exchange', exchangeRouter);

    app.use('/api/v1', apiRouter);

    app.use(errorMiddleware);

    app.all(/.*/, (req, res) => {
        return handle(req, res);
    });

    app.listen(PORT, async () => {
        console.log('server is up, port: ', PORT);

        await connectToDatabase();

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
