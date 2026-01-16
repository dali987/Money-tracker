import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import User from '../models/user.model.js';

/**
 * Middleware to authorize requests using Better Auth sessions.
 * Replaces the old JWT-based authorization.
 *
 * Attaches the authenticated user to `req.user` for use in route handlers.
 */
export const authorizeToken = async (req, res, next) => {
    try {
        // Get session from Better Auth using the request headers
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No valid session',
            });
        }

        // Fetch the full user document from MongoDB
        // Better Auth stores minimal user data, we need full user with settings
        const user = await User.findById(session.user.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not found',
            });
        }

        // Attach user to request for use in route handlers
        req.user = user;
        req.session = session;

        next();
    } catch (error) {
        console.error('Authorization error:', error);

        // Handle specific error cases
        if (error.message?.includes('session')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Session expired or invalid',
            });
        }

        next(error);
    }
};

/**
 * Optional middleware that checks for authentication but doesn't require it.
 * Useful for routes that should work for both authenticated and anonymous users.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (session?.user) {
            const user = await User.findById(session.user.id).select('-password');
            req.user = user;
            req.session = session;
        }

        next();
    } catch (error) {
        // For optional auth, we don't fail on errors
        console.warn('Optional auth check failed:', error.message);
        next();
    }
};
