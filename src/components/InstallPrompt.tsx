import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function InstallPrompt() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Check if user dismissed recently
    const dismissed = localStorage.getItem("hydra_install_dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    setShowPrompt(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("hydra_install_dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="streak-card animate-fade-in border-primary/30" style={{ animationDelay: "0.5s" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Install the App</p>
            <p className="text-xs text-muted-foreground">Get offline access & notifications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Later
          </Button>
          <Button variant="fire" size="sm" onClick={() => navigate("/install")}>
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
