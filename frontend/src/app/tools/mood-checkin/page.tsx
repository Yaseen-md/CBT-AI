'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { submitMoodCheckin } from '@/services/clinical.service';

const emotionsList = [
    'Happy', 'Sad', 'Angry', 'Anxious', 'Calm', 'Frustrated', 
    'Tired', 'Energetic', 'Overwhelmed', 'Hopeful', 'Numb'
];

export default function MoodCheckinPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [moodScore, setMoodScore] = useState(5);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [note, setNote] = useState('');
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

    const toggleEmotion = (emotion: string) => {
        if (selectedEmotions.includes(emotion)) {
            setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
        } else {
            if (selectedEmotions.length < 5) {
                setSelectedEmotions([...selectedEmotions, emotion]);
            } else {
                alert('You can select up to 5 emotions.');
            }
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await submitMoodCheckin({
                mood_score: moodScore,
                emotion_tags: selectedEmotions,
                note
            });
            alert('Mood logged successfully!');
            router.push('/dashboard');
        } catch (error) {
            console.error('Error logging mood:', error);
            alert('Failed to log mood.');
            setSubmitting(false);
        }
    };

    // Helper text for mood score
    const getMoodText = () => {
        if (moodScore <= 3) return 'Struggling';
        if (moodScore <= 6) return 'Okay / Neutral';
        if (moodScore <= 8) return 'Good';
        return 'Great';
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
            
            <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-8 sm:p-10 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Daily Mood Check-in</h1>
                        <p className="text-slate-600 mb-10">Take a moment to center yourself. How are you feeling today?</p>
                        
                        <div className="mb-10">
                            <label className="block text-lg font-medium text-slate-800 mb-6">
                                Overal Mood: {moodScore}/10 - <span className="text-primary-600">{getMoodText()}</span>
                            </label>
                            
                            <div className="px-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    value={moodScore}
                                    onChange={(e) => setMoodScore(Number(e.target.value))}
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-2">
                                    <span>Very Low (1)</span>
                                    <span>Neutral (5)</span>
                                    <span>Excellent (10)</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <label className="block text-md font-medium text-slate-700 mb-4 text-left">
                                What specific emotions are you feeling? (Select up to 5)
                            </label>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {emotionsList.map(emp => (
                                    <button
                                        key={emp}
                                        onClick={() => toggleEmotion(emp)}
                                        className={'px-4 py-2 rounded-full border text-sm font-medium transition ' + (
                                            selectedEmotions.includes(emp) 
                                            ? 'bg-primary-100 border-primary-300 text-primary-800' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        )}
                                    >
                                        {emp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8 text-left">
                            <label className="block text-md font-medium text-slate-700 mb-2">
                                Add a brief note (Optional)
                            </label>
                            <textarea
                                className="w-full rounded-lg border-slate-300 border p-3 focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                                placeholder="Why are you feeling this way today?"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 text-lg shadow-sm"
                        >
                            {submitting ? 'Saving...' : 'Log Mood'}
                        </button>

                    </div>
                </div>
            </main>
        </div>
    );
}
