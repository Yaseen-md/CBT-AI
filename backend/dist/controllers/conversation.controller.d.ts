import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare const createConversation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listConversations: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getConversation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=conversation.controller.d.ts.map