import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

/**
 * Safely extract text from Whisper response.
 * With response_format 'text', SDK v6 may return a string or an object.
 */
const extractText = (response: unknown): string => {
    if (typeof response === 'string') return response.trim();
    if (response && typeof response === 'object' && 'text' in response) {
        return (response as { text: string }).text.trim();
    }
    throw new Error('Unexpected Whisper response format');
};

/**
 * Transcribe audio using OpenAI Whisper
 * @param audioBuffer - Audio file buffer
 * @param language - Optional language code (e.g., 'en')
 * @returns Transcribed text
 */
export const transcribeAudio = async (
    audioBuffer: Buffer,
    language?: string
): Promise<string> => {
    // Convert buffer to Blob-like object for OpenAI SDK
    const blob = new Blob([audioBuffer], { type: 'audio/webm' });
    const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

    const response = await openai.audio.transcriptions.create({
        file,
        model: process.env.WHISPER_MODEL || 'whisper-1',
        language: language || 'en',
        response_format: 'text',
    });

    return extractText(response);
};


