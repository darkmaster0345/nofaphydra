import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";
import { ArrowLeft, Save, User as UserIcon, Settings, Loader2 } from "lucide-react";
import { z } from "zod";
import { generateOrLoadKeys, NostrKeys } from "@/services/nostr";
import { SecuritySettings } from "@/components/SecuritySettings";
import { AvatarUpload } from "@/components/AvatarUpload";
import { RelaySettings } from "@/components/RelaySettings";
import { finalizeEvent } from "nostr-tools";
import { saveStreak, fetchStreak, StreakPayload } from "@/services/nostr";
import { Cloud, Download } from "lucide-react";
import { useNostr } from "@/hooks/useNostr";

const profileSchema = z.object({
  username: z.string().trim().min(2, "Username must be at least 2 characters").max(30, "Username must be less than 30 characters"),
});

const Profile = () => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [identity, setIdentity] = useState<NostrKeys | null>(null);
  const navigate = useNavigate();
  const { publish } = useNostr();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const id = await generateOrLoadKeys();
        setIdentity(id);

        const storedUsername = localStorage.getItem(`nostr_username_${id?.publicKey}`);
        const storedAvatar = localStorage.getItem(`nostr_avatar_${id?.publicKey}`);
        setUsername(storedUsername || "");
        setAvatarUrl(storedAvatar || "");
      } catch (e) {
        console.error("Failed to load identity", e);
        navigate("/auth");
      } finally {
        // Ensure loading state is turned off after internal init
        setTimeout(() => setLoading(false), 500);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleCloudSync = async () => {
    if (!identity?.privateKey) {
      toast.error("Authentication required for sync.");
      return;
    }

    setSaving(true);
    try {
      const storedDays = localStorage.getItem("streak_days") || "0";
      const storedStartDate = localStorage.getItem("streak_start_date");
      const storedLongest = localStorage.getItem("longest_streak") || "0";
      const storedRelapses = localStorage.getItem("total_relapses") || "0";

      const streakData: StreakPayload = {
        days: parseInt(storedDays),
        startDate: storedStartDate,
        longestStreak: parseInt(storedLongest),
        totalRelapses: parseInt(storedRelapses),
        timestamp: Math.floor(Date.now() / 1000),
      };

      const success = await saveStreak(streakData);
      if (success) {
        toast.success("Cloud Backup Successful", {
          description: "Your progress is now secured on the Nostr network."
        });
      } else {
        throw new Error("Relay confirmation failed");
      }
    } catch (err) {
      console.error("Cloud sync failed", err);
      toast.error("Backup Failed", {
        description: "Could not reach relays. Try again later."
      });
    }
    setSaving(false);
  };

  const handleCloudRestore = async () => {
    if (!identity?.publicKey) {
      toast.error("Identity not detected.");
      return;
    }

    setSaving(true);
    try {
      const remoteStreak = await fetchStreak();
      if (remoteStreak) {
        localStorage.setItem("streak_days", remoteStreak.days.toString());
        localStorage.setItem("streak_start_date", remoteStreak.startDate || "");
        localStorage.setItem("longest_streak", remoteStreak.longestStreak.toString());
        localStorage.setItem("total_relapses", remoteStreak.totalRelapses.toString());

        toast.success("Progress Restored", {
          description: `Successfully restored ${remoteStreak.days} day streak from cloud.`
        });
      } else {
        toast.error("No Backup Found", {
          description: "No cloud progress was found for this identity."
        });
      }
    } catch (err) {
      console.error("Cloud restore failed", err);
      toast.error("Restore Failed", {
        description: "Failed to fetch backup from network."
      });
    }
    setSaving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity?.privateKey) {
      toast.error("Cannot sign event: Private key missing.");
      return;
    }

    const validation = profileSchema.safeParse({ username });
    if (!validation.success) {
      toast.error("Validation Error", {
        description: validation.error.errors[0].message
      });
      return;
    }

    setSaving(true);

    try {
      const profileEvent = {
        kind: 0,
        content: JSON.stringify({
          name: username.trim(),
          picture: avatarUrl
        }),
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      };

      const signedEvent = finalizeEvent(profileEvent, identity.privateKey);
      await publish(signedEvent);

      localStorage.setItem(`nostr_username_${identity.publicKey}`, username.trim());
      localStorage.setItem(`nostr_avatar_${identity.publicKey}`, avatarUrl);

      toast.success("Profile synchronized! ✨", {
        description: "Your identity has been updated on the Nostr network."
      });
    } catch (err) {
      console.error("Failed to sync profile", err);
      toast.success("Partial Success", {
        description: "Profile saved locally, but failed to sync to some relays."
      });
    }

    setSaving(false);
  };

  if (loading || !identity) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-black animate-spin" strokeWidth={3} />
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-black uppercase tracking-tighter italic">NoFap Hydra</h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/40">Securing identity protocol...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 pb-24 animate-in fade-in duration-500">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="rounded-none border-black hover:bg-black hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Control Center
          </Button>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/40">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            Protected Session
          </div>
        </div>

        <div className="border border-black bg-white p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-4 border-b border-black pb-6">
            <Settings className="w-6 h-6" />
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">
              Identity Management
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="mx-auto md:mx-0">
              <AvatarUpload
                currentAvatar={avatarUrl}
                onUploadSuccess={setAvatarUrl}
              />
            </div>

            <form onSubmit={handleSave} className="flex-1 w-full space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[10px] uppercase font-black tracking-widest text-black/40">Broadcasting Alias</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="HYDRO_OPERATIVE"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white border-black rounded-none h-12 focus-visible:ring-0 focus-visible:ring-offset-0 font-bold uppercase tracking-widest text-xs"
                  maxLength={30}
                />
                <p className="text-[9px] text-black/40 font-mono leading-tight uppercase">
                  Nostr NIP-01 identification name.
                </p>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full bg-black text-white hover:bg-black/90 transition-all active:scale-95 rounded-none border border-black uppercase text-xs font-black tracking-widest h-14"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    BROADCASTING...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    UPDATE METADATA
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloudSync}
                  className="rounded-none border-black hover:bg-black hover:text-white uppercase text-[10px] font-black tracking-widest h-12 transition-all active:scale-95"
                  disabled={saving}
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Sync
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloudRestore}
                  className="rounded-none border-black hover:bg-black hover:text-white uppercase text-[10px] font-black tracking-widest h-12 transition-all active:scale-95"
                  disabled={saving}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fetch
                </Button>
              </div>
            </form>
          </div>

          <div className="pt-8 space-y-8 border-t border-black">
            <RelaySettings />
            <SecuritySettings />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
