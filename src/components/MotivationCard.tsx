import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { getRandomQuote } from "@/lib/streakUtils";
import { Button } from "@/components/ui/button";

export function MotivationCard() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const refreshQuote = () => {
    setQuote(getRandomQuote());
  };

  return (
    <div className="streak-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground font-medium">Daily Motivation</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshQuote}
          className="text-muted-foreground hover:text-primary"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <blockquote className="text-xl font-medium text-foreground leading-relaxed">
        "{quote}"
      </blockquote>
    </div>
  );
}
