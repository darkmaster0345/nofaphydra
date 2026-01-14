import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";

export function NotificationToggle() {
  const { enabled, toggleNotifications, isSupported, permission } = useNotifications();

  if (!isSupported) return null;

  const handleToggle = async () => {
    const result = await toggleNotifications();
    
    if (result) {
      toast({
        title: "Notifications Enabled",
        description: "You'll receive motivational reminders every 3 hours",
      });
    } else if (permission === "denied") {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      });
    } else if (!result && enabled) {
      toast({
        title: "Notifications Disabled",
        description: "You won't receive motivational reminders",
      });
    }
  };

  return (
    <div className="streak-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="font-medium text-foreground">Motivation Reminders</h3>
            <p className="text-xs text-muted-foreground">
              {enabled ? "Active • Every 3 hours" : "Get AI motivation every 3 hours"}
            </p>
          </div>
        </div>
        <Button
          variant={enabled ? "outline" : "fire"}
          size="sm"
          onClick={handleToggle}
        >
          {enabled ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );
}
