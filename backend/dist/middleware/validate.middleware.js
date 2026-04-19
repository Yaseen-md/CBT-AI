import { validationResult } from 'express-validator';
import { createError } from './error.middleware.js';
export const validate = (req, _res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg).join(', ');
        next(createError(messages, 400));
        return;
    }
    next();
};
//# sourceMappingURL=validate.middleware.js.map