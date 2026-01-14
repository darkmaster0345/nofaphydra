import { Share2, Flame, Globe, Check } from "lucide-react";
import { toPng } from 'html-to-image';
import { useRef, useState } from "react";
import { useNostr } from "@/hooks/useNostr";
import { generateOrLoadKeys } from "@/services/nostr";
import { finalizeEvent } from "nostr-tools";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface ShareProgressCardProps {
  streak: {
    days: number;
    hours: number;
    minutes: number;
  };
  avatarDays: number;
}

export function ShareProgressCard({ streak, avatarDays }: ShareProgressCardProps) {
  const shareableRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const { publish } = useNostr();

  const shareText = `I am on day ${streak.days} of my journey with NoFap Hydra! 🐉\n\nJoin the resistance: https://github.com/darkmaster0345/nofaphydra`;

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "NoFap Hydra Progress",
          text: shareText,
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Streak text copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Native share failed:', err);
        toast.error("Could not open share menu.");
      }
    }
  };

  const handleNostrShare = async () => {
    setSharing(true);
    try {
      const identity = await generateOrLoadKeys();
      if (!identity || !identity.privateKey) {
        toast.error("No identity found. Please set up your profile.");
        return;
      }

      const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['t', 'nofaphydra'],
        ],
        content: shareText,
      };

      const signedEvent = finalizeEvent(eventTemplate, identity.privateKey);
      await publish(signedEvent);

      toast.success("Posted to Community! 🐉", {
        description: "Your progress is now visible in the community feed."
      });
    } catch (err) {
      console.error('Nostr share failed:', err);
      toast.error("Failed to post to community.");
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!shareableRef.current) return;
    try {
      const dataUrl = await toPng(shareableRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `nofap-hydra-day-${streak.days}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Progress image downloaded!");
    } catch (err) {
      console.error('Image generation failed:', err);
      toast.error("Could not generate image.");
    }
  };

  return (
    <div className="border border-black bg-white p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Share2 className="w-4 h-4" /> Proof of Work
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={handleNativeShare}
          variant="outline"
          className="w-full border-black rounded-none h-12 bg-black text-white hover:bg-black/90 uppercase text-[10px] font-bold tracking-widest"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Native Share
        </Button>

        <Button
          onClick={handleNostrShare}
          variant="outline"
          disabled={sharing}
          className="w-full border-black rounded-none h-12 bg-white text-black hover:bg-black hover:text-white uppercase text-[10px] font-bold tracking-widest transition-colors"
        >
          <Globe className="w-4 h-4 mr-2" />
          {sharing ? "POSTING..." : "Post to Community"}
        </Button>

        <Button
          onClick={handleDownloadImage}
          variant="ghost"
          className="w-full border-none rounded-none text-[9px] uppercase font-bold tracking-tighter opacity-50 hover:opacity-100 h-6 p-0"
        >
          Download Achievement Card
        </Button>
      </div>

      {/* Hidden element for generating the image */}
      <div ref={shareableRef} className="fixed -left-[9999px] top-0 w-[350px] bg-background-alt p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">NoFap Hydra Streak</span>
        </div>
        <div className="text-center my-8">
          <p className="text-8xl font-display text-gradient-fire">{streak.days}</p>
          <p className="text-3xl font-display text-muted-foreground">DAYS</p>
        </div>
        <div className="text-center">
          <img src={`/avatars/level${Math.min(Math.floor(avatarDays / 7), 5)}.png`} alt="Avatar" className="w-32 h-32 mx-auto" />
          <p className="text-lg mt-2">Level {Math.floor(avatarDays / 7)}</p>
        </div>
        <p className="text-center text-muted-foreground mt-6">nofaphydra.vercel.app</p>
      </div>
    </div>
  );
}
