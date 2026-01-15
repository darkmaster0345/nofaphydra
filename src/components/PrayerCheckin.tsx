import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Moon, Sun, Sunrise, Sunset, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
    getTodayCheckin,
    savePrayerCheckin,
    calculatePrayerStreak,
    getTodayCompletionPercentage,
    PrayerCheckin as PrayerCheckinType
} from "@/lib/prayerUtils";
import { tapVibrate, heartbeatVibrate } from "@/lib/vibrationUtils";
import { cn } from "@/lib/utils";

interface Prayer {
    id: keyof PrayerCheckinType['prayers'];
    name: string;
    arabicName: string;
    icon: typeof Sun;
    gradient: string;
}

const PRAYERS: Prayer[] = [
    { id: 'fajr', name: 'Fajr', arabicName: 'الفجر', icon: Sunrise, gradient: 'from-orange-300 to-amber-400' },
    { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', icon: Sun, gradient: 'from-yellow-300 to-amber-400' },
    { id: 'asr', name: 'Asr', arabicName: 'العصر', icon: Sun, gradient: 'from-amber-400 to-orange-400' },
    { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', icon: Sunset, gradient: 'from-orange-400 to-rose-400' },
    { id: 'isha', name: 'Isha', arabicName: 'العشاء', icon: Moon, gradient: 'from-indigo-400 to-purple-500' },
];

export function PrayerCheckin() {
    const [checkin, setCheckin] = useState<PrayerCheckinType['prayers'] | null>(null);
    const [streak, setStreak] = useState(0);
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const today = getTodayCheckin();
        setCheckin(today?.prayers || {
            fajr: false,
            dhuhr: false,
            asr: false,
            maghrib: false,
            isha: false
        });
        setStreak(calculatePrayerStreak());
        setPercentage(getTodayCompletionPercentage());
    };

    const handlePrayerToggle = async (prayerId: keyof PrayerCheckinType['prayers']) => {
        if (!checkin) return;

        const newValue = !checkin[prayerId];
        savePrayerCheckin(prayerId, newValue);

        // Update local state
        setCheckin({ ...checkin, [prayerId]: newValue });

        // Haptic feedback
        if (newValue) {
            await tapVibrate();
            toast.success(`${PRAYERS.find(p => p.id === prayerId)?.name} logged ✓`);
        }

        // Check if all prayers completed
        const updatedCheckin = { ...checkin, [prayerId]: newValue };
        const allCompleted = Object.values(updatedCheckin).every(v => v);

        if (allCompleted) {
            await heartbeatVibrate();
            toast.success("MashaAllah! All prayers completed today! 🌙");
        }

        // Refresh data
        setStreak(calculatePrayerStreak());
        setPercentage(getTodayCompletionPercentage());
    };

    if (!checkin) return null;

    return (
        <div className="royal-card overflow-hidden page-transition" style={{ animationDelay: "0.15s" }}>
            <div className="p-5 border-b border-amber-200/50">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Moon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-amber-800">Prayer Check-in</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/50">الصلاة • Daily Salah</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-gradient-gold">{percentage}%</p>
                        <p className="text-[9px] uppercase tracking-wider text-amber-600/60 font-bold">
                            {streak > 0 ? `${streak} Day Streak` : 'Start Today'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="grid grid-cols-5 gap-2">
                    {PRAYERS.map((prayer) => {
                        const isCompleted = checkin[prayer.id];
                        const Icon = prayer.icon;

                        return (
                            <button
                                key={prayer.id}
                                onClick={() => handlePrayerToggle(prayer.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1 py-3 px-1 rounded-lg transition-all duration-300",
                                    isCompleted
                                        ? `bg-gradient-to-br ${prayer.gradient} text-white shadow-lg`
                                        : "bg-amber-50/50 text-amber-700/60 hover:bg-amber-100/70 border border-amber-200/30"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                                <span className="text-[9px] font-bold uppercase tracking-tight">
                                    {prayer.name}
                                </span>
                                <span className="text-[8px] opacity-80">
                                    {prayer.arabicName}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/30">
                    <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-xs font-black text-amber-700">{Object.values(checkin).filter(v => v).length}/5</span>
                </div>

                <p className="text-[10px] text-center text-amber-600/60 uppercase tracking-wider font-medium">
                    {percentage === 100
                        ? "May Allah accept your prayers ✨"
                        : "Tap each prayer when complete"
                    }
                </p>
            </div>
        </div>
    );
}
