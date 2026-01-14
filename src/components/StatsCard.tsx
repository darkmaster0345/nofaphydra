import { Trophy, RotateCcw, Target } from "lucide-react";
import { StreakData, calculateStreak } from "@/lib/streakUtils";

interface StatsCardProps {
  data: StreakData;
}

export function StatsCard({ data }: StatsCardProps) {
  const currentStreak = calculateStreak(data.startDate);

  return (
    <div className="streak-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <h3 className="text-lg font-display text-muted-foreground mb-4">Your Stats</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-xl font-display text-foreground">{data.longestStreak} days</p>
            </div>
          </div>
          {currentStreak.days > data.longestStreak && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-success/20 text-success">
              NEW!
            </span>
          )}
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resets</p>
              <p className="text-xl font-display text-foreground">{data.totalRelapses}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Goal</p>
              <p className="text-xl font-display text-foreground">
                {currentStreak.days < 7 ? "7" : 
                 currentStreak.days < 14 ? "14" :
                 currentStreak.days < 30 ? "30" :
                 currentStreak.days < 60 ? "60" :
                 currentStreak.days < 90 ? "90" : "180"} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
