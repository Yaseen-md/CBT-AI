'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { submitPhq9 } from '@/services/clinical.service';

const PHQ9_QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const OPTIONS = [
    { label: 'Not at all', score: 0 },
    { label: 'Several days', score: 1 },
    { label: 'More than half the days', score: 2 },
    { label: 'Nearly every day', score: 3 }
];

export default function PHQ9Page() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [scores, setScores] = useState<number[]>(Array(9).fill(-1));
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

    const handleSelectOption = (questionIndex: number, score: number) => {
        const newScores = [...scores];
        newScores[questionIndex] = score;
        setScores(newScores);
    };

    const isComplete = !scores.includes(-1);

    const handleSubmit = async () => {
        if (!isComplete) return;

        try {
            setSubmitting(true);
            await submitPhq9(scores);
            alert('PHQ-9 submitted successfully.');
            router.push('/dashboard');
        } catch (err) {
            console.error('Error submitting PHQ-9:', err);
            alert('Failed to submit assessment.');
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
                        <div className="mb-8 border-b border-slate-200 pb-6 text-center">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">PHQ-9 Assessment</h1>
                            <p className="text-slate-600">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
                        </div>

                        <div className="space-y-8">
                            {PHQ9_QUESTIONS.map((question, qIdx) => (
                                <div key={qIdx} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <p className="text-md font-medium text-slate-800 mb-4">{qIdx + 1}. {question}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        {OPTIONS.map((opt) => (
                                            <button
                                                key={opt.score}
                                                onClick={() => handleSelectOption(qIdx, opt.score)}
                                                className={'py-3 px-4 rounded-lg text-sm font-medium border transition-colors ' + (
                                                    scores[qIdx] === opt.score 
                                                    ? 'bg-primary-600 border-primary-600 text-white' 
                                                    : 'bg-white border-slate-300 text-slate-700 hover:border-primary-400'
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <button
                                onClick={handleSubmit}
                                disabled={!isComplete || submitting}
                                className="w-full py-4 rounded-xl text-lg font-bold shadow-sm transition-all text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit Assessment'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
