'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

interface Conversation {
    id: string;
    title: string;
    updated_at: string;
    message_count: string;
    last_message: string | null;
}

interface JournalEntry {
    id: string;
    short_summary: string | null;
    full_text: string | null;
    tags: string[];
    created_at: string;
}

interface DistortionEntry {
    id: string;
    short_summary: string | null;
    tags: string[];
    created_at: string;
}

const DISTORTION_COLORS: Record<string, string> = {
    'catastrophizing': 'bg-red-100 text-red-700 border-red-200',
    'black-and-white thinking': 'bg-gray-100 text-gray-700 border-gray-200',
    'overgeneralization': 'bg-orange-100 text-orange-700 border-orange-200',
    'mind reading': 'bg-purple-100 text-purple-700 border-purple-200',
    'fortune telling': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'emotional reasoning': 'bg-pink-100 text-pink-700 border-pink-200',
    'should statements': 'bg-amber-100 text-amber-700 border-amber-200',
    'personalization': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'mental filtering': 'bg-teal-100 text-teal-700 border-teal-200',
    'labeling': 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function DashboardPage() {
    const { user, token, isLoading, logout } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [loadingJournal, setLoadingJournal] = useState(true);
    const [distortions, setDistortions] = useState<DistortionEntry[]>([]);
    const [loadingDistortions, setLoadingDistortions] = useState(true);

    // Guard: redirect if not logged in or hasn't consented
    useEffect(() => {
        if (!isLoading) {
            if (!user) router.push('/login');
            else if (!user.has_consented) router.push('/consent');
        }
    }, [user, isLoading, router]);

    // Fetch conversations
    useEffect(() => {
        if (!token) return;
        apiFetch<{ success: boolean; conversations: Conversation[] }>('/api/conversations', { token })
            .then((data) => setConversations(data.conversations))
            .catch(console.error)
            .finally(() => setLoadingConvs(false));
    }, [token]);

    // Fetch recent journal entries
    useEffect(() => {
        if (!token) return;
        apiFetch<{ success: boolean; memories: JournalEntry[] }>('/api/journal/recent?limit=3', { token })
            .then((data) => setJournalEntries(data.memories))
            .catch(console.error)
            .finally(() => setLoadingJournal(false));
    }, [token]);

    // Fetch recent cognitive distortions
    useEffect(() => {
        if (!token) return;
        apiFetch<{ success: boolean; memories: DistortionEntry[] }>('/api/journal/insights?limit=10', { token })
            .then((data) => setDistortions(data.memories))
            .catch(() => setDistortions([]))
            .finally(() => setLoadingDistortions(false));
    }, [token]);

    const handleNewSession = async () => {
        setIsCreating(true);
        try {
            const data = await apiFetch<{ success: boolean; conversation: Conversation }>(
                '/api/conversations',
                { method: 'POST', token }
            );
            router.push(`/chat/${data.conversation.id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const formatJournalDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

    const getDistortionColor = (name: string) => {
        const lower = name.toLowerCase();
        return DISTORTION_COLORS[lower] || 'bg-blue-100 text-blue-700 border-blue-200';
    };

    // Aggregate distortions for unique display with counts
    const aggregatedDistortions = distortions.reduce<Record<string, number>>((acc, d) => {
        const name = d.short_summary || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">🧠</span>
                        </div>
                        <span className="font-bold text-gray-900">CBT AI</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Hi, {user?.name?.split(' ')[0]} 👋</span>
                        {user?.is_admin && (
                            <Link href="/admin" className="text-sm text-red-600 font-semibold hover:text-red-700 transition-colors">
                                Admin Dashboard
                            </Link>
                        )}
                        <button
                            onClick={logout}
                            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                {/* Hero greeting */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="mt-1 text-gray-600">How are you feeling today? Start a new session or review a past one.</p>
                </div>

                {/* Quick Actions Row */}
                <div className="grid md:grid-cols-2 gap-4 mb-10">
                    {/* Start session CTA */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold mb-1">Start a New Session</h2>
                                <p className="text-blue-100 text-sm">Talk through your thoughts with your AI CBT therapist</p>
                            </div>
                            <button
                                onClick={handleNewSession}
                                disabled={isCreating}
                                className="flex-shrink-0 ml-4 px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-70 text-sm"
                            >
                                {isCreating ? 'Starting…' : '+ New Session'}
                            </button>
                        </div>
                    </div>

                    {/* Journal CTA */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold mb-1">📔 Write in Journal</h2>
                                <p className="text-amber-100 text-sm">Track your thoughts, feelings, and progress</p>
                            </div>
                            <Link
                                href="/journal/new"
                                className="flex-shrink-0 ml-4 px-5 py-2.5 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors text-sm"
                            >
                                + New Entry
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Clinical Toolkit Section */}
                <div className="mb-10">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Toolkit</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Link href="/tools/mood-checkin" className="bg-white/80 border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all text-center">
                            <div className="text-3xl mb-2">📊</div>
                            <p className="font-medium text-sm text-gray-800">Mood Check-in</p>
                        </Link>
                        <Link href="/tools/thought-record" className="bg-white/80 border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all text-center">
                            <div className="text-3xl mb-2">📝</div>
                            <p className="font-medium text-sm text-gray-800">Thought Record</p>
                        </Link>
                        <Link href="/tools/phq9" className="bg-white/80 border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all text-center">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="font-medium text-sm text-gray-800">PHQ-9 (Depression)</p>
                        </Link>
                        <Link href="/tools/gad7" className="bg-white/80 border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all text-center">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="font-medium text-sm text-gray-800">GAD-7 (Anxiety)</p>
                        </Link>
                        <Link href="/tools/safety-plan" className="bg-white/80 border border-gray-100 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all text-center">
                            <div className="text-3xl mb-2">🛡️</div>
                            <p className="font-medium text-sm text-red-600">Safety Plan</p>
                        </Link>
                    </div>
                </div>

                {/* Two-column layout for Sessions + Journal */}
                <div className="grid lg:grid-cols-3 gap-8 mb-10">
                    {/* Recent Sessions — takes 2 cols */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
                        {loadingConvs ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-6 h-6 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-16 bg-white/60 rounded-2xl border border-gray-100">
                                <p className="text-4xl mb-3">💬</p>
                                <p className="text-gray-500">No sessions yet. Start your first one above!</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {conversations.map((conv) => (
                                    <Link
                                        key={conv.id}
                                        href={`/chat/${conv.id}`}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                    {conv.title}
                                                </p>
                                                {conv.last_message && (
                                                    <p className="text-sm text-gray-500 mt-1 truncate">{conv.last_message}</p>
                                                )}
                                            </div>
                                            <div className="ml-4 flex-shrink-0 text-right">
                                                <p className="text-xs text-gray-400">{formatDate(conv.updated_at)}</p>
                                                <p className="text-xs text-gray-400 mt-1">{conv.message_count} messages</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Journal sidebar — takes 1 col */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Journal</h2>
                            <Link href="/journal" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                View All →
                            </Link>
                        </div>
                        {loadingJournal ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-5 h-5 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : journalEntries.length === 0 ? (
                            <div className="bg-white/60 rounded-2xl border border-gray-100 p-6 text-center">
                                <p className="text-3xl mb-2">📔</p>
                                <p className="text-sm text-gray-500 mb-3">No journal entries yet</p>
                                <Link
                                    href="/journal/new"
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Write your first entry →
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {journalEntries.map((entry) => (
                                    <Link
                                        key={entry.id}
                                        href={`/journal/${entry.id}`}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all group"
                                    >
                                        <p className="text-xs text-gray-400 mb-1">{formatJournalDate(entry.created_at)}</p>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                                            {entry.short_summary || entry.full_text?.substring(0, 80)}
                                        </p>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {entry.tags.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {entry.tags.length > 3 && (
                                                    <span className="text-[10px] text-gray-400">+{entry.tags.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Session Insights */}
                {Object.keys(aggregatedDistortions).length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Insights</h2>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Cognitive patterns identified across your recent sessions:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(aggregatedDistortions).map(([name, count]) => (
                                    <span
                                        key={name}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getDistortionColor(name)}`}
                                    >
                                        {name} {count > 1 && <span className="opacity-60">×{count}</span>}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                💡 Recognizing patterns is the first step in CBT. These are common — everyone has them!
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

