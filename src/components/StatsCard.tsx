import { Trophy, RotateCcw, Target, Star } from "lucide-react";
import { StreakData, calculateStreak } from "@/lib/streakUtils";

interface StatsCardProps {
  data: StreakData;
}

export function StatsCard({ data }: StatsCardProps) {
  const currentStreak = calculateStreak(data.startDate);

  // The effective longest streak is the max of the historic record and current progress
  const effectiveLongest = Math.max(data.longestStreak || 0, currentStreak.days || 0);

  // Goals logic
  const goals = [7, 14, 30, 60, 90, 180, 365];
  const nextGoal = goals.find(g => g > currentStreak.days) || 365;
  const daysRemaining = nextGoal - currentStreak.days;
  const progress = Math.min(100, Math.round((currentStreak.days / nextGoal) * 100));

  // New record logic: current streak has purely surpassed the historic longest streak
  const isNewRecord = currentStreak.days > 0 && currentStreak.days >= data.longestStreak;

  return (
    <div className="royal-card p-6 page-transition" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-800/70">Battle Statistics</h3>
      </div>

      <div className="space-y-4">
        {/* Longest Streak */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-amber-600/60 tracking-tight truncate">Personal Best</p>
              <p className="text-xl font-black text-amber-800 truncate">{effectiveLongest} Days</p>
            </div>
          </div>
          {isNewRecord && (
            <span className="flex-shrink-0 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full shadow-lg shadow-amber-500/30 animate-pulse ml-2">
              NEW RECORD ⚔️
            </span>
          )}
        </div>

        {/* Total Resets */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/60 border border-amber-200/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-gray-500/80 tracking-tight truncate">Total Resets</p>
              <p className="text-xl font-black text-gray-700 truncate">{data.totalRelapses}</p>
            </div>
          </div>
        </div>

        {/* Next Goal with Progress Bar */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
          <div className="flex items-center gap-3 mb-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold text-emerald-600/60 tracking-tight truncate">Next Milestone: Day {nextGoal}</p>
              <p className="text-xl font-black text-emerald-800 truncate">{daysRemaining} Days To Go</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] text-right mt-1 text-emerald-600/60 font-bold">{progress}% Complete</p>
        </div>
      </div>
    </div>
  );
}
