export type MemoryType = 'journal' | 'summary' | 'fact' | 'cognitive-distortion-tag';
export interface Memory {
    id: string;
    user_id: string;
    type: MemoryType;
    short_summary: string | null;
    full_text: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}
export interface CreateMemoryInput {
    user_id: string;
    type: MemoryType;
    short_summary?: string;
    full_text?: string;
    tags?: string[];
}
export interface UpdateMemoryInput {
    short_summary?: string;
    full_text?: string;
    tags?: string[];
}
/**
 * Create a new memory entry
 */
export declare const createMemory: (input: CreateMemoryInput) => Promise<Memory>;
/**
 * Get memories by user ID with optional type filter
 */
export declare const getMemoriesByUser: (userId: string, type?: MemoryType, limit?: number, offset?: number) => Promise<Memory[]>;
/**
 * Get memory by ID with ownership verification
 */
export declare const getMemoryById: (memoryId: string, userId: string) => Promise<Memory | null>;
/**
 * Update memory with ownership verification
 */
export declare const updateMemory: (memoryId: string, userId: string, input: UpdateMemoryInput) => Promise<Memory>;
/**
 * Delete memory with ownership verification
 */
export declare const deleteMemory: (memoryId: string, userId: string) => Promise<void>;
/**
 * Search memories by tags (using JSONB containment)
 */
export declare const searchMemoriesByTags: (userId: string, tags: string[]) => Promise<Memory[]>;
/**
 * Get recent memories for context (last N entries of specified types)
 */
export declare const getRecentMemories: (userId: string, types: MemoryType[], limit?: number) => Promise<Memory[]>;
/**
 * Generate session summary and save as memory
 */
export declare const saveSessionSummary: (userId: string, conversationId: string, summary: string, distortions: string[]) => Promise<{
    summary: Memory;
    distortionTags: Memory[];
}>;
/**
 * Search memories by semantic similarity using pgvector
 */
export declare const searchSimilarMemories: (userId: string, queryText: string, limit?: number) => Promise<Memory[]>;
//# sourceMappingURL=memory.service.d.ts.map