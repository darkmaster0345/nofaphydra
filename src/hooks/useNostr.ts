import { useState, useEffect, useRef } from 'react';
import { Relay, Event, Filter } from 'nostr-tools';

const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.snort.social',
  'wss://nostr.wine',
];

export const useNostr = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const relayRef = useRef<Relay | null>(null);

  useEffect(() => {
    const connectToRelay = async () => {
      try {
        const relay = await Relay.connect(RELAYS[0]);
        relayRef.current = relay;
        console.log(`connected to ${relay.url}`);

        relay.on('disconnect', () => {
          console.log(`disconnected from ${relay.url}`);
        });

      } catch (error) {
        console.error(`failed to connect to ${RELAYS[0]}`, error);
      }
    };

    connectToRelay();

    return () => {
      relayRef.current?.close();
    };
  }, []);

  const subscribe = (filter: Filter) => {
    if (!relayRef.current) return;

    relayRef.current.subscribe([filter], {
      onevent: (event: Event) => {
        setEvents(prev => {
          // Prevent duplicates
          if (prev.some(e => e.id === event.id)) return prev;
          return [...prev, event];
        });
      },
      oneose: () => {
        console.log('End of stored events reached');
      }
    });
  };

  const publish = async (event: Event) => {
    if (!relayRef.current) return;
    await relayRef.current.publish(event);
  };

  return { events, subscribe, publish };
};
