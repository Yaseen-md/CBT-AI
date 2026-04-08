import { Response, NextFunction } from 'express';
import { query } from '../db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { getRecentSafetyEvents, getCrisisStats, resolveSafetyEvent } from '../services/safety.service.js';
import { createError } from '../middleware/error.middleware.js';

// GET /api/admin/stats
export const getSystemStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userCountRes = await query('SELECT COUNT(*) FROM users');
        const convCountRes = await query('SELECT COUNT(*) FROM conversations');
        const messageCountRes = await query('SELECT COUNT(*) FROM messages');
        
        const crisisStats = await getCrisisStats();

        res.json({
            success: true,
            stats: {
                users: parseInt(userCountRes.rows[0].count, 10),
                conversations: parseInt(convCountRes.rows[0].count, 10),
                messages: parseInt(messageCountRes.rows[0].count, 10),
                safetyEvents: crisisStats
            }
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/admin/safety-events
export const getSafetyEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const includeResolved = req.query.includeResolved === 'true';
        const limit = parseInt(req.query.limit as string) || 50;
        
        const events = await getRecentSafetyEvents(limit, includeResolved);

        res.json({ success: true, events });
    } catch (err) {
        next(err);
    }
};

// PUT /api/admin/safety-events/:id/resolve
export const resolveEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const adminId = req.user!.id;

        const updatedEvent = await resolveSafetyEvent(id, adminId, notes);
        if (!updatedEvent) {
            throw createError('Safety event not found', 404);
        }

        res.json({ success: true, event: updatedEvent });
    } catch (err) {
        next(err);
    }
};

// GET /api/admin/users
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await query(
            `SELECT id, name, email, created_at, crisis_count, is_admin 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.json({ success: true, users: result.rows });
    } catch (err) {
        next(err);
    }
};
