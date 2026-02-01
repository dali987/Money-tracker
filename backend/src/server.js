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
import budgetRouter from './routes/budget.router.js';
import recurringRouter from './routes/recurring.router.js';
import helmet from 'helmet';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import cron from 'node-cron';
import {
    fetchAndSaveExchangeRates,
    checkExchangeRates,
} from './controllers/exchange.controller.js';
import { processDueRecurringTransactions } from './controllers/recurring.controller.js';

const dev = ENV.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: '../frontend' });
const handle = nextApp.getRequestHandler();

const PORT = ENV.PORT;

nextApp.prepare().then(async () => {
    await connectToDatabase();

    const app = express();

    app.use(cookieParser());

    app.all('/api/auth/{*path}', toNodeHandler(auth));

    app.use(express.json());

    // Apply Helmet for security headers
    app.use(
        helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'default-src': ["'self'"],
                    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    'connect-src': ["'self'", 'http://localhost:3000'],
                    'style-src': ["'self'", "'unsafe-inline'"],
                    'img-src': ["'self'", 'data:', 'https:'],
                },
            },
        }),
    );

    const apiRouter = express.Router();
    apiRouter.use('/account', accountRouter);
    apiRouter.use('/transaction', transactionRouter);
    apiRouter.use('/user', userRouter);
    apiRouter.use('/exchange', exchangeRouter);
    apiRouter.use('/budget', budgetRouter);
    apiRouter.use('/recurring', recurringRouter);

    // Standard rate limiting for API routes
    app.use('/api/v1', apiLimiter);
    app.use('/api/v1', apiRouter);

    app.use(errorMiddleware);

    app.all(/.*/, (req, res) => {
        return handle(req, res);
    });

    app.listen(PORT, async () => {
        console.log('Server is up, port:', PORT);

        // Run startup check for exchange rates
        try {
            await checkExchangeRates();
        } catch (error) {
            console.error('Failed to run startup exchange rates check:', error);
        }

        // Run startup check for recurring transactions
        try {
            await processDueRecurringTransactions();
        } catch (error) {
            console.error('Failed to run startup recurring transactions check:', error);
        }

        cron.schedule('0 0 * * *', async () => {
            console.log('Running daily exchange rate update check...');
            try {
                await checkExchangeRates();
                console.log('Exchange rates update check completed via scheduler.');
            } catch (error) {
                console.error('Failed to check exchange rates in scheduler:', error);
            }
        });

        cron.schedule('0 0 * * *', async () => {
            console.log('Running daily recurring transactions check...');
            try {
                const count = await processDueRecurringTransactions();
                console.log(`Daily check complete. Processed ${count} recurring transactions.`);
            } catch (error) {
                console.error('Failed to run daily recurring transactions check:', error);
            }
        });
    });
});
