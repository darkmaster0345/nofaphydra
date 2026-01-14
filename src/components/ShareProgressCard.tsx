import { Share2, Globe, CheckCircle2, Download, Flame } from "lucide-react";
import { useState, useRef } from "react";
import { useNostr } from "@/hooks/useNostr";
import { generateOrLoadKeys } from "@/services/nostr";
import { finalizeEvent } from "nostr-tools";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toPng } from 'html-to-image';

interface ShareProgressCardProps {
  streak: {
    days: number;
  };
  avatarUrl?: string | null;
}

// Utility to convert external images to Base64 to bypass CORS issues in canvas
const getBase64FromUrl = async (url: string): Promise<string> => {
  try {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  } catch (e) {
    console.error("Base64 conversion failed", e);
    return "";
  }
};

export function ShareProgressCard({ streak, avatarUrl }: ShareProgressCardProps) {
  const [sharing, setSharing] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [base64Avatar, setBase64Avatar] = useState<string | null>(null);
  const { publish } = useNostr();
  const shareableRef = useRef<HTMLDivElement>(null);

  const appLink = "https://github.com/darkmaster0345/nofaphydra";
  const shareText = `I am on day ${streak?.days || 0} of my journey with NoFap Hydra! 🐉\n\nJoin the resistance: ${appLink} `;

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "NoFap Hydra - Progress Report",
          text: shareText,
        });
        toast.success("Progress shared to system! 🐉");
        triggerSuccess();
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Streak text copied to clipboard!");
        triggerSuccess();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Native share failed:', err);
        toast.error("Could not open system share menu.");
      }
    }
  };

  const handleNostrShare = async () => {
    setSharing(true);
    try {
      const identity = await generateOrLoadKeys();
      if (!identity?.privateKey) {
        toast.error("Nostr identity not found. Please set it up in Profile.");
        return;
      }

      const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['t', 'nofaphydra'],
          ['r', appLink],
        ],
        content: shareText,
      };

      const signedEvent = finalizeEvent(eventTemplate, identity.privateKey);
      const success = await publish(signedEvent);

      if (success) {
        toast.success("Posted to Community! 🐉");
        triggerSuccess();
      } else {
        throw new Error("No relays accepted the event");
      }
    } catch (err) {
      console.error('Nostr share failed:', err);
      toast.error("Failed to post to Hydra community.");
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!shareableRef.current) return;
    setDownloading(true);

    try {
      // Step 1: Pre-process avatar if it exists (Crucial for html-to-image/Canvas)
      if (avatarUrl && !base64Avatar) {
        const b64 = await getBase64FromUrl(avatarUrl);
        setBase64Avatar(b64);
      }

      // Small delay to ensure state update renders in the hidden element
      await new Promise(r => setTimeout(r, 100));

      // Step 2: Generate PNG with stability settings to prevent cross-origin CSS crash
      const dataUrl = await toPng(shareableRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true,
        fontEmbedCSS: '', // Disable font embedding to avoid cross-origin CSS issues
        ...({ copyStyles: false } as any), // Prevents accessing cssRules of cross-origin stylesheets
        includeQueryParams: false,
        filter: (node: HTMLElement) => {
          if (node.tagName === 'LINK') return false;
          return true;
        }
      });

      const link = document.createElement('a');
      link.download = `hydra-progress-day-${streak?.days || 0}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Progress report generated! 🐉");
      triggerSuccess();
    } catch (err) {
      console.error('Image generation failed:', err);
      toast.error("Picture generation failed. Using text share instead.");
      handleNativeShare();
    } finally {
      setDownloading(false);
    }
  };

  const triggerSuccess = () => {
    setJustShared(true);
    setTimeout(() => setJustShared(false), 3000);
  };

  return (
    <div className="border border-black bg-white p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
          {justShared ? (
            <CheckCircle2 className="w-4 h-4 text-black animate-bounce" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          Share Progress
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={handleNativeShare}
          className="w-full border border-black rounded-none h-14 bg-black text-white hover:bg-black/90 uppercase text-[10px] font-black tracking-[0.2em] transition-all hover:translate-y-[-2px] active:translate-y-[0px] shadow-none"
        >
          <Share2 className="w-4 h-4 mr-2" />
          System Share
        </Button>

        <Button
          onClick={handleNostrShare}
          disabled={sharing}
          variant="outline"
          className="w-full border border-black rounded-none h-14 bg-white text-black hover:bg-black hover:text-white uppercase text-[10px] font-black tracking-[0.2em] transition-all hover:translate-y-[-2px] active:translate-y-[0px] shadow-none"
        >
          <Globe className="w-4 h-4 mr-2" />
          {sharing ? "POSTING..." : "Post to Community"}
        </Button>

        <Button
          onClick={handleDownloadImage}
          disabled={downloading}
          variant="ghost"
          className="w-full text-black/40 hover:text-black uppercase text-[10px] font-bold truncate h-8"
        >
          <Download className="w-3 h-3 mr-2" />
          {downloading ? "GENERATING ENCRYPTED IMAGE..." : "Download Progress Picture"}
        </Button>
      </div>

      <div className="pt-2">
        <div className="bg-secondary p-4 border border-dashed border-black/20 font-mono text-[10px] whitespace-pre-wrap leading-tight text-muted-foreground select-none uppercase">
          {shareText}
        </div>
      </div>

      {/* Hidden Capture Element */}
      <div className="fixed -left-[4000px] top-0 pointer-events-none">
        <div
          ref={shareableRef}
          className="w-[500px] bg-white p-16 border-[16px] border-black flex flex-col items-center justify-center text-center space-y-8"
        >
          {/* Avatar Section */}
          {(base64Avatar || avatarUrl) && (
            <div className="relative mb-4">
              <div className="w-32 h-32 border-4 border-black overflow-hidden bg-white">
                <img
                  src={base64Avatar || avatarUrl || ""}
                  alt="User Avatar"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-black text-white p-1">
                <Flame className="w-6 h-6" />
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-black uppercase tracking-[0.2em] italic leading-none">NOFAP HYDRA</h1>
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] opacity-40">Persistence Protocol // Verified Output</p>
          </div>

          <div className="space-y-0 py-8 border-y-2 border-black w-full">
            <p className="text-[140px] font-black leading-none tracking-tighter">{streak?.days || 0}</p>
            <p className="text-2xl font-black uppercase tracking-[0.4em] text-black">DAYS STRONG</p>
          </div>

          <div className="w-full pt-4">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Reference Link</p>
                <p className="text-xs font-bold">nofaphydra.vercel.app</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Timestamp</p>
                <p className="text-xs font-bold font-mono">{new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
