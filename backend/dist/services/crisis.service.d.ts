/**
 * Crisis Detection Service
 * Detects potential self-harm, suicide, psychosis, mania, dissociation,
 * and BPD crisis signals in message content.
 * Uses a multi-tier keyword/phrase system with severity levels.
 */
export type CrisisSeverity = 'low' | 'medium' | 'high' | 'critical';
export type CrisisType = 'suicidal' | 'self_harm' | 'psychosis' | 'mania' | 'dissociation' | 'bpd_crisis' | 'general';
export interface CrisisDetectionResult {
    detected: boolean;
    severity: CrisisSeverity;
    crisisType: CrisisType;
    matchedPatterns: string[];
    requiresImmediateAction: boolean;
    requiresPsychiatricEscalation: boolean;
}
/**
 * Analyze a message for crisis signals.
 * Returns the highest severity match found, crisis type, and escalation flags.
 */
export declare const detectCrisis: (content: string) => CrisisDetectionResult;
interface CrisisResource {
    name: string;
    contact: string;
    type: 'phone' | 'text' | 'web';
    availability?: string;
}
interface CountryCrisisResources {
    banner: string;
    resources: CrisisResource[];
    aiDisclaimer: string;
    psychiatricNote?: string;
}
/**
 * Get country-appropriate crisis resources.
 * @param countryCode ISO 3166-1 alpha-2 code (e.g. 'US', 'IN', 'GB')
 */
export declare const getCrisisResources: (countryCode?: string) => CountryCrisisResources;
/**
 * Legacy export for backwards compatibility — US resources.
 */
export declare const CRISIS_RESOURCES: CountryCrisisResources;
export {};
//# sourceMappingURL=crisis.service.d.ts.map