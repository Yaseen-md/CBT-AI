import { Response, NextFunction } from 'express';
import { query } from '../db.js';
import { createError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { generateReply, Message } from '../services/openai.service.js';

// POST /api/messages
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.user!.id;

        // Verify conversation belongs to user
        const convResult = await query(
            'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
            [conversationId, userId]
        );
        if (convResult.rows.length === 0) throw createError('Conversation not found', 404);

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

        // Generate AI reply
        const aiContent = await generateReply(history);

        // Save AI reply
        const aiMsgResult = await query(
            `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'assistant', $2) RETURNING *`,
            [conversationId, aiContent]
        );
        const aiMessage = aiMsgResult.rows[0];

        // Update conversation's updated_at
        await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);

        res.status(201).json({
            success: true,
            userMessage,
            aiMessage,
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
