import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './routes/auth.routes.js';
import conversationRoutes from './routes/conversations.routes.js';
import messageRoutes from './routes/messages.routes.js';
import audioRoutes from './routes/audio.routes.js';
import journalRoutes from './routes/journal.routes.js';
import adminRoutes from './routes/admin.routes.js';
import clinicalRoutes from './routes/clinical.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// Middleware imports
import { errorHandler } from './middleware/error.middleware.js';
import { sanitizeInputs, apiLimiter } from './middleware/security.middleware.js';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(helmet()); // Set security HTTP headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeInputs); // Sanitize inputs against XSS

// Apply global rate limiter
app.use('/api/', apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'cbt-ai-backend',
        version: '1.0.0',
    });
});

app.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'CBT AI Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            conversations: '/api/conversations/*',
            messages: '/api/messages/*',
            audio: '/api/audio/*',
            journal: '/api/journal/*',
            clinical: '/api/clinical/*',
        },
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
