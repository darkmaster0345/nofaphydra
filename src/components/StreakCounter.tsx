import { useRef } from "react";
import { Clock, Calendar } from "lucide-react";
import { calculateStreak } from "@/lib/streakUtils";
import { motion } from "framer-motion";
import { DynamicFire } from "@/components/DynamicComponents";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface StreakCounterProps {
  startDate: string | null;
  isSyncing?: boolean;
  isOnline?: boolean;
  pendingCount?: number;
}

export function StreakCounter({ startDate, isSyncing, isOnline, pendingCount }: StreakCounterProps) {
  const streak = calculateStreak(startDate);
  const prevDaysRef = useRef(streak.days);

  // Trigger haptics if day count increases
  if (streak.days > prevDaysRef.current && startDate) {
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });
    prevDaysRef.current = streak.days;
  }

  const isNewUser = !startDate;

  return (
    <div className="streak-card relative overflow-hidden border border-black rounded-none shadow-none bg-white p-6">
      <div className="flex items-center justify-between mb-4 relative z-10 px-1">
        <div className="flex items-center gap-2">
          <DynamicFire streakDays={streak.days} className="w-5 h-5 text-black" />
          <span className="text-black font-black uppercase tracking-widest text-[10px]">Active Persistence</span>
        </div>

        {startDate && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-black rounded-none bg-black text-white text-[9px] font-bold uppercase tracking-widest">
            {isSyncing ? (
              <>
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                SYNCING
              </>
            ) : isOnline ? (
              <>
                <div className="w-1 h-1 bg-white rounded-full" />
                SYNCED
              </>
            ) : (
              <>
                <div className="w-1 h-1 bg-red-500 rounded-full" />
                OFFLINE
              </>
            )}
          </div>
        )}
      </div>

      {isNewUser ? (
        <div className="text-center py-8 relative z-10 border border-dashed border-black/20">
          <p className="text-2xl font-black uppercase tracking-tighter mb-2">Dormant State</p>
          <p className="text-black/40 text-[10px] uppercase font-bold tracking-widest">
            Initiate streak to begin transformation
          </p>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="flex items-baseline gap-3 mb-8">
            <motion.span
              key={streak.days}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-8xl font-black tracking-tighter leading-none"
            >
              {streak.days}
            </motion.span>
            <span className="text-xl font-black uppercase tracking-widest text-black/20">Days</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 border border-black bg-white group hover:bg-black hover:text-white transition-all">
              <Clock className="w-4 h-4" />
              <div>
                <p className="text-xl font-black leading-none">{streak.hours}</p>
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-40">Hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border border-black bg-white group hover:bg-black hover:text-white transition-all">
              <Calendar className="w-4 h-4" />
              <div>
                <p className="text-xl font-black leading-none">{streak.minutes}</p>
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-40">Minutes</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/5">
            <p className="text-[10px] font-mono text-black/40 uppercase tracking-tight">
              Deployment Hash: {new Date(startDate).getTime().toString(16).toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
