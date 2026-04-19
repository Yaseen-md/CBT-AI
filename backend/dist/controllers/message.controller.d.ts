import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare const sendMessage: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMessages: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=message.controller.d.ts.map