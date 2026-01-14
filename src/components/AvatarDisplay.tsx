import { Crown, TrendingUp } from "lucide-react";
import { getAvatarLevel, getNextAvatarLevel, getDaysUntilNextLevel, AVATAR_LEVELS } from "@/lib/streakUtils";
import { Progress } from "@/components/ui/progress";

interface AvatarDisplayProps {
  days: number;
}

export function AvatarDisplay({ days }: AvatarDisplayProps) {
  const currentLevel = getAvatarLevel(days);
  const nextLevel = getNextAvatarLevel(days);
  const daysUntilNext = getDaysUntilNextLevel(days);
  
  const progressToNext = nextLevel 
    ? ((days - currentLevel.minDays) / (nextLevel.minDays - currentLevel.minDays)) * 100
    : 100;

  return (
    <div className="streak-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-primary" />
        <span className="text-muted-foreground font-medium">Your Avatar</span>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <span className="text-8xl animate-float">{currentLevel.emoji}</span>
          {days >= 90 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse-glow">
              <span className="text-xs">🔥</span>
            </div>
          )}
        </div>
        <h3 className={`text-3xl font-display mt-4 ${currentLevel.color}`}>
          {currentLevel.name}
        </h3>
        <p className="text-muted-foreground text-sm mt-1">{currentLevel.description}</p>
      </div>

      {nextLevel && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next: {nextLevel.emoji} {nextLevel.name}</span>
            <span className="text-primary font-semibold">{daysUntilNext} days</span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Milestone Ranks</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVATAR_LEVELS.slice(1).map((level) => (
            <div
              key={level.name}
              title={level.description}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-help ${
                days >= level.minDays
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {level.emoji} {level.name}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Hover on ranks to see what they mean
        </p>
      </div>
    </div>
  );
}
