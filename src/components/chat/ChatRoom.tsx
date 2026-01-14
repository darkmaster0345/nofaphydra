import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useNostr } from "@/hooks/useNostr";
import { generateOrLoadKeys, NostrKeys } from "@/services/nostr";
import { finalizeEvent } from "nostr-tools";
import type { Event } from "nostr-tools";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

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
  const [identity, setIdentity] = useState<NostrKeys | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateOrLoadKeys().then(setIdentity);
  }, []);

  useEffect(() => {
    if (!identity) return;
    const unsub = subscribe({
      kinds: [1],
      '#t': ['nofaphydra'],
      limit: 50
    });
    return () => unsub && unsub();
  }, [identity, subscribe]);

  useEffect(() => {
    // Filter events locally to ensure they have the room tag as well
    const roomMessages = events
      .filter(event => event.tags.some(t => t[0] === 't' && t[1] === roomId))
      .map(event => ({
        id: event.id!,
        content: event.content,
        pubkey: event.pubkey,
        created_at: event.created_at,
      }));
    setMessages(roomMessages);
  }, [events, roomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!identity || !identity.privateKey) {
      toast({ title: "Error", description: "You must be logged in to chat.", variant: "destructive" });
      return;
    }

    try {
      const secretKey = identity.privateKey;

      const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['t', 'nofaphydra'],
          ['t', roomId]
        ],
        content: newMessage.trim(),
      };

      const signedEvent = finalizeEvent(eventTemplate, secretKey);

      publish(signedEvent);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({ title: "Error", description: "Failed to sign message.", variant: "destructive" });
    }
  };

  return (
    <div className="border border-black flex flex-col h-[600px] bg-white">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-black">
        {messages.map((message) => {
          const isOwn = identity && message.pubkey === identity.publicKey;
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] space-y-1 ${isOwn ? "text-right" : "text-left"}`}>
                <div className={`px-4 py-2 border border-black ${isOwn ? "bg-black text-white" : "bg-white text-black"}`}>
                  <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                </div>
                <div className="flex items-center gap-2 justify-end px-1">
                  <p className="text-[9px] uppercase font-bold tracking-tighter opacity-50">
                    {formatDistanceToNow(new Date(message.created_at * 1000), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-black bg-gray-50">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="TYPE YOUR MESSAGE..."
            className="flex-1 border-black rounded-none h-12 bg-white text-xs font-bold uppercase tracking-widest px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="border border-black rounded-none h-12 w-12 bg-black text-white hover:bg-black/90 flex items-center justify-center p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
