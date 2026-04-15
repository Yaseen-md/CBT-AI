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

/**
 * Psychosis/Mania/BPD/Dissociation patterns.
 * These require psychiatric escalation (not just crisis line referral).
 * NEVER engage with delusional content — only express concern and escalate.
 */
const PSYCHIATRIC_ESCALATION_PATTERNS = [
    // Psychosis: hallucinations
    /\b(hear(?:ing)? voices)\b/i,
    /\b(see(?:ing)? things(?: that)? (?:aren'?t|are not) (?:there|real))\b/i,
    /\b(the voices (?:are|told|say|said|tell))\b/i,
    /\b(something is (?:controlling|speaking to|inside) me)\b/i,
    // Psychosis: paranoia/delusions
    /\b(people are (?:watching|following|tracking|after) me)\b/i,
    /\b(they'?re (?:trying to|going to) (?:control|get|kill|hurt) me)\b/i,
    /\b(the government (?:is|are) (?:tracking|watching|after) me)\b/i,
    /\b((?:someone|they) (?:planted|put|implanted) (?:something|a chip|a device) in me)\b/i,
    /\b(I'?m being (?:watched|followed|spied on|controlled))\b/i,
    // Mania: sleep deprivation + grandiosity
    /\b(haven'?t (?:slept|needed sleep) (?:in|for) (?:days|a week))\b/i,
    /\b(don'?t (?:need|want) (?:to )?sleep)\b/i,
    /\b(I (?:feel|am) invincible)\b/i,
    /\b(I can do (?:anything|everything))\b/i,
    /\b(racing thoughts won'?t stop)\b/i,
    /\b(spending (?:spree|everything|all my money))\b/i,
    /\b(I'?m (?:special|chosen|a prophet|a god|god-like))\b/i,
    // Dissociation
    /\b((?:don'?t|do not) feel real)\b/i,
    /\b(nothing (?:feels|is) real)\b/i,
    /\b(watching myself from (?:outside|above|a distance))\b/i,
    /\b(losing (?:time|hours|days))\b/i,
    /\b(can'?t remember (?:hours|days|what happened))\b/i,
    /\b(I'?m (?:floating|detached|not in my body))\b/i,
    // BPD crisis
    /\b(I'?m (?:splitting|in a spiral))\b/i,
    /\b(everyone (?:abandons|leaves|hates) me)\b/i,
    /\b(I feel (?:completely )?empty inside)\b/i,
    /\b(I want to (?:destroy|break|smash) everything)\b/i,
];

// ─── Core Detection Logic ────────────────────────────────────────────────────

/**
 * Analyze a message for crisis signals.
 * Returns the highest severity match found, crisis type, and escalation flags.
 */
export const detectCrisis = (content: string): CrisisDetectionResult => {
    const matchedPatterns: string[] = [];
    let highestSeverity: CrisisSeverity = 'low';
    let detected = false;
    let requiresPsychiatricEscalation = false;
    let crisisType: CrisisType = 'general';

    // Check psychiatric escalation patterns first (psychosis/mania/dissociation)
    for (const pattern of PSYCHIATRIC_ESCALATION_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
            matchedPatterns.push(match[0]);
            requiresPsychiatricEscalation = true;
            highestSeverity = 'critical';
            detected = true;
            // Determine sub-type
            if (/voices|see.*things|controlling|delusion|paranoi|watching.*me|government/i.test(match[0])) {
                crisisType = 'psychosis';
            } else if (/sleep|invincible|racing thoughts|spending|chosen|prophet/i.test(match[0])) {
                crisisType = 'mania';
            } else if (/real|floating|detached|losing time|outside/i.test(match[0])) {
                crisisType = 'dissociation';
            } else if (/splitting|abandons|empty inside|destroy everything/i.test(match[0])) {
                crisisType = 'bpd_crisis';
            }
        }
    }

    // Check critical suicidal patterns
    for (const pattern of CRITICAL_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
            matchedPatterns.push(match[0]);
            highestSeverity = 'critical';
            detected = true;
            if (crisisType === 'general') crisisType = 'suicidal';
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
                if (crisisType === 'general') crisisType = 'self_harm';
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
        crisisType: detected ? crisisType : 'general',
        matchedPatterns,
        requiresImmediateAction: highestSeverity === 'critical' || highestSeverity === 'high',
        requiresPsychiatricEscalation,
    };
};

// ─── Crisis Resources (Country-Aware) ────────────────────────────────────────

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

/** Global fallback resources */
const GLOBAL_RESOURCES: CrisisResource[] = [
    { name: 'International Association for Suicide Prevention', contact: 'https://www.iasp.info/resources/Crisis_Centres/', type: 'web' },
    { name: 'Crisis Text Line (US)', contact: 'Text HOME to 741741', type: 'text', availability: '24/7' },
];

const COUNTRY_RESOURCES: Record<string, CrisisResource[]> = {
    US: [
        { name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988', type: 'phone', availability: '24/7' },
        { name: 'Crisis Text Line', contact: 'Text HOME to 741741', type: 'text', availability: '24/7' },
        { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', type: 'phone', availability: '24/7' },
        { name: 'NAMI Helpline', contact: '1-800-950-6264', type: 'phone', availability: 'Mon-Fri 10am-10pm ET' },
    ],
    IN: [
        { name: 'Vandrevala Foundation', contact: '+91 9999 666 555', type: 'phone', availability: '24/7' },
        { name: 'iCall (TISS)', contact: '022-25521111', type: 'phone', availability: 'Mon-Sat 8am-10pm' },
        { name: 'Snehi', contact: '+91 44-24640050', type: 'phone', availability: '24/7' },
        { name: 'NIMHANS', contact: '080-46110007', type: 'phone', availability: '24/7' },
    ],
    GB: [
        { name: 'Samaritans', contact: '116 123', type: 'phone', availability: '24/7 (free)' },
        { name: 'PAPYRUS (under 35)', contact: '0800 068 4141', type: 'phone', availability: '24/7' },
        { name: 'Campaign Against Living Miserably (CALM)', contact: '0800 58 58 58', type: 'phone', availability: '5pm-midnight' },
        { name: 'Shout Crisis Text Line', contact: 'Text SHOUT to 85258', type: 'text', availability: '24/7' },
    ],
    AU: [
        { name: 'Lifeline Australia', contact: '13 11 14', type: 'phone', availability: '24/7' },
        { name: 'Beyond Blue', contact: '1300 22 4636', type: 'phone', availability: '24/7' },
        { name: 'Suicide Call Back Service', contact: '1300 659 467', type: 'phone', availability: '24/7' },
        { name: 'Crisis Text Line (AU)', contact: 'Text 0477 13 11 14', type: 'text', availability: '24/7' },
    ],
    CA: [
        { name: 'Suicide Crisis Helpline', contact: 'Call or text 988', type: 'phone', availability: '24/7' },
        { name: 'Kids Help Phone', contact: '1-800-668-6868', type: 'phone', availability: '24/7' },
        { name: 'Crisis Text Line (CA)', contact: 'Text HOME to 686868', type: 'text', availability: '24/7' },
    ],
    NZ: [
        { name: 'Lifeline New Zealand', contact: '0800 543 354', type: 'phone', availability: '24/7' },
        { name: 'Youthline', contact: '0800 376 633', type: 'phone', availability: '24/7' },
    ],
    ZA: [
        { name: 'South African Depression & Anxiety Group (SADAG)', contact: '0800 456 789', type: 'phone', availability: '24/7' },
        { name: 'Lifeline South Africa', contact: '0861 322 322', type: 'phone', availability: '24/7' },
    ],
    SG: [
        { name: 'Samaritans of Singapore (SOS)', contact: '1-767', type: 'phone', availability: '24/7' },
        { name: 'Institute of Mental Health', contact: '6389 2000', type: 'phone', availability: '24/7' },
    ],
};

const AI_DISCLAIMER = "I want you to know that I care about your wellbeing. While I'm here to support you, I'm an AI assistant — not a licensed therapist. If you're in crisis, please reach out to a real person who can help:";

const PSYCHIATRIC_NOTE = "⚠️ The experiences you've described — like hearing voices, feeling detached from reality, or feeling invincible — are important signals that need professional evaluation. Please contact a mental health professional or go to your nearest emergency department as soon as possible.";

/**
 * Get country-appropriate crisis resources.
 * @param countryCode ISO 3166-1 alpha-2 code (e.g. 'US', 'IN', 'GB')
 */
export const getCrisisResources = (countryCode?: string): CountryCrisisResources => {
    const code = (countryCode || 'US').toUpperCase();
    const countrySpecific = COUNTRY_RESOURCES[code] || GLOBAL_RESOURCES;

    return {
        banner: '⚠️ If you are in immediate danger, please call your local emergency services or a crisis line immediately.',
        resources: countrySpecific,
        aiDisclaimer: AI_DISCLAIMER,
        psychiatricNote: PSYCHIATRIC_NOTE,
    };
};

/**
 * Legacy export for backwards compatibility — US resources.
 */
export const CRISIS_RESOURCES = getCrisisResources('US');
