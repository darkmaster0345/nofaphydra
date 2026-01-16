import { Bell, Clock, Sparkles } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NotificationSettings() {
    const { enabled, intervalHours, setIntervalHours, isSupported, showTestNotification } = useNotifications();

    if (!isSupported) return null;

    const handleIntervalChange = (value: number[]) => {
        setIntervalHours(value[0]);
        toast.success(`Protocol signals updated to every ${value[0]} hours.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <Bell className={`w-8 h-8 ${enabled ? 'text-amber-600' : 'text-amber-300'} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-amber-800 truncate">
                        Honor Protocol Reminders
                    </h3>
                    <p className="text-[10px] text-amber-700/60 font-medium break-words leading-tight">
                        {enabled
                            ? "Motivational signals and Adhan alerts are active."
                            : "Enable notifications to receive spiritual reinforcements."}
                    </p>
                </div>
            </div>

            <div className="space-y-4 px-1">
                <div className="flex justify-between items-center mb-2">
                    <Label className="flex items-center gap-2 text-[11px] uppercase font-black tracking-widest text-amber-900">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Signal Frequency
                    </Label>
                    <span className="text-amber-600 font-black text-sm">{intervalHours}h</span>
                </div>

                <div className="pt-2">
                    <Slider
                        value={[intervalHours]}
                        onValueChange={handleIntervalChange}
                        min={1}
                        max={24}
                        step={1}
                        disabled={!enabled}
                        className={!enabled ? "opacity-50 cursor-not-allowed" : ""}
                    />
                </div>

                <div className="flex justify-between text-[10px] text-amber-600/40 font-bold uppercase tracking-tighter">
                    <span>High Frequency (1h)</span>
                    <span>Low Frequency (24h)</span>
                </div>

                {!enabled ? (
                    <p className="text-[10px] text-rose-500 font-bold uppercase text-center mt-2 animate-pulse">
                        Enable Honor Protocol to adjust frequency
                    </p>
                ) : (
                    <div className="flex justify-center pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-6 rounded-xl border-amber-200 text-amber-800 hover:bg-amber-100/50 uppercase text-[10px] font-black tracking-widest shadow-sm group"
                            onClick={showTestNotification}
                        >
                            <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500 group-hover:animate-spin" />
                            Test Signal
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50/30 border border-amber-100/50">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-amber-800/70 leading-relaxed font-medium italic">
                        "Verily, in the remembrance of Allah do hearts find rest." (13:28)
                        <br />
                        <span className="not-italic text-[10px] block mt-1 opacity-60">
                            Signals will be sent every {intervalHours} hours to keep your resolve firm.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
