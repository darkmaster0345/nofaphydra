/**
 * Prayer Time Utilities
 * 
 * Fetches prayer times from Aladhan API and provides utilities for
 * tracking daily prayer check-ins.
 */

const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';
const STORAGE_KEY = 'fursan_prayer_checkins';

export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

export interface PrayerCheckin {
    date: string; // ISO date string (YYYY-MM-DD)
    prayers: {
        fajr: boolean;
        dhuhr: boolean;
        asr: boolean;
        maghrib: boolean;
        isha: boolean;
    };
    timestamp: number;
}

interface AladhanResponse {
    data: {
        timings: PrayerTimes;
    };
}

// Cache prayer times for the day
let cachedPrayerTimes: PrayerTimes | null = null;
let cacheDate: string | null = null;

/**
 * Get user's current position
 */
async function getCurrentPosition(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            () => resolve(null),
            { timeout: 5000, maximumAge: 3600000 }
        );
    });
}

/**
 * Fetch prayer times from Aladhan API
 */
export async function fetchPrayerTimes(date: Date = new Date()): Promise<PrayerTimes | null> {
    const dateKey = date.toISOString().split('T')[0];

    // Return cached if same day
    if (cachedPrayerTimes && cacheDate === dateKey) {
        return cachedPrayerTimes;
    }

    try {
        const position = await getCurrentPosition();

        if (!position) {
            console.warn('[Prayer] No geolocation, using default times');
            return getDefaultPrayerTimes();
        }

        const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const response = await fetch(
            `${ALADHAN_API_BASE}/timings/${dateStr}?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&method=2`
        );

        if (!response.ok) {
            return getDefaultPrayerTimes();
        }

        const data: AladhanResponse = await response.json();
        cachedPrayerTimes = data.data.timings;
        cacheDate = dateKey;

        return cachedPrayerTimes;
    } catch (error) {
        console.error('[Prayer] API fetch failed:', error);
        return getDefaultPrayerTimes();
    }
}

/**
 * Default prayer times (approximate for Islamic regions)
 */
function getDefaultPrayerTimes(): PrayerTimes {
    return {
        Fajr: "05:30",
        Sunrise: "06:45",
        Dhuhr: "12:30",
        Asr: "15:45",
        Maghrib: "18:00",
        Isha: "19:30"
    };
}

/**
 * Get today's date key (Islamic day - starts at Fajr)
 */
export function getIslamicDateKey(date: Date = new Date()): string {
    // For simplicity, use calendar date
    // A more accurate implementation would use Fajr time
    return date.toISOString().split('T')[0];
}

/**
 * Get stored prayer check-ins
 */
export function getPrayerCheckins(): PrayerCheckin[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Get today's prayer check-in
 */
export function getTodayCheckin(): PrayerCheckin | null {
    const today = getIslamicDateKey();
    const checkins = getPrayerCheckins();
    return checkins.find(c => c.date === today) || null;
}

/**
 * Save a prayer check-in
 */
export function savePrayerCheckin(prayer: keyof PrayerCheckin['prayers'], completed: boolean): void {
    const today = getIslamicDateKey();
    const checkins = getPrayerCheckins();

    let todayCheckin = checkins.find(c => c.date === today);

    if (!todayCheckin) {
        todayCheckin = {
            date: today,
            prayers: {
                fajr: false,
                dhuhr: false,
                asr: false,
                maghrib: false,
                isha: false
            },
            timestamp: Date.now()
        };
        checkins.push(todayCheckin);
    }

    todayCheckin.prayers[prayer] = completed;
    todayCheckin.timestamp = Date.now();

    // Keep only last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filtered = checkins.filter(c => c.timestamp > thirtyDaysAgo);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Calculate prayer streak (consecutive days with all 5 prayers)
 */
export function calculatePrayerStreak(): number {
    const checkins = getPrayerCheckins();
    if (checkins.length === 0) return 0;

    // Sort by date descending
    const sorted = [...checkins].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sorted.length; i++) {
        const checkin = sorted[i];
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        const expectedKey = getIslamicDateKey(expectedDate);

        // Check if this is the expected consecutive day
        if (checkin.date !== expectedKey) break;

        // Check if all prayers were completed
        const allCompleted = Object.values(checkin.prayers).every(v => v);
        if (!allCompleted) break;

        streak++;
    }

    return streak;
}

/**
 * Get completion percentage for today
 */
export function getTodayCompletionPercentage(): number {
    const today = getTodayCheckin();
    if (!today) return 0;

    const completed = Object.values(today.prayers).filter(v => v).length;
    return Math.round((completed / 5) * 100);
}

/**
 * Get specific dates/times for prayer notifications
 */
export async function getPrayerNotificationTimes(): Promise<{ name: string; time: Date }[]> {
    const times = await fetchPrayerTimes();
    if (!times) return [];

    const now = new Date();
    const result: { name: string; time: Date }[] = [];

    const prayerNames: (keyof PrayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    prayerNames.forEach(name => {
        const [hours, minutes] = times[name].split(':').map(Number);
        const prayerDate = new Date(now);
        prayerDate.setHours(hours, minutes, 0, 0);

        // If the prayer time has already passed today, schedule it for tomorrow
        if (prayerDate.getTime() < now.getTime()) {
            prayerDate.setDate(now.getDate() + 1);
        }

        result.push({ name, time: prayerDate });
    });

    return result.sort((a, b) => a.time.getTime() - b.time.getTime());
}
