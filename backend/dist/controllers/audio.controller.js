import { query } from '../db.js';
import { createError } from '../middleware/error.middleware.js';
import { uploadAudio, generateAudioKey, deleteAudio } from '../services/minio.service.js';
import { transcribeAudio } from '../services/whisper.service.js';
import { generateReply } from '../services/openai.service.js';
import { detectCrisis, CRISIS_RESOURCES } from '../services/crisis.service.js';
import { logSafetyEvent } from '../services/safety.service.js';
/**
 * POST /api/audio/upload
 * Upload audio file, transcribe it, and optionally send as chat message
 */
export const uploadAndTranscribe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.body;
        const audioFile = req.file;
        if (!audioFile || !audioFile.buffer) {
            throw createError('No audio file provided', 400);
        }
        // Generate storage key
        const extension = audioFile.originalname.split('.').pop() || 'webm';
        const storageKey = generateAudioKey(userId, extension);
        // Upload to MinIO/S3
        const audioUrl = await uploadAudio(audioFile.buffer, storageKey, audioFile.mimetype);
        // Transcribe audio
        let transcription;
        try {
            transcription = await transcribeAudio(audioFile.buffer);
        }
        catch (transcribeError) {
            console.error('Transcription failed:', transcribeError);
            // Delete uploaded file if transcription fails
            await deleteAudio(storageKey);
            throw createError('Failed to transcribe audio', 500);
        }
        if (!transcription || transcription.trim().length === 0) {
            await deleteAudio(storageKey);
            throw createError('No speech detected in audio', 400);
        }
        const response = {
            success: true,
            audioUrl,
            transcription,
        };
        // If conversationId provided, create message
        if (conversationId) {
            // Verify conversation belongs to user
            const convResult = await query('SELECT id FROM conversations WHERE id = $1 AND user_id = $2', [conversationId, userId]);
            if (convResult.rows.length === 0) {
                await deleteAudio(storageKey);
                throw createError('Conversation not found', 404);
            }
            // ─── Crisis Detection ─────────────────────────────────────────────
            const crisisResult = detectCrisis(transcription);
            let crisisData = null;
            if (crisisResult.detected) {
                try {
                    await logSafetyEvent(userId, conversationId, transcription, crisisResult.severity);
                    console.warn(`🚨 Crisis detected [${crisisResult.severity}] in audio for user ${userId}: ${crisisResult.matchedPatterns.join(', ')}`);
                }
                catch (err) {
                    console.error('Failed to log safety event:', err);
                }
                if (crisisResult.requiresImmediateAction) {
                    crisisData = {
                        severity: crisisResult.severity,
                        resources: CRISIS_RESOURCES.resources,
                        banner: CRISIS_RESOURCES.banner,
                    };
                }
            }
            // Save user message with audio
            const userMsgResult = await query(`INSERT INTO messages (conversation_id, role, content, audio_url, transcription)
                 VALUES ($1, 'user', $2, $3, $4) RETURNING *`, [conversationId, transcription, audioUrl, transcription]);
            const userMessage = userMsgResult.rows[0];
            // Fetch recent history for AI context
            const historyResult = await query(`SELECT role, content FROM messages
                 WHERE conversation_id = $1
                 ORDER BY created_at ASC`, [conversationId]);
            const history = historyResult.rows.map((r) => ({
                role: r.role,
                content: r.content,
            }));
            // Build memory context for personalized AI replies
            let memoryContext;
            try {
                const { getRecentMemories } = await import('../services/memory.service.js');
                const memories = await getRecentMemories(userId, ['journal', 'summary'], 5);
                if (memories.length > 0) {
                    memoryContext = memories.map((m) => {
                        const date = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        return `[${m.type === 'journal' ? 'Journal' : 'Session Summary'} ${date}]: ${m.short_summary || m.full_text?.substring(0, 200)}`;
                    }).join('\n');
                }
            }
            catch { /* non-blocking */ }
            // Generate AI reply with memory context
            const aiContent = await generateReply(history, memoryContext);
            // Save AI reply
            const aiMsgResult = await query(`INSERT INTO messages (conversation_id, role, content)
                 VALUES ($1, 'assistant', $2) RETURNING *`, [conversationId, aiContent]);
            const aiMessage = aiMsgResult.rows[0];
            // Update conversation timestamp
            await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
            response.userMessage = userMessage;
            response.aiMessage = aiMessage;
            if (crisisData)
                response.crisis = crisisData;
        }
        res.status(201).json(response);
    }
    catch (err) {
        next(err);
    }
};
/**
 * DELETE /api/audio/file?key=audio/userId/timestamp.webm
 * Delete audio file from storage (with ownership verification)
 */
export const deleteAudioFile = async (req, res, next) => {
    try {
        const key = req.query.key;
        const userId = req.user.id;
        if (!key) {
            throw createError('Audio key is required (pass as ?key=...)', 400);
        }
        // Verify user owns this audio file by checking the messages table
        const result = await query(`SELECT m.id FROM messages m
             JOIN conversations c ON m.conversation_id = c.id
             WHERE m.audio_url LIKE $1 AND c.user_id = $2`, [`%${key}%`, userId]);
        if (result.rows.length === 0) {
            throw createError('Audio file not found or not authorized', 403);
        }
        await deleteAudio(key);
        res.json({ success: true, message: 'Audio file deleted' });
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=audio.controller.js.map