import { Response, NextFunction } from 'express';
import { query } from '../db.js';
import { createError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { generateReply, generateSessionSummary, Message } from '../services/openai.service.js';
import { getRecentMemories, saveSessionSummary } from '../services/memory.service.js';
import { detectCrisis, getCrisisResources } from '../services/crisis.service.js';
import { logSafetyEvent } from '../services/safety.service.js';

/**
 * Build memory context string from user's recent memories for AI injection
 */
const buildMemoryContext = async (userId: string): Promise<string | undefined> => {
    try {
        const memories = await getRecentMemories(userId, ['journal', 'summary'], 5);
        if (memories.length === 0) return undefined;

        const contextParts = memories.map((m) => {
            const date = new Date(m.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
            if (m.type === 'journal') {
                return `[Journal ${date}]: ${m.short_summary || m.full_text?.substring(0, 200)}`;
            }
            return `[Session Summary ${date}]: ${m.short_summary || m.full_text?.substring(0, 200)}`;
        });

        return contextParts.join('\n');
    } catch {
        // Don't fail the message if memory retrieval fails
        return undefined;
    }
};

// POST /api/messages
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.user!.id;
        const userCountry = req.user!.country;

        // Verify conversation belongs to user
        const convResult = await query(
            'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
            [conversationId, userId]
        );
        if (convResult.rows.length === 0) throw createError('Conversation not found', 404);

        // ─── Crisis Detection ─────────────────────────────────────────────
        const crisisResult = detectCrisis(content);
        let crisisData = null;

        if (crisisResult.detected) {
            // Log safety event (non-blocking for low severity, blocking for high/critical)
            try {
                await logSafetyEvent(userId, conversationId, content, crisisResult.severity);
                console.warn(
                    `🚨 Crisis detected [${crisisResult.severity}] for user ${userId}: ${crisisResult.matchedPatterns.join(', ')}`
                );
            } catch (err) {
                console.error('Failed to log safety event:', err);
            }

            // Build country-aware crisis response data for frontend
            if (crisisResult.requiresImmediateAction) {
                const crisisResources = getCrisisResources(userCountry);
                crisisData = {
                    severity: crisisResult.severity,
                    crisisType: crisisResult.crisisType,
                    requiresPsychiatricEscalation: crisisResult.requiresPsychiatricEscalation,
                    resources: crisisResources.resources,
                    banner: crisisResources.banner,
                    psychiatricNote: crisisResult.requiresPsychiatricEscalation
                        ? crisisResources.psychiatricNote
                        : undefined,
                };
            }
        }

        // Save user message
        const userMsgResult = await query(
            `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'user', $2) RETURNING *`,
            [conversationId, content]
        );
        const userMessage = userMsgResult.rows[0];

        // Fetch recent history for context
        const historyResult = await query(
            `SELECT role, content FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
            [conversationId]
        );
        const history: Message[] = historyResult.rows.map((r: { role: string; content: string }) => ({
            role: r.role as 'user' | 'assistant',
            content: r.content,
        }));

        // Build memory context from user's past journals and summaries
        const memoryContext = await buildMemoryContext(userId);

        // Generate AI reply with memory context
        const aiContent = await generateReply(history, memoryContext);

        // Save AI reply
        const aiMsgResult = await query(
            `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'assistant', $2) RETURNING *`,
            [conversationId, aiContent]
        );
        const aiMessage = aiMsgResult.rows[0];

        // Update conversation's updated_at
        await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);

        // Auto-generate session summary every 10 messages (non-blocking)
        if (history.length > 0 && history.length % 10 === 0) {
            generateSessionSummary(history)
                .then((result) => saveSessionSummary(userId, conversationId, result.summary, result.distortions))
                .catch((err) => console.error('Session summary generation failed:', err));
        }

        res.status(201).json({
            success: true,
            userMessage,
            aiMessage,
            crisis: crisisData, // null if no crisis, object if crisis detected
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/messages/:conversationId
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user!.id;

        // Verify ownership
        const convResult = await query(
            'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
            [conversationId, userId]
        );
        if (convResult.rows.length === 0) throw createError('Conversation not found', 404);

        const result = await query(
            `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
            [conversationId]
        );

        res.json({ success: true, messages: result.rows });
    } catch (err) {
        next(err);
    }
};

