/**
 * Transcribe audio using OpenAI Whisper
 * @param audioBuffer - Audio file buffer
 * @param language - Optional language code (e.g., 'en')
 * @returns Transcribed text
 */
export declare const transcribeAudio: (audioBuffer: Buffer, language?: string) => Promise<string>;
/**
 * Transcribe with additional context (optional)
 * Includes prompt for better accuracy with CBT terminology
 */
export declare const transcribeWithContext: (audioBuffer: Buffer, context?: string) => Promise<string>;
//# sourceMappingURL=whisper.service.d.ts.map