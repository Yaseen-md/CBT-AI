'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

interface Stats {
    users: number;
    conversations: number;
    messages: number;
    safetyEvents: {
        total: number;
        unresolved: number;
        bySeverity: Record<string, number>;
        last24h: number;
    };
}

interface SafetyEvent {
    id: string;
    user_name: string;
    email: string;
    snippet: string;
    severity: string;
    created_at: string;
    resolved: boolean;
    notes?: string;
}

interface UserAdmin {
    id: string;
    name: string;
    email: string;
    created_at: string;
    crisis_count: number;
    is_admin: boolean;
}

export default function AdminDashboard() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    
    const [stats, setStats] = useState<Stats | null>(null);
    const [events, setEvents] = useState<SafetyEvent[]>([]);
    const [users, setUsers] = useState<UserAdmin[]>([]);
    const [viewMode, setViewMode] = useState<'events' | 'users'>('events');
    const [showResolved, setShowResolved] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Resolve modal state
    const [resolvingEvent, setResolvingEvent] = useState<string | null>(null);
    const [resolveNotes, setResolveNotes] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (!user) router.push('/login');
            else if (!user.is_admin) router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    const fetchData = async () => {
        if (!token) return;
        setLoadingData(true);
        try {
            const statsRes = await apiFetch<{ stats: Stats }>('/api/admin/stats', { token });
            setStats(statsRes.stats);

            const eventsRes = await apiFetch<{ events: SafetyEvent[] }>(
                `/api/admin/safety-events?includeResolved=${showResolved}&limit=50`, 
                { token }
            );
            setEvents(eventsRes.events);

            const usersRes = await apiFetch<{ users: UserAdmin[] }>('/api/admin/users', { token });
            setUsers(usersRes.users);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user?.is_admin && token) {
            fetchData();
        }
    }, [user, token, showResolved]);

    const handleResolve = async (id: string) => {
        if (!token) return;
        try {
            await apiFetch(`/api/admin/safety-events/${id}/resolve`, {
                method: 'PUT',
                token,
                body: JSON.stringify({ notes: resolveNotes })
            });
            setResolvingEvent(null);
            setResolveNotes('');
            fetchData(); // reload
        } catch (err) {
            alert('Failed to resolve event');
        }
    };

    if (isLoading || loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user?.is_admin) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-800">
                            ← App
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-indigo-600">
                            🛡️ Admin Console
                        </h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        Logged in as <span className="font-semibold">{user.name}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full gap-8 grid lg:grid-cols-3">
                {/* Fixed Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">System Overview</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span className="text-gray-600 text-sm">Total Users</span>
                                <span className="font-semibold text-gray-900">{stats?.users || 0}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span className="text-gray-600 text-sm">Sessions</span>
                                <span className="font-semibold text-gray-900">{stats?.conversations || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Messages</span>
                                <span className="font-semibold text-gray-900">{stats?.messages || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm border border-red-100 p-6">
                        <h2 className="text-lg font-bold text-red-900 mb-4">Crisis Center</h2>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/60 rounded-lg p-3 text-center border border-red-100">
                                <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-1">Unresolved</p>
                                <p className="text-2xl font-bold text-red-700">{stats?.safetyEvents?.unresolved || 0}</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-3 text-center border border-orange-100">
                                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-1">Last 24Hr</p>
                                <p className="text-2xl font-bold text-orange-700">{stats?.safetyEvents?.last24h || 0}</p>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <p className="text-xs text-red-800 font-semibold mb-2">BY SEVERITY (All Time)</p>
                            <div className="space-y-1">
                                {Object.entries(stats?.safetyEvents?.bySeverity || {}).map(([sev, count]) => (
                                    <div key={sev} className="flex justify-between text-sm">
                                        <span className="capitalize">{sev}</span>
                                        <span className="font-medium">{count as number}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Safety Events / Users Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <button 
                            onClick={() => setViewMode('events')}
                            className={`flex-1 py-3 px-5 text-center font-bold text-sm transition-colors ${viewMode === 'events' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Safety Events
                        </button>
                        <button 
                            onClick={() => setViewMode('users')}
                            className={`flex-1 py-3 px-5 text-center font-bold text-sm transition-colors ${viewMode === 'users' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            User Analytics
                        </button>
                    </div>

                    {viewMode === 'events' && (
                        <>
                            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Safety Event Logs</h2>
                                <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors border border-gray-200">
                                    <input 
                                        type="checkbox" 
                                        checked={showResolved}
                                        onChange={(e) => setShowResolved(e.target.checked)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                    />
                                    <span className="font-medium text-gray-700">Include Resolved</span>
                                </label>
                            </div>

                            {events.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                                    {showResolved ? 'No safety events logged yet.' : 'All clear! No unresolved safety events.'}
                                    <div className="mt-4 text-4xl">🎉</div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {events.map((evt) => (
                                        <div key={evt.id} className={`bg-white rounded-xl shadow-sm border p-5 ${evt.resolved ? 'border-gray-200 opacity-60' : evt.severity === 'critical' ? 'border-red-300 ring-1 ring-red-100' : 'border-orange-200'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${
                                                            evt.severity === 'critical' ? 'bg-red-600 text-white' :
                                                            evt.severity === 'high' ? 'bg-orange-500 text-white' :
                                                            evt.severity === 'medium' ? 'bg-yellow-400 text-yellow-900' :
                                                            'bg-gray-200 text-gray-800'
                                                        }`}>
                                                            {evt.severity}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(evt.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="font-semibold text-gray-900">{evt.user_name || 'Deleted User'}</p>
                                                    <p className="text-xs text-gray-500">{evt.email}</p>
                                                </div>
                                                {!evt.resolved && (
                                                    <button 
                                                        onClick={() => setResolvingEvent(evt.id)}
                                                        className="px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition-colors"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                                {evt.resolved && (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md font-medium border border-green-200">
                                                        Resolved
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic border-l-2 border-gray-300 whitespace-pre-wrap">
                                                "{evt.snippet}"
                                            </div>

                                            {evt.resolved && evt.notes && (
                                                <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                                    <strong>Admin Notes:</strong> {evt.notes}
                                                </div>
                                            )}

                                            {/* Resolution Form Inline */}
                                            {resolvingEvent === evt.id && (
                                                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <h4 className="text-sm font-semibold mb-2 text-gray-800">Resolve Event</h4>
                                                    <textarea 
                                                        value={resolveNotes}
                                                        onChange={(e) => setResolveNotes(e.target.value)}
                                                        className="w-full text-sm p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                        placeholder="Action taken or notes (optional)..."
                                                        rows={2}
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setResolvingEvent(null)} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                                                        <button onClick={() => handleResolve(evt.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium shadow-sm">Mark Resolved</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {viewMode === 'users' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Crisis Level</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                                <div className="text-sm text-gray-500">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                {u.is_admin ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Admin</span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">User</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {(u.crisis_count ?? 0) > 0 ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                                                        {u.crisis_count} Events
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">0</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
