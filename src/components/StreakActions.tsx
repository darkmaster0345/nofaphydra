import { useState } from "react";
import { Play, RotateCcw, AlertTriangle } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

interface StreakActionsProps {
  isActive: boolean;
  onStart: () => void;
  onReset: () => void;
}

export function StreakActions({ isActive, onStart, onReset }: StreakActionsProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStart = () => {
    onStart();
    setShowConfetti(true);
    toast({
      title: "🔥 Streak Started!",
      description: "Your journey to greatness begins now. Stay strong!",
    });
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleReset = () => {
    onReset();
    toast({
      title: "Streak Reset",
      description: "Don't give up. Every champion has setbacks. Start again!",
      variant: "destructive",
    });
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {["🔥", "⚡", "💪", "🏆", "⭐"][Math.floor(Math.random() * 5)]}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {!isActive ? (
          <Button
            variant="fire"
            size="xl"
            className="flex-1"
            onClick={handleStart}
          >
            <Play className="w-5 h-5" />
            START YOUR JOURNEY
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Streak
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Reset Your Streak?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will reset your current streak to 0. Your longest streak record will be preserved. 
                  Remember: setbacks are part of the journey. What matters is getting back up.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  Keep Going
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reset Streak
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
