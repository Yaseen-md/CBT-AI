import api from './api';

export interface ThoughtRecord {
    id: string;
    situation: string;
    emotion_before: string;
    emotion_before_rating: number;
    automatic_thought: string;
    evidence_for?: string;
    evidence_against?: string;
    balanced_thought?: string;
    emotion_after?: string;
    emotion_after_rating?: number;
    created_at: string;
}

export const submitThoughtRecord = async (data: Partial<ThoughtRecord>) => {
    const response = await api.post('/clinical/thought-records', data);
    return response.data;
};

export const getThoughtRecords = async () => {
    const response = await api.get('/clinical/thought-records');
    return response.data;
};

export const submitMoodCheckin = async (data: { mood_score: number; emotion_tags?: string[]; note?: string }) => {
    const response = await api.post('/clinical/mood-checkins', data);
    return response.data;
};

export const getMoodCheckins = async () => {
    const response = await api.get('/clinical/mood-checkins');
    return response.data;
};

export const submitPhq9 = async (scores: number[]) => {
    const response = await api.post('/clinical/assessments/phq9', { scores });
    return response.data;
};

export const submitGad7 = async (scores: number[]) => {
    const response = await api.post('/clinical/assessments/gad7', { scores });
    return response.data;
};
