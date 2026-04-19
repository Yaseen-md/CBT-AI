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
export declare const createThoughtRecord: (input: CreateThoughtRecordInput) => Promise<any>;
export declare const getThoughtRecordsByUser: (userId: string, limit?: number, offset?: number) => Promise<any[]>;
export interface CreateMoodCheckinInput {
    user_id: string;
    mood_score: number;
    emotion_tags?: string[];
    note?: string;
}
export declare const createMoodCheckin: (input: CreateMoodCheckinInput) => Promise<any>;
export declare const getMoodCheckinsByUser: (userId: string, limit?: number) => Promise<any[]>;
export interface CreateAssessmentInput {
    user_id: string;
    scores: number[];
}
export declare const calculateDepressionSeverity: (total: number) => string;
export declare const calculateAnxietySeverity: (total: number) => string;
export declare const createPhq9Response: (input: CreateAssessmentInput) => Promise<any>;
export declare const getPhq9ScoresByUser: (userId: string, limit?: number) => Promise<any[]>;
export declare const createGad7Response: (input: CreateAssessmentInput) => Promise<any>;
export declare const getGad7ScoresByUser: (userId: string, limit?: number) => Promise<any[]>;
export interface ContactInfo {
    name: string;
    phone: string;
    description?: string;
}
export interface CreateSafetyPlanInput {
    user_id: string;
    warning_signs?: string[];
    internal_coping?: string[];
    social_distractors?: string[];
    support_contacts?: ContactInfo[];
    professional_contacts?: ContactInfo[];
    environment_safety_steps?: string[];
}
export declare const createSafetyPlan: (input: CreateSafetyPlanInput) => Promise<any>;
export declare const getSafetyPlansByUser: (userId: string, limit?: number) => Promise<any[]>;
//# sourceMappingURL=clinical.service.d.ts.map