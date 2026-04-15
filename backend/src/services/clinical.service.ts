import { query } from '../db.js';

// --- THOUGHT RECORDS ---

export interface CreateThoughtRecordInput {
    user_id: string;
    conversation_id?: string;
    situation: string;
    emotion_before: string;
    emotion_before_rating: number;
    automatic_thought: string;
    evidence_for?: string;
    evidence_against?: string;
    balanced_thought?: string;
    emotion_after?: string;
    emotion_after_rating?: number;
}

export const createThoughtRecord = async (input: CreateThoughtRecordInput) => {
    const result = await query(
        `INSERT INTO thought_records (
            user_id, conversation_id, situation, emotion_before, emotion_before_rating, 
            automatic_thought, evidence_for, evidence_against, balanced_thought, 
            emotion_after, emotion_after_rating
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
            input.user_id, input.conversation_id || null, input.situation, 
            input.emotion_before, input.emotion_before_rating, input.automatic_thought, 
            input.evidence_for, input.evidence_against, input.balanced_thought, 
            input.emotion_after, input.emotion_after_rating
        ]
    );
    return result.rows[0];
};

export const getThoughtRecordsByUser = async (userId: string, limit = 20, offset = 0) => {
    const result = await query(
        `SELECT * FROM thought_records WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return result.rows;
};

// --- MOOD CHECK-INS ---

export interface CreateMoodCheckinInput {
    user_id: string;
    mood_score: number;
    emotion_tags?: string[];
    note?: string;
}

export const createMoodCheckin = async (input: CreateMoodCheckinInput) => {
    const result = await query(
        `INSERT INTO mood_checkins (user_id, mood_score, emotion_tags, note)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [
            input.user_id, input.mood_score, 
            JSON.stringify(input.emotion_tags || []), input.note
        ]
    );
    return result.rows[0];
};

export const getMoodCheckinsByUser = async (userId: string, limit = 14) => {
    const result = await query(
        `SELECT * FROM mood_checkins WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
};

// --- ASSESSMENTS (PHQ-9 & GAD-7) ---

export interface CreateAssessmentInput {
    user_id: string;
    scores: number[];
}

export const calculateDepressionSeverity = (total: number): string => {
    if (total <= 4) return 'Minimal';
    if (total <= 9) return 'Mild';
    if (total <= 14) return 'Moderate';
    if (total <= 19) return 'Moderately Severe';
    return 'Severe';
};

export const calculateAnxietySeverity = (total: number): string => {
    if (total <= 4) return 'Minimal';
    if (total <= 9) return 'Mild';
    if (total <= 14) return 'Moderate';
    return 'Severe';
};

export const createPhq9Response = async (input: CreateAssessmentInput) => {
    const total = input.scores.reduce((a, b) => a + b, 0);
    const severity = calculateDepressionSeverity(total);
    const result = await query(
        `INSERT INTO phq9_responses (user_id, scores, total_score, severity_label)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [input.user_id, input.scores, total, severity]
    );
    return result.rows[0];
};

export const getPhq9ScoresByUser = async (userId: string, limit = 10) => {
    const result = await query(
        `SELECT * FROM phq9_responses WHERE user_id = $1 ORDER BY taken_at DESC LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
};

export const createGad7Response = async (input: CreateAssessmentInput) => {
    const total = input.scores.reduce((a, b) => a + b, 0);
    const severity = calculateAnxietySeverity(total);
    const result = await query(
        `INSERT INTO gad7_responses (user_id, scores, total_score, severity_label)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [input.user_id, input.scores, total, severity]
    );
    return result.rows[0];
};

export const getGad7ScoresByUser = async (userId: string, limit = 10) => {
    const result = await query(
        `SELECT * FROM gad7_responses WHERE user_id = $1 ORDER BY taken_at DESC LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
};
