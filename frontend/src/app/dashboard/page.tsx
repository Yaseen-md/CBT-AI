'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

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

interface PHQ9Entry {
    total_score: number;
    severity_label: string;
    taken_at: string;
}

interface GAD7Entry {
    total_score: number;
    severity_label: string;
    taken_at: string;
}

interface MoodEntry {
    mood_score: number;
    created_at: string;
}

interface DashboardData {
    success: boolean;
    data: {
        conversations: Conversation[];
        journalEntries: JournalEntry[];
        distortions: DistortionEntry[];
        phq9: PHQ9Entry[];
        gad7: GAD7Entry[];
        mood: MoodEntry[];
    };
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
    const { user, token, isLoading: isAuthLoading, logout } = useAuth();
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    // Guard: redirect if not logged in or hasn't consented
    useEffect(() => {
        if (!isAuthLoading) {
            if (!user) router.push('/login');
            else if (!user.has_consented) router.push('/consent');
        }
    }, [user, isAuthLoading, router]);

    const fetcher = async (url: string) => {
        if (!token) return null;
        return apiFetch<DashboardData>(url, { token });
    };

    const { data: dashboardResult, error, isLoading: isDataLoading } = useSWR(
        token ? '/api/dashboard' : null,
        fetcher,
        { refreshInterval: 15000 } // Poll every 15 seconds
    );

    const handleNewSession = async () => {
        if (!token) return;
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

    const formatShortDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

    const getDistortionColor = (name: string) => {
        const lower = name.toLowerCase();
        return DISTORTION_COLORS[lower] || 'bg-blue-100 text-blue-700 border-blue-200';
    };

    const isLoading = isAuthLoading || (!dashboardResult && !error);
    const dashboardData = dashboardResult?.data;

    // Aggregate distortions for unique display with counts
    const aggregatedDistortions = (dashboardData?.distortions || []).reduce<Record<string, number>>((acc, d) => {
        const name = d.short_summary || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    // Prepare chart data
    const moodChartData = (dashboardData?.mood || []).map(m => ({
        date: formatShortDate(m.created_at),
        score: m.mood_score
    }));

    const clinicalChartData = (dashboardData?.phq9 || []).map((p, index) => {
        const g = dashboardData?.gad7?.[index];
        return {
            date: formatShortDate(p.taken_at),
            phq9: p.total_score,
            gad7: g ? g.total_score : null
        };
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-500">Failed to load dashboard data. Please try again.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-10">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Hero greeting */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="mt-1 text-gray-600">How are you feeling today? Start a new session or review a past one.</p>
                </div>

                {/* Quick Actions Row */}
                <div className="grid md:grid-cols-2 gap-4 mb-10">
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

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                    {/* Mood Trend Chart */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood Trend (Last 30 Days)</h2>
                        {moodChartData.length > 0 ? (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={moodChartData}>
                                        <defs>
                                            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                Not enough data for mood trends yet.
                            </div>
                        )}
                    </div>

                    {/* Clinical Scores Chart */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">PHQ-9 & GAD-7 Progress</h2>
                        {clinicalChartData.length > 0 ? (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={clinicalChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis domain={[0, 27]} stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="phq9" name="Depression (PHQ-9)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="gad7" name="Anxiety (GAD-7)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                Complete your first PHQ-9 or GAD-7 to see trends.
                            </div>
                        )}
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
                    {/* Recent Sessions */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
                        {!dashboardData?.conversations?.length ? (
                            <div className="text-center py-16 bg-white/60 rounded-2xl border border-gray-100">
                                <p className="text-4xl mb-3">💬</p>
                                <p className="text-gray-500">No sessions yet. Start your first one above!</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {dashboardData.conversations.map((conv) => (
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

                    {/* Journal sidebar */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Journal</h2>
                            <Link href="/journal" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                View All →
                            </Link>
                        </div>
                        {!dashboardData?.journalEntries?.length ? (
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
                                {dashboardData.journalEntries.map((entry) => (
                                    <Link
                                        key={entry.id}
                                        href={`/journal/${entry.id}`}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all group"
                                    >
                                        <p className="text-xs text-gray-400 mb-1">{formatShortDate(entry.created_at)}</p>
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
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-sm">
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
