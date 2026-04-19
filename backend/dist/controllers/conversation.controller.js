import { query } from '../db.js';
import { createError } from '../middleware/error.middleware.js';
// POST /api/conversations
export const createConversation = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const title = req.body.title || `Session ${new Date().toLocaleDateString()}`;
        const result = await query('INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *', [userId, title]);
        res.status(201).json({ success: true, conversation: result.rows[0] });
    }
    catch (err) {
        next(err);
    }
};
// GET /api/conversations
export const listConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await query(`SELECT c.*, 
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message
       FROM conversations c
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC
       LIMIT 20`, [userId]);
        res.json({ success: true, conversations: result.rows });
    }
    catch (err) {
        next(err);
    }
};
// GET /api/conversations/:id
export const getConversation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await query('SELECT * FROM conversations WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rows.length === 0)
            throw createError('Conversation not found', 404);
        res.json({ success: true, conversation: result.rows[0] });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=conversation.controller.js.map