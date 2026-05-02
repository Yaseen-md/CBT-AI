import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadAndTranscribe } from '../controllers/audio.controller.js';

const router = Router();

/**
 * POST /api/audio/upload
 * Upload audio file for transcription
 *
 * Request:
 * - multipart/form-data
 * - file: Audio file (webm, mp4, mp3, wav, ogg)
 * - conversationId: (optional) UUID - if provided, creates message and returns AI response
 */
router.post(
    '/upload',
    requireAuth,
    upload.single('audio'),
    uploadAndTranscribe
);



export default router;
