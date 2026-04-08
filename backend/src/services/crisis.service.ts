/**
 * Crisis Detection Service
 * Detects potential self-harm, suicide, or crisis signals in message content.
 * Uses a multi-tier keyword/phrase system with severity levels.
 */

export type CrisisSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CrisisDetectionResult {
    detected: boolean;
    severity: CrisisSeverity;
    matchedPatterns: string[];
    requiresImmediateAction: boolean;
}

// ─── Crisis Pattern Definitions ──────────────────────────────────────────────

/** Critical: Immediate danger signals — must trigger emergency resources */
const CRITICAL_PATTERNS = [
    /\b(want|going|plan(?:ning)?|thinking about|decided?) to (kill|end|hurt) (myself|my life)\b/i,
    /\b(suicid(?:e|al))\b/i,
    /\b(end(?:ing)? (?:it all|my life|everything))\b/i,
    /\b(don'?t want to (?:live|be alive|exist))\b/i,
    /\b(better off dead)\b/i,
    /\b(no reason to (?:live|go on|continue))\b/i,
    /\b(kill(?:ing)? myself)\b/i,
    /\b(take my (?:own )?life)\b/i,
    /\b(overdose|od)\s+(on|with|myself)\b/i,
    /\b(slit|cut) my (?:wrist|throat|vein)\b/i,
    /\b(jump(?:ing)? off|hang(?:ing)? myself)\b/i,
    /\b(goodbye|farewell)\s+(?:forever|everyone|world|all)\b/i,
];

/** High: Strong indicators of distress — needs resources and attention */
const HIGH_PATTERNS = [
    /\b(self[- ]?harm)\b/i,
    /\b(hurt(?:ing)? myself)\b/i,
    /\b(cut(?:ting)? myself)\b/i,
    /\b(want(?:ing)? to (?:die|disappear))\b/i,
    /\b(wish I (?:was|were) dead)\b/i,
    /\b(I'?m (?:going to|gonna) (?:hurt|harm) myself)\b/i,
    /\b(life (?:isn'?t|is not) worth)\b/i,
    /\b(nobody (?:would|will) (?:miss|care|notice))\b/i,
    /\b(I (?:can'?t|cannot) (?:take|handle|bear|do) (?:it|this) anymore)\b/i,
    /\b((?:feel|feeling) (?:so )?(?:hopeless|worthless|helpless))\b/i,
    /\b(writing (?:a |my )?(?:suicide )?note)\b/i,
    /\b(giving away (?:my |all )(?:stuff|things|belongings))\b/i,
];

/** Medium: Concerning language — monitor and offer resources gently */
const MEDIUM_PATTERNS = [
    /\b(don'?t (?:want to|wanna) (?:be here|wake up))\b/i,
    /\b(I'?m (?:a )?(?:burden|worthless|useless))\b/i,
    /\b(hate myself)\b/i,
    /\b(what'?s the point)\b/i,
    /\b((?:so |very |really )?(?:depressed|desperate|miserable))\b/i,
    /\b((?:trapped|stuck) (?:and|with) no (?:way out|escape))\b/i,
    /\b(everyone (?:hates|ignores|leaves) me)\b/i,
    /\b(I'?m (?:all )?alone)\b/i,
    /\b(nothing (?:matters|gets better|will change))\b/i,
    /\b(can'?t (?:go on|take it|handle it))\b/i,
];

/** Low: Emotional distress — worth tracking but not alarming */
const LOW_PATTERNS = [
    /\b((?:feel|feeling) (?:so )?(?:empty|numb|lost|broken))\b/i,
    /\b(I (?:don'?t|do not) (?:care|matter))\b/i,
    /\b((?:giving|gave) up)\b/i,
    /\b(crying (?:all|every) (?:day|night|time))\b/i,
    /\b(can'?t (?:sleep|eat|focus|function))\b/i,
    /\b(panic (?:attack|attacks))\b/i,
    /\b(anxiety (?:is|so|really) (?:bad|terrible|overwhelming))\b/i,
];

// ─── Core Detection Logic ────────────────────────────────────────────────────

/**
 * Analyze a message for crisis signals.
 * Returns the highest severity match found.
 */
export const detectCrisis = (content: string): CrisisDetectionResult => {
    const matchedPatterns: string[] = [];
    let highestSeverity: CrisisSeverity = 'low';
    let detected = false;

    // Check critical patterns first (highest priority)
    for (const pattern of CRITICAL_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
            matchedPatterns.push(match[0]);
            highestSeverity = 'critical';
            detected = true;
        }
    }

    // Check high patterns
    if (!detected || highestSeverity !== 'critical') {
        for (const pattern of HIGH_PATTERNS) {
            const match = content.match(pattern);
            if (match) {
                matchedPatterns.push(match[0]);
                if (highestSeverity !== 'critical') highestSeverity = 'high';
                detected = true;
            }
        }
    }

    // Check medium patterns
    for (const pattern of MEDIUM_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
            matchedPatterns.push(match[0]);
            if (!detected) highestSeverity = 'medium';
            detected = true;
        }
    }

    // Check low patterns
    for (const pattern of LOW_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
            matchedPatterns.push(match[0]);
            if (!detected) highestSeverity = 'low';
            detected = true;
        }
    }

    return {
        detected,
        severity: detected ? highestSeverity : 'low',
        matchedPatterns,
        requiresImmediateAction: highestSeverity === 'critical' || highestSeverity === 'high',
    };
};

// ─── Crisis Resources ────────────────────────────────────────────────────────

export const CRISIS_RESOURCES = {
    banner: '⚠️ If you are in immediate danger, please call 988 (Suicide & Crisis Lifeline) or text HOME to 741741.',
    resources: [
        { name: 'National Suicide Prevention Lifeline', contact: '988', type: 'phone' },
        { name: 'Crisis Text Line', contact: 'Text HOME to 741741', type: 'text' },
        { name: 'International Association for Suicide Prevention', contact: 'https://www.iasp.info/resources/Crisis_Centres/', type: 'web' },
        { name: 'National Alliance on Mental Illness', contact: '1-800-950-NAMI', type: 'phone' },
        { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', type: 'phone' },
    ],
    aiDisclaimer: 'I want you to know that I care about your wellbeing. While I\'m here to support you, I\'m an AI assistant — not a licensed therapist. If you\'re in crisis, please reach out to a real person who can help:',
};
