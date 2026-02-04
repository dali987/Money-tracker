import 'dotenv/config';

export const ENV = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI,
    CLIENT_URL: process.env.CLIENT_URL,
    EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
};
