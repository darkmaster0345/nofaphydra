import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SimplePool, Relay, Filter, Event } from 'nostr-tools';
import { Preferences } from '@capacitor/preferences';

const DEFAULT_RELAYS = [
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://relay.snort.social',
    'wss://relay.eden.earth',
];

interface NostrContextType {
    pool: SimplePool;
    relays: string[];
    connectedRelays: string[];
    addRelay: (url: string) => Promise<void>;
    removeRelay: (url: string) => Promise<void>;
    publish: (event: any) => Promise<boolean>;
    subscribe: (filter: Filter, onEvent: (event: Event) => void) => () => void;
}

const NostrContext = createContext<NostrContextType | null>(null);

export const NostrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [relays, setRelays] = useState<string[]>(DEFAULT_RELAYS);
    const [connectedRelays, setConnectedRelays] = useState<string[]>([]);
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
    useEffect(() => {
        const checkConnections = async () => {
            const connected = [];
            for (const url of relays) {
                try {
                    // SimplePool handles connection, but we can check status if needed
                    // For now we just assume pool manages them
                    connected.push(url);
                } catch (e) { }
            }
            setConnectedRelays(connected);
        };
        checkConnections();
    }, [relays]);

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
            addRelay,
            removeRelay,
            publish,
            subscribe
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
