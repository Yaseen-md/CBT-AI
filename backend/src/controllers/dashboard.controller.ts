import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import pool from '../db.js';

export const getDashboardData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // 1. Fetch recent conversations (limit 5)
        const convResult = await pool.query(
            `SELECT id, title, updated_at, 
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
             FROM conversations c
             WHERE user_id = $1 AND archived = false
             ORDER BY updated_at DESC LIMIT 5`,
            [userId]
        );

        // 2. Fetch recent journal entries (limit 3)
        const journalResult = await pool.query(
            `SELECT id, short_summary, full_text, tags, created_at 
             FROM memories 
             WHERE user_id = $1 AND type = 'journal'
             ORDER BY created_at DESC LIMIT 3`,
            [userId]
        );

        // 3. Fetch recent distortions (limit 10)
        const distortionsResult = await pool.query(
            `SELECT id, short_summary, tags, created_at 
             FROM memories 
             WHERE user_id = $1 AND type = 'cognitive-distortion-tag'
             ORDER BY created_at DESC LIMIT 10`,
            [userId]
        );

        // 4. Fetch PHQ-9 trends (limit 10)
        const phq9Result = await pool.query(
            `SELECT total_score, severity_label, taken_at 
             FROM phq9_responses 
             WHERE user_id = $1
             ORDER BY taken_at ASC LIMIT 10`,
            [userId]
        );

        // 5. Fetch GAD-7 trends (limit 10)
        const gad7Result = await pool.query(
            `SELECT total_score, severity_label, taken_at 
             FROM gad7_responses 
             WHERE user_id = $1
             ORDER BY taken_at ASC LIMIT 10`,
            [userId]
        );

        // 6. Fetch Mood trends (limit 30)
        const moodResult = await pool.query(
            `SELECT mood_score, created_at 
             FROM mood_checkins 
             WHERE user_id = $1
             ORDER BY created_at ASC LIMIT 30`,
            [userId]
        );

        return res.json({
            success: true,
            data: {
                conversations: convResult.rows,
                journalEntries: journalResult.rows,
                distortions: distortionsResult.rows,
                phq9: phq9Result.rows,
                gad7: gad7Result.rows,
                mood: moodResult.rows
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        next(error);
    }
};
