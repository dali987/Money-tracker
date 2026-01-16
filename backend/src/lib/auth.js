import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { ENV } from './env.js';

/**
 * MongoDB client for Better Auth.
 * We create a separate client instance because Better Auth needs access
 * to the native MongoDB client, not mongoose.
 */
const client = new MongoClient(ENV.MONGO_URI);
const db = client.db();

/**
 * Better Auth configuration for MongoDB with email/password authentication.
 *
 * This replaces the custom JWT/bcrypt/Redis auth system with Better Auth's
 * built-in session management and secure password hashing.
 */
export const auth = betterAuth({
    /**
     * Database configuration using MongoDB adapter.
     * Uses a native MongoDB database object.
     */
    database: mongodbAdapter(db),

    /**
     * Base URL for the auth server.
     * Used for generating callback URLs and redirects.
     */
    baseURL: ENV.BETTER_AUTH_URL || 'http://localhost:3000',

    /**
     * Secret key for signing tokens and cookies.
     * Must be at least 32 characters.
     */
    secret: ENV.BETTER_AUTH_SECRET,

    /**
     * Email and password authentication configuration.
     */
    emailAndPassword: {
        enabled: true,
        /**
         * Minimum password length requirement.
         */
        minPasswordLength: 6,
        /**
         * Maximum password length to prevent DoS attacks.
         */
        maxPasswordLength: 128,
    },

    /**
     * Session configuration.
     */
    session: {
        /**
         * Session expiry time (7 days by default).
         */
        expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
        /**
         * Update session expiry on each request if within this window.
         */
        updateAge: 60 * 60 * 24, // 1 day in seconds
        /**
         * Cookie configuration for sessions.
         */
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes cache
        },
    },

    /**
     * User configuration with additional fields.
     */
    user: {
        /**
         * Additional fields to store on the user object.
         * These extend Better Auth's default user schema.
         */
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

    /**
     * Advanced security options.
     */
    advanced: {
        /**
         * Use secure cookies in production.
         */
        useSecureCookies: ENV.NODE_ENV === 'production',
        /**
         * Default cookie attributes.
         */
        defaultCookieAttributes: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: ENV.NODE_ENV === 'production',
        },
    },

    /**
     * Trust the host header for proxy setups.
     */
    trustedOrigins: ['http://localhost:3000', ENV.CLIENT_URL].filter(Boolean),
});

export default auth;
