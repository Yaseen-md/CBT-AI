const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FetchOptions = RequestInit & {
    token?: string | null;
};

export const apiFetch = async <T>(
    path: string,
    options: FetchOptions = {}
): Promise<T> => {
    const { token, body, ...rest } = options;

    // Check if body is FormData
    const isFormData = body instanceof FormData;

    const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((rest.headers as Record<string, string>) || {}),
    };

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers,
        credentials: 'include', // send cookies
        body,
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'API request failed');
    }
    return data as T;
};
