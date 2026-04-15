'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { submitThoughtRecord } from '@/services/clinical.service';

export default function ThoughtRecordPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [situation, setSituation] = useState('');
    const [emotionBefore, setEmotionBefore] = useState('');
    const [emotionBeforeRating, setEmotionBeforeRating] = useState(50);
    const [automaticThought, setAutomaticThought] = useState('');
    const [evidenceFor, setEvidenceFor] = useState('');
    const [evidenceAgainst, setEvidenceAgainst] = useState('');
    const [balancedThought, setBalancedThought] = useState('');
    const [emotionAfter, setEmotionAfter] = useState('');
    const [emotionAfterRating, setEmotionAfterRating] = useState(50);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (user && !user.has_consented) {
            router.push('/consent');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await submitThoughtRecord({
                situation,
                emotion_before: emotionBefore,
                emotion_before_rating: emotionBeforeRating,
                automatic_thought: automaticThought,
                evidence_for: evidenceFor,
                evidence_against: evidenceAgainst,
                balanced_thought: balancedThought,
                emotion_after: emotionAfter,
                emotion_after_rating: emotionAfterRating
            });
            alert('Thought record saved successfully!');
            router.push('/dashboard');
        } catch (error) {
            console.error('Error saving thought record:', error);
            alert('Failed to save thought record.');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="text-primary-600 font-medium hover:text-primary-700">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </header>
            
            <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-8 sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">CBT Thought Record</h1>
                            <p className="text-slate-600">A core cognitive behavioral therapy tool to restructure automatic negative thoughts.</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-8">
                            <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: ((step / 4) * 100) + '%' }}></div>
                        </div>

                        {/* Step 1: Trigger & Emotion */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 1: The Situation & Emotion</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        1. What happened? (The Situation)
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">Briefly describe the trigger event. Just the facts.</p>
                                    <textarea
                                        className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500 h-24"
                                        value={situation}
                                        onChange={(e) => setSituation(e.target.value)}
                                        placeholder="e.g., My boss sent me a message saying 'we need to talk'..."
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        2. What emotion did you feel?
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                                        value={emotionBefore}
                                        onChange={(e) => setEmotionBefore(e.target.value)}
                                        placeholder="e.g., Anxious, Sad, Angry, Ashamed..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        3. Rate the intensity of this emotion (0-100%)
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            value={emotionBeforeRating}
                                            onChange={(e) => setEmotionBeforeRating(Number(e.target.value))}
                                        />
                                        <span className="text-lg font-bold text-primary-700 w-12">{emotionBeforeRating}%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Automatic Thought */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 2: The Automatic Thought</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        4. What was going through your mind? (Automatic Thought)
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">Identify the most distressing thought that popped into your head.</p>
                                    <textarea
                                        className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500 h-24"
                                        value={automaticThought}
                                        onChange={(e) => setAutomaticThought(e.target.value)}
                                        placeholder="e.g., 'I am going to be fired. I am a failure.'"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Examining Evidence */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 3: Examining the Evidence</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        5. Factually, what evidence SUPPORTS this thought?
                                    </label>
                                    <textarea
                                        className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500 h-24"
                                        value={evidenceFor}
                                        onChange={(e) => setEvidenceFor(e.target.value)}
                                        placeholder="e.g., 'I did make a mistake on the report yesterday.'"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        6. Factually, what evidence CONTRADICTS this thought?
                                    </label>
                                    <textarea
                                        className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500 h-24"
                                        value={evidenceAgainst}
                                        onChange={(e) => setEvidenceAgainst(e.target.value)}
                                        placeholder="e.g., 'I have had positive performance reviews for 3 years. My boss usually says we need to talk for routine updates.'"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Restructure & Re-rate */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-xl font-semibold text-slate-800">Step 4: Restructure & Re-rate</h2>
                                
                                <div className="p-4 bg-primary-50 rounded-lg text-sm text-primary-900 border border-primary-100 mb-6">
                                    <strong>Original Thought:</strong> "{automaticThought}"
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        7. Write a new, balanced thought:
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">Based on all the evidence, what is a more realistic and compassionate way to view this?</p>
                                    <textarea
                                        className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500 h-24"
                                        value={balancedThought}
                                        onChange={(e) => setBalancedThought(e.target.value)}
                                        placeholder="e.g., 'Even though I made a mistake, one mistake doesn't mean I will be fired. My boss may just want to discuss the project.'"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        8. Re-rate your emotion (0-100%)
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">How intense is the {emotionBefore} feeling now?</p>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            value={emotionAfterRating}
                                            onChange={(e) => setEmotionAfterRating(Number(e.target.value))}
                                        />
                                        <span className="text-lg font-bold text-primary-700 w-12">{emotionAfterRating}%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-10 flex justify-between">
                            <button
                                onClick={() => setStep(step - 1)}
                                disabled={step === 1}
                                className={'px-6 py-2 rounded-lg font-medium ' + (step === 1 ? 'opacity-0 cursor-default' : 'text-slate-600 hover:bg-slate-100')}
                            >
                                Back
                            </button>
                            
                            {step < 4 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                                    disabled={
                                        (step === 1 && (!situation || !emotionBefore)) ||
                                        (step === 2 && !automaticThought) ||
                                        (step === 3 && (!evidenceFor || !evidenceAgainst))
                                    }
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !balancedThought}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save Thought Record'}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
