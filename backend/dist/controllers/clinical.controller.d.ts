import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare const submitThoughtRecord: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listThoughtRecords: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const submitMoodCheckin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listMoodCheckins: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const submitPhq9: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listPhq9Scores: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const submitGad7: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listGad7Scores: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const submitSafetyPlan: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listSafetyPlans: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=clinical.controller.d.ts.map