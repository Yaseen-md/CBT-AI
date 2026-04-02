import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { createError } from './error.middleware.js';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg).join(', ');
        next(createError(messages, 400));
        return;
    }
    next();
};
