// Knowledge Base: Psychiatric Medications - Psychoeducation Only
// Source: Stahl's Essential Psychopharmacology, Maudsley Prescribing Guidelines
// CRITICAL: This information is for psychoeducation ONLY. The AI must NEVER advise on medication changes.

import { KnowledgeEntry } from './distortions';

export const medications: KnowledgeEntry[] = [
    {
        id: 'med_01',
        category: 'medication',
        title: 'SSRIs (Selective Serotonin Reuptake Inhibitors)',
        content: `SSRI ANTIDEPRESSANTS - PSYCHOEDUCATION OVERVIEW

COMMON SSRIs:
- Fluoxetine (Prozac)
- Sertraline (Zoloft)
- Citalopram (Celexa)
- Escitalopram (Lexapro)
- Paroxetine (Paxil)
- Fluvoxamine (Luvox)

MECHANISM OF ACTION:
SSRIs block the reuptake of serotonin, increasing serotonin availability in the synaptic cleft. This enhances serotonergic neurotransmission, which over time leads to downstream changes in receptor sensitivity and neuroplasticity.

COMMONLY TREATED CONDITIONS:
- Major Depressive Disorder (MDD)
- Generalized Anxiety Disorder (GAD)
- Panic Disorder
- Social Anxiety Disorder
- Obsessive-Compulsive Disorder (OCD)
- Post-Traumatic Stress Disorder (PTSD)
- Premenstrual Dysphoric Disorder (PMDD)

EXPECTED TIMELINE:
- Week 1-2: Side effects may appear before benefits (nausea, headache, sleep changes)
- Week 2-4: Early improvements in sleep, appetite, energy
- Week 4-6: Mood and anxiety improvements become noticeable
- Week 8-12: Full therapeutic effect

COMMON SIDE EFFECTS:
- Nausea, GI upset (often temporary)
- Sexual dysfunction (decreased libido, delayed orgasm)
- Weight changes (gain or loss)
- Sleep disturbances (insomnia or sedation)
- Emotional blunting ("feeling numb")
- Increased sweating
- Headache

IMPORTANT CONSIDERATIONS:
- Do NOT stop abruptly (discontinuation syndrome: dizziness, "brain zaps," flu-like symptoms)
- May increase suicidal thoughts in young adults (under 25) during first weeks—monitoring essential
- Serotonin syndrome risk if combined with other serotonergic agents (rare but serious)
- Alcohol may worsen side effects

BOUNDARY: The AI must NEVER advise on starting, stopping, or changing medication doses. Always redirect the user to their prescribing physician.`,
        tags: ['medication', 'SSRI', 'antidepressant', 'serotonin', 'depression', 'anxiety'],
        sources: ["Stahl's Essential Psychopharmacology", 'Maudsley Prescribing Guidelines']
    },
    {
        id: 'med_02',
        category: 'medication',
        title: 'SNRIs (Serotonin-Norepinephrine Reuptake Inhibitors)',
        content: `SNRI ANTIDEPRESSANTS - PSYCHOEDUCATION OVERVIEW

COMMON SNRIs:
- Venlafaxine (Effexor)
- Duloxetine (Cymbalta)
- Desvenlafaxine (Pristiq)
- Levomilnacipran (Fetzima)
- Milnacipran (Savella)

MECHANISM OF ACTION:
SNRIs block reuptake of both serotonin and norepinephrine, increasing availability of both neurotransmitters. At lower doses, some SNRIs act primarily on serotonin; norepinephrine effects increase at higher doses.

COMMONLY TREATED CONDITIONS:
- Major Depressive Disorder (MDD)
- Generalized Anxiety Disorder (GAD)
- Panic Disorder
- Social Anxiety Disorder
- Neuropathic pain (especially Duloxetine)
- Fibromyalgia (Milnacipran, Duloxetine)
- Chronic musculoskeletal pain

EXPECTED TIMELINE:
- Similar to SSRIs: 2-4 weeks for initial improvement, 6-8 weeks for full effect
- Pain relief may occur earlier than mood improvement (sometimes within 1-2 weeks)

COMMON SIDE EFFECTS:
- Nausea, decreased appetite
- Increased blood pressure (monitor regularly, especially Venlafaxine)
- Sweating
- Sexual dysfunction (similar to SSRIs)
- Insomnia or sedation
- Constipation
- Dizziness

WITHDRAWAL/DISCONTINUATION:
- SNRIs (especially Venlafaxine) have notably difficult discontinuation syndromes
- Tapering must be gradual under physician supervision
- Symptoms: dizziness, nausea, irritability, "brain zaps," flu-like symptoms

ADVANTAGES OVER SSRIs:
- May be more effective for severe depression
- Dual mechanism may help with energy/fatigue symptoms
- Additional indication for pain conditions

BOUNDARY: The AI must NEVER advise on starting, stopping, or changing medication doses. Always redirect the user to their prescribing physician.`,
        tags: ['medication', 'SNRI', 'antidepressant', 'serotonin', 'norepinephrine', 'depression', 'anxiety', 'pain'],
        sources: ["Stahl's Essential Psychopharmacology", 'Maudsley Prescribing Guidelines']
    },
    {
        id: 'med_03',
        category: 'medication',
        title: 'Benzodiazepines',
        content: `BENZODIAZEPINES - PSYCHOEDUCATION OVERVIEW

COMMON BENZODIAZEPINES:

Short-Acting:
- Alprazolam (Xanax)
- Lorazepam (Ativan)
- Triazolam (Halcion)

Intermediate-Acting:
- Clonazepam (Klonopin)
- Temazepam (Restoril)

Long-Acting:
- Diazepam (Valium)
- Chlordiazepoxide (Librium)

MECHANISM OF ACTION:
Benzodiazepines enhance GABA-A receptor activity, the primary inhibitory neurotransmitter system. This produces rapid anxiolytic, sedative, muscle-relaxant, and anticonvulsant effects.

COMMONLY TREATED CONDITIONS:
- Acute anxiety/panic attacks (as-needed use)
- Generalized Anxiety Disorder (short-term bridge therapy)
- Insomnia (short-term)
- Alcohol withdrawal
- Seizure disorders
- Procedural sedation
- Muscle spasms

EXPECTED TIMELINE:
- Onset: 15-60 minutes (varies by specific medication)
- Peak effect: 1-2 hours
- Duration: Varies by half-life (short-acting: 6-12 hours; long-acting: 24-48+ hours)

COMMON SIDE EFFECTS:
- Drowsiness, sedation
- Dizziness, unsteadiness
- Memory impairment (anterograde amnesia)
- Confusion (especially in elderly)
- Slowed reaction time
- Paradoxical agitation (rare, more common in elderly/children)

CRITICAL SAFETY CONSIDERATIONS:

1. DEPENDENCE AND TOLERANCE:
   - Physical dependence can develop within 2-4 weeks of regular use
   - Tolerance develops (need higher doses for same effect)
   - NOT recommended for long-term daily use as first-line anxiety treatment

2. WITHDRAWAL RISK:
   - Abrupt discontinuation after regular use can cause severe withdrawal
   - Symptoms: rebound anxiety, insomnia, tremor, sweating, seizures (potentially life-threatening)
   - Must taper gradually under medical supervision

3. OVERDOSE RISK:
   - Benzodiazepines + opioids = HIGH RISK of fatal respiratory depression
   - Benzodiazepines + alcohol = dangerous CNS depression
   - Never combine with other depressants

4. SPECIAL POPULATIONS:
   - Elderly: Increased fall risk, cognitive impairment (Beers Criteria—generally avoid)
   - Pregnancy: Potential fetal risk (especially first trimester)
   - History of substance use disorder: Use with extreme caution

APPROPRIATE USE:
- Best reserved for: acute crisis, short-term bridge while waiting for SSRI/SNRI to work, occasional as-needed use
- NOT appropriate as monotherapy for chronic anxiety disorders long-term

BOUNDARY: The AI must NEVER advise on starting, stopping, or changing medication doses. Always redirect the user to their prescribing physician.`,
        tags: ['medication', 'benzodiazepine', 'anxiety', 'panic', 'GABA', 'sedative', 'dependence'],
        sources: ["Stahl's Essential Psychopharmacology", 'Maudsley Prescribing Guidelines', 'FDA Black Box Warnings']
    },
    {
        id: 'med_04',
        category: 'medication',
        title: 'Mood Stabilizers',
        content: `MOOD STABILIZERS - PSYCHOEDUCATION OVERVIEW

COMMON MOOD STABILIZERS:

Anticonvulsant Mood Stabilizers:
- Lithium (Lithobid)
- Valproate/Divalproex (Depakote)
- Carbamazepine (Tegretol)
- Lamotrigine (Lamictal)

Atypical Antipsychotics (with mood stabilizing properties):
- Quetiapine (Seroquel)
- Olanzapine (Zyprexa)
- Risperidone (Risperdal)
- Aripiprazole (Abilify)
- Lurasidone (Latuda)

MECHANISM OF ACTION:
- Lithium: Modulates second messenger systems, neuroprotective effects
- Anticonvulsants: Stabilize neuronal membranes, reduce excitatory neurotransmission
- Atypical antipsychotics: Dopamine and serotonin receptor modulation

COMMONLY TREATED CONDITIONS:
- Bipolar Disorder (Type I and Type II)
- Cyclothymia
- Schizoaffective Disorder
- Treatment-Resistant Depression (as augmentation)
- Borderline Personality Disorder (some evidence for symptom management)
- Impulse control disorders (some agents)

MOOD STABILIZER-SPECIFIC INFORMATION:

LITHIUM:
- Gold standard for bipolar disorder
- Requires regular blood monitoring (therapeutic range: 0.6-1.2 mEq/L)
- Side effects: tremor, thirst, frequent urination, weight gain, hypothyroidism
- Toxicity signs: severe tremor, confusion, vomiting, ataxia (medical emergency)
- Kidney function monitoring required with long-term use

VALPROATE (DEPAKOTE):
- Effective for acute mania and maintenance
- Side effects: weight gain, hair loss, tremor, GI upset
- Liver function monitoring required
- Teratogenic—avoid in pregnancy if possible

LAMOTRIGINE (LAMICTAL):
- Particularly effective for bipolar depression prevention
- Must titrate slowly to reduce rash risk
- BLACK BOX WARNING: Stevens-Johnson Syndrome (rare but serious rash)
- Report any rash immediately to physician

COMMON SIDE EFFECTS (VARIES BY AGENT):
- Weight gain
- Sedation
- Tremor
- Cognitive dulling
- Metabolic changes (glucose, lipids)
- Hormonal effects

MONITORING REQUIREMENTS:
- Regular blood tests (medication levels, kidney/liver function, metabolic panel)
- Weight and BMI tracking
- Mood monitoring for efficacy and side effects

BOUNDARY: The AI must NEVER advise on starting, stopping, or changing medication doses. Always redirect the user to their prescribing physician.`,
        tags: ['medication', 'mood stabilizer', 'bipolar', 'lithium', 'anticonvulsant', 'mania'],
        sources: ["Stahl's Essential Psychopharmacology", 'Maudsley Prescribing Guidelines', 'FDA Black Box Warnings']
    },
    {
        id: 'med_05',
        category: 'medication',
        title: 'Antipsychotic Medications',
        content: `ANTIPSYCHOTIC MEDICATIONS - PSYCHOEDUCATION OVERVIEW

FIRST-GENERATION (TYPICAL) ANTIPSYCHOTICS:
- Haloperidol (Haldol)
- Chlorpromazine (Thorazine)
- Fluphenazine (Prolixin)
- Perphenazine (Trilafon)

SECOND-GENERATION (ATYPICAL) ANTIPSYCHOTICS:
- Risperidone (Risperdal)
- Olanzapine (Zyprexa)
- Quetiapine (Seroquel)
- Aripiprazole (Abilify)
- Ziprasidone (Geodon)
- Lurasidone (Latuda)
- Clozapine (Clozaril)

MECHANISM OF ACTION:
- Primarily block dopamine D2 receptors (first-generation)
- Second-generation: dopamine + serotonin (5-HT2A) receptor antagonism
- Reduce positive symptoms of psychosis (hallucinations, delusions)

COMMONLY TREATED CONDITIONS:
- Schizophrenia
- Schizoaffective Disorder
- Bipolar Disorder (acute mania and maintenance)
- Treatment-Resistant Depression (augmentation)
- PTSD (adjunctive treatment)
- Agitation in dementia (short-term, with caution)
- Tourette's Syndrome

EXPECTED TIMELINE:
- Agitation: Hours to days (with sedating agents)
- Positive symptoms (hallucinations, delusions): 1-2 weeks for initial improvement, 4-6 weeks for full effect
- Negative symptoms: Variable, often limited response

COMMON SIDE EFFECTS:

METABOLIC EFFECTS (especially Olanzapine, Clozapine):
- Weight gain
- Elevated blood sugar/diabetes risk
- Elevated cholesterol/triglycerides

NEUROLOGICAL EFFECTS:
- Extrapyramidal symptoms (EPS): tremor, rigidity, restlessness (akathisia)
- Tardive Dyskinesia (TD): involuntary movements (can be irreversible)
- Neuroleptic Malignant Syndrome (NMS): rare but life-threatening (fever, rigidity, autonomic instability)

HORMONAL EFFECTS:
- Elevated prolactin (especially Risperidone): breast enlargement, lactation, sexual dysfunction, menstrual changes

OTHER:
- Sedation
- Anticholinergic effects (dry mouth, constipation, blurred vision)
- Orthostatic hypotension
- QTc prolongation (cardiac monitoring for some agents)

CLOZAPINE (SPECIAL CASE):
- Reserved for treatment-resistant schizophrenia
- Most effective antipsychotic but highest side effect burden
- BLACK BOX WARNING: Severe neutropenia (requires weekly blood monitoring initially)
- Also carries risk of seizures, myocarditis, metabolic syndrome

IMPORTANT CONSIDERATIONS:
- Never stop abruptly (risk of rebound psychosis, withdrawal)
- Long-acting injectable (LAI) formulations available for adherence support
- Regular monitoring: weight, metabolic panel, movement disorders (AIMS exam)

BOUNDARY: The AI must NEVER advise on starting, stopping, or changing medication doses. Always redirect the user to their prescribing physician.`,
        tags: ['medication', 'antipsychotic', 'schizophrenia', 'psychosis', 'bipolar', 'dopamine'],
        sources: ["Stahl's Essential Psychopharmacology", 'Maudsley Prescribing Guidelines', 'FDA Black Box Warnings']
    }
];
