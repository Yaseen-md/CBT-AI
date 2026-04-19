/**
 * Upload audio file to S3/MinIO
 * @param buffer - File buffer
 * @param key - Storage key (e.g., 'audio/user-id/timestamp.webm')
 * @param contentType - MIME type (e.g., 'audio/webm')
 */
export declare const uploadAudio: (buffer: Buffer, key: string, contentType: string) => Promise<string>;
/**
 * Get audio file from S3/MinIO
 * @param key - Storage key
 */
export declare const getAudio: (key: string) => Promise<Buffer>;
/**
 * Delete audio file from S3/MinIO
 * @param key - Storage key
 */
export declare const deleteAudio: (key: string) => Promise<void>;
/**
 * Generate storage key for audio file
 * Format: audio/{userId}/{timestamp}_{randomId}.{ext}
 */
export declare const generateAudioKey: (userId: string, extension?: string) => string;
//# sourceMappingURL=minio.service.d.ts.map