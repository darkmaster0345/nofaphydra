import { useEffect, useState } from "react";
import { Trophy, Flame, Medal } from "lucide-react";
import { getAvatarLevel } from "@/lib/streakUtils";

// TODO: Re-implement this with Nostr. This is a complex feature that requires a way
// to aggregate user data from Nostr events, likely with a coordinating server
// or a well-defined NIP.

interface LeaderboardUser {
  id: string;
  username: string | null;
  avatar_emoji: string | null;
  current_streak: number | null;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm text-muted-foreground font-medium">{index + 1}</span>;
    }
  };

  if (true) return null; // Completely disable the component for now

  return (
    <div className="streak-card">
      {/* ... (UI is hidden) */}
    </div>
  );
}
