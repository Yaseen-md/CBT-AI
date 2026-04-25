import { apiFetch } from '../lib/api';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('cbt_token');

// --- THOUGHT RECORDS ---

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
    return apiFetch<{ success: boolean; record: ThoughtRecord }>('/api/clinical/thought-records', {
        method: 'POST',
        token: getToken(),
        body: JSON.stringify(data),
    });
};

export const getThoughtRecords = async () => {
    return apiFetch<{ success: boolean; records: ThoughtRecord[] }>('/api/clinical/thought-records', {
        token: getToken(),
    });
};

// --- MOOD CHECK-INS ---

export const submitMoodCheckin = async (data: { mood_score: number; emotion_tags?: string[]; note?: string }) => {
    return apiFetch<{ success: boolean; checkin: any }>('/api/clinical/mood-checkins', {
        method: 'POST',
        token: getToken(),
        body: JSON.stringify(data),
    });
};

export const getMoodCheckins = async () => {
    return apiFetch<{ success: boolean; checkins: any[] }>('/api/clinical/mood-checkins', {
        token: getToken(),
    });
};

// --- ASSESSMENTS ---

export const submitPhq9 = async (scores: number[]) => {
    return apiFetch<{ success: boolean; response: any }>('/api/clinical/assessments/phq9', {
        method: 'POST',
        token: getToken(),
        body: JSON.stringify({ scores }),
    });
};

export const submitGad7 = async (scores: number[]) => {
    return apiFetch<{ success: boolean; response: any }>('/api/clinical/assessments/gad7', {
        method: 'POST',
        token: getToken(),
        body: JSON.stringify({ scores }),
    });
};

// --- SAFETY PLANS ---

export interface ContactInfo {
    name: string;
    phone: string;
    description?: string;
}

export interface SafetyPlanData {
    warning_signs?: string[];
    internal_coping?: string[];
    social_distractors?: string[];
    support_contacts?: ContactInfo[];
    professional_contacts?: ContactInfo[];
    environment_safety_steps?: string[];
}

export const submitSafetyPlan = async (data: SafetyPlanData) => {
    return apiFetch<{ success: boolean; plan: any }>('/api/clinical/safety-plans', {
        method: 'POST',
        token: getToken(),
        body: JSON.stringify(data),
    });
};

export const getSafetyPlans = async () => {
    return apiFetch<{ success: boolean; plans: any[] }>('/api/clinical/safety-plans', {
        token: getToken(),
    });
};

// Get the user's latest safety plan
export const getSafetyPlan = async () => {
    return apiFetch<{ success: boolean; plan: any }>('/api/clinical/safety-plan/latest', {
        token: getToken(),
    });
};
