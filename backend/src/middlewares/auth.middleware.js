import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import User from '../models/user.model.js';

export const authorizeToken = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No valid session',
            });
        }

        const user = await User.findById(session.user.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not found',
            });
        }

        req.user = user;
        req.session = session;

        next();
    } catch (error) {
        console.error('Authorization error:', error);

        if (error.message?.includes('session')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Session expired or invalid',
            });
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
