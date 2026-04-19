// Knowledge Base: Clinical Conditions - CBT Treatment Scaffolding
// Source: Cognitive Behavior Therapy: Basics and Beyond (Beck, J. S.), Treatment manuals
export const conditions = [
    {
        id: 'cond_01',
        category: 'condition',
        title: 'Major Depressive Disorder - CBT Treatment Protocol',
        content: `CORE CBT MODEL FOR DEPRESSION:
Depression is maintained by a cycle of negative thoughts, reduced activity, and social withdrawal. Treatment focuses on breaking this cycle through Behavioral Activation and cognitive restructuring.

BEHAVIORAL ACTIVATION (BA) - First-Line Intervention:
1. Activity Monitoring: Have the client track daily activities and mood (0-10 scale) for 3-7 days to identify patterns between activity and mood.

2. Activity Scheduling:
   - Identify activities that provide Pleasure (P) and/or Mastery (M)
   - Schedule 1-3 specific, achievable activities per day
   - Start small to ensure success (e.g., "walk for 5 minutes" vs "exercise more")
   - Rate each activity post-completion: P___/10, M___/10

3. Graded Task Assignment:
   - Break overwhelming tasks into smaller, manageable steps
   - Example: "Clean house" → Step 1: Pick up 5 items. Step 2: Wash dishes for 5 min.
   - Celebrate completion of each micro-step

COGNITIVE INTERVENTIONS:
1. Identify automatic thoughts using thought records
2. Focus on common depression-related themes: worthlessness, guilt, hopelessness
3. Use Socratic questioning: "What evidence supports this thought? What contradicts it?"
4. Develop balanced alternative thoughts (not necessarily "positive," but accurate)

SAFETY PLANNING:
- Always assess for suicidal ideation
- If SI present: develop safety plan, identify supports, remove means, provide crisis resources
- Know referral pathways for higher levels of care

SYSTEM BOUNDARY: For severe depression with active suicidality, psychosis, or inability to function, the AI should encourage professional support and not attempt to provide standalone treatment.`,
        tags: ['depression', 'major depressive disorder', 'behavioral activation', 'activity scheduling', 'treatment protocol'],
        sources: ['Beck Institute', 'NICE Guidelines', 'CBT Treatment Manuals']
    },
    {
        id: 'cond_02',
        category: 'condition',
        title: 'Generalized Anxiety Disorder (GAD) - CBT Treatment Protocol',
        content: `CORE CBT MODEL FOR GAD:
GAD is characterized by excessive, uncontrollable worry about multiple life domains. The CBT model targets worry intolerance, cognitive avoidance, and physiological hyperarousal.

WORRY EXPOSURE (Imaginal Exposure):
1. Identify the client's "worst-case scenario" worry
2. Have them write a detailed script of the feared outcome (1-2 paragraphs, present tense, emotionally vivid)
3. Client reads/listens to the script daily for 20-30 minutes without engaging in safety behaviors
4. Process: "What did you notice about your anxiety level over time?" (habituation)
5. Repeat until anxiety decreases by at least 50% from initial rating

DECATASTROPHIZING (What-If Technique):
1. Ask: "What's the worst that could happen?"
2. Follow up: "And if that happened, what would you do? How would you cope?"
3. Continue until client recognizes: a) the actual probability is low, and b) they have coping resources
4. Shift from "I can't handle uncertainty" to "I can handle difficult outcomes"

COGNITIVE RESTRUCTURING FOR GAD:
- Target thoughts like: "Worrying keeps me safe," "If I worry enough, I'll be prepared"
- Evidence: "Has worrying actually prevented bad outcomes? Or just made you exhausted?"
- Alternative: "Worrying is not problem-solving. I can take practical steps instead."

STIMULUS CONTROL:
- Designate a "worry period" (e.g., 5:00-5:20 PM daily)
- When worry arises outside this window: "I'll think about this during my worry time"
- Many worries will feel less urgent by the designated time

RELAXATION TRAINING:
- Progressive Muscle Relaxation (PMR): Tense-release cycle through muscle groups
- Diaphragmatic breathing: 4-7-8 technique or box breathing
- Use as coping skill, not safety behavior

SYSTEM BOUNDARY: GAD often co-occurs with depression. Monitor for both.`,
        tags: ['GAD', 'generalized anxiety disorder', 'worry', 'worry exposure', 'decatastrophizing', 'treatment protocol'],
        sources: ['Beck Institute', 'NICE Guidelines', 'CBT Treatment Manuals']
    },
    {
        id: 'cond_03',
        category: 'condition',
        title: 'Panic Disorder - CBT Treatment Protocol',
        content: `CORE CBT MODEL FOR PANIC DISORDER:
Panic attacks are maintained by fear of bodily sensations (interoceptive fear) and catastrophic misinterpretation of normal physiological arousal ("My heart is racing—I'm having a heart attack!").

INTEROCEPTIVE EXPOSURE (Core Intervention):
Purpose: To disconfirm the belief that bodily sensations are dangerous and to build tolerance to physical discomfort.

Common Interoceptive Exercises (select based on client's feared sensations):
1. Spinning in a chair (30-60 seconds) → induces dizziness
2. Breathing through a thin straw (2 minutes) → induces breathlessness
3. Running in place (1-2 minutes) → induces heart racing, sweating
4. Tensing muscles throughout body (1 minute) → induces tension sensations
5. Shaking head side-to-side (30 seconds) → induces dizziness/disorientation
6. Staring at bright light (30 seconds) → induces visual disturbances

EXPOSURE PROTOCOL:
1. Psychoeducation: Explain that sensations are uncomfortable but NOT dangerous
2. Create hierarchy: Rank exercises from least to most anxiety-provoking (SUDS 0-100)
3. Begin exposure: Start with moderate-level exercise
4. Duration: Continue until anxiety drops by 50% OR for a set time (2-5 minutes)
5. Process: "What did you learn? Did anything catastrophic happen?"
6. Repeat daily until the exercise no longer provokes significant anxiety

COGNITIVE RESTRUCTURING:
- Identify catastrophic thoughts: "I'm going to pass out," "My heart will stop"
- Examine evidence: "Have you ever actually passed out during a panic attack?"
- Develop realistic coping statements: "This is uncomfortable, not dangerous. It will pass."

IN VIVO EXPOSURE:
- After mastering interoceptive exercises, practice them in real-world situations
- Example: Do jumping jacks at the grocery store to trigger sensations in public

CRITICAL: Eliminate safety behaviors (e.g., carrying water, sitting near exits, checking pulse) during exposure—they prevent full learning.

SYSTEM BOUNDARY: Rule out medical causes first (cardiac, thyroid, respiratory conditions).`,
        tags: ['panic disorder', 'panic attacks', 'interoceptive exposure', 'agoraphobia', 'treatment protocol'],
        sources: ['Beck Institute', 'NICE Guidelines', 'CBT Treatment Manuals']
    },
    {
        id: 'cond_04',
        category: 'condition',
        title: 'Social Anxiety Disorder - CBT Treatment Protocol',
        content: `CORE CBT MODEL FOR SOCIAL ANXIETY:
Social anxiety is maintained by: 1) excessively high standards for social performance, 2) self-focused attention (monitoring one's own behavior), 3) safety behaviors that prevent disconfirmation, and 4) post-event rumination.

BEHAVIORAL EXPERIMENTS (Core Intervention):
Purpose: To test the validity of negative beliefs about social situations through real-world experimentation.

Structure for Social Anxiety Behavioral Experiments:
1. IDENTIFY THE PREDICTION:
   - "If I speak up in the meeting, people will think I'm stupid"
   - Make it specific and testable: "At least 3 people will roll their eyes or look bored"

2. DESIGN THE EXPERIMENT:
   - Choose a realistic social situation
   - Define success as "collecting data," not "performing well"
   - Plan to drop safety behaviors (e.g., avoiding eye contact, rehearsing sentences)

3. CONDUCT THE EXPERIMENT:
   - Enter the situation and engage as planned
   - Focus attention outward (on others, the task) rather than inward (on your anxiety)

4. COLLECT DATA:
   - What actually happened?
   - How many people reacted negatively vs. neutrally vs. positively?
   - What evidence do you have that your prediction came true?

5. REVISE THE BELIEF:
   - "Based on this data, what is a more accurate belief?"
   - Example: "Some people may not care, but most don't think negatively of me"

SOCIAL SKILLS TRAINING (if deficits exist):
- Eye contact practice
- Conversation starters and active listening
- Assertiveness training

ATTENTION TRAINING:
- Shift focus from internal monitoring ("Am I blushing?") to external cues ("What is this person saying?")
- Practice: During conversations, notice 3 details about the other person

POST-EVENT RUMINATION INTERVENTION:
- Set a 10-minute "rumination window" if needed, then redirect
- Challenge: "Is replaying this helpful? What would I tell a friend?"

SYSTEM BOUNDARY: Social anxiety often co-occurs with depression and substance use (self-medication). Screen for both.`,
        tags: ['social anxiety', 'social phobia', 'behavioral experiments', 'safety behaviors', 'treatment protocol'],
        sources: ['Beck Institute', 'NICE Guidelines', 'CBT Treatment Manuals']
    },
    {
        id: 'cond_05',
        category: 'condition',
        title: 'System Boundaries: PTSD and OCD Referral Guidelines',
        content: `IMPORTANT SYSTEM BOUNDARIES FOR THIS CBT AI:

This AI system is designed to provide CBT support for common conditions including depression, generalized anxiety, panic disorder, and social anxiety. However, certain conditions require specialized, higher-intensity intervention that is beyond the scope of this AI system.

PTSD (Post-Traumatic Stress Disorder) - REFER OUT:
PTSD requires trauma-focused treatment that should only be delivered by trained clinicians.
RED FLAGS indicating need for referral:
- Intrusive memories, flashbacks, or nightmares about a traumatic event
- Avoidance of trauma reminders
- Hypervigilance and exaggerated startle response
- Emotional numbness or detachment related to trauma history
- Dissociation or feeling "unreal"

Appropriate referrals: Trauma-focused CT, EMDR, Prolonged Exposure (PE), or CPT with a licensed clinician.

OCD (Obsessive-Compulsive Disorder) - REFER OUT:
OCD requires Exposure and Response Prevention (ERP), a specialized protocol.
RED FLAGS indicating need for referral:
- Intrusive, unwanted thoughts (obsessions) that cause distress
- Repetitive behaviors or mental acts (compulsions) performed to reduce distress
- Time spent on obsessions/compulsions exceeds 1 hour daily
- Common themes: contamination, harm, symmetry, taboo thoughts

Appropriate referrals: ERP-trained therapist, IOCDF provider directory.

SUICIDAL IDEATION - IMMEDIATE ACTION:
If a user expresses active suicidal thoughts with intent or plan:
1. Provide crisis resources immediately (988 Suicide & Crisis Lifeline in US)
2. Encourage contact with emergency services or trusted support person
3. Do NOT attempt to provide CBT intervention—prioritize safety

The AI should gracefully acknowledge limitations: "It sounds like you're dealing with something that would benefit from specialized support. I can provide general CBT information, but a trained professional would be better equipped to help you with this specific concern."`,
        tags: ['boundaries', 'referral', 'PTSD', 'OCD', 'crisis', 'safety', 'system limits'],
        sources: ['Beck Institute', 'APA Guidelines', 'IOCDF']
    }
];
//# sourceMappingURL=conditions.js.map