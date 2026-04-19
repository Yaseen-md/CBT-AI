import { query } from '../db.js';
import { generateEmbedding } from './openai.service.js';
/**
 * Create a new memory entry
 */
export const createMemory = async (input) => {
    const textToEmbed = `${input.short_summary || ''} ${input.full_text || ''} ${input.tags?.join(' ') || ''}`.trim();
    let vector = null;
    if (textToEmbed.length > 0) {
        try {
            vector = await generateEmbedding(textToEmbed);
        }
        catch (e) {
            console.error('Failed to generate embedding for memory', e);
        }
    }
    const result = await query(`INSERT INTO memories (user_id, type, short_summary, full_text, tags, vector)
         VALUES ($1, $2, $3, $4, $5, $6::vector) RETURNING *`, [
        input.user_id,
        input.type,
        input.short_summary || null,
        input.full_text || null,
        JSON.stringify(input.tags || []),
        vector ? JSON.stringify(vector) : null,
    ]);
    return result.rows[0];
};
/**
 * Get memories by user ID with optional type filter
 */
export const getMemoriesByUser = async (userId, type, limit = 20, offset = 0) => {
    const typeFilter = type ? 'AND type = $3' : '';
    const typeParam = type ? [type] : [];
    const result = await query(`SELECT * FROM memories
         WHERE user_id = $1 ${typeFilter}
         ORDER BY created_at DESC
         LIMIT $${2 + typeParam.length} OFFSET $${3 + typeParam.length}`, [userId, ...typeParam, limit, offset]);
    return result.rows;
};
/**
 * Get memory by ID with ownership verification
 */
export const getMemoryById = async (memoryId, userId) => {
    const result = await query('SELECT * FROM memories WHERE id = $1 AND user_id = $2', [memoryId, userId]);
    return result.rows[0] || null;
};
/**
 * Update memory with ownership verification
 */
export const updateMemory = async (memoryId, userId, input) => {
    const updates = [];
    const values = [];
    let paramIndex = 3;
    if (input.short_summary !== undefined) {
        updates.push(`short_summary = $${paramIndex++}`);
        values.push(input.short_summary);
    }
    if (input.full_text !== undefined) {
        updates.push(`full_text = $${paramIndex++}`);
        values.push(input.full_text);
    }
    if (input.tags !== undefined) {
        updates.push(`tags = $${paramIndex++}`);
        values.push(JSON.stringify(input.tags));
    }
    if (updates.length === 0) {
        throw new Error('No fields to update');
    }
    values.push(memoryId, userId);
    const result = await query(`UPDATE memories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
         RETURNING *`, values);
    if (result.rows.length === 0) {
        throw new Error('Memory not found or not authorized');
    }
    return result.rows[0];
};
/**
 * Delete memory with ownership verification
 */
export const deleteMemory = async (memoryId, userId) => {
    const result = await query('DELETE FROM memories WHERE id = $1 AND user_id = $2 RETURNING id', [memoryId, userId]);
    if (result.rows.length === 0) {
        throw new Error('Memory not found or not authorized');
    }
};
/**
 * Search memories by tags (using JSONB containment)
 */
export const searchMemoriesByTags = async (userId, tags) => {
    const result = await query(`SELECT * FROM memories
         WHERE user_id = $1 AND tags @> $2
         ORDER BY created_at DESC`, [userId, JSON.stringify(tags)]);
    return result.rows;
};
/**
 * Get recent memories for context (last N entries of specified types)
 */
export const getRecentMemories = async (userId, types, limit = 5) => {
    const result = await query(`SELECT * FROM memories
         WHERE user_id = $1 AND type = ANY($2)
         ORDER BY created_at DESC
         LIMIT $3`, [userId, types, limit]);
    return result.rows;
};
/**
 * Generate session summary and save as memory
 */
export const saveSessionSummary = async (userId, conversationId, summary, distortions) => {
    // Save the summary
    const summaryResult = await createMemory({
        user_id: userId,
        type: 'summary',
        short_summary: summary.substring(0, 500),
        full_text: summary,
        tags: distortions,
    });
    // Save individual distortion tags
    const distortionMemories = [];
    for (const distortion of distortions) {
        const distortionMemory = await createMemory({
            user_id: userId,
            type: 'cognitive-distortion-tag',
            short_summary: distortion,
            tags: [distortion, conversationId],
        });
        distortionMemories.push(distortionMemory);
    }
    return { summary: summaryResult, distortionTags: distortionMemories };
};
/**
 * Search memories by semantic similarity using pgvector
 */
export const searchSimilarMemories = async (userId, queryText, limit = 3) => {
    try {
        const queryVector = await generateEmbedding(queryText);
        // Using cosine distance operator <=> from pgvector
        const result = await query(`SELECT *, 1 - (vector <=> $2::vector) as similarity 
             FROM memories
             WHERE user_id = $1 AND vector IS NOT NULL
             ORDER BY vector <=> $2::vector
             LIMIT $3`, [userId, JSON.stringify(queryVector), limit]);
        return result.rows;
    }
    catch (e) {
        console.error('Semantic search failed, falling back to basic', e);
        return [];
    }
};
//# sourceMappingURL=memory.service.js.map