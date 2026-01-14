import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User as UserIcon, Settings } from "lucide-react";
import { z } from "zod";
import { generateOrLoadKeys, NostrKeys } from "@/services/nostr";
import { SecuritySettings } from "@/components/SecuritySettings";
import { AvatarUpload } from "@/components/AvatarUpload";
import { RelaySettings } from "@/components/RelaySettings";
import { finalizeEvent } from "nostr-tools";
import { saveStreakToCloud, fetchStreakFromCloud, StreakPayload } from "@/services/nostr";
import { Cloud, Download } from "lucide-react";

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

        const storedUsername = localStorage.getItem(`nostr_username_${id.publicKey}`);
        const storedAvatar = localStorage.getItem(`nostr_avatar_${id.publicKey}`);
        setUsername(storedUsername || "");
        setAvatarUrl(storedAvatar || "");
      } catch (e) {
        console.error("Failed to load identity", e);
        navigate("/auth");
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleCloudSync = async () => {
    if (!identity) return;

    setSaving(true);
    try {
      // Get current local streak
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

      const success = await saveStreakToCloud(streakData);
      if (success) {
        toast({
          title: "Cloud Backup Successful",
          description: "Your progress is now secured on the Nostr network.",
        });
      } else {
        throw new Error("Relay confirmation failed");
      }
    } catch (err) {
      console.error("Cloud sync failed", err);
      toast({
        title: "Backup Failed",
        description: "Could not reach relays. Try again later.",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleCloudRestore = async () => {
    if (!identity) return;

    setSaving(true);
    try {
      const remoteStreak = await fetchStreakFromCloud();
      if (remoteStreak) {
        localStorage.setItem("streak_days", remoteStreak.days.toString());
        localStorage.setItem("streak_start_date", remoteStreak.startDate || "");
        localStorage.setItem("longest_streak", remoteStreak.longestStreak.toString());
        localStorage.setItem("total_relapses", remoteStreak.totalRelapses.toString());

        toast({
          title: "Progress Restored",
          description: `Successfully restored ${remoteStreak.days} day streak from cloud.`,
        });
        // We might need to trigger a global state update or refresh if needed, 
        // but for now local storage is updated.
      } else {
        toast({
          title: "No Backup Found",
          description: "No cloud progress was found for this identity.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Cloud restore failed", err);
      toast({
        title: "Restore Failed",
        description: "Failed to fetch backup from network.",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) return;

    const validation = profileSchema.safeParse({ username });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Publish Kind 0 Metadata to Nostr
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

      toast({
        title: "Profile synchronized! ✨",
        description: "Your identity has been updated on the Nostr network.",
      });
    } catch (err) {
      console.error("Failed to sync profile", err);
      toast({
        title: "Partial Success",
        description: "Profile saved locally, but failed to sync to some relays.",
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Initializing Identity...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 pb-24">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Authenticated
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-4 border-b border-black/5 pb-6">
            <Settings className="w-6 h-6" />
            <h1 className="text-2xl font-display tracking-widest uppercase">
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
                <Label htmlFor="username" className="text-xs uppercase tracking-tighter">Display Name</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="The Nameless One"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-secondary border-black/5"
                  maxLength={30}
                />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Public identifier across the decentralized network.
                </p>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full bg-black text-white hover:bg-black/90 transition-transform active:scale-95 rounded-none border border-black"
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Synchronizing..." : "Update Metadata"}
              </Button>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloudSync}
                  className="rounded-none border-black hover:bg-black hover:text-white uppercase text-[10px] font-bold tracking-widest h-12"
                  disabled={saving}
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Cloud Backup
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloudRestore}
                  className="rounded-none border-black hover:bg-black hover:text-white uppercase text-[10px] font-bold tracking-widest h-12"
                  disabled={saving}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Restore
                </Button>
              </div>
            </form>
          </div>

          <div className="pt-8 space-y-8 border-t border-black/5">
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
