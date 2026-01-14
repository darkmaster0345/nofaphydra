import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SimplePool, Relay, Filter, Event } from 'nostr-tools';
import { Preferences } from '@capacitor/preferences';

const DEFAULT_RELAYS = [
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://relay.snort.social',
    'wss://relay.eden.earth',
    'wss://relay.primal.net',
    'wss://relay.nostr.band',
];

interface RelayMetadata {
    name?: string;
    description?: string;
    pubkey?: string;
    contact?: string;
    supported_nips?: number[];
    software?: string;
    version?: string;
}

interface NostrContextType {
    pool: SimplePool;
    relays: string[];
    connectedRelays: string[];
    relayMetadata: Record<string, RelayMetadata>;
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

    // Monitor relay connections and fetch metadata
    useEffect(() => {
        const checkConnections = async () => {
            const connected: string[] = [];

            const ensureConnection = async (url: string) => {
                try {
                    // Timeout promise
                    const timeout = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Connection timeout')), 5000);
                    });

                    // connection promise
                    const connection = poolRef.current.ensureRelay(url);

                    await Promise.race([connection, timeout]);
                    connected.push(url);

                    // Fetch metadata if not already present
                    if (!relayMetadata[url]) {
                        fetchMetadata(url);
                    }
                } catch (e) {
                    // Silent fail, just don't add to connected list
                }
            };

            await Promise.allSettled(relays.map(url => ensureConnection(url)));
            setConnectedRelays(connected);
        };

        const fetchMetadata = async (url: string) => {
            try {
                const httpUrl = url.replace('wss://', 'https://').replace('ws://', 'http://');

                // Polyfill-like timeout for broader browser compatibility
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch(httpUrl, {
                    headers: { 'Accept': 'application/nostr+json' },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    setRelayMetadata(prev => ({ ...prev, [url]: data }));
                }
            } catch (e) {
                // Silently fail metadata fetch
            }
        };

        checkConnections();
        const interval = setInterval(checkConnections, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [relays, relayMetadata]);

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
            const pubs = poolRef.current.publish(relays, event);
            // Polyfill-like behavior for Promise.any (wait for first success)
            return new Promise<boolean>((resolve) => {
                let failureCount = 0;
                let successCount = 0;
                const total = pubs.length;

                if (total === 0) {
                    resolve(false);
                    return;
                }

                pubs.forEach(p => {
                    p.then(() => {
                        successCount++;
                        // Resolve immediately on first success
                        resolve(true);
                    }).catch(() => {
                        failureCount++;
                        // If all failed, we're done
                        if (failureCount === total && successCount === 0) {
                            resolve(false);
                        }
                    });
                });
            });
        } catch (e) {
            console.error('Publish failed', e);
            return false;
        }
    }, [relays]);

    const subscribe = useCallback((filter: Filter, onEvent: (event: Event) => void) => {
        const sub = poolRef.current.subscribeMany(relays, [filter] as any, {
            onevent: onEvent,
            oneose: () => console.log('EOSE'),
        });
        return () => sub.close();
    }, [relays]);

    return (
        <NostrContext.Provider value={{
            pool: poolRef.current,
            relays,
            connectedRelays,
            relayMetadata,
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
