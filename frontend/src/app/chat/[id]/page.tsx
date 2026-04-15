'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import { AudioRecorder } from '../../../components/AudioRecorder';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    audio_url?: string | null;
    transcription?: string | null;
    created_at: string;
}

interface CrisisData {
    severity: string;
    resources: { name: string; contact: string; type: string }[];
    banner: string;
}

export default function ChatPage() {
    const { id } = useParams<{ id: string }>();
    const { user, token, isLoading } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [crisis, setCrisis] = useState<CrisisData | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Guard
    useEffect(() => {
        if (!isLoading) {
            if (!user) router.push('/login');
            else if (!user.has_consented) router.push('/consent');
        }
    }, [user, isLoading, router]);

    // Load messages
    useEffect(() => {
        if (!token || !id) return;
        apiFetch<{ success: boolean; messages: Message[] }>(`/api/messages/${id}`, { token })
            .then((data) => setMessages(data.messages))
            .catch(() => router.push('/dashboard'));
    }, [token, id, router]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, isUploadingAudio]);

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        const content = input.trim();
        if (!content || isSending) return;

        // Optimistic update
        const tempUserMsg: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMsg]);
        setInput('');
        setIsSending(true);
        setIsTyping(true);

        try {
            const data = await apiFetch<{ success: boolean; userMessage: Message; aiMessage: Message; crisis?: CrisisData }>(
                '/api/messages',
                {
                    method: 'POST',
                    token,
                    body: JSON.stringify({ conversationId: id, content }),
                }
            );
            
            if (data.crisis) {
                setCrisis(data.crisis);
            }

            // Replace temp message + add AI reply
            setMessages((prev) =>
                [...prev.filter((m) => m.id !== tempUserMsg.id), data.userMessage, data.aiMessage]
            );
        } catch (err) {
            console.error(err);
            setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        } finally {
            setIsSending(false);
            setIsTyping(false);
        }
    };

    const handleAudioRecordingComplete = async (blob: Blob, duration: number) => {
        if (!token || !id) return;

        setIsUploadingAudio(true);
        setIsTyping(true);

        // Show optimistic audio message
        const tempUserMsg: Message = {
            id: `temp-audio-${Date.now()}`,
            role: 'user',
            content: 'Recording audio...',
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMsg]);

        try {
            // Create form data for upload
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');
            formData.append('conversationId', id);

            const data = await apiFetch<{
                success: boolean;
                audioUrl: string;
                transcription: string;
                userMessage: Message;
                aiMessage: Message;
                crisis?: CrisisData;
            }>('/api/audio/upload', {
                method: 'POST',
                token,
                body: formData,
            });

            if (data.crisis) {
                setCrisis(data.crisis);
            }

            // Replace temp message with actual messages
            setMessages((prev) => [
                ...prev.filter((m) => m.id !== tempUserMsg.id),
                data.userMessage,
                data.aiMessage,
            ]);
        } catch (err) {
            console.error('Audio upload failed:', err);
            setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
            alert('Failed to send audio message. Please try again.');
        } finally {
            setIsUploadingAudio(false);
            setIsTyping(false);
        }
    };

    const formatTime = (dateStr: string) =>
        new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Crisis Banner */}
            {crisis && (
                <div className="bg-red-50 border-b border-red-200 text-red-800 p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between shadow-sm z-20 sticky top-0">
                    <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">{crisis.banner}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {crisis.resources.map((res, i) => (
                                <a key={i} href={res.type === 'phone' ? `tel:${res.contact}` : '#'} className="font-medium underline hover:text-red-900 transition-colors">
                                    {res.name}: {res.contact}
                                </a>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setCrisis(null)} className="p-2 ml-4 mb-auto hover:bg-red-100 rounded-md transition-colors" title="Dismiss">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            )}

            {/* Top bar */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center space-x-3 flex-shrink-0 z-10">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                >
                    ← Back
                </Link>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🧠</span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">CBT AI Therapist</p>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                            Online
                        </p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 && !isTyping && !isUploadingAudio && (
                    <div className="text-center pt-16 text-gray-400">
                        <p className="text-5xl mb-3">💬</p>
                        <p className="font-medium text-gray-600">Start the conversation</p>
                        <p className="text-sm mt-1">Tell me how you're feeling — I'm here to help.</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                                <span className="text-xs">🧠</span>
                            </div>
                        )}
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                msg.role === 'user'
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                            }`}
                        >
                            {/* Audio Message */}
                            {msg.audio_url ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🎤</span>
                                        <span className="text-xs opacity-70">Voice Message</span>
                                    </div>
                                    {msg.audio_url && (
                                        <audio
                                            controls
                                            src={msg.audio_url}
                                            className="w-full max-w-xs h-8"
                                        />
                                    )}
                                    {msg.transcription && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs opacity-60 mb-1">Transcription:</p>
                                            <p className="text-sm">{msg.transcription}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Text Message */
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            )}
                            <p
                                className={`text-xs mt-1 ${
                                    msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                                }`}
                            >
                                {formatTime(msg.created_at)}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Uploading audio indicator */}
                {isUploadingAudio && (
                    <div className="flex items-start space-x-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">🎤</span>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-gray-600">Uploading audio...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Typing indicator */}
                {isTyping && !isUploadingAudio && (
                    <div className="flex items-start space-x-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">🧠</span>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center space-x-1">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="bg-white/90 backdrop-blur-sm border-t border-gray-100 px-4 py-3 flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-end gap-3 max-w-3xl mx-auto">
                    {/* Audio Recorder Button */}
                    <AudioRecorder
                        onRecordingComplete={handleAudioRecordingComplete}
                        disabled={isSending || isUploadingAudio}
                    />

                    {/* Text Input */}
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e as unknown as FormEvent);
                            }
                        }}
                        placeholder="Share what's on your mind… (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        disabled={isSending || isUploadingAudio}
                        className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 max-h-[120px] overflow-y-auto bg-white"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isSending || isUploadingAudio}
                        className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </form>
                <p className="text-center text-xs text-gray-400 mt-2">
                    AI responses are not a substitute for professional mental health care. If in crisis, call{' '}
                    <strong>988</strong>.
                </p>
            </div>
        </div>
    );
}
