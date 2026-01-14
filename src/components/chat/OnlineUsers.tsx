import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

// TODO: Re-implement this with Nostr. This is a complex feature.
// One approach is to have users publish a custom ephemeral event (e.g., kind 30078)
// to a specific tag for the room to signal their presence.

interface OnlineUser {
  user_id: string;
  username: string;
  avatar_emoji: string;
}

interface OnlineUsersProps {
  roomId: string;
  currentUserId: string | null;
  currentUsername: string | null;
  currentAvatarEmoji: string | null;
}

export function OnlineUsers({ roomId, currentUserId, currentUsername, currentAvatarEmoji }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    // if (!currentUserId) return;
    // const channel = supabase.channel(`presence-${roomId}`);
    // channel
    //   .on("presence", { event: "sync" }, () => {
    //     const state = channel.presenceState();
    //     const users: OnlineUser[] = [];
    //     Object.values(state).forEach((presences: any) => {
    //       presences.forEach((presence: any) => {
    //         if (!users.find(u => u.user_id === presence.user_id)) {
    //           users.push({
    //             user_id: presence.user_id,
    //             username: presence.username || "Anonymous",
    //             avatar_emoji: presence.avatar_emoji || "🌱",
    //           });
    //         }
    //       });
    //     });
    //     setOnlineUsers(users);
    //   })
    //   .subscribe(async (status) => {
    //     if (status === "SUBSCRIBED") {
    //       await channel.track({
    //         user_id: currentUserId,
    //         username: currentUsername || "Anonymous",
    //         avatar_emoji: currentAvatarEmoji || "🌱",
    //       });
    //     }
    //   });
    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [roomId, currentUserId, currentUsername, currentAvatarEmoji]);

  if (true) return null; // Completely disable the component for now

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg mb-3">
      {/* ... (UI is hidden) */}
    </div>
  );
}
