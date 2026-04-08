import { detectCrisis } from '../services/crisis.service.js';

describe('Crisis Detection Service', () => {
    it('should detect critical patterns correctly', () => {
        const message = 'I want to kill myself';
        const result = detectCrisis(message);

        expect(result.detected).toBe(true);
        expect(result.severity).toBe('critical');
        expect(result.requiresImmediateAction).toBe(true);
        expect(result.matchedPatterns.length).toBeGreaterThan(0);
    });

    it('should detect high patterns correctly', () => {
        const message = 'i wish i was dead right now';
        const result = detectCrisis(message);

        expect(result.detected).toBe(true);
        expect(result.severity).toBe('high');
        expect(result.requiresImmediateAction).toBe(true);
    });

    it('should detect medium patterns correctly', () => {
        const message = "what's the point of anything";
        const result = detectCrisis(message);

        expect(result.detected).toBe(true);
        expect(result.severity).toBe('medium');
        expect(result.requiresImmediateAction).toBe(false);
    });

    it('should detect low patterns correctly', () => {
        const message = 'i have really bad anxiety today';
        const result = detectCrisis(message);

        expect(result.detected).toBe(true);
        expect(result.severity).toBe('low');
        expect(result.requiresImmediateAction).toBe(false);
    });

    it('should not detect crisis in normal conversations', () => {
        const message = 'I had a great day at work but I am tired';
        const result = detectCrisis(message);

        expect(result.detected).toBe(false);
        expect(result.severity).toBe('low');
        expect(result.requiresImmediateAction).toBe(false);
        expect(result.matchedPatterns).toHaveLength(0);
    });

    it('should prioritize highest severity when multiple patterns match', () => {
        const message = 'i feel so empty and I want to die right now';
        // "feel so empty" -> low
        // "want to die" -> high (assuming pattern handles "die" or similar)
        // Wait, "want to" kill/end/hurt vs want to die.
        // My HIGH_PATTERNS has "want(?:ing)? to (?:die|disappear)".
        
        const result = detectCrisis(message);
        
        expect(result.detected).toBe(true);
        expect(result.severity).toBe('high');
    });
});
