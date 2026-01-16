import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { StreakCounter } from "@/components/StreakCounter";
import { BottomNav } from "@/components/BottomNav";
import { SyncIndicator } from "@/components/SyncIndicator";
import { DailyHealthCheck } from "@/components/DailyHealthCheck";
import { PrayerCheckin } from "@/components/PrayerCheckin";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useStreak } from "@/hooks/useStreak";
import { SettingsDialog } from "@/components/SettingsDialog";
import { LocationTimeCard } from "@/components/LocationTimeCard";
import { StreakActions } from "@/components/StreakActions";

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

  if (!streakData || !liveStreak) {
    return <LoadingScreen message="Starting up..." subMessage="Setting things up for you" />;
  }

  const isActive = streakData?.startDate !== null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <Header />

        {/* Top Header with Gear Icon */}
        <div className="flex justify-between items-center mb-6 mt-2">
          <div className="flex-1">
            <SyncIndicator
              isSyncing={isSyncing}
              isOnline={isOnline}
              pendingCount={pendingCount}
            />
          </div>
          <SettingsDialog />
        </div>

        <div className="flex flex-col gap-6 w-full">
          {/* Primary Row: Streak & Time */}
          <div className="stagger-item" style={{ animationDelay: '0.05s' }}>
            <StreakCounter
              startDate={streakData?.startDate}
              isSyncing={isSyncing}
              isOnline={isOnline}
              pendingCount={pendingCount}
            />
          </div>

          <div className="stagger-item" style={{ animationDelay: '0.1s' }}>
            <LocationTimeCard />
          </div>

          {/* Critical Feature: Active Protocol (Mindset) */}
          <div className="stagger-item" style={{ animationDelay: '0.15s' }}>
            <DailyHealthCheck showPillar="mindset" days={liveStreak.days} />
          </div>

          {/* Secondary Protocol: Biological Signal */}
          <div className="stagger-item" style={{ animationDelay: '0.2s' }}>
            <DailyHealthCheck showPillar="biological" days={liveStreak.days} />
          </div>

          {/* The Five Pillars: Prayer */}
          <div className="stagger-item" style={{ animationDelay: '0.25s' }}>
            <PrayerCheckin />
          </div>

          {/* Control Actions */}
          <div className="stagger-item py-4" style={{ animationDelay: '0.3s' }}>
            <StreakActions
              isActive={isActive}
              onStart={handleStart}
              onReset={handleReset}
            />
          </div>
        </div>

        <footer className="mt-12 text-center text-muted-foreground">
          <p className="font-black uppercase tracking-[0.4em] text-[8px] opacity-20 sub-label">Stay strong and keep going. ⚔️</p>
        </footer>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;

