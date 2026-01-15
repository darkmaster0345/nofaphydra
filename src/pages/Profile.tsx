import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveStreak, fetchStreak, StreakPayload } from "@/services/nostr";
import { Download, ArrowLeft, Loader2, LogOut, Settings, ShieldCheck, User, Network, Sparkles } from "lucide-react";
import { useNostr } from "@/hooks/useNostr";
import { IdentityManagement } from "@/components/IdentityManagement";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateOrLoadKeys, clearKeys, NostrKeys } from "@/services/nostr";
import { AvatarUpload } from "@/components/AvatarUpload";
import { BottomNav } from "@/components/BottomNav";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RelaySettings } from "@/components/RelaySettings";
import { SecuritySettings } from "@/components/SecuritySettings";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { Header } from "@/components/Header";

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
      localStorage.removeItem('fursan_streak_data');
      localStorage.removeItem('fursan_activity_log');
      if (identity?.publicKey) {
        localStorage.removeItem(`nostr_username_${identity.publicKey}`);
        localStorage.removeItem(`nostr_avatar_${identity.publicKey}`);
      }
      toast.success("Identity Purged");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  if (loading || !identity) {
    return <LoadingScreen message="Linking Identity" subMessage="Verifying Cryptographic Keys" />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <Header />

        <div className="flex items-center justify-between mb-8 page-transition" style={{ animationDelay: "0.1s" }}>
          <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl border-amber-200 bg-white text-amber-800 hover:bg-amber-50 h-10 px-4 text-xs font-bold shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
            <ShieldCheck className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Session</span>
          </div>
        </div>

        <div className="royal-card p-0 overflow-hidden page-transition" style={{ animationDelay: "0.15s" }}>
          <div className="p-6 border-b border-amber-200/50 bg-gradient-to-r from-amber-50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display text-amber-900 tracking-tight">Knight Settings</h1>
                <p className="text-[10px] font-bold text-amber-600/50 uppercase tracking-widest">Identity & Protocol Control</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <AvatarUpload currentAvatar={avatarUrl} onUploadSuccess={setAvatarUrl} />
              <div className="flex-1 w-full pt-2">
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

            <div className="pt-8 space-y-10 border-t border-amber-100">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                  <Network className="w-4 h-4 text-amber-500" />
                  Network Settings
                </div>
                <RelaySettings />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  Security Protocol
                </div>
                <SecuritySettings />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Visual Aesthetics
                </div>
                <ThemeSelector />
              </div>
            </div>

            <div className="pt-8 border-t border-amber-100">
              <Button
                onClick={handleLogout}
                className="w-full h-16 rounded-2xl bg-white border-2 border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 font-black uppercase text-xs tracking-widest shadow-md transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4 mr-3" /> Terminate All Local Data
              </Button>
              <div className="flex flex-col items-center gap-2 mt-8 text-center">
                <p className="text-[10px] text-amber-800/30 font-bold uppercase tracking-[0.3em]">NoFap Fursan v2.5 Elite</p>
                <p className="text-[9px] text-amber-800/10 font-mono tracking-widest">BITCOIN // NOSTR // SABR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
