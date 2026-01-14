import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// TODO: Re-implement this with Nostr kind 7 events

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  userId: string | null;
}

const AVAILABLE_EMOJIS = ["👍", "❤️", "🔥", "💪", "🙌", "👏", "🎉", "💯"];

export function MessageReactions({ messageId, userId }: MessageReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchReactions = async () => {
    // const { data, error } = await supabase
    //   .from("message_reactions")
    //   .select("emoji, user_id")
    //   .eq("message_id", messageId);
    // if (error) {
    //   console.error("Error fetching reactions:", error);
    //   return;
    // }
    // const reactionMap = new Map<string, { count: number; userReacted: boolean }>();
    // data?.forEach((r) => {
    //   const existing = reactionMap.get(r.emoji) || { count: 0, userReacted: false };
    //   reactionMap.set(r.emoji, {
    //     count: existing.count + 1,
    //     userReacted: existing.userReacted || r.user_id === userId,
    //   });
    // });
    // setReactions(
    //   Array.from(reactionMap.entries()).map(([emoji, data]) => ({
    //     emoji,
    //     ...data,
    //   }))
    // );
  };

  useEffect(() => {
    // fetchReactions();
    // const channel = supabase
    //   .channel(`reactions-${messageId}`)
    //   .on(
    //     "postgres_changes",
    //     {
    //       event: "*",
    //       schema: "public",
    //       table: "message_reactions",
    //       filter: `message_id=eq.${messageId}`,
    //     },
    //     () => {
    //       fetchReactions();
    //     }
    //   )
    //   .subscribe();
    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [messageId, userId]);

  const toggleReaction = async (emoji: string) => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to messages",
        variant: "destructive",
      });
      return;
    }
    // ... (rest of the logic is commented out)
  };
  
  if (true) return null; // Completely disable the component for now

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* ... (UI is hidden) */}
    </div>
  );
}
