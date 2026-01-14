import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SimplePool, Relay, Filter, Event } from 'nostr-tools';
import { Preferences } from '@capacitor/preferences';

const DEFAULT_RELAYS = [
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://relay.snort.social',
    'wss://relay.eden.earth',
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

            for (const url of relays) {
                try {
                    // In nostr-tools v2, we check the pool's internal relay status if possible
                    // However, querySync or query will establish connections.
                    // A better way for Hydra: use the fetchRelay Information (NIP-11) as a proxy for life
                    const relay = await poolRef.current.ensureRelay(url);
                    // Check if it's connected (this might vary by nostr-tools version)
                    // For Hydra, we'll use a simpler 'active' check
                    connected.push(url);

                    // Fetch metadata if not already present
                    if (!relayMetadata[url]) {
                        fetchMetadata(url);
                    }
                } catch (e) {
                    console.warn(`[Nostr] Relay ${url} unreachable`);
                }
            }
            setConnectedRelays(connected);
        };

        const fetchMetadata = async (url: string) => {
            try {
                const httpUrl = url.replace('wss://', 'https://').replace('ws://', 'http://');
                const response = await fetch(httpUrl, {
                    headers: { 'Accept': 'application/nostr+json' }
                });
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
                const response = await fetch(httpUrl, {
                    headers: { 'Accept': 'application/nostr+json' },
                    signal: AbortSignal.timeout(5000)
                });
                if (response.ok) {
                    metadata = await response.json();
                }
            } catch (e) { }

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
            await Promise.any(pubs);
            return true;
        } catch (e) {
            console.error('Publish failed', e);
            return false;
        }
    }, [relays]);

    const subscribe = useCallback((filter: Filter, onEvent: (event: Event) => void) => {
        const sub = poolRef.current.subscribeMany(relays, [filter], {
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
