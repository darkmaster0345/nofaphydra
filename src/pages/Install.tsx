import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Check, Smartphone, Bell, Zap, ArrowLeft } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-4xl">🐉</span>
          </div>
          <h1 className="text-3xl font-display text-foreground mb-2">Install Hydra</h1>
          <p className="text-muted-foreground">
            Get the full experience with our mobile app
          </p>
        </div>

        {isInstalled ? (
          <div className="streak-card text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-display text-foreground mb-2">Already Installed!</h2>
            <p className="text-muted-foreground text-sm">
              Hydra is ready to use on your device
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <div className="streak-card flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Works Offline</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your streak even without internet
                  </p>
                </div>
              </div>

              <div className="streak-card flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Get AI motivation even when app is closed
                  </p>
                </div>
              </div>

              <div className="streak-card flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Instant Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Launch from your home screen like a native app
                  </p>
                </div>
              </div>
            </div>

            {deferredPrompt ? (
              <Button variant="fire" size="lg" className="w-full" onClick={handleInstall}>
                <Download className="w-5 h-5 mr-2" />
                Install App
              </Button>
            ) : isIOS ? (
              <div className="streak-card">
                <h3 className="font-medium text-foreground mb-3">Install on iOS</h3>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">1</span>
                    Tap the Share button in Safari
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">2</span>
                    Scroll down and tap "Add to Home Screen"
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">3</span>
                    Tap "Add" to confirm
                  </li>
                </ol>
              </div>
            ) : (
              // BIG PROMINENT BUTTON FOR NON-iOS DEVICES
              <div className="streak-card text-center py-6">
                <a
                  href="https://drive.proton.me/urls/3AFKY85FZR#n0BhmHOOIeCY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-20 h-20 rounded-full bg-fire flex items-center justify-center mx-auto hover:scale-110 transition"
                  title="Install Hydra"
                >
                  <Download className="w-8 h-8 text-white" />
                </a>
                <p className="text-sm text-muted-foreground mt-2">Tap to install Hydra</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Install;
