import { Trophy, RotateCcw, Target } from "lucide-react";
import { StreakData, calculateStreak } from "@/lib/streakUtils";

interface StatsCardProps {
  data: StreakData;
}

export function StatsCard({ data }: StatsCardProps) {
  const currentStreak = calculateStreak(data.startDate);

  // The effective longest streak is the max of the historic record and current progress
  const effectiveLongest = Math.max(data.longestStreak, currentStreak.days);

  // Goals logic
  const goals = [7, 14, 30, 60, 90, 180, 365];
  const nextGoal = goals.find(g => g > currentStreak.days) || 365;
  const daysRemaining = nextGoal - currentStreak.days;

  // New record logic: current streak has purely surpassed the historic longest streak
  const isNewRecord = currentStreak.days > 0 && currentStreak.days >= data.longestStreak;

  return (
    <div className="streak-card animate-fade-in border border-black p-6 bg-white" style={{ animationDelay: "0.4s" }}>
      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-black/40 mb-6">Battle Statistics</h3>

      <div className="space-y-3">
        {/* Longest Streak */}
        <div className="flex items-center justify-between p-4 border border-black bg-white">
          <div className="flex items-center gap-3">
            <Trophy className="w-4 h-4 text-black" />
            <div>
              <p className="text-[10px] uppercase font-bold text-black/40 tracking-tight">Personal Best</p>
              <p className="text-xl font-black uppercase tracking-tighter">{effectiveLongest} Days</p>
            </div>
          </div>
          {isNewRecord && (
            <span className="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-black text-white animate-pulse">
              NEW RECORD
            </span>
          )}
        </div>

        {/* Total Resets */}
        <div className="flex items-center justify-between p-4 border border-black bg-white">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-black" />
            <div>
              <p className="text-[10px] uppercase font-bold text-black/40 tracking-tight">Total Resets</p>
              <p className="text-xl font-black uppercase tracking-tighter">{data.totalRelapses}</p>
            </div>
          </div>
        </div>

        {/* Next Goal */}
        <div className="flex items-center justify-between p-4 border border-black bg-white">
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-black" />
            <div>
              <p className="text-[10px] uppercase font-bold text-black/40 tracking-tight">Objective: {nextGoal} Days</p>
              <p className="text-xl font-black uppercase tracking-tighter">
                {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} To Go
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
