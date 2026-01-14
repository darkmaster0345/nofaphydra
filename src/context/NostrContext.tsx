import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SimplePool, Relay, Filter, Event } from 'nostr-tools';
import { Preferences } from '@capacitor/preferences';

const RELAYS = ["wss://nos.lol", "wss://relay.damus.io", "wss://relay.snort.social"];
const DEFAULT_RELAYS = RELAYS;

interface RelayMetadata {
    name?: string;
    description?: string;
    pubkey?: string;
    contact?: string;
    supported_nips?: number[];
    software?: string;
    version?: string;
}

interface UserMetadata {
    name?: string;
    picture?: string;
}

interface NostrContextType {
    pool: SimplePool;
    relays: string[];
    connectedRelays: string[];
    relayMetadata: Record<string, RelayMetadata>;
    userMetadata: Record<string, UserMetadata>;
    addRelay: (url: string) => Promise<void>;
    removeRelay: (url: string) => Promise<void>;
    publish: (event: any) => Promise<boolean>;
    subscribe: (filter: Filter, onEvent: (event: Event) => void) => () => void;
    checkRelayStatus: (url: string) => Promise<{ success: boolean; metadata?: RelayMetadata }>;
}

const NostrContext = createContext<NostrContextType | null>(null);

export const NostrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [relays, setRelays] = useState<string[]>(DEFAULT_RELAYS);
    const [connectedRelays, setConnectedRelays] = useState<string[]>([]);
    const [relayMetadata, setRelayMetadata] = useState<Record<string, RelayMetadata>>({});
    const [userMetadata, setUserMetadata] = useState<Record<string, UserMetadata>>({});
    const poolRef = useRef<SimplePool>(new SimplePool());

    useEffect(() => {
        const loadRelays = async () => {
            const { value } = await Preferences.get({ key: 'user_relays' });
            if (value) {
                setRelays(JSON.parse(value));
            }
        };
        loadRelays();
    }, []);

    // Monitor relay connections
    const connectionInProgress = useRef(false);

    useEffect(() => {
        const checkConnections = async () => {
            if (connectionInProgress.current) return;
            connectionInProgress.current = true;

            try {
                const connected: string[] = [];

                const ensureConnection = async (url: string) => {
                    try {
                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error(`Relay ${url} connection timeout`)), 5000);
                        });

                        const connectionPromise = poolRef.current.ensureRelay(url);
                        await Promise.race([connectionPromise, timeoutPromise]);

                        console.log(`✅ Connected to ${url}`);
                        return url;
                    } catch (e) {
                        console.warn(`❌ Failed to connect to ${url}`, e);
                        return null;
                    }
                };

                const results = await Promise.allSettled(relays.map(url => ensureConnection(url)));

                const successfulRelays = results
                    .filter(r => r.status === 'fulfilled' && r.value !== null)
                    .map(r => (r as PromiseFulfilledResult<string>).value);

                console.log(`Connected to ${successfulRelays.length}/${relays.length} relays`);
                setConnectedRelays(successfulRelays);
            } finally {
                connectionInProgress.current = false;
            }
        };

        checkConnections();
        const interval = setInterval(checkConnections, 60000);

        return () => {
            clearInterval(interval);
            // This is the "Kill Switch" that stops the logs from piling up
            relays.forEach(url => poolRef.current.close([url]));
        };
    }, [relays]);

    // Separate effect for metadata fetching
    useEffect(() => {
        const fetchMetadata = async (url: string) => {
            // Avoid refetching if we already have it
            if (relayMetadata[url]) return;

            try {
                const httpUrl = url.replace('wss://', 'https://').replace('ws://', 'http://');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch(httpUrl, {
                    headers: { 'Accept': 'application/nostr+json' },
                    mode: 'cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    setRelayMetadata(prev => ({ ...prev, [url]: data }));
                }
            } catch (e) {
                // Silently fail
            }
        };

        // Attempt to fetch metadata for all known relays on mount or change
        relays.forEach(url => fetchMetadata(url));
    }, [relays]);

    const checkRelayStatus = useCallback(async (url: string) => {
        try {
            const relay = await poolRef.current.ensureRelay(url);

            // Fetch NIP-11 metadata
            let metadata: RelayMetadata | undefined;
            try {
                const httpUrl = url.replace('wss://', 'https://').replace('ws://', 'http://');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(httpUrl, {
                    headers: { 'Accept': 'application/nostr+json' },
                    mode: 'cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    metadata = await response.json();
                }
            } catch (e) {
                console.warn("Relay metadata fetch failed or timed out", url);
            }

            return { success: true, metadata };
        } catch (e) {
            return { success: false };
        }
    }, []);

    const addRelay = useCallback(async (url: string) => {
        if (!url.startsWith('wss://') && !url.startsWith('ws://')) return;
        const newRelays = [...new Set([...relays, url])];
        setRelays(newRelays);
        await Preferences.set({ key: 'user_relays', value: JSON.stringify(newRelays) });
    }, [relays]);

    const removeRelay = useCallback(async (url: string) => {
        const newRelays = relays.filter(r => r !== url);
        setRelays(newRelays);
        await Preferences.set({ key: 'user_relays', value: JSON.stringify(newRelays) });
    }, [relays]);

    const publish = useCallback(async (event: any) => {
        try {
            const targetRelays = connectedRelays.length > 0 ? connectedRelays : relays;

            if (targetRelays.length === 0) {
                console.warn("No connected relays to publish to");
                // Attempt to publish to all known relays as fallback
            }

            // Fallback to all relays if no connected ones are maintained in state properly
            const activeRelays = targetRelays.length > 0 ? targetRelays : relays;

            if (activeRelays.length === 0) {
                return false;
            }

            // 1. Force a "re-wake" of the pool before sending to ensure socket is alive
            // This helps with browser background tab suspension issues
            try {
                await poolRef.current.ensureRelay(activeRelays[0]);
            } catch (e) {
                // Ignore wake-up failure, the race loop will handle individual connection attempts if needed
                console.warn("Wake-up ping failed, proceeding to race", e);
            }

            return await Promise.race([
                new Promise<boolean>((resolve) => {
                    let acknowledged = false;
                    let failureCount = 0;
                    const total = activeRelays.length;

                    activeRelays.forEach((url) => {
                        const pub = poolRef.current.publish([url], event);

                        // Handle both single Promise and array of Promises return types from publish
                        const promise = Array.isArray(pub) ? pub[0] : pub;

                        promise.then(() => {
                            if (!acknowledged) {
                                acknowledged = true;
                                console.log(`✅ Message accepted by ${url}`);
                                resolve(true);
                            }
                        }).catch((err) => {
                            console.warn(`Relay ${url} rejected:`, err);
                            failureCount++;
                            if (failureCount === total && !acknowledged) {
                                resolve(false);
                            }
                        });
                    });
                }),
                new Promise<boolean>((resolve) =>
                    setTimeout(() => {
                        console.warn("Publish timed out, but might have sent.");
                        // If we timed out, return false so the UI shows 'failed' status if strict, 
                        // or true if we want to be optimistic. 
                        // Returning false is safer so user can retry.
                        resolve(false);
                    }, 5000)
                )
            ]);

        } catch (e) {
            console.error('Publish fatal error', e);
            return false;
        }
    }, [relays, connectedRelays]);

    const subscribe = useCallback((filter: Filter, onEvent: (event: Event) => void) => {
        if (!filter) return () => { };

        // Safe Wrapper: Transform filter to ensure Relay acceptance
        const cleanFilterObj = Array.isArray(filter) ? filter[0] : filter;

        // Remove null/undefined values and empty arrays (relays hate authors: [])
        const finalFilter = Object.fromEntries(
            Object.entries(cleanFilterObj).filter(([_, v]) =>
                v != null && (!Array.isArray(v) || v.length > 0)
            )
        );

        console.log("[HYDRA-DEBUG] Forcing NIP-01 Object Filter:", finalFilter);

        // Use the standard subscribe method with a single object (Silver Bullet Fix)
        // We cast to any to ensure we can access 'subscribe' if it's considered internal/alias
        const sub = (poolRef.current as any).subscribe(
            relays,
            finalFilter,
            {
                onevent: (event: Event) => {
                    console.log("[HYDRA] EVENT:", event.content);

                    // Automatic Profile Discovery
                    if (event.kind === 1 && !userMetadata[event.pubkey]) {
                        // Fetch user profile (Kind 0)
                        (poolRef.current as any).subscribe(RELAYS, {
                            kinds: [0],
                            authors: [event.pubkey],
                            limit: 1
                        }, {
                            onevent: (metaEvent: Event) => {
                                try {
                                    const data = JSON.parse(metaEvent.content);
                                    setUserMetadata(prev => ({
                                        ...prev,
                                        [event.pubkey]: {
                                            name: data.name || data.display_name,
                                            picture: data.picture
                                        }
                                    }));
                                } catch (e) {
                                    // Silently fail on bad metadata
                                }
                            }
                        });
                    }

                    onEvent(event);
                },
                oneose: () => {
                    console.log("[HYDRA] EOSE reached");
                }
            }
        );

        return () => sub.close();
    }, [relays, userMetadata]);

    return (
        <NostrContext.Provider value={{
            pool: poolRef.current,
            relays,
            connectedRelays,
            relayMetadata,
            userMetadata,
            addRelay,
            removeRelay,
            publish,
            subscribe,
            checkRelayStatus
        }}>
            {children}
        </NostrContext.Provider>
    );
};

export const useNostrContext = () => {
    const context = useContext(NostrContext);
    if (!context) throw new Error('useNostrContext must be used within NostrProvider');
    return context;
};
