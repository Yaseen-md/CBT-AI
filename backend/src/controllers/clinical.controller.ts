import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { createError } from '../middleware/error.middleware.js';
import {
    createThoughtRecord,
    getThoughtRecordsByUser,
    createMoodCheckin,
    getMoodCheckinsByUser,
    createPhq9Response,
    getPhq9ScoresByUser,
    createGad7Response,
    getGad7ScoresByUser
} from '../services/clinical.service.js';

// --- THOUGHT RECORDS ---

export const submitThoughtRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const record = await createThoughtRecord({ ...req.body, user_id: userId });
        res.status(201).json({ success: true, record });
    } catch (err) {
        next(err);
    }
};

export const listThoughtRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;
        const records = await getThoughtRecordsByUser(userId, limit, offset);
        res.json({ success: true, records });
    } catch (err) {
        next(err);
    }
};

// --- MOOD CHECK-INS ---

export const submitMoodCheckin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        if (!req.body.mood_score || req.body.mood_score < 1 || req.body.mood_score > 10) {
            throw createError('Mood score must be between 1 and 10', 400);
        }
        const checkin = await createMoodCheckin({ ...req.body, user_id: userId });
        res.status(201).json({ success: true, checkin });
    } catch (err) {
        next(err);
    }
};

export const listMoodCheckins = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 14; 
        const checkins = await getMoodCheckinsByUser(userId, limit);
        res.json({ success: true, checkins });
    } catch (err) {
        next(err);
    }
};

// --- ASSESSMENTS ---

export const submitPhq9 = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        if (!req.body.scores || req.body.scores.length !== 9) {
            throw createError('PHQ-9 requires exactly 9 scores', 400);
        }
        const response = await createPhq9Response({ scores: req.body.scores, user_id: userId });
        res.status(201).json({ success: true, response });
    } catch (err) {
        next(err);
    }
};

export const listPhq9Scores = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 10;
        const scores = await getPhq9ScoresByUser(userId, limit);
        res.json({ success: true, scores });
    } catch (err) {
        next(err);
    }
};

export const submitGad7 = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        if (!req.body.scores || req.body.scores.length !== 7) {
            throw createError('GAD-7 requires exactly 7 scores', 400);
        }
        const response = await createGad7Response({ scores: req.body.scores, user_id: userId });
        res.status(201).json({ success: true, response });
    } catch (err) {
        next(err);
    }
};

export const listGad7Scores = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 10;
        const scores = await getGad7ScoresByUser(userId, limit);
        res.json({ success: true, scores });
    } catch (err) {
        next(err);
    }
};
