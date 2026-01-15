import { getStreakData, calculateStreak, getAvatarLevel } from "@/lib/streakUtils";
import { useEffect, useState } from "react";
import { FursanLogo } from "@/components/FursanLogo";
import { Sparkles } from "lucide-react";

export function Header() {
  const [level, setLevel] = useState<{ name: string, emoji: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await getStreakData();
      if (data.startDate) {
        const { days } = calculateStreak(data.startDate);
        const lvl = getAvatarLevel(days);
        setLevel(lvl);
      }
    };
    loadData();
  }, []);

  return (
    <header className="flex flex-col items-center justify-center gap-4 py-10 page-transition">
      <div className="relative group p-2">
        {/* Decorative ring around logo */}
        <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full animate-spin-slow" />
        <div className="absolute inset-2 border-2 border-dashed border-amber-400/40 rounded-full" />

        <div className="relative z-10 p-2 bg-white rounded-full shadow-xl shadow-amber-500/10 transition-all duration-700 group-hover:shadow-amber-500/30">
          <FursanLogo className="w-20 h-20 md:w-24 md:h-24 fursan-logo-glow" />
        </div>

        {level && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg border-2 border-white animate-in fade-in zoom-in duration-700 whitespace-nowrap">
            {level.emoji} {level.name.toUpperCase()}
          </div>
        )}
      </div>

      <div className="text-center mt-4 w-full px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-[0.15em] font-bold break-words">
          <span className="text-amber-900 inline-block">FURSAN</span>
          <span className="text-gradient-gold ml-2 inline-block">PROTOCOL</span>
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
          <p className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.4em] text-amber-800/40 uppercase font-bold text-center leading-relaxed">
            Protocol Active // V2.5 Elite
          </p>
          <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
        </div>
      </div>
    </header>
  );
}
