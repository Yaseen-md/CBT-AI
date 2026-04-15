import OpenAI from 'openai';
import { RagService } from './rag.service';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

const CBT_SYSTEM_PROMPT = `You are a compassionate, evidence-based AI CBT (Cognitive Behavioral Therapy) assistant. Your role is to guide users through structured self-reflection using CBT principles.

**CLINICAL & SAFETY BOUNDARIES (CRITICAL):**
1. **Not a Doctor/Therapist:** You are NOT a replacement for professional mental health care or medical advice.
2. **Medication Rule:** You MUST NOT provide advice on starting, stopping, or changing ANY medication (including SSRIs, SNRIs, Benzodiazepines, Mood Stabilizers, or Antipsychotics). If the user asks about medication, ALWAYS state: "I am not able to provide advice about medication. Please discuss all medication questions with your prescribing doctor or psychiatrist."
3. **Severe Crisis / Hard Escalation:** If the user expresses thoughts of self-harm, suicide, severe dissociation, or symptoms of psychosis/mania (e.g., hearing voices, paranoia, delusions, not sleeping for days, feeling invincible, losing time), DO NOT engage therapeutically or validate delusions. You MUST immediately express concern, prioritize safety, and strongly recommend they contact emergency services or a local crisis line (e.g., 988 in the US/Canada, 116 123 in the UK, 13 11 14 in Australia, 022-25521111 in India).
4. **Diagnosis Rule:** Do not diagnose conditions. Focus on guiding reflection and coping strategies.

**CBT SESSION STRUCTURE & APPROACH:**
1. **Session Flow:** When starting a new session, follow this structure naturally over time:
   - Check mood (1-10) and set a brief agenda.
   - Ask about and review any previous homework/coping strategies.
   - Focus on the main topic using a specific CBT skill (e.g., Thought Record, Cognitive Restructuring).
   - Summarize the session and assign a small, actionable "homework" step.
2. **Socratic Questioning:** Guide the user using questions rather than giving direct answers or unsolicited advice. Ask:
   - "What evidence supports that thought?"
   - "What is an alternative way to look at this?"
   - "What would you tell a friend in this situation?"
3. **Skill Application:** Help identify cognitive distortions (e.g., catastrophizing, black-and-white thinking) and gently challenge them. Use grounding exercises for acute anxiety.
4. **Comorbidity Awareness:** Recognize that depression and anxiety frequently co-occur (e.g., 60% of cases). Adjust your approach by addressing withdrawal behaviors (depression) and avoidance behaviors (anxiety) appropriately.
5. **Tone:** Be warm, empathetic, validating, and speak like a supportive coach/therapist. Keep responses concise (1-3 paragraphs) to avoid overwhelming the user.`;

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
export const generateReply = async (
    messages: Message[],
    memoryContext?: string
): Promise<string> => {
    const contextWindow = messages.slice(-10); // Cost control: last 10 msgs only

    // 1. Gather recent user input for RAG
    const recentUserMessages = contextWindow
        .filter(m => m.role === 'user')
        .slice(-3) // look closely at the last 3 user messages
        .map(m => m.content)
        .join(' ');
        
    // 2. Query RAG service
    const ragEntries = RagService.getRelevantContext(recentUserMessages, 2);
    const ragContext = RagService.formatContextForLLM(ragEntries);

    let systemPrompt = CBT_SYSTEM_PROMPT;
    if (ragContext) {
        systemPrompt += ragContext;
    }
    
    if (memoryContext) {
        systemPrompt += `\n\n**USER'S PREVIOUS CONTEXT (from past sessions and journal):**\n${memoryContext}\n\nUse this context to provide more personalized and continuous care. Reference past insights naturally when relevant, but don't force it.`;
    }

    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        messages: [
            { role: 'system', content: systemPrompt },
            ...contextWindow,
        ],
    });

    const reply = response.choices[0]?.message?.content;
    if (!reply) throw new Error('No response from OpenAI');
    return reply;
};

/**
 * Generate a session summary with cognitive distortion identification.
 * Called when a conversation ends or reaches a threshold.
 */
export interface SessionSummaryResult {
    summary: string;
    distortions: string[];
}

export const generateSessionSummary = async (
    messages: Message[]
): Promise<SessionSummaryResult> => {
    const summaryPrompt = `You are a clinical CBT analyst. Analyze the following therapy conversation and respond in VALID JSON format only.

Your response must be exactly this JSON structure (no markdown, no code fences):
{
  "summary": "A 2-3 sentence summary of what the user discussed, their emotional state, and any progress made.",
  "distortions": ["list", "of", "cognitive", "distortions", "identified"]
}

Common cognitive distortions to look for:
- Catastrophizing
- Black-and-white thinking
- Overgeneralization
- Mind reading
- Fortune telling
- Emotional reasoning
- Should statements
- Personalization
- Mental filtering
- Disqualifying the positive
- Magnification/Minimization
- Labeling

If no clear distortions are found, return an empty array for "distortions".`;

    const conversationText = messages
        .slice(-20) // Analyze last 20 messages max
        .map((m) => `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`)
        .join('\n');

    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.3, // Lower temp for analytical task
        messages: [
            { role: 'system', content: summaryPrompt },
            { role: 'user', content: conversationText },
        ],
    });

    const rawReply = response.choices[0]?.message?.content;
    if (!rawReply) throw new Error('No response from OpenAI for summary');

    try {
        // Clean the response — strip markdown fences if present
        const cleaned = rawReply.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
            summary: parsed.summary || 'Session summary unavailable.',
            distortions: Array.isArray(parsed.distortions) ? parsed.distortions : [],
        };
    } catch {
        // Fallback if JSON parsing fails
        return {
            summary: rawReply.substring(0, 500),
            distortions: [],
        };
    }
};

