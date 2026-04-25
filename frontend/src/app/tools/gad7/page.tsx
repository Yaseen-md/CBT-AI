'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { submitGad7 } from '@/services/clinical.service';

const GAD7_QUESTIONS = [
    "Feeling nervous, anxious or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen",
];

const OPTIONS = [
    { label: 'Not at all', score: 0 },
    { label: 'Several days', score: 1 },
    { label: 'More than half the days', score: 2 },
    { label: 'Nearly every day', score: 3 }
];

const getSeverityInfo = (total: number) => {
    if (total <= 4) return { label: 'Minimal', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
    if (total <= 9) return { label: 'Mild', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (total <= 14) return { label: 'Moderate', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { label: 'Severe', color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300' };
};

export default function GAD7Page() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [scores, setScores] = useState<number[]>(Array(7).fill(-1));
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ total: number; severity: string } | null>(null);

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
            const response = await submitGad7(scores);
            const total = scores.reduce((a, b) => a + b, 0);
            setResult({ total, severity: response.response.severity_label });
        } catch (err) {
            console.error('Error submitting GAD-7:', err);
            alert('Failed to submit assessment.');
            setSubmitting(false);
        }
    };

    if (result) {
        const severityInfo = getSeverityInfo(result.total);
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
                        <div className="px-6 py-8 sm:p-10 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Complete</h1>
                                <p className="text-slate-600">Your GAD-7 results are ready</p>
                            </div>

                            <div className={`p-6 rounded-xl border-2 ${severityInfo.bg} ${severityInfo.border} mb-8`}>
                                <p className="text-sm text-slate-600 mb-2">Total Score</p>
                                <p className="text-5xl font-bold text-slate-900 mb-4">{result.total}</p>
                                <p className="text-sm text-slate-600 mb-1">Anxiety Severity</p>
                                <p className={`text-2xl font-bold ${severityInfo.color}`}>{result.severity}</p>
                            </div>

                            <div className="text-left p-4 bg-slate-50 rounded-lg border border-slate-200 mb-8">
                                <h3 className="font-semibold text-slate-800 mb-3">Understanding GAD-7 Scores:</h3>
                                <ul className="space-y-2 text-sm text-slate-700">
                                    <li className="flex justify-between"><span>0-4:</span> <span className="font-medium text-green-700">Minimal anxiety</span></li>
                                    <li className="flex justify-between"><span>5-9:</span> <span className="font-medium text-yellow-700">Mild anxiety</span></li>
                                    <li className="flex justify-between"><span>10-14:</span> <span className="font-medium text-orange-700">Moderate anxiety</span></li>
                                    <li className="flex justify-between"><span>15-21:</span> <span className="font-medium text-red-800">Severe anxiety</span></li>
                                </ul>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                                >
                                    Return to Dashboard
                                </button>
                                <button
                                    onClick={() => { setScores(Array(7).fill(-1)); setResult(null); }}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
                                >
                                    Take Assessment Again
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

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
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">GAD-7 Assessment</h1>
                            <p className="text-slate-600">Over the last 2 weeks, how often have you been bothered by the following problems?</p>
                        </div>

                        <div className="space-y-8">
                            {GAD7_QUESTIONS.map((question, qIdx) => (
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
