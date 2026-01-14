import { Share2, Flame } from "lucide-react";
import { toPng } from 'html-to-image';
import { useRef } from "react";

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

  const handleShare = async () => {
    if (!shareableRef.current) return;

    try {
      const dataUrl = await toPng(shareableRef.current, { cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "streak.png", { type: blob.type });
      const shareUrl = `${window.location.origin}/join?streak=${streak.days}`;

      if (navigator.share) {
        await navigator.share({
          title: "My NoFap Hydra Streak",
          text: `I'm on a ${streak.days}-day streak! Join me on NoFap Hydra.`,
          url: shareUrl,
          files: [file],
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        const link = document.createElement('a');
        link.download = 'streak.png';
        link.href = dataUrl;
        link.click();
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert("Image downloaded and invite link copied to clipboard!");
        });
      }
    } catch (err) {
      console.error('Failed to share progress:', err);
      alert("Couldn't share progress. Please try again.");
    }
  };

  return (
    <div>
      <div className="card-base">
        <button 
          onClick={handleShare}
          className="button-primary w-full"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Progress
        </button>
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
