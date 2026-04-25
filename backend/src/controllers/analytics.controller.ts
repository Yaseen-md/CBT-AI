import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { query } from '../db.js';

// --- MOOD TRENDS ---

export const getMoodTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const result = await query(
            `SELECT
                DATE(created_at) as date,
                mood_score,
                COALESCE(energy_level, 5) as energy_level,
                COALESCE(anxiety_level, 5) as anxiety_level
            FROM mood_checkins
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 30`,
            [userId]
        );
        // Reverse to get chronological order
        const trends = result.rows.reverse().map(row => ({
            date: row.date,
            mood_score: parseInt(row.mood_score),
            energy_level: parseInt(row.energy_level),
            anxiety_level: parseInt(row.anxiety_level)
        }));
        res.json({ success: true, trends });
    } catch (err) {
        next(err);
    }
};

// --- SCREENER HISTORY ---

export const getScreenerHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const phq9Result = await query(
            `SELECT
                DATE(taken_at) as date,
                total_score,
                severity_label
            FROM phq9_responses
            WHERE user_id = $1
            ORDER BY taken_at DESC
            LIMIT 20`,
            [userId]
        );

        const gad7Result = await query(
            `SELECT
                DATE(taken_at) as date,
                total_score,
                severity_label
            FROM gad7_responses
            WHERE user_id = $1
            ORDER BY taken_at DESC
            LIMIT 20`,
            [userId]
        );

        const phq9 = phq9Result.rows.reverse().map(row => ({
            date: row.date,
            total_score: parseInt(row.total_score),
            severity: row.severity_label
        }));

        const gad7 = gad7Result.rows.reverse().map(row => ({
            date: row.date,
            total_score: parseInt(row.total_score),
            severity: row.severity_label
        }));

        res.json({ success: true, phq9, gad7 });
    } catch (err) {
        next(err);
    }
};

// --- SESSION STATS ---

export const getSessionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        // Get counts from each table
        const conversationsResult = await query(
            'SELECT COUNT(*) as count FROM conversations WHERE user_id = $1',
            [userId]
        );

        const journalResult = await query(
            'SELECT COUNT(*) as count FROM journal_entries WHERE user_id = $1',
            [userId]
        );

        const thoughtRecordsResult = await query(
            'SELECT COUNT(*) as count FROM thought_records WHERE user_id = $1',
            [userId]
        );

        const moodCheckinsResult = await query(
            'SELECT COUNT(*) as count FROM mood_checkins WHERE user_id = $1',
            [userId]
        );

        // Get first session date
        const firstSessionResult = await query(
            `SELECT MIN(created_at) as first_date FROM (
                SELECT created_at FROM conversations WHERE user_id = $1
                UNION ALL
                SELECT created_at FROM journal_entries WHERE user_id = $1
                UNION ALL
                SELECT created_at FROM mood_checkins WHERE user_id = $1
            ) all_sessions`,
            [userId]
        );

        const firstDate = firstSessionResult.rows[0]?.first_date;
        const daysSinceFirst = firstDate
            ? Math.floor((Date.now() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 0;

        // Calculate current streak (consecutive days with at least one activity)
        const streakResult = await query(
            `SELECT DISTINCT DATE(created_at) as activity_date FROM (
                SELECT created_at FROM conversations WHERE user_id = $1
                UNION ALL
                SELECT created_at FROM journal_entries WHERE user_id = $1
                UNION ALL
                SELECT created_at FROM mood_checkins WHERE user_id = $1
                UNION ALL
                SELECT created_at FROM thought_records WHERE user_id = $1
            ) all_activities
            ORDER BY activity_date DESC`,
            [userId]
        );

        let currentStreak = 0;
        if (streakResult.rows.length > 0) {
            const dates = streakResult.rows.map(r => new Date(r.activity_date));
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if there's activity today or yesterday to start counting
            let expectedDate = new Date(today);
            let hasActivityTodayOrYesterday = false;

            for (const date of dates) {
                date.setHours(0, 0, 0, 0);
                const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays <= 1) {
                    hasActivityTodayOrYesterday = true;
                    expectedDate = date;
                    break;
                }
            }

            if (hasActivityTodayOrYesterday) {
                for (let i = 0; i < dates.length; i++) {
                    const date = new Date(dates[i]);
                    date.setHours(0, 0, 0, 0);

                    const expectedCheck = new Date(expectedDate);
                    expectedCheck.setDate(expectedCheck.getDate() - i);

                    if (date.getTime() === expectedCheck.getTime()) {
                        currentStreak++;
                    } else if (date.getTime() < expectedCheck.getTime()) {
                        // Gap detected, stop counting
                        break;
                    }
                }
            }
        }

        res.json({
            success: true,
            stats: {
                total_conversations: parseInt(conversationsResult.rows[0].count),
                total_journal_entries: parseInt(journalResult.rows[0].count),
                total_thought_records: parseInt(thoughtRecordsResult.rows[0].count),
                total_mood_checkins: parseInt(moodCheckinsResult.rows[0].count),
                days_since_first: daysSinceFirst,
                current_streak: currentStreak
            }
        });
    } catch (err) {
        next(err);
    }
};

// --- RECENT ACTIVITY ---

export const getRecentActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        // Get recent activities from all sources
        const result = await query(
            `(SELECT
                'mood_checkin' as activity_type,
                created_at,
                'Mood Check-in' as title,
                'Rated mood: ' || mood_score || '/10' as summary
            FROM mood_checkins WHERE user_id = $1)
            UNION ALL
            (SELECT
                'journal_entry' as activity_type,
                created_at,
                COALESCE(short_summary, 'Journal Entry') as title,
                'Journal entry created' as summary
            FROM journal_entries WHERE user_id = $1)
            UNION ALL
            (SELECT
                'thought_record' as activity_type,
                created_at,
                'Thought Record' as title,
                'Completed a CBT thought record' as summary
            FROM thought_records WHERE user_id = $1)
            UNION ALL
            (SELECT
                'phq9' as activity_type,
                taken_at as created_at,
                'PHQ-9 Assessment' as title,
                'Depression screener: ' || severity_label as summary
            FROM phq9_responses WHERE user_id = $1)
            UNION ALL
            (SELECT
                'gad7' as activity_type,
                taken_at as created_at,
                'GAD-7 Assessment' as title,
                'Anxiety screener: ' || severity_label as summary
            FROM gad7_responses WHERE user_id = $1)
            ORDER BY created_at DESC
            LIMIT 10`,
            [userId]
        );

        const activities = result.rows.map(row => ({
            type: row.activity_type,
            title: row.title,
            summary: row.summary,
            timestamp: row.created_at
        }));

        res.json({ success: true, activities });
    } catch (err) {
        next(err);
    }
};
