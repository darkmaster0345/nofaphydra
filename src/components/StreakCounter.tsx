import { useEffect, useState, useRef } from "react";
import { Clock, Calendar } from "lucide-react";
import { calculateStreak } from "@/lib/streakUtils";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicFire } from "@/components/DynamicComponents";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface StreakCounterProps {
  startDate: string | null;
}

export function StreakCounter({ startDate }: StreakCounterProps) {
  const [streak, setStreak] = useState({ days: 0, hours: 0, minutes: 0 });
  const prevDaysRef = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const updateStreak = () => {
      const newStreak = calculateStreak(startDate);
      setStreak(newStreak);

      // Trigger haptics and animation if day count increases
      // But only if it's not the first render to avoid "pop" on load
      if (!isFirstRender.current && newStreak.days > prevDaysRef.current && startDate) {
        triggerHaptics();
      }

      prevDaysRef.current = newStreak.days;
      isFirstRender.current = false;
    };

    updateStreak();
    const interval = setInterval(updateStreak, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startDate]);

  const triggerHaptics = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available
    }
  };

  const isNewUser = !startDate;

  return (
    <div className="streak-card relative overflow-hidden">
      {/* Background Glow for high streaks */}
      {streak.days >= 30 && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      )}

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <DynamicFire streakDays={streak.days} className="w-6 h-6" />
        <span className="text-muted-foreground font-medium">Current Streak</span>
      </div>

      {isNewUser ? (
        <div className="text-center py-4 relative z-10">
          <p className="text-2xl font-display text-foreground mb-2">Ready to Begin?</p>
          <p className="text-muted-foreground text-sm">
            Start your journey to self-improvement today
          </p>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="flex items-baseline gap-2 mb-6">
            <motion.span
              key={streak.days} // Triggers animation on change
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-7xl font-display text-gradient-fire"
            >
              {streak.days}
            </motion.span>
            <span className="text-2xl font-display text-muted-foreground">DAYS</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-accent/20 transition-colors">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-display text-foreground">{streak.hours}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-success/20 transition-colors">
              <Calendar className="w-5 h-5 text-success" />
              <div>
                <p className="text-2xl font-display text-foreground">{streak.minutes}</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground text-center">
            Started: {new Date(startDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
}
