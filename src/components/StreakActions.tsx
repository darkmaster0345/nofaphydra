import { useState } from "react";
import { Play, RotateCcw, AlertTriangle, Sparkles, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { toast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";

interface StreakActionsProps {
  isActive: boolean;
  onStart: () => void;
  onReset: () => void;
}

export function StreakActions({ isActive, onStart, onReset }: StreakActionsProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStart = async () => {
    onStart();
    setShowConfetti(true);

    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    toast({
      title: "⚔️ Protocol Initiated!",
      description: "Your journey to Fursanhood begins now. Stay disciplined!",
    });
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleReset = async () => {
    onReset();

    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else if ('vibrate' in navigator) {
      navigator.vibrate(150);
    }

    toast({
      title: "Sabr Count Reset",
      description: "A Knight may fall, but he always rises. Start again with wisdom.",
      variant: "destructive",
    });
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
          {[...Array(30)].map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.8}s`,
              }}
            >
              {["🛡️", "⚔️", "🔥", "✨", "🏹", "⭐"][Math.floor(Math.random() * 6)]}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {!isActive ? (
          <Button
            size="xl"
            className="flex-1 rounded-2xl h-20 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-size-200 animate-gradient-x text-white font-black uppercase text-xl tracking-widest shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group"
            onClick={handleStart}
          >
            <Swords className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform" />
            INITIATE PROTOCOL
            <Sparkles className="ml-4 w-6 h-6 animate-pulse" />
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 rounded-xl h-14 border-2 border-rose-200 text-rose-500 hover:bg-rose-50 font-bold uppercase tracking-wider shadow-md hover:border-rose-300 transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Sabr Count
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-amber-200 p-8 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-amber-900 text-2xl font-display">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                  Request Full Reset?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-amber-800/70 font-medium text-base pt-4">
                  This will reset your current Sabr Count to zero. Your record of persistence will be archived.
                  <br /><br />
                  <span className="italic">"The path to mastery is paved with persistence, not perfection."</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-6 gap-3">
                <AlertDialogCancel className="flex-1 rounded-xl h-12 bg-amber-50 text-amber-800 border-amber-200 font-bold">
                  Continue Battle
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="flex-1 rounded-xl h-12 bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                >
                  Reset Count
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
