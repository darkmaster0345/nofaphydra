import {
    Coordinates,
    CalculationMethod,
    PrayerTimes as AdhanPrayerTimes,
    SunnahTimes,
    Prayer as AdhanPrayer,
    Madhab
} from 'adhan';
import { Geolocation } from '@capacitor/geolocation';

const STORAGE_KEY = 'fursan_prayer_checkins';
const METHOD_STORAGE_KEY = 'fursan_prayer_method';
const MADHAB_STORAGE_KEY = 'fursan_prayer_madhab';

export const CALCULATION_METHODS = [
    { id: 'MuslimWorldLeague', name: 'Muslim World League' },
    { id: 'Egyptian', name: 'Egyptian General Authority of Survey' },
    { id: 'Karachi', name: 'University of Islamic Sciences, Karachi' },
    { id: 'UmmAlQura', name: 'Umm al-Qura University, Makkah' },
    { id: 'Dubai', name: 'Dubai' },
    { id: 'MoonsightingCommittee', name: 'Moonsighting Committee' },
    { id: 'NorthAmerica', name: 'ISNA (North America)' },
    { id: 'Kuwait', name: 'Kuwait' },
    { id: 'Qatar', name: 'Qatar' },
    { id: 'Singapore', name: 'Singapore' },
    { id: 'Turkey', name: 'Turkey' },
    { id: 'Tehran', name: 'Institute of Geophysics, University of Tehran' },
];

export const MADHABS = [
    { id: 'Shafi', name: 'Shafi / Maliki / Hanbali' },
    { id: 'Hanafi', name: 'Hanafi' },
];

export interface PrayerTimes {
    Fajr: Date;
    Sunrise: Date;
    Dhuhr: Date;
    Asr: Date;
    Maghrib: Date;
    Isha: Date;
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

/**
 * Get Network Verified Time (Anti-Cheat)
 * Falls back to local time if network is unavailable.
 */
export async function getVerifiedTime(): Promise<number> {
    try {
        // We fetch from a high-availability server to check the 'Date' header
        // This is a lightweight way to get a trusted timestamp without a specialized NTP library.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://www.google.com', {
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const dateStr = response.headers.get('Date');
        if (dateStr) {
            return new Date(dateStr).getTime();
        }
    } catch (e) {
        console.warn('[Anti-Cheat] Network time check failed, using local clock.');
    }
    return Date.now();
}

/**
 * Get prayer times locally using Adhan.js
 */
export async function getLocalPrayerTimes(date: Date = new Date()): Promise<PrayerTimes | null> {
    try {
        const platform = (window as any).Capacitor?.getPlatform();
        let coords: { latitude: number; longitude: number } | null = null;

        // Try to get GPS coordinates
        try {
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: false,
                timeout: 5000
            });
            coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (e) {
            console.warn('[Prayer] GPS access denied or failed, using default (Mecca)');
            // Default to Mecca coordinates if GPS is unavailable
            coords = { latitude: 21.4225, longitude: 39.8262 };
        }

        const adhanCoords = new Coordinates(coords.latitude, coords.longitude);

        // Load Calculation Method
        const storedMethod = localStorage.getItem(METHOD_STORAGE_KEY) || 'MuslimWorldLeague';
        let params;
        switch (storedMethod) {
            case 'Egyptian': params = CalculationMethod.Egyptian(); break;
            case 'Karachi': params = CalculationMethod.Karachi(); break;
            case 'UmmAlQura': params = CalculationMethod.UmmAlQura(); break;
            case 'Dubai': params = CalculationMethod.Dubai(); break;
            case 'MoonsightingCommittee': params = CalculationMethod.MoonsightingCommittee(); break;
            case 'NorthAmerica': params = CalculationMethod.NorthAmerica(); break;
            case 'Kuwait': params = CalculationMethod.Kuwait(); break;
            case 'Qatar': params = CalculationMethod.Qatar(); break;
            case 'Singapore': params = CalculationMethod.Singapore(); break;
            case 'Turkey': params = CalculationMethod.Turkey(); break;
            case 'Tehran': params = CalculationMethod.Tehran(); break;
            default: params = CalculationMethod.MuslimWorldLeague();
        }

        // Load Madhab
        const storedMadhab = localStorage.getItem(MADHAB_STORAGE_KEY) || 'Shafi';
        params.madhab = storedMadhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

        const prayerTimes = new AdhanPrayerTimes(adhanCoords, date, params);

        return {
            Fajr: prayerTimes.fajr,
            Sunrise: prayerTimes.sunrise,
            Dhuhr: prayerTimes.dhuhr,
            Asr: prayerTimes.asr,
            Maghrib: prayerTimes.maghrib,
            Isha: prayerTimes.isha
        };
    } catch (error) {
        console.error('[Prayer] Local calculation failed:', error);
        return null;
    }
}

/**
 * Check if a prayer time has been reached
 */
export async function isPrayerActive(prayerId: string): Promise<{ active: boolean; countdown: number }> {
    const times = await getLocalPrayerTimes();
    if (!times) return { active: false, countdown: 0 };

    const verifiedNow = await getVerifiedTime();
    const prayerKey = prayerId.charAt(0).toUpperCase() + prayerId.slice(1) as keyof PrayerTimes;
    const prayerTime = times[prayerKey].getTime();

    const diff = prayerTime - verifiedNow;

    return {
        active: diff <= 0,
        countdown: diff > 0 ? diff : 0
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
    const times = await getLocalPrayerTimes();
    if (!times) return [];

    const now = new Date();
    const result: { name: string; time: Date }[] = [];

    const prayerNames: (keyof PrayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    prayerNames.forEach(name => {
        const prayerDate = new Date(times[name]);

        // If the prayer time has already passed today, scheduled for next cycle
        // Not perfectly accurate for midnight cases but works for standard daily reset
        if (prayerDate.getTime() < now.getTime()) {
            prayerDate.setDate(now.getDate() + 1);
        }

        result.push({ name, time: prayerDate });
    });

    return result.sort((a, b) => a.time.getTime() - b.time.getTime());
}
