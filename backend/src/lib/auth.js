import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { ENV } from './env.js';

const client = new MongoClient(ENV.MONGO_URI);
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db),

    baseURL: ENV.BETTER_AUTH_URL || 'http://localhost:3000',
    secret: ENV.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
        maxPasswordLength: 128,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },
    user: {
        additionalFields: {
            username: {
                type: 'string',
                required: false,
            },
            currencies: {
                type: 'string[]',
                defaultValue: ['EUR'],
            },
            baseCurrency: {
                type: 'string',
                defaultValue: 'USD',
            },
            groups: {
                type: 'string[]',
                defaultValue: ['Cash', 'Bank', 'Credit'],
            },
            tags: {
                type: 'string[]',
                defaultValue: [
                    'Groceries',
                    'Restaurant',
                    'Rent',
                    'Tax',
                    'Health',
                    'Clothes',
                    'Transport',
                    'Entertainment',
                    'Salary',
                    'Random',
                    'Stationery',
                    'Utilities',
                    'Others',
                ],
            },
            profilePic: {
                type: 'string',
                defaultValue: '',
            },
        },
    },
    advanced: {
        useSecureCookies: ENV.NODE_ENV === 'production',
        defaultCookieAttributes: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: ENV.NODE_ENV === 'production',
        },
    },
    trustedOrigins: ['http://localhost:3000', ENV.CLIENT_URL].filter(Boolean),
});

export default auth;
