import { getStreakData, calculateStreak, getAvatarLevel } from "@/lib/streakUtils";
import { useEffect, useState } from "react";

export function Header() {
  const [level, setLevel] = useState<{ name: string, emoji: string } | null>(null);

  useEffect(() => {
    const data = getStreakData();
    if (data.startDate) {
      const { days } = calculateStreak(data.startDate);
      const lvl = getAvatarLevel(days);
      setLevel(lvl);
    }
  }, []);

  return (
    <header className="flex flex-col items-center justify-center gap-4 py-8 animate-fade-in">
      <div className="relative group">
        <img
          src="/logo.png"
          alt="NoFap Hydra Logo"
          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary shadow-2xl transition-all duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 blur-2xl bg-primary/20 -z-10 rounded-full" />

        {level && (
          <div className="absolute -bottom-1 -right-1 bg-primary text-background text-[10px] font-black px-2 py-0.5 border border-primary animate-in fade-in zoom-in duration-500">
            {level.emoji} {level.name.toUpperCase()}
          </div>
        )}
      </div>
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-display tracking-[0.2em] font-bold">
          <span className="text-foreground">NOFAP</span>
          <span className="text-primary ml-2">HYDRA</span>
        </h1>
        <p className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase mt-1 font-medium">
          Protocol Active // Community 0.1
        </p>
      </div>
    </header>
  );
}
