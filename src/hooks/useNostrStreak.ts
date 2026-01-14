/**
 * React hook for Nostr streak synchronization with offline support
 * 
 * This hook provides:
 * - Automatic sync on mount
 * - Manual save/fetch functions
 * - Loading and error states
 * - Network status monitoring
 * - Pending queue indicator
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
    saveStreak as nostrSaveStreak,
    fetchStreak as nostrFetchStreak,
    syncStreak as nostrSyncStreak,
    generateOrLoadKeys,
    initNetworkListener,
    subscribeToNetworkState,
    manualFlush,
    getPendingCount,
    StreakPayload,
    NetworkState,
} from "@/services/nostr";

interface UseNostrStreakOptions {
    autoSync?: boolean;
}

interface UseNostrStreakReturn {
    // Sync states
    isSyncing: boolean;
    lastSyncTime: Date | null;
    error: string | null;

    // Identity
    publicKey: string | null;

    // Network status
    isOnline: boolean;
    pendingCount: number;

    // Actions
    saveStreak: (data: StreakPayload) => Promise<boolean>;
    fetchStreak: () => Promise<StreakPayload | null>;
    syncStreak: (localData: StreakPayload) => Promise<StreakPayload>;
    initializeKeys: () => Promise<void>;
    flushPendingEvents: () => Promise<void>;
}

export function useNostrStreak(
    options: UseNostrStreakOptions = {}
): UseNostrStreakReturn {
    const { autoSync = false } = options;

    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);

    // Network state
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    // Track if we've initialized
    const hasInitialized = useRef(false);

    // Initialize network listener and subscribe to state changes
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // Initialize network listener
        initNetworkListener().catch((err) => {
            console.error("[useNostrStreak] Failed to init network listener:", err);
        });

        // Subscribe to network state changes
        const unsubscribe = subscribeToNetworkState((state: NetworkState) => {
            setIsOnline(state.isOnline);
            setPendingCount(state.pendingCount);

            // Update syncing state from network service
            if (state.isSyncing) {
                setIsSyncing(true);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const initializeKeys = useCallback(async () => {
        try {
            const keys = await generateOrLoadKeys();
            setPublicKey(keys.publicKey);
        } catch (err) {
            console.error("[useNostrStreak] Failed to initialize keys:", err);
            setError("Failed to initialize Nostr identity");
        }
    }, []);

    const saveStreak = useCallback(async (data: StreakPayload): Promise<boolean> => {
        setIsSyncing(true);
        setError(null);

        try {
            const success = await nostrSaveStreak(data);
            if (success) {
                setLastSyncTime(new Date());
            }

            // Update pending count after save
            const count = await getPendingCount();
            setPendingCount(count);

            return success;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save streak";
            setError(message);
            console.error("[useNostrStreak] Save error:", err);
            return false;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const fetchStreak = useCallback(async (): Promise<StreakPayload | null> => {
        if (!isOnline) {
            console.log("[useNostrStreak] Offline - skipping fetch");
            return null;
        }

        setIsSyncing(true);
        setError(null);

        try {
            const data = await nostrFetchStreak();
            if (data) {
                setLastSyncTime(new Date());
            }
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch streak";
            setError(message);
            console.error("[useNostrStreak] Fetch error:", err);
            return null;
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline]);

    const syncStreak = useCallback(async (localData: StreakPayload): Promise<StreakPayload> => {
        setIsSyncing(true);
        setError(null);

        try {
            const merged = await nostrSyncStreak(localData);
            setLastSyncTime(new Date());
            return merged;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to sync streak";
            setError(message);
            console.error("[useNostrStreak] Sync error:", err);
            return localData;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const flushPendingEvents = useCallback(async () => {
        if (!isOnline) {
            setError("Cannot flush while offline");
            return;
        }

        setIsSyncing(true);
        try {
            await manualFlush();
            const count = await getPendingCount();
            setPendingCount(count);
            setLastSyncTime(new Date());
        } catch (err) {
            console.error("[useNostrStreak] Flush error:", err);
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline]);

    // Auto-initialize keys on mount
    useEffect(() => {
        initializeKeys();
    }, [initializeKeys]);

    return {
        isSyncing,
        lastSyncTime,
        error,
        publicKey,
        isOnline,
        pendingCount,
        saveStreak,
        fetchStreak,
        syncStreak,
        initializeKeys,
        flushPendingEvents,
    };
}
