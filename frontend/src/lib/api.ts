const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FetchOptions = RequestInit & {
    token?: string | null;
};

export const apiFetch = async <T>(
    path: string,
    options: FetchOptions = {}
): Promise<T> => {
    const { token, ...rest } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((rest.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers,
        credentials: 'include', // send cookies
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'API request failed');
    }
    return data as T;
};
