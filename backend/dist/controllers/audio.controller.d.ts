import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
interface UploadResponse {
    success: boolean;
    audioUrl: string;
    transcription: string;
    userMessage?: any;
    aiMessage?: any;
    crisis?: any;
}
/**
 * POST /api/audio/upload
 * Upload audio file, transcribe it, and optionally send as chat message
 */
export declare const uploadAndTranscribe: (req: AuthRequest, res: Response<UploadResponse>, next: NextFunction) => Promise<void>;
/**
 * DELETE /api/audio/file?key=audio/userId/timestamp.webm
 * Delete audio file from storage (with ownership verification)
 */
export declare const deleteAudioFile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=audio.controller.d.ts.map