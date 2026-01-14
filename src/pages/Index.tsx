import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { StreakCounter } from "@/components/StreakCounter";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { MotivationCard } from "@/components/MotivationCard";
import { StatsCard } from "@/components/StatsCard";
import { StreakActions } from "@/components/StreakActions";
import { CommunityButton } from "@/components/CommunityButton";
import { NotificationToggle } from "@/components/NotificationToggle";
import { BottomNav } from "@/components/BottomNav";
import { getStreakData, saveStreakData, calculateStreak, StreakData } from "@/lib/streakUtils";
import { ShareProgressCard } from "@/components/ShareProgressCard";
import { useNostrStreak } from "@/hooks/useNostrStreak";
import { StreakPayload } from "@/services/nostr";
import { SyncIndicator } from "@/components/SyncIndicator";
import { ActivityHeatmap } from "@/components/DynamicComponents";

const Index = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    startDate: null,
    longestStreak: 0,
    totalRelapses: 0,
  });

  // Track previous streak days to detect increases
  const previousStreakDaysRef = useRef<number>(-1);

  // Nostr sync hook with offline support
  const { saveStreak, fetchStreak, isSyncing, isOnline, pendingCount } = useNostrStreak();

  // Load local streak data on mount
  useEffect(() => {
    setStreakData(getStreakData());
  }, []);

  // Fetch and sync streak from Nostr on app load
  useEffect(() => {
    const syncFromNostr = async () => {
      try {
        const remoteStreak = await fetchStreak();
        if (remoteStreak && remoteStreak.startDate) {
          const localData = getStreakData();

          // Merge: prefer remote if it has a more recent timestamp or higher stats
          const shouldUpdateLocal =
            remoteStreak.timestamp > (localData.startDate ? new Date(localData.startDate).getTime() : 0) ||
            remoteStreak.longestStreak > localData.longestStreak;

          if (shouldUpdateLocal) {
            const mergedData: StreakData = {
              startDate: remoteStreak.startDate,
              longestStreak: Math.max(localData.longestStreak, remoteStreak.longestStreak),
              totalRelapses: Math.max(localData.totalRelapses, remoteStreak.totalRelapses),
            };
            setStreakData(mergedData);
            saveStreakData(mergedData);
            console.log("[Nostr] Restored streak from relay:", mergedData);
          }
        }
      } catch (error) {
        console.error("[Nostr] Failed to sync on load:", error);
      }
    };

    // Small delay to ensure keys are initialized first
    const timer = setTimeout(syncFromNostr, 1000);
    return () => clearTimeout(timer);
  }, [fetchStreak]);

  // Calculate current streak (moved up so it can be used in effects)
  const currentStreak = calculateStreak(streakData.startDate);
  const isActive = streakData.startDate !== null;

  // Prepare streak data for Nostr sync
  const prepareStreakPayload = (data: StreakData, days: number): StreakPayload => ({
    days,
    startDate: data.startDate,
    longestStreak: data.longestStreak,
    totalRelapses: data.totalRelapses,
    timestamp: Date.now(),
  });

  // Sync to Nostr when streak increases
  useEffect(() => {
    const currentDays = currentStreak.days;

    // Only sync if:
    // 1. We have initialized (not first render)
    // 2. The streak has increased
    // 3. We have an active streak
    if (
      previousStreakDaysRef.current >= 0 &&
      currentDays > previousStreakDaysRef.current &&
      streakData.startDate
    ) {
      console.log(`[Nostr] Streak increased from ${previousStreakDaysRef.current} to ${currentDays}, syncing...`);
      const payload = prepareStreakPayload(streakData, currentDays);
      saveStreak(payload).then((success) => {
        if (success) {
          console.log("[Nostr] Streak synced successfully!");
        }
      });
    }

    // Update the ref for next comparison
    previousStreakDaysRef.current = currentDays;
  }, [currentStreak.days, streakData, saveStreak]);

  const handleStart = () => {
    const newData: StreakData = {
      ...streakData,
      startDate: new Date().toISOString(),
    };
    setStreakData(newData);
    saveStreakData(newData);

    // Immediately sync new streak to Nostr
    const payload = prepareStreakPayload(newData, 0);
    saveStreak(payload);
  };

  const handleReset = () => {
    const currentStreakCalc = calculateStreak(streakData.startDate);
    const newData: StreakData = {
      startDate: null,
      longestStreak: Math.max(streakData.longestStreak, currentStreakCalc.days),
      totalRelapses: streakData.totalRelapses + 1,
    };
    setStreakData(newData);
    saveStreakData(newData);

    // Sync reset to Nostr (preserves stats)
    const payload = prepareStreakPayload(newData, 0);
    saveStreak(payload);
  };

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
            <StreakCounter startDate={streakData.startDate} />
            <MotivationCard />
            <ShareProgressCard streak={currentStreak} avatarDays={currentStreak.days} />
            <NotificationToggle />
            <CommunityButton />
          </div>

          <div className="space-y-6">
            <AvatarDisplay days={currentStreak.days} />
            <StatsCard data={streakData} />
            <ActivityHeatmap startDate={streakData.startDate} />
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
          <p>Stay strong. Stay disciplined. Become legendary. 🐉</p>
        </footer>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
