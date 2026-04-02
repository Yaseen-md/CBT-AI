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
 */
export const generateReply = async (messages: Message[]): Promise<string> => {
    const contextWindow = messages.slice(-10); // Cost control: last 10 msgs only

    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        messages: [
            { role: 'system', content: CBT_SYSTEM_PROMPT },
            ...contextWindow,
        ],
    });

    const reply = response.choices[0]?.message?.content;
    if (!reply) throw new Error('No response from OpenAI');
    return reply;
};
