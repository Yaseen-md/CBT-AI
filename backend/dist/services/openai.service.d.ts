export interface Message {
    role: 'user' | 'assistant';
    content: string;
}
/**
 * Generates a CBT-focused AI reply given the conversation history.
 * Only sends the last 10 messages to control token usage.
 * Optionally injects memory context (journal entries, past summaries) into the system prompt.
 * Also automatically injects RAG context from clinical knowledge base.
 */
export declare const generateReply: (messages: Message[], memoryContext?: string) => Promise<string>;
/**
 * Generate a session summary with cognitive distortion identification.
 * Called when a conversation ends or reaches a threshold.
 */
export interface SessionSummaryResult {
    summary: string;
    distortions: string[];
}
export declare const generateSessionSummary: (messages: Message[]) => Promise<SessionSummaryResult>;
/**
 * Generates an embedding vector for a given text using OpenAI's embedding models.
 * Returns an array of numbers representing the text in vector space.
 */
export declare const generateEmbedding: (text: string) => Promise<number[]>;
//# sourceMappingURL=openai.service.d.ts.map