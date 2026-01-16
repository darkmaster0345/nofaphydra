import { getStreakData, calculateStreak, getAvatarLevel } from "@/lib/streakUtils";
import { useEffect, useState } from "react";
import { FursanLogo } from "@/components/FursanLogo";
import { Shield, Zap } from "lucide-react";

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
    <header className="flex flex-col items-center justify-center gap-6 py-12 page-transition">
      <div className="relative group p-4">
        {/* Elite Metallic Rings */}
        <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full animate-spin-slow" />
        <div className="absolute inset-2 border border-dashed border-amber-600/20 rounded-full" />
        <div className="absolute -inset-1 border-2 border-amber-900/40 rounded-full blur-[1px]" />

        <div className="relative z-10 p-3 bg-black rounded-full border-2 border-amber-800 shadow-[0_0_40px_rgba(217,119,6,0.1)] transition-all duration-700 group-hover:shadow-[0_0_60px_rgba(217,119,6,0.2)]">
          <FursanLogo className="w-24 h-24 fursan-logo-glow" />
        </div>

        {level && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black text-amber-500 text-[10px] font-black px-6 py-2 rounded-xl shadow-2xl border-2 border-amber-900 animate-in fade-in zoom-in duration-700 whitespace-nowrap tracking-widest uppercase">
            {level.name}
          </div>
        )}
      </div>

      <div className="text-center mt-2 w-full px-4 space-y-3">
        <h1 className="text-4xl md:text-6xl font-black tracking-[-0.05em] text-white">
          FURSAN<span className="text-amber-500 ml-2">ELITE</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-900 to-transparent" />
          <p className="text-[9px] tracking-[0.4em] text-amber-500/60 uppercase font-black flex items-center gap-2">
            <Shield className="w-3 h-3" /> Protocol V2.5 <Zap className="w-3 h-3" />
          </p>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-900 to-transparent" />
        </div>
      </div>
    </header>
  );
}

