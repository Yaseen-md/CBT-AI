'use client';

import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
    audioUrl: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    clearRecording: () => void;
    error: string | null;
}

/**
 * Hook for handling audio recording using MediaRecorder API
 */
export const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);

    // Start recording
    const startRecording = useCallback(async () => {
        setError(null);
        chunksRef.current = [];

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm',
            });

            mediaRecorderRef.current = mediaRecorder;

            // Collect audio data
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            // When recording stops, create blob
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);

                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            // Start recording
            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
            setIsPaused(false);
            startTimeRef.current = Date.now();
            elapsedTimeRef.current = 0;

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            if (err instanceof Error && err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please enable microphone permissions.');
            } else if (err instanceof Error && err.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone.');
            } else {
                setError('Failed to start recording. Please try again.');
            }
            console.error('Recording error:', err);
        }
    }, []);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);

            // Stop timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording]);

    // Pause recording
    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording, isPaused]);

    // Resume recording
    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        }
    }, [isRecording, isPaused]);

    // Clear recording
    const clearRecording = useCallback(() => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setError(null);
        elapsedTimeRef.current = 0;
    }, [audioUrl]);

    return {
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
    };
};

/**
 * Format recording time as MM:SS
 */
export const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
