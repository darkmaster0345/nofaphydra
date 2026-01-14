import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
}

// Placeholder static rooms
const STATIC_ROOMS: ChatRoom[] = [
  {
    id: "global",
    name: "Global Chat",
    description: "The main public chat for all users.",
    emoji: "🌎"
  },
  {
    id: "beginners",
    name: "Beginners",
    description: "New here? Start your journey with others.",
    emoji: "🌱"
  },
  {
    id: "veterans",
    name: "Veterans",
    description: "For those with long streaks and wisdom to share.",
    emoji: "🔥"
  },
];

interface ChatRoomListProps {
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatRoomList({ selectedRoom, onSelectRoom }: ChatRoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(STATIC_ROOMS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In the future, this could fetch rooms from a Nostr relay or a hardcoded list
    if (!selectedRoom && rooms.length > 0) {
      onSelectRoom(rooms[0].id);
    }
  }, [selectedRoom, onSelectRoom, rooms]);

  if (loading) {
    return (
      <div className="streak-card animate-pulse">
        <div className="h-6 bg-secondary rounded mb-4 w-1/2" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-secondary rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="streak-card">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display text-foreground">Chat Rooms</h3>
      </div>

      <div className="space-y-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`w-full p-3 rounded-xl text-left transition-all ${
              selectedRoom === room.id
                ? "bg-primary/20 border border-primary/50"
                : "bg-secondary/50 hover:bg-secondary"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{room.emoji}</span>
              <div>
                <p className={`font-medium ${selectedRoom === room.id ? "text-primary" : "text-foreground"}`}>
                  {room.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {room.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
