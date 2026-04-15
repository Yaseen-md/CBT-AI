'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function ConsentPage() {
    const { user, isLoading, provideConsent, logout } = useAuth();
    const router = useRouter();
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.has_consented) {
                router.push('/dashboard');
            }
        }
    }, [user, isLoading, router]);

    const handleSubmit = async () => {
        if (!accepted) return;
        setSubmitting(true);
        try {
            await provideConsent();
            // Auth context will update and useEffect will redirect to dashboard
        } catch (error) {
            console.error('Failed to submit consent', error);
            setSubmitting(false);
        }
    };

    if (isLoading || !user || user.has_consented) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden text-gray-900 border border-gray-100">
                <div className="bg-indigo-600 px-6 py-4 flex items-center space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <h1 className="text-xl font-bold text-white">Important Safety Information</h1>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-lg font-medium">Please read and acknowledge the following before continuing:</p>

                    <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="font-bold text-gray-900">What this app IS:</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>A tool for structured self-reflection using Cognitive Behavioral Therapy (CBT) principles.</li>
                            <li>An AI-powered system designed to help you identify and challenge cognitive distortions.</li>
                            <li>A private journal and progress tracker.</li>
                        </ul>

                        <h2 className="font-bold text-gray-900 pt-4 border-t border-gray-200">What this app IS NOT:</h2>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li className="font-semibold text-red-600">This is NOT a replacement for a licensed human therapist or medical professional.</li>
                            <li>This is NOT a medical device, nor can it diagnose or treat mental health disorders.</li>
                            <li className="font-semibold text-red-600">This app is NOT equipped to handle emergencies or crises.</li>
                        </ul>

                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            <strong>Emergency?</strong> If you are experiencing a crisis, having thoughts of harming yourself, or feeling out of touch with reality, you must immediately contact your local emergency services or a crisis line. The AI cannot keep you safe.
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 pt-4">
                        <div className="flex items-center h-5">
                            <input
                                id="consent"
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                            />
                        </div>
                        <label htmlFor="consent" className="text-gray-700 cursor-pointer select-none font-medium leading-tight">
                            I understand that CBT AI is not a therapist, cannot provide medical advice, and is not a crisis response service.
                        </label>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-gray-100">
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-gray-900 font-medium px-4 py-2"
                        >
                            Log Out
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!accepted || submitting}
                            className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                                accepted
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:scale-[1.02]'
                                    : 'bg-gray-400 cursor-not-allowed hidden md:block opacity-50'
                            }`}
                        >
                            {submitting ? 'Processing...' : 'I Understand & Agree'}
                        </button>
                    </div>
                    {/* Mobile button fallback */}
                    <button
                        onClick={handleSubmit}
                        disabled={!accepted || submitting}
                        className={`w-full px-8 py-3 rounded-xl font-bold text-white mt-2 md:hidden transition-all shadow-md ${
                            accepted
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg'
                                : 'bg-gray-400 cursor-not-allowed opacity-50'
                        }`}
                    >
                        {submitting ? 'Processing...' : 'I Understand & Agree'}
                    </button>
                </div>
            </div>
        </div>
    );
}
