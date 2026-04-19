import { Request, Response, NextFunction } from 'express';
/**
 * Standard API rate limiter (100 requests per 15 mins)
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Stricter configuration for authentication routes (10 requests per hour)
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Stricter config for sending chat messages (50 requests per 10 mins)
 */
export declare const messageLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Middleware to sanitize inputs (req.body, req.query, req.params) against XSS.
 * Deeply sanitizes string objects.
 */
export declare const sanitizeInputs: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.middleware.d.ts.map