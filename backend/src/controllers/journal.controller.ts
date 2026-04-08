import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { createError } from '../middleware/error.middleware.js';
import {
    createMemory,
    getMemoriesByUser,
    getMemoryById,
    updateMemory,
    deleteMemory,
} from '../services/memory.service.js';

/**
 * POST /api/journal
 * Create a new journal entry
 */
export const createJournalEntry = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const { short_summary, full_text, tags } = req.body;

        if (!full_text && !short_summary) {
            throw createError('Either full_text or short_summary is required', 400);
        }

        const memory = await createMemory({
            user_id: userId,
            type: 'journal',
            short_summary,
            full_text,
            tags: tags || [],
        });

        res.status(201).json({ success: true, memory });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/journal
 * List user's journal entries (paginated)
 */
export const listJournalEntries = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const memories = await getMemoriesByUser(userId, 'journal', limit, offset);

        res.json({ success: true, memories });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/journal/:id
 * Get a single journal entry
 */
export const getJournalEntry = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const memory = await getMemoryById(id, userId);
        if (!memory) {
            throw createError('Journal entry not found', 404);
        }

        res.json({ success: true, memory });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/journal/:id
 * Update a journal entry
 */
export const updateJournalEntry = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const { short_summary, full_text, tags } = req.body;

        const memory = await updateMemory(id, userId, {
            short_summary,
            full_text,
            tags,
        });

        res.json({ success: true, memory });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/journal/:id
 * Delete a journal entry
 */
export const deleteJournalEntry = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        await deleteMemory(id, userId);

        res.json({ success: true, message: 'Journal entry deleted' });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/journal/recent
 * Get recent journal entries for dashboard
 */
export const getRecentJournalEntries = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 3;

        const memories = await getMemoriesByUser(userId, 'journal', limit, 0);

        res.json({ success: true, memories });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/journal/insights
 * Get recent cognitive distortion tags for dashboard insights
 */
export const getRecentDistortions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 10;

        const memories = await getMemoriesByUser(userId, 'cognitive-distortion-tag', limit, 0);

        res.json({ success: true, memories });
    } catch (err) {
        next(err);
    }
};

