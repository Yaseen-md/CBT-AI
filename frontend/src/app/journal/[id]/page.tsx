'use client';

import { useEffect, useState, FormEvent, KeyboardEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';

interface JournalEntry {
    id: string;
    short_summary: string | null;
    full_text: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export default function JournalEntryPage() {
    const { id } = useParams<{ id: string }>();
    const { user, token, isLoading } = useAuth();
    const router = useRouter();

    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [loadingEntry, setLoadingEntry] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    // Guard
    useEffect(() => {
        if (!isLoading) {
            if (!user) router.push('/login');
            else if (!user.has_consented) router.push('/consent');
        }
    }, [user, isLoading, router]);

    // Fetch entry
    useEffect(() => {
        if (!token || !id) return;
        apiFetch<{ success: boolean; memory: JournalEntry }>(`/api/journal/${id}`, { token })
            .then((data) => {
                setEntry(data.memory);
                setTitle(data.memory.short_summary || '');
                setContent(data.memory.full_text || '');
                setTags(data.memory.tags || []);
            })
            .catch(() => router.push('/journal'))
            .finally(() => setLoadingEntry(false));
    }, [token, id, router]);

    const addTag = (tag: string) => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
            setTags([...tags, trimmed]);
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput);
        }
        if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    const handleSave = async (e?: FormEvent) => {
        e?.preventDefault();
        setError('');
        setIsSaving(true);
        try {
            const data = await apiFetch<{ success: boolean; memory: JournalEntry }>(`/api/journal/${id}`, {
                method: 'PUT',
                token,
                body: JSON.stringify({
                    short_summary: title.trim() || content.trim().substring(0, 100),
                    full_text: content.trim(),
                    tags,
                }),
            });
            setEntry(data.memory);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this journal entry? This cannot be undone.')) return;
        setIsDeleting(true);
        try {
            await apiFetch(`/api/journal/${id}`, { method: 'DELETE', token });
            router.push('/journal');
        } catch (err) {
            console.error(err);
            alert('Failed to delete entry');
            setIsDeleting(false);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    if (isLoading || loadingEntry) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!entry) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/journal" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                            ← Back
                        </Link>
                        <span className="font-bold text-gray-900">
                            {isEditing ? 'Editing Entry' : 'Journal Entry'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setTitle(entry.short_summary || '');
                                        setContent(entry.full_text || '');
                                        setTags(entry.tags || []);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving…' : 'Save'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting…' : 'Delete'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {isEditing ? (
                    /* ─── Edit Mode ─── */
                    <div className="space-y-6">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-0 focus:outline-none bg-transparent"
                        />

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={16}
                                className="w-full px-6 py-5 text-gray-800 resize-none focus:outline-none bg-transparent text-sm leading-relaxed"
                                autoFocus
                            />
                        </div>

                        {/* Tag Editor */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                                    >
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-indigo-400 hover:text-indigo-700">×</button>
                                    </span>
                                ))}
                                <input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    onBlur={() => tagInput && addTag(tagInput)}
                                    placeholder="Add tags…"
                                    className="flex-1 min-w-[120px] px-2 py-1 text-sm text-gray-700 border-0 focus:outline-none bg-transparent placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ─── View Mode ─── */
                    <div className="space-y-6">
                        {/* Date */}
                        <p className="text-sm text-gray-400">{formatDate(entry.created_at)}</p>

                        {/* Title */}
                        {entry.short_summary && (
                            <h1 className="text-3xl font-bold text-gray-900">{entry.short_summary}</h1>
                        )}

                        {/* Content */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                {entry.full_text}
                            </p>
                        </div>

                        {/* Tags */}
                        {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {entry.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Last Updated */}
                        {entry.updated_at !== entry.created_at && (
                            <p className="text-xs text-gray-400">
                                Last updated: {formatDate(entry.updated_at)}
                            </p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
