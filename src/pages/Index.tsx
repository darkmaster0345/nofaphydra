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

  useEffect(() => {
    console.log("[FURSAN] Index page mounted");
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

        <div className="flex flex-col gap-6 max-w-lg mx-auto">
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
            <PrayerCheckin />
          </div>

          <div className="stagger-item mt-4" style={{ animationDelay: '0.3s' }}>
            <StreakActions
              isActive={isActive}
              onStart={handleStart}
              onReset={handleReset}
            />
          </div>
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
