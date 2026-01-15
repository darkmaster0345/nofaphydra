import { Bell, BellOff, Sparkles } from "lucide-react";
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
        title: "Notifications Enabled 🔔",
        description: "You'll receive Islamic motivational reminders every 3 hours",
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
    <div className="royal-card p-4 page-transition" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${enabled
            ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/20'
            : 'bg-gradient-to-br from-gray-200 to-gray-300'
            }`}>
            {enabled ? (
              <Bell className="w-5 h-5 text-white" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Knight's Discipline
            </h3>
            <p className="text-[11px] text-amber-600/70 font-medium leading-tight">
              {enabled
                ? "Active • Adhan alerts & Quranic wisdom every 3h"
                : "Enable Adhan alerts and daily wisdom reminders"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleToggle}
          className={enabled
            ? "rounded-full px-5 bg-white border-2 border-amber-300 text-amber-700 font-bold hover:bg-amber-50 shadow-md"
            : "rounded-full px-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold shadow-lg shadow-amber-500/25 hover:shadow-xl"
          }
        >
          {enabled ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );
}
