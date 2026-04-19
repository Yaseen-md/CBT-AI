import multer from 'multer';
import { createError } from './error.middleware.js';
// Configure multer for memory storage (we'll upload to S3/MinIO ourselves)
const storage = multer.memoryStorage();
// File filter for audio files only
const fileFilter = (_req, file, cb) => {
    // Allowed audio MIME types
    const allowedMimeTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(createError('Invalid file type. Only audio files are allowed.', 400));
    }
};
// Multer configuration
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max (adjust based on needs)
        files: 1, // Only one file at a time
    },
});
//# sourceMappingURL=upload.middleware.js.map