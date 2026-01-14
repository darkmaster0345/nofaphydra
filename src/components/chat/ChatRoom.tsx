import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useNostr } from "@/hooks/useNostr";
import { getNostrIdentity } from "@/lib/nostr";
import { finalizeEvent } from "nostr-tools";
import type { Event } from "nostr-tools";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  pubkey: string;
  created_at: number;
}

interface ChatRoomProps {
  roomId: string;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { events, subscribe, publish } = useNostr();
  const [identity, setIdentity] = useState<{ publicKey: string, privateKey: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNostrIdentity().then(setIdentity);
  }, []);

  useEffect(() => {
    if (!identity) return;
    subscribe({ kinds: [1], '#t': [roomId] });
  }, [identity, subscribe, roomId]);

  useEffect(() => {
    const newMessages = events.map(event => ({
      id: event.id!,
      content: event.content,
      pubkey: event.pubkey,
      created_at: event.created_at,
    }));
    setMessages(prev => [...prev, ...newMessages].sort((a, b) => a.created_at - b.created_at));
  }, [events]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !identity) return;

    const secretKey = Buffer.from(identity.privateKey, 'hex');

    const eventTemplate = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['t', roomId]],
      content: newMessage.trim(),
    };

    const signedEvent = finalizeEvent(eventTemplate, secretKey as Uint8Array);

    publish(signedEvent);
    setNewMessage("");
  };

  return (
    <div className="android-card flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message) => {
          const isOwn = message.pubkey === identity?.publicKey;
          return (
            <div key={message.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
              <div className={`flex-1 max-w-[75%] ${isOwn ? "text-right" : ""}`}>
                <div className={`inline-block px-3 py-2 shadow-sm ${isOwn ? "bg-primary text-primary-foreground rounded-lg" : "bg-secondary rounded-lg"}`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(message.created_at * 1000), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" />
          <Button type="submit" disabled={!newMessage.trim()}><Send className="w-5 h-5" /></Button>
        </form>
      </div>
    </div>
  );
}
