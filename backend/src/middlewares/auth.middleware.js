import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import User from '../models/user.model.js';

export const authorizeToken = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            const error = new Error("Unauthorized: No valid session");
            error.status = 401;
            throw error;
        }

        const user = await User.findById(session.user.id).select('-password');

        if (!user) {
            const error = new Error("Unauthorized: User not found");
            error.status = 401;
            throw error;
        }

        req.user = user;
        req.session = session;

        next();
    } catch (error) {
        console.error('Authorization error:', error);

        if (error.message?.includes('session')) {
            const error = new Error("Unauthorized: Session expired or invalid");
            error.status = 401;
            throw error;
        }

        next(error);
    }
};

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
        console.warn('Optional auth check failed:', error.message);
        next();
    }
};
