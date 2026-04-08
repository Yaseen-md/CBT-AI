import { query } from '../db.js';
import { CrisisSeverity } from './crisis.service.js';

export interface SafetyEvent {
    id: string;
    user_id: string | null;
    conversation_id: string | null;
    snippet: string | null;
    severity: CrisisSeverity;
    created_at: string;
    resolved: boolean;
    resolved_at: string | null;
    resolved_by: string | null;
    notes: string | null;
}

/**
 * Log a safety event when crisis is detected
 */
export const logSafetyEvent = async (
    userId: string,
    conversationId: string | null,
    snippet: string,
    severity: CrisisSeverity
): Promise<SafetyEvent> => {
    const result = await query(
        `INSERT INTO safety_events (user_id, conversation_id, snippet, severity)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, conversationId, snippet.substring(0, 500), severity]
    );

    // Increment user's crisis count
    await query(
        'UPDATE users SET crisis_count = crisis_count + 1 WHERE id = $1',
        [userId]
    );

    return result.rows[0];
};

/**
 * Get recent safety events (for admin dashboard)
 */
export const getRecentSafetyEvents = async (
    limit: number = 20,
    includeResolved: boolean = false
): Promise<SafetyEvent[]> => {
    const resolvedFilter = includeResolved ? '' : 'AND resolved = false';
    const result = await query(
        `SELECT se.*, u.email, u.name as user_name
         FROM safety_events se
         LEFT JOIN users u ON se.user_id = u.id
         WHERE 1=1 ${resolvedFilter}
         ORDER BY se.created_at DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows;
};

/**
 * Get safety events for a specific user
 */
export const getUserSafetyEvents = async (userId: string): Promise<SafetyEvent[]> => {
    const result = await query(
        `SELECT * FROM safety_events
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId]
    );
    return result.rows;
};

/**
 * Resolve a safety event (admin action)
 */
export const resolveSafetyEvent = async (
    eventId: string,
    resolvedBy: string,
    notes?: string
): Promise<SafetyEvent | null> => {
    const result = await query(
        `UPDATE safety_events
         SET resolved = true, resolved_at = CURRENT_TIMESTAMP, resolved_by = $2, notes = $3
         WHERE id = $1
         RETURNING *`,
        [eventId, resolvedBy, notes || null]
    );
    return result.rows[0] || null;
};

/**
 * Get crisis statistics (for admin dashboard)
 */
export const getCrisisStats = async (): Promise<{
    total: number;
    unresolved: number;
    bySeverity: Record<string, number>;
    last24h: number;
}> => {
    const totalResult = await query('SELECT COUNT(*) FROM safety_events');
    const unresolvedResult = await query('SELECT COUNT(*) FROM safety_events WHERE resolved = false');
    const last24hResult = await query(
        "SELECT COUNT(*) FROM safety_events WHERE created_at > NOW() - INTERVAL '24 hours'"
    );
    const bySeverityResult = await query(
        'SELECT severity, COUNT(*) FROM safety_events GROUP BY severity'
    );

    const bySeverity: Record<string, number> = {};
    bySeverityResult.rows.forEach((row: { severity: string; count: string }) => {
        bySeverity[row.severity] = parseInt(row.count, 10);
    });

    return {
        total: parseInt(totalResult.rows[0].count, 10),
        unresolved: parseInt(unresolvedResult.rows[0].count, 10),
        bySeverity,
        last24h: parseInt(last24hResult.rows[0].count, 10),
    };
};
