import jwt from 'jsonwebtoken';
import { createError } from './error.middleware.js';
export const requireAuth = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.token;
        const token = (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) || cookieToken;
        if (!token) {
            throw createError('Authentication required', 401);
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw createError('Server configuration error', 500);
        }
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            next(createError('Invalid or expired token', 401));
        }
        else {
            next(err);
        }
    }
};
export const requireAdmin = (req, _res, next) => {
    // Rely on requireAuth having been run first
    if (!req.user || !req.user.is_admin) {
        return next(createError('Forbidden: Admin access required', 403));
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map