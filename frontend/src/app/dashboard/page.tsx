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

export default function DashboardPage() {
    const { user, token, isLoading, logout } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loadingConvs, setLoadingConvs] = useState(true);

    // Guard: redirect if not logged in
    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    // Fetch conversations
    useEffect(() => {
        if (!token) return;
        apiFetch<{ success: boolean; conversations: Conversation[] }>('/api/conversations', { token })
            .then((data) => setConversations(data.conversations))
            .catch(console.error)
            .finally(() => setLoadingConvs(false));
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

                {/* Start session CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-10 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Start a New Session</h2>
                            <p className="text-blue-100 text-sm">Talk through your thoughts with your AI CBT therapist</p>
                        </div>
                        <button
                            onClick={handleNewSession}
                            disabled={isCreating}
                            className="flex-shrink-0 ml-6 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-70"
                        >
                            {isCreating ? 'Starting…' : '+ New Session'}
                        </button>
                    </div>
                </div>

                {/* Past conversations */}
                <div>
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
            </main>
        </div>
    );
}
