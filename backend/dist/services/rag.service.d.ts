import { KnowledgeEntry } from '../data/knowledge-base/distortions';
export declare class RagService {
    /**
     * Looks up relevant clinical knowledge based on user input keywords.
     * In a full production environment, this would use vector embeddings (e.g., Pinecone/Weaviate).
     * For this phase, we use optimized local keyword and tag matching.
     */
    static getRelevantContext(userInput: string, limit?: number): KnowledgeEntry[];
    /**
     * Formats the relevant knowledge into a string suitable for LLM injection.
     */
    static formatContextForLLM(entries: KnowledgeEntry[]): string;
}
//# sourceMappingURL=rag.service.d.ts.map