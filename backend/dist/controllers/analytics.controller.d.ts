import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare const getMoodTrends: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getScreenerHistory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSessionStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getRecentActivity: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=analytics.controller.d.ts.map