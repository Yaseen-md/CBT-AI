'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';

export default function NewJournalPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Guard
    if (!isLoading && !user) {
        router.push('/login');
    }

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!content.trim()) {
            setError('Please write something in your journal entry.');
            return;
        }

        setIsSaving(true);
        try {
            await apiFetch('/api/journal', {
                method: 'POST',
                token,
                body: JSON.stringify({
                    short_summary: title.trim() || content.trim().substring(0, 100),
                    full_text: content.trim(),
                    tags,
                }),
            });
            router.push('/journal');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save entry');
        } finally {
            setIsSaving(false);
        }
    };

    const suggestedTags = [
        'anxiety', 'gratitude', 'progress', 'stress', 'mood', 'sleep',
        'relationships', 'work', 'self-care', 'goals', 'mindfulness', 'anger',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/journal" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                            ← Back
                        </Link>
                        <span className="font-bold text-gray-900">New Journal Entry</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !content.trim()}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm disabled:opacity-50 disabled:scale-100"
                    >
                        {isSaving ? 'Saving…' : 'Save Entry'}
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your entry a title (optional)"
                            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-0 focus:outline-none focus:ring-0 bg-transparent"
                        />
                    </div>

                    {/* Date */}
                    <p className="text-sm text-gray-400">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </p>

                    {/* Content */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="How are you feeling today? What's on your mind?&#10;&#10;Write freely — this is your private space for reflection…"
                            rows={14}
                            className="w-full px-6 py-5 text-gray-800 placeholder-gray-400 resize-none focus:outline-none bg-transparent text-sm leading-relaxed"
                            autoFocus
                        />

                        {/* Writing prompts */}
                        {!content && (
                            <div className="px-6 pb-5 border-t border-gray-50">
                                <p className="text-xs text-gray-400 mt-3 mb-2">Need inspiration? Try these prompts:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'What made me smile today?',
                                        'What challenged me today?',
                                        'One thing I\'m grateful for…',
                                        'A thought I want to challenge…',
                                    ].map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => setContent(prompt + '\n\n')}
                                            className="px-3 py-1.5 text-xs rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tags
                        </label>

                        {/* Added Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-0.5 text-indigo-400 hover:text-indigo-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onBlur={() => tagInput && addTag(tagInput)}
                                placeholder={tags.length === 0 ? 'Add tags (press Enter)' : 'Add more…'}
                                className="flex-1 min-w-[120px] px-2 py-1 text-sm text-gray-700 border-0 focus:outline-none bg-transparent placeholder-gray-400"
                            />
                        </div>

                        {/* Suggested Tags */}
                        <div className="flex flex-wrap gap-1.5">
                            {suggestedTags
                                .filter((t) => !tags.includes(t))
                                .map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => addTag(tag)}
                                        className="px-2.5 py-1 rounded-full text-xs text-gray-500 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        + {tag}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Word Count */}
                    <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                        <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                        <span>{content.length} characters</span>
                    </div>
                </form>
            </main>
        </div>
    );
}
