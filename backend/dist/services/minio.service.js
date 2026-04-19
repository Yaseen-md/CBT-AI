import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, } from '@aws-sdk/client-s3';
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cbt-ai-audio';
/**
 * Upload audio file to S3/MinIO
 * @param buffer - File buffer
 * @param key - Storage key (e.g., 'audio/user-id/timestamp.webm')
 * @param contentType - MIME type (e.g., 'audio/webm')
 */
export const uploadAudio = async (buffer, key, contentType) => {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });
    await s3Client.send(command);
    // Return public URL
    const endpoint = process.env.AWS_ENDPOINT || 'http://localhost:9500';
    return `${endpoint}/${BUCKET_NAME}/${key}`;
};
/**
 * Get audio file from S3/MinIO
 * @param key - Storage key
 */
export const getAudio = async (key) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    const response = await s3Client.send(command);
    const stream = response.Body;
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};
/**
 * Delete audio file from S3/MinIO
 * @param key - Storage key
 */
export const deleteAudio = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    await s3Client.send(command);
};
/**
 * Generate storage key for audio file
 * Format: audio/{userId}/{timestamp}_{randomId}.{ext}
 */
export const generateAudioKey = (userId, extension = 'webm') => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `audio/${userId}/${timestamp}_${randomId}.${extension}`;
};
//# sourceMappingURL=minio.service.js.map