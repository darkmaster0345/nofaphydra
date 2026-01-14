// Activity Log Utility for tracking user actions
export interface ActivityEntry {
    id: string;
    type: 'journal_save' | 'streak_start' | 'streak_reset' | 'profile_update' | 'cloud_sync';
    message: string;
    timestamp: number;
}

const STORAGE_KEY = 'hydra_activity_log';
const MAX_ENTRIES = 50;

export function getActivityLog(): ActivityEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function logActivity(type: ActivityEntry['type'], message: string): void {
    const entry: ActivityEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        message,
        timestamp: Date.now(),
    };

    const log = getActivityLog();
    const updated = [entry, ...log].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearActivityLog(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function getActivityIcon(type: ActivityEntry['type']): string {
    switch (type) {
        case 'journal_save': return '📝';
        case 'streak_start': return '🚀';
        case 'streak_reset': return '🔄';
        case 'profile_update': return '👤';
        case 'cloud_sync': return '☁️';
        default: return '📌';
    }
}
