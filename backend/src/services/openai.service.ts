import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

const CBT_SYSTEM_PROMPT = `You are a compassionate AI CBT (Cognitive Behavioral Therapy) therapist assistant. Your role is to:

1. **Listen actively** and acknowledge the user's feelings without judgment
2. **Apply CBT techniques** such as:
   - Identifying cognitive distortions (catastrophizing, black-and-white thinking, etc.)
   - Thought challenging and reframing
   - Behavioral activation suggestions
   - Grounding exercises for anxiety
   - Mood tracking prompts
3. **Be warm and empathetic** — speak like a caring therapist, not a robot
4. **Ask open-ended questions** to help users explore their thoughts
5. **Keep responses concise** — 2-4 paragraphs maximum

**IMPORTANT BOUNDARIES:**
- You are NOT a replacement for professional mental health care
- If any user expresses thoughts of self-harm or suicide, ALWAYS direct them to emergency services (call 988 in the US) and a professional
- Do not diagnose conditions; you guide reflection and coping strategies only
- Keep sessions focused on the user's current concern

Start each response with empathy, then guide with CBT techniques.`;

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * Generates a CBT-focused AI reply given the conversation history.
 * Only sends the last 10 messages to control token usage.
 * Optionally injects memory context (journal entries, past summaries) into the system prompt.
 */
export const generateReply = async (
    messages: Message[],
    memoryContext?: string
): Promise<string> => {
    const contextWindow = messages.slice(-10); // Cost control: last 10 msgs only

    let systemPrompt = CBT_SYSTEM_PROMPT;
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

