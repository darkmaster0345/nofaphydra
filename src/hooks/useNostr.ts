import { useState, useCallback, useEffect } from 'react';
import { Event, Filter } from 'nostr-tools';
import { useNostrContext } from '../context/NostrContext';

export const useNostr = () => {
  const { subscribe: contextSubscribe, publish: contextPublish, connectedRelays } = useNostrContext();
  const [events, setEvents] = useState<Event[]>([]);

  const subscribe = useCallback((filter: Filter) => {
    // Return the cleanup function from the context's subscribe
    return contextSubscribe(filter, (event: Event) => {
      setEvents(prev => {
        if (prev.some(e => e.id === event.id)) return prev;
        return [...prev, event].sort((a, b) => a.created_at - b.created_at);
      });
    });
  }, [contextSubscribe]);

  const publish = useCallback(async (event: Event) => {
    return await contextPublish(event);
  }, [contextPublish]);

  return { events, subscribe, publish, connectedRelays };
};
