import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// ─── Rate Limiting ───────────────────────────────────────────────────────────

/**
 * Standard API rate limiter (100 requests per 15 mins)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
});

/**
 * Stricter configuration for authentication routes (10 requests per hour)
 */
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts, please try again later.' },
});

/**
 * Stricter config for sending chat messages (50 requests per 10 mins)
 */
export const messageLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'You are sending messages too quickly. Please slow down.' },
});

// ─── Input Sanitization ──────────────────────────────────────────────────────

/**
 * Middleware to sanitize inputs (req.body, req.query, req.params) against XSS.
 * Deeply sanitizes string objects.
 */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction) => {
    const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
            // Strip all HTML/script tags from incoming strings
            return xss(obj, {
                whiteList: {}, // empty means no tags allowed
                stripIgnoreTag: true,
                stripIgnoreTagBody: ['script'] // the script tag is a special case, we need to filter out its content
            });
        }
        if (Array.isArray(obj)) {
            return obj.map((v) => sanitize(v));
        }
        if (obj !== null && typeof obj === 'object') {
            const sanitizedObj: any = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitizedObj[key] = sanitize(value);
            }
            return sanitizedObj;
        }
        return obj;
    };

    const sanitizeObject = (targetObj: any) => {
        if (!targetObj || typeof targetObj !== 'object') return;
        for (const [key, value] of Object.entries(targetObj)) {
            targetObj[key] = sanitize(value);
        }
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);

    next();
};
