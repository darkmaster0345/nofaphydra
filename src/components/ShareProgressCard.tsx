import { Share2, Globe, CheckCircle2, Download, Flame, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
import { useNostr } from "@/hooks/useNostr";
import { generateOrLoadKeys } from "@/services/nostr";
import { finalizeEvent } from "nostr-tools";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toPng } from 'html-to-image';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Media } from '@capacitor-community/media';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

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

  const appLink = "https://github.com/darkmaster0345/nofapfursan";
  const shareText = `I am on day ${streak?.days || 0} of my journey with NoFap Fursan! ⚔️\n\nJoin the resistance: ${appLink} `;

  const handleNativeShare = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: "NoFap Fursan - Progress Report",
          text: shareText,
          url: appLink,
          dialogTitle: "Share your progress",
        });
        toast.success("Progress shared! ⚔️");
        triggerSuccess();
      } else if (navigator.share) {
        await navigator.share({
          title: "NoFap Fursan - Progress Report",
          text: shareText,
          url: appLink,
        });
        toast.success("Progress shared to system! ⚔️");
        triggerSuccess();
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Sabr Count text copied to clipboard!");
        triggerSuccess();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
        toast.error("Could not open share menu.");
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
          ['t', 'nofapfursan'],
          ['r', appLink],
        ],
        content: shareText,
      };

      const signedEvent = finalizeEvent(eventTemplate, identity.privateKey);
      const success = await publish(signedEvent);

      if (success) {
        toast.success("Posted to Community! ⚔️");
        triggerSuccess();
      } else {
        throw new Error("No relays accepted the event");
      }
    } catch (err) {
      console.error('Nostr share failed:', err);
      toast.error("Failed to post to Fursan community.");
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

      // Step 2: Generate PNG
      const dataUrl = await toPng(shareableRef.current, {
        cacheBust: true,
        backgroundColor: '#FAF6F0',
        pixelRatio: 2,
        skipFonts: true,
      });

      const fileName = `fursan-sabr-count-day-${streak?.days || 0}.png`;

      // Native Capacitor Download Logic
      if (Capacitor.isNativePlatform()) {
        try {
          const base64Data = dataUrl.split(',')[1];
          const safeFileName = `fursan_progress_${streak?.days || 0}.png`;

          const savedFile = await Filesystem.writeFile({
            path: safeFileName,
            data: base64Data,
            directory: Directory.Cache
          });

          await Media.savePhoto({
            path: savedFile.uri,
            albumIdentifier: 'NofapFursan'
          });
          toast.success("Progress picture saved into 'NofapFursan' album! ⚔️");
        } catch (err) {
          console.error('Capacitor download error:', err);
          throw err;
        }
      } else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        toast.success("Progress report generated! ⚔️");
      }

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
    <div className="royal-card p-6 space-y-4 page-transition" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {justShared ? (
              <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
            ) : (
              <Share2 className="w-4 h-4 text-white" />
            )}
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-amber-800">Share Progress</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={handleNativeShare}
          className="w-full rounded-xl h-14 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4 mr-2" />
          System Share
        </Button>

        <Button
          onClick={handleNostrShare}
          disabled={sharing}
          variant="outline"
          className="w-full rounded-xl h-14 border-2 border-amber-300 bg-white text-amber-800 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-amber-50 active:scale-95 transition-all"
        >
          <Globe className="w-4 h-4 mr-2" />
          {sharing ? "POSTING..." : "Post to Community"}
        </Button>

        <Button
          onClick={handleDownloadImage}
          disabled={downloading}
          variant="ghost"
          className="w-full text-amber-700/60 hover:text-amber-700 uppercase text-[10px] font-bold truncate h-8"
        >
          <Download className="w-3 h-3 mr-2" />
          {downloading ? "GENERATING..." : "Get Progress Picture"}
        </Button>
      </div>

      <div className="pt-2">
        <div className="bg-amber-50/50 p-4 rounded-lg border border-dashed border-amber-200/50 font-mono text-[10px] whitespace-pre-wrap leading-tight text-amber-800/60 select-none uppercase">
          {shareText}
        </div>
      </div>

      {/* Hidden Capture Element */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          ref={shareableRef}
          className="w-[500px] bg-[#FAF6F0] p-16 border-[16px] border-amber-400/50 flex flex-col items-center justify-center text-center space-y-8"
        >
          {/* Avatar Section */}
          {(base64Avatar || avatarUrl) && (
            <div className="relative mb-4">
              <div className="w-32 h-32 border-4 border-amber-500/30 overflow-hidden bg-white rounded-full">
                <img
                  src={base64Avatar || avatarUrl || ""}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-2 rounded-full shadow-lg">
                <Flame className="w-6 h-6" />
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-black uppercase tracking-[0.2em] italic leading-none text-amber-900">
              NOFAP <span className="text-amber-500">FURSAN</span>
            </h1>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-amber-800/40">Verified Sabr Protocol</p>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
          </div>

          <div className="space-y-0 py-8 border-y-2 border-amber-200/50 w-full bg-white/50">
            <p className="text-[140px] font-black leading-none tracking-tighter text-amber-900">{streak?.days || 0}</p>
            <p className="text-2xl font-black uppercase tracking-[0.4em] text-amber-500">DAYS OF SABR</p>
          </div>

          <div className="w-full pt-4">
            <div className="flex justify-between items-end border-t border-amber-200/50 pt-4">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-800/40">Reference</p>
                <p className="text-xs font-bold text-amber-900">nofapfursan.org</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-800/40">Timestamp</p>
                <p className="text-xs font-bold font-mono text-amber-900">{new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
