'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    is_admin?: boolean;
    has_consented?: boolean;
    country?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    provideConsent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('cbt_token');
        if (savedToken) {
            setToken(savedToken);
            apiFetch<{ success: boolean; user: User }>('/api/auth/me', {
                token: savedToken,
            })
                .then(({ user }) => setUser(user))
                .catch(() => {
                    localStorage.removeItem('cbt_token');
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await apiFetch<{ success: boolean; token: string; user: User }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        localStorage.setItem('cbt_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const data = await apiFetch<{ success: boolean; token: string; user: User }>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        localStorage.setItem('cbt_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
        localStorage.removeItem('cbt_token');
        setToken(null);
        setUser(null);
    }, []);

    const provideConsent = useCallback(async () => {
        if (!token) return;
        const data = await apiFetch<{ success: boolean; token: string; user: User }>('/api/auth/consent', {
            method: 'POST',
            token
        });
        localStorage.setItem('cbt_token', data.token);
        setToken(data.token);
        setUser(data.user);
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, provideConsent }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
