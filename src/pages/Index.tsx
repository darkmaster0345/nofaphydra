import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { StreakCounter } from "@/components/StreakCounter";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { MotivationCard } from "@/components/MotivationCard";
import { StatsCard } from "@/components/StatsCard";
import { StreakActions } from "@/components/StreakActions";
import { CommunityButton } from "@/components/CommunityButton";
import { NotificationToggle } from "@/components/NotificationToggle";
import { BottomNav } from "@/components/BottomNav";
import { ShareProgressCard } from "@/components/ShareProgressCard";
import { SyncIndicator } from "@/components/SyncIndicator";
import { ActivityHeatmap } from "@/components/DynamicComponents";
import { ActivityHistory } from "@/components/ActivityHistory";
import { DailyHealthCheck } from "@/components/DailyHealthCheck";
import { PrayerCheckin } from "@/components/PrayerCheckin";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useStreak } from "@/hooks/useStreak";
import { Loader2 } from "lucide-react";
import { generateOrLoadKeys } from "@/services/nostr";

import { LocationTimeCard } from "@/components/LocationTimeCard";

const Index = () => {
  const {
    streakData,
    liveStreak,
    isSyncing,
    isOnline,
    pendingCount,
    handleStart,
    handleReset
  } = useStreak();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log("[FURSAN] Index page mounted");
    const loadProfile = async () => {
      try {
        const id = await generateOrLoadKeys();
        if (id?.publicKey) {
          const storedAvatar = localStorage.getItem(`nostr_avatar_${id.publicKey}`);
          setAvatarUrl(storedAvatar);
        }
      } catch (e) {
        console.error("Failed to load profile for sharing", e);
      }
    };
    loadProfile();
  }, []);

  // Stability Check: Prevent white screen while streak logic initializes
  if (!streakData || !liveStreak) {
    return <LoadingScreen message="Initializing Protocol" subMessage="Establishing P2P Identity" />;
  }

  const isActive = streakData?.startDate !== null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 pb-12">
        <Header />

        {/* Sync Status Indicator */}
        <div className="flex justify-center mb-4">
          <SyncIndicator
            isSyncing={isSyncing}
            isOnline={isOnline}
            pendingCount={pendingCount}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div className="stagger-item" style={{ animationDelay: '0.05s' }}>
              <LocationTimeCard />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.1s' }}>
              <StreakCounter
                startDate={streakData?.startDate}
                isSyncing={isSyncing}
                isOnline={isOnline}
                pendingCount={pendingCount}
              />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.2s' }}>
              <DailyHealthCheck />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.3s' }}>
              <MotivationCard />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.4s' }}>
              <NotificationToggle />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.5s' }}>
              <ShareProgressCard streak={liveStreak} avatarUrl={avatarUrl} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="stagger-item" style={{ animationDelay: '0.15s' }}>
              <AvatarDisplay days={liveStreak?.days || 0} />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.25s' }}>
              <PrayerCheckin />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.35s' }}>
              <StatsCard data={streakData} />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.45s' }}>
              <CommunityButton />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.55s' }}>
              <ActivityHeatmap startDate={streakData?.startDate} />
            </div>

            <div className="stagger-item" style={{ animationDelay: '0.65s' }}>
              <ActivityHistory />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <StreakActions
            isActive={isActive}
            onStart={handleStart}
            onReset={handleReset}
          />
        </div>

        <footer className="mt-12 pb-20 text-center text-muted-foreground text-sm">
          <p className="font-bold uppercase tracking-widest text-[10px]">NoFap Fursan Protocol // Stay disciplined. Become legendary. ⚔️</p>
        </footer>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
