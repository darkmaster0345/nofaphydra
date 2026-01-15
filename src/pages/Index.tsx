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
import { LoadingScreen } from "@/components/LoadingScreen";
import { useStreak } from "@/hooks/useStreak";
import { Loader2 } from "lucide-react";
import { generateOrLoadKeys } from "@/services/nostr";

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
    console.log("[HYDRA] Index page mounted");
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
            <StreakCounter
              startDate={streakData?.startDate}
              isSyncing={isSyncing}
              isOnline={isOnline}
              pendingCount={pendingCount}
            />
            <DailyHealthCheck />
            <MotivationCard />
            <ShareProgressCard streak={liveStreak} avatarUrl={avatarUrl} />
            <NotificationToggle />
            <CommunityButton />
          </div>

          <div className="space-y-6">
            <AvatarDisplay days={liveStreak?.days || 0} />
            <StatsCard data={streakData} />
            <ActivityHeatmap startDate={streakData?.startDate} />
            <ActivityHistory />
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
          <p className="font-bold uppercase tracking-widest text-[10px]">NoFap Hydra Protocol // Stay disciplined. Become legendary. 🐉</p>
        </footer>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
