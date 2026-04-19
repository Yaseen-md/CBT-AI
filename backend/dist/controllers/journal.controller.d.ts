import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
/**
 * POST /api/journal
 * Create a new journal entry
 */
export declare const createJournalEntry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/journal
 * List user's journal entries (paginated)
 */
export declare const listJournalEntries: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/journal/:id
 * Get a single journal entry
 */
export declare const getJournalEntry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * PUT /api/journal/:id
 * Update a journal entry
 */
export declare const updateJournalEntry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * DELETE /api/journal/:id
 * Delete a journal entry
 */
export declare const deleteJournalEntry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/journal/recent
 * Get recent journal entries for dashboard
 */
export declare const getRecentJournalEntries: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/journal/insights
 * Get recent cognitive distortion tags for dashboard insights
 */
export declare const getRecentDistortions: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=journal.controller.d.ts.map