import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveStreak, fetchStreak, StreakPayload } from "@/services/nostr";
import { Download, ArrowLeft, Loader2, LogOut, Settings } from "lucide-react";
import { useNostr } from "@/hooks/useNostr";
import { IdentityManagement } from "@/components/IdentityManagement";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateOrLoadKeys, clearKeys, NostrKeys } from "@/services/nostr";
import { AvatarUpload } from "@/components/AvatarUpload";
import { BottomNav } from "@/components/BottomNav";
import { RelaySettings } from "@/components/RelaySettings";
import { SecuritySettings } from "@/components/SecuritySettings";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

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
      const streakData: StreakPayload = {
        days: parseInt(storedDays),
        startDate: storedStartDate,
        longestStreak: parseInt(localStorage.getItem("longest_streak") || "0"),
        totalRelapses: parseInt(localStorage.getItem("total_relapses") || "0"),
        timestamp: Math.floor(Date.now() / 1000),
      };
      const success = await saveStreak(streakData);
      if (success) toast.success("Cloud Backup Successful");
    } catch (err) {
      toast.error("Backup Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCloudRestore = async () => {
    if (!identity?.publicKey) return;
    setSaving(true);
    try {
      const remoteStreak = await fetchStreak();
      if (remoteStreak) {
        localStorage.setItem("streak_days", remoteStreak.days.toString());
        localStorage.setItem("streak_start_date", remoteStreak.startDate || "");
        toast.success("Progress Restored");
      }
    } catch (err) {
      toast.error("Restore Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }
      await clearKeys();
      localStorage.removeItem('hydra_streak_data');
      localStorage.removeItem('hydra_activity_log');
      if (identity?.publicKey) {
        localStorage.removeItem(`nostr_username_${identity.publicKey}`);
        localStorage.removeItem(`nostr_avatar_${identity.publicKey}`);
      }
      toast.success("Session Terminated");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  if (loading || !identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" strokeWidth={3} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 pb-24 animate-in fade-in duration-500">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="rounded-none border-primary hover:bg-primary hover:text-background">
            <ArrowLeft className="w-4 h-4 mr-2" /> Control Center
          </Button>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Protected Session
          </div>
        </div>

        <div className="border border-primary bg-background p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-4 border-b border-primary pb-6">
            <Settings className="w-6 h-6" />
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Identity Management</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <AvatarUpload currentAvatar={avatarUrl} onUploadSuccess={setAvatarUrl} />
            <div className="flex-1 w-full">
              <IdentityManagement
                userPrivateKey={identity.privateKeyHex}
                pool={pool}
                initialAlias={username}
                onUpdateSuccess={(newName) => {
                  setUsername(newName);
                  localStorage.setItem(`nostr_username_${identity.publicKey}`, newName);
                }}
                onSync={handleCloudSync}
                onFetch={handleCloudRestore}
              />
            </div>
          </div>

          <div className="pt-8 space-y-8 border-t border-primary">
            <RelaySettings />
            <SecuritySettings />
            <div className="pt-8 border-t border-primary">
              <ThemeSelector />
            </div>
          </div>

          <div className="pt-8 border-t border-primary/20">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-14 rounded-none border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white uppercase text-xs font-black tracking-widest transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4 mr-2" /> Terminate Session
            </Button>
            <div className="flex flex-col items-center gap-1 mt-6">
              <p className="text-[9px] opacity-40 font-mono uppercase">This will clear all local data and keys</p>
              <p className="text-[8px] opacity-20 font-mono uppercase">Hydra Protocol v0.1.0-alpha</p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
