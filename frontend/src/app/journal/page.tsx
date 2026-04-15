'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

interface JournalEntry {
    id: string;
    short_summary: string | null;
    full_text: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

const TAG_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
];

export default function JournalPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Guard
    useEffect(() => {
        if (!isLoading) {
            if (!user) router.push('/login');
            else if (!user.has_consented) router.push('/consent');
        }
    }, [user, isLoading, router]);

    // Fetch journal entries
    useEffect(() => {
        if (!token) return;
        apiFetch<{ success: boolean; memories: JournalEntry[] }>('/api/journal', { token })
            .then((data) => setEntries(data.memories))
            .catch(console.error)
            .finally(() => setLoadingEntries(false));
    }, [token]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this journal entry?')) return;
        setDeletingId(id);
        try {
            await apiFetch(`/api/journal/${id}`, { method: 'DELETE', token });
            setEntries((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete entry');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    const getPreview = (entry: JournalEntry) => {
        const text = entry.full_text || entry.short_summary || '';
        return text.length > 150 ? text.substring(0, 150) + '…' : text;
    };

    const getTagColor = (tag: string) => {
        const index = tag.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TAG_COLORS.length;
        return TAG_COLORS[index];
    };

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
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                            ← Back
                        </Link>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">📔</span>
                            </div>
                            <span className="font-bold text-gray-900">Journal</span>
                        </div>
                    </div>
                    <Link
                        href="/journal/new"
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
                    >
                        + New Entry
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Journal</h1>
                    <p className="mt-1 text-gray-600">Track your thoughts, feelings, and progress over time.</p>
                </div>

                {/* Journal Entries */}
                {loadingEntries ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-20 bg-white/60 rounded-2xl border border-gray-100">
                        <p className="text-5xl mb-4">📔</p>
                        <p className="text-xl font-semibold text-gray-700 mb-2">No journal entries yet</p>
                        <p className="text-gray-500 mb-6">Start writing to track your thoughts and feelings.</p>
                        <Link
                            href="/journal/new"
                            className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                        >
                            Write Your First Entry
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <Link href={`/journal/${entry.id}`} className="flex-1 min-w-0 cursor-pointer">
                                        {/* Date */}
                                        <p className="text-xs text-gray-400 mb-2">{formatDate(entry.created_at)}</p>

                                        {/* Summary / Title */}
                                        {entry.short_summary && (
                                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors mb-1">
                                                {entry.short_summary}
                                            </h3>
                                        )}

                                        {/* Preview */}
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {getPreview(entry)}
                                        </p>

                                        {/* Tags */}
                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {entry.tags.map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </Link>

                                    {/* Actions */}
                                    <div className="ml-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/journal/${entry.id}`}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Edit"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            disabled={deletingId === entry.id}
                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
