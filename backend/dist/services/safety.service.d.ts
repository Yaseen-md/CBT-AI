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
export declare const logSafetyEvent: (userId: string, conversationId: string | null, snippet: string, severity: CrisisSeverity) => Promise<SafetyEvent>;
/**
 * Get recent safety events (for admin dashboard)
 */
export declare const getRecentSafetyEvents: (limit?: number, includeResolved?: boolean) => Promise<SafetyEvent[]>;
/**
 * Get safety events for a specific user
 */
export declare const getUserSafetyEvents: (userId: string) => Promise<SafetyEvent[]>;
/**
 * Resolve a safety event (admin action)
 */
export declare const resolveSafetyEvent: (eventId: string, resolvedBy: string, notes?: string) => Promise<SafetyEvent | null>;
/**
 * Get crisis statistics (for admin dashboard)
 */
export declare const getCrisisStats: () => Promise<{
    total: number;
    unresolved: number;
    bySeverity: Record<string, number>;
    last24h: number;
}>;
//# sourceMappingURL=safety.service.d.ts.map