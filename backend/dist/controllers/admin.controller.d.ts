import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare const getSystemStats: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSafetyEvents: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const resolveEvent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map