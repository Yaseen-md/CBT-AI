import { cognitiveDistortions } from '../data/knowledge-base/distortions';
import { conditions } from '../data/knowledge-base/conditions';
import { worksheets } from '../data/knowledge-base/worksheets';
import { psychoeducation } from '../data/knowledge-base/psychoeducation';
import { medications } from '../data/knowledge-base/medications';
// Combine all loaded knowledge bases here
const allKnowledge = [
    ...cognitiveDistortions,
    ...conditions,
    ...worksheets,
    ...psychoeducation,
    ...medications
];
export class RagService {
    /**
     * Looks up relevant clinical knowledge based on user input keywords.
     * In a full production environment, this would use vector embeddings (e.g., Pinecone/Weaviate).
     * For this phase, we use optimized local keyword and tag matching.
     */
    static getRelevantContext(userInput, limit = 2) {
        if (!userInput)
            return [];
        const inputLower = userInput.toLowerCase();
        const scoredEntries = allKnowledge.map(entry => {
            let score = 0;
            // 1. Tag matching (highest weight)
            entry.tags.forEach(tag => {
                if (inputLower.includes(tag.toLowerCase())) {
                    score += 5;
                }
            });
            // 2. Title matching (high weight)
            if (inputLower.includes(entry.title.toLowerCase())) {
                score += 3;
            }
            // 3. Keyword matching (medium weight)
            const words = inputLower.split(/\W+/).filter(w => w.length > 4);
            const contentLower = entry.content.toLowerCase();
            words.forEach(word => {
                if (contentLower.includes(word)) {
                    score += 1;
                }
            });
            return { entry, score };
        });
        // Sort by score descending and take top N
        return scoredEntries
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.entry)
            .slice(0, limit);
    }
    /**
     * Formats the relevant knowledge into a string suitable for LLM injection.
     */
    static formatContextForLLM(entries) {
        if (!entries || entries.length === 0)
            return '';
        let formatted = `\n\n=== RELEVANT CLINICAL KNOWLEDGE (RAG) ===\n`;
        formatted += `Use the following evidence-based CBT concepts to guide your psychoeducation and Socratic questioning. Do not copy it verbatim, but weave these principles into your response:\n\n`;
        entries.forEach(entry => {
            formatted += `[${entry.category.toUpperCase()}: ${entry.title.toUpperCase()}]\n`;
            formatted += `${entry.content}\n`;
            formatted += `(Sources: ${entry.sources.join(', ')})\n\n`;
        });
        formatted += `=========================================\n\n`;
        return formatted;
    }
}
//# sourceMappingURL=rag.service.js.map