import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveStreak, fetchStreak, StreakPayload } from "@/services/nostr";
import { Download } from "lucide-react";
import { useNostr } from "@/hooks/useNostr";
import { IdentityManagement } from "@/components/IdentityManagement";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2, LogOut, Settings } from "lucide-react";
import { generateOrLoadKeys, clearKeys, NostrKeys } from "@/services/nostr";
import { AvatarUpload } from "@/components/AvatarUpload";
import { BottomNav } from "@/components/BottomNav";
import { RelaySettings } from "@/components/RelaySettings";
import { SecuritySettings } from "@/components/SecuritySettings";
import { ThemeSelector } from "@/components/ThemeSelector";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [identity, setIdentity] = useState<NostrKeys | null>(null);
  const navigate = useNavigate();
  const { publish, updateProfileName, pool } = useNostr();

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

  const handleLogout = async () => {
    try {
      // Clear Nostr keys
      await clearKeys();

      // Clear all app-specific localStorage
      localStorage.removeItem('hydra_streak_data');
      localStorage.removeItem('hydra_activity_log');
      if (identity?.publicKey) {
        localStorage.removeItem(`nostr_username_${identity.publicKey}`);
        localStorage.removeItem(`nostr_avatar_${identity.publicKey}`);
      }

      toast.success("Session Terminated", {
        description: "All local data has been purged."
      });

      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed. Please try again.");
    }
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

            <div className="flex-1 w-full">
              <IdentityManagement
                userPrivateKey={identity.privateKeyHex}
                pool={pool}
                initialAlias={username}
                onUpdateSuccess={(newName) => {
                  setUsername(newName);
                  localStorage.setItem(`nostr_username_${identity.publicKey}`, newName);
                  localStorage.setItem(`nostr_avatar_${identity.publicKey}`, avatarUrl);
                }}
                onSync={handleCloudSync}
                onFetch={handleCloudRestore}
              />
            </div>
          </div>

          <div className="pt-8 space-y-8 border-t border-black">
            <RelaySettings />
            <SecuritySettings />
            <div className="pt-8 border-t border-black">
              <ThemeSelector />
            </div>
          </div>

          {/* Logout Section */}
          <div className="pt-8 border-t border-black/20">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-14 rounded-none border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white uppercase text-xs font-black tracking-widest transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Terminate Session
            </Button>
            <p className="text-[9px] text-black/40 font-mono text-center mt-3 uppercase">
              This will clear all local data and keys
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
