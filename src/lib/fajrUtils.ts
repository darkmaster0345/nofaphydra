/**
 * Fajr Time Utility
 * 
 * This module provides utilities for calculating Fajr prayer time
 * and determining if daily resets should trigger based on Islamic biological rhythms.
 * 
 * Uses the Aladhan API for accurate prayer times based on location,
 * with a static fallback when geolocation is unavailable.
 */

const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';
const DEFAULT_FAJR_HOUR = 5;
const DEFAULT_FAJR_MINUTE = 30;

// Cache for daily Fajr time to avoid excessive API calls
let cachedFajrTime: Date | null = null;
let cacheDate: string | null = null;

interface PrayerTimesResponse {
    data: {
        timings: {
            Fajr: string;
            Sunrise: string;
            Dhuhr: string;
            Asr: string;
            Maghrib: string;
            Isha: string;
        };
    };
}

/**
 * Get the user's current position using the Geolocation API
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
            { timeout: 5000, maximumAge: 3600000 } // Cache location for 1 hour
        );
    });
}

/**
 * Fetch Fajr time from Aladhan API based on coordinates
 */
async function fetchFajrFromAPI(latitude: number, longitude: number, date: Date): Promise<string | null> {
    try {
        const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const response = await fetch(
            `${ALADHAN_API_BASE}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
        );

        if (!response.ok) return null;

        const data: PrayerTimesResponse = await response.json();
        return data.data.timings.Fajr;
    } catch (error) {
        console.warn('[Fajr] API fetch failed:', error);
        return null;
    }
}

/**
 * Parse time string (HH:MM) to Date object for today
 */
function parseTimeToDate(timeStr: string, date: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}

/**
 * Get the static fallback Fajr time (5:30 AM local time)
 */
function getStaticFajrTime(date: Date): Date {
    const result = new Date(date);
    result.setHours(DEFAULT_FAJR_HOUR, DEFAULT_FAJR_MINUTE, 0, 0);
    return result;
}

/**
 * Get Fajr time for a given date.
 * Uses geolocation + Aladhan API if available, falls back to static 5:30 AM.
 * 
 * @param date - The date to get Fajr time for (defaults to today)
 * @returns Promise<Date> - The Fajr time as a Date object
 */
export async function getFajrTime(date: Date = new Date()): Promise<Date> {
    const dateKey = date.toDateString();

    // Return cached value if same day
    if (cachedFajrTime && cacheDate === dateKey) {
        return cachedFajrTime;
    }

    try {
        const position = await getCurrentPosition();

        if (position) {
            const fajrStr = await fetchFajrFromAPI(
                position.coords.latitude,
                position.coords.longitude,
                date
            );

            if (fajrStr) {
                cachedFajrTime = parseTimeToDate(fajrStr, date);
                cacheDate = dateKey;
                console.log('[Fajr] Using API time:', fajrStr);
                return cachedFajrTime;
            }
        }
    } catch (error) {
        console.warn('[Fajr] Geolocation/API failed, using static fallback');
    }

    // Fallback to static time
    cachedFajrTime = getStaticFajrTime(date);
    cacheDate = dateKey;
    console.log('[Fajr] Using static fallback:', `${DEFAULT_FAJR_HOUR}:${DEFAULT_FAJR_MINUTE}`);
    return cachedFajrTime;
}

/**
 * Get Fajr time synchronously (uses cached value or static fallback).
 * Useful when async isn't convenient.
 */
export function getFajrTimeSync(date: Date = new Date()): Date {
    const dateKey = date.toDateString();

    if (cachedFajrTime && cacheDate === dateKey) {
        return cachedFajrTime;
    }

    // If no cache, return static fallback
    return getStaticFajrTime(date);
}

/**
 * Check if it's a new "Islamic day" (has passed Fajr since last check).
 * 
 * @param lastActionTimestamp - Timestamp of the last action (in ms)
 * @returns boolean - True if we've passed a Fajr boundary since the last action
 */
export function isDayResetDue(lastActionTimestamp: number): boolean {
    const now = new Date();
    const lastAction = new Date(lastActionTimestamp);
    const todayFajr = getFajrTimeSync(now);

    // If last action was before today's Fajr and now is after today's Fajr
    if (lastAction < todayFajr && now >= todayFajr) {
        return true;
    }

    // If last action was on a previous day entirely
    const yesterdayFajr = new Date(todayFajr);
    yesterdayFajr.setDate(yesterdayFajr.getDate() - 1);

    if (lastAction < yesterdayFajr) {
        return true;
    }

    return false;
}

/**
 * Get the current "Islamic date" start time (today's Fajr).
 * If before Fajr, returns yesterday's Fajr.
 */
export function getCurrentIslamicDayStart(now: Date = new Date()): Date {
    const todayFajr = getFajrTimeSync(now);

    if (now < todayFajr) {
        // Before Fajr, so we're still in "yesterday's" Islamic day
        const yesterdayFajr = new Date(todayFajr);
        yesterdayFajr.setDate(yesterdayFajr.getDate() - 1);
        return yesterdayFajr;
    }

    return todayFajr;
}

/**
 * Check if a given timestamp is from "today" in Islamic time.
 */
export function isToday(timestamp: number): boolean {
    const checkDate = new Date(timestamp);
    const islamicDayStart = getCurrentIslamicDayStart();
    const nextFajr = new Date(islamicDayStart);
    nextFajr.setDate(nextFajr.getDate() + 1);

    return checkDate >= islamicDayStart && checkDate < nextFajr;
}

/**
 * Check if a Sabr (streak) day should be incremented.
 * Only returns true if current time is AFTER today's Fajr.
 */
export function shouldIncrementSabrDay(): boolean {
    const now = new Date();
    const todayFajr = getFajrTimeSync(now);
    return now >= todayFajr;
}

/**
 * Get message for pre-Fajr check-in attempts.
 * Returns null if it's already past Fajr.
 */
export function getPreFajrMessage(): string | null {
    const now = new Date();
    const todayFajr = getFajrTimeSync(now);

    if (now < todayFajr) {
        const fajrTime = todayFajr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `Sabr for the Night remains. Next Day of Sabr starts at ${fajrTime}.`;
    }

    return null;
}

/**
 * Calculate total Sabr days from start date, respecting Fajr boundaries.
 */
export function calculateSabrDays(startDate: string | null): number {
    if (!startDate) return 0;

    const start = new Date(startDate);
    const now = new Date();

    // If before today's Fajr, don't count today yet
    if (!shouldIncrementSabrDay()) {
        now.setDate(now.getDate() - 1);
    }

    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
}
