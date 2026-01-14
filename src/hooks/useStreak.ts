import { useState, useEffect, useCallback, useMemo } from "react";
import { StreakData, getStreakData, saveStreakData, calculateStreak } from "@/lib/streakUtils";
import { useNostrStreak } from "./useNostrStreak";

export function useStreak() {
    const [streakData, setStreakData] = useState<StreakData>({
        startDate: null,
        longestStreak: 0,
        totalRelapses: 0,
    });

    const { saveStreak, fetchStreak, isSyncing, isOnline, pendingCount } = useNostrStreak();

    // Load local data
    useEffect(() => {
        setStreakData(getStreakData());
    }, []);

    // Sync from Nostr on load
    useEffect(() => {
        const sync = async () => {
            const remote = await fetchStreak();
            if (remote) {
                const local = getStreakData();
                const newestTimestamp = remote.timestamp;
                const localTimestamp = local.startDate ? new Date(local.startDate).getTime() : 0;

                if (newestTimestamp > localTimestamp || remote.longestStreak > local.longestStreak) {
                    const merged: StreakData = {
                        startDate: remote.startDate,
                        longestStreak: Math.max(local.longestStreak, remote.longestStreak),
                        totalRelapses: Math.max(local.totalRelapses, remote.totalRelapses),
                    };
                    setStreakData(merged);
                    saveStreakData(merged);
                }
            }
        };
        const timer = setTimeout(sync, 1000);
        return () => clearTimeout(timer);
    }, [fetchStreak]);

    // Live streak calculation
    const [liveStreak, setLiveStreak] = useState({ days: 0, hours: 0, minutes: 0 });

    const updateLiveStreak = useCallback(() => {
        setLiveStreak(calculateStreak(streakData.startDate));
    }, [streakData.startDate]);

    useEffect(() => {
        updateLiveStreak();
        const interval = setInterval(updateLiveStreak, 60000);
        return () => clearInterval(interval);
    }, [updateLiveStreak]);

    // Auto-update longest streak
    useEffect(() => {
        if (liveStreak.days > streakData.longestStreak) {
            const updated = {
                ...streakData,
                longestStreak: liveStreak.days,
            };
            setStreakData(updated);
            saveStreakData(updated);
        }
    }, [liveStreak.days, streakData.longestStreak]);

    const handleStart = useCallback(() => {
        const newData: StreakData = {
            ...streakData,
            startDate: new Date().toISOString(),
        };
        setStreakData(newData);
        saveStreakData(newData);
        saveStreak({
            days: 0,
            startDate: newData.startDate,
            longestStreak: newData.longestStreak,
            totalRelapses: newData.totalRelapses,
            timestamp: Date.now(),
        });
    }, [streakData, saveStreak]);

    const handleReset = useCallback(() => {
        const current = calculateStreak(streakData.startDate);
        const newData: StreakData = {
            startDate: null,
            longestStreak: Math.max(streakData.longestStreak, current.days),
            totalRelapses: streakData.totalRelapses + 1,
        };
        setStreakData(newData);
        saveStreakData(newData);
        saveStreak({
            days: 0,
            startDate: null,
            longestStreak: newData.longestStreak,
            totalRelapses: newData.totalRelapses,
            timestamp: Date.now(),
        });
    }, [streakData, saveStreak]);

    return {
        streakData,
        liveStreak,
        isSyncing,
        isOnline,
        pendingCount,
        handleStart,
        handleReset,
        fetchStreak // optionally expose
    };
}
