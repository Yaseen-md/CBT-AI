'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAudioRecorder, formatRecordingTime } from '../hooks/useAudioRecorder';

interface AudioRecorderProps {
    onRecordingComplete: (blob: Blob, duration: number) => void;
    disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
    onRecordingComplete,
    disabled = false,
}) => {
    const [showRecorder, setShowRecorder] = useState(false);

    const handleComplete = useCallback(
        (blob: Blob, duration: number) => {
            onRecordingComplete(blob, duration);
            setShowRecorder(false);
        },
        [onRecordingComplete]
    );

    if (disabled) {
        return null;
    }

    return (
        <>
            {!showRecorder ? (
                <button
                    type="button"
                    onClick={() => setShowRecorder(true)}
                    className="w-11 h-11 flex-shrink-0 bg-white text-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Record voice message"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                </button>
            ) : (
                <RecordingModal onRecordingComplete={handleComplete} onClose={() => setShowRecorder(false)} />
            )}
        </>
    );
};

interface RecordingModalProps {
    onRecordingComplete: (blob: Blob, duration: number) => void;
    onClose: () => void;
}

const RecordingModal: React.FC<RecordingModalProps> = ({ onRecordingComplete, onClose }) => {
    const {
        isRecording,
        isPaused,
        recordingTime,
        audioBlob,
        audioUrl,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        clearRecording,
        error,
    } = useAudioRecorder();

    // Pre-generate stable bar heights so animation doesn't flicker on re-render
    const barHeights = useMemo(
        () => Array.from({ length: 5 }, () => Math.random() * 30 + 10),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [recordingTime] // regenerate each second for a natural wave effect
    );

    const handleStop = useCallback(() => {
        stopRecording();
    }, [stopRecording]);

    const handleSend = useCallback(() => {
        if (audioBlob) {
            onRecordingComplete(audioBlob, recordingTime);
        }
    }, [audioBlob, recordingTime, onRecordingComplete]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {isRecording ? 'Recording...' : 'Voice Message'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Recording Visualization */}
                <div className="flex flex-col items-center mb-6">
                    {/* Timer */}
                    <div className="text-4xl font-mono font-bold text-gray-900 mb-4">
                        {formatRecordingTime(recordingTime)}
                    </div>

                    {/* Recording Indicator */}
                    {isRecording && !isPaused && (
                        <div className="flex items-center gap-1 h-12">
                            {barHeights.map((height, i) => (
                                <div
                                    key={i}
                                    className="w-2 bg-gradient-to-t from-blue-600 to-indigo-600 rounded-full animate-pulse"
                                    style={{
                                        height: `${height}px`,
                                        animationDelay: `${i * 100}ms`,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Paused Indicator */}
                    {isPaused && (
                        <div className="text-amber-500 text-sm font-medium">
                            Paused
                        </div>
                    )}

                    {/* Audio Preview */}
                    {!isRecording && audioUrl && (
                        <div className="w-full">
                            <audio controls src={audioUrl} className="w-full" />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                    {/* Cancel */}
                    {!isRecording && audioUrl && (
                        <button
                            onClick={() => {
                                clearRecording();
                                onClose();
                            }}
                            className="p-4 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            title="Cancel"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="5" x2="5" y2="19" />
                                <line x1="5" y1="5" x2="19" y2="19" />
                            </svg>
                        </button>
                    )}

                    {/* Record / Stop */}
                    {isRecording ? (
                        <button
                            onClick={handleStop}
                            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"
                            title="Stop recording"
                        >
                            <div className="w-6 h-6 bg-white rounded-sm" />
                        </button>
                    ) : audioUrl ? (
                        /* Re-record button (smaller) when there's already a recording */
                        <button
                            onClick={() => {
                                clearRecording();
                                startRecording();
                            }}
                            className="p-4 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            title="Re-record"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1 4 1 10 7 10" />
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                        </button>
                    ) : (
                        /* Start recording button */
                        <button
                            onClick={startRecording}
                            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"
                            title="Start recording"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </button>
                    )}

                    {/* Pause / Resume */}
                    {isRecording && (
                        <button
                            onClick={isPaused ? resumeRecording : pauseRecording}
                            className="p-4 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            title={isPaused ? 'Resume' : 'Pause'}
                        >
                            {isPaused ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" />
                                    <rect x="14" y="4" width="4" height="16" />
                                </svg>
                            )}
                        </button>
                    )}

                    {/* SEND BUTTON - appears after recording is done */}
                    {!isRecording && audioBlob && (
                        <button
                            onClick={handleSend}
                            className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-full transition-all hover:scale-105 shadow-lg"
                            title="Send voice message"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Instructions */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    {isRecording
                        ? 'Tap the square to stop recording'
                        : audioUrl
                        ? 'Tap Send to share, or Re-record'
                        : 'Tap the microphone to start recording'}
                </p>
            </div>
        </div>
    );
};
