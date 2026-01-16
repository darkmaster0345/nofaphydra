import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CALCULATION_METHODS,
    MADHABS
} from "@/lib/prayerUtils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Scale, BookOpen, Compass } from "lucide-react";

export function PrayerFiqhSettings() {
    const [method, setMethod] = useState("MuslimWorldLeague");
    const [madhab, setMadhab] = useState("Shafi");

    useEffect(() => {
        const storedMethod = localStorage.getItem('fursan_prayer_method');
        const storedMadhab = localStorage.getItem('fursan_prayer_madhab');
        if (storedMethod) setMethod(storedMethod);
        if (storedMadhab) setMadhab(storedMadhab);
    }, []);

    const handleMethodChange = (value: string) => {
        setMethod(value);
        localStorage.setItem('fursan_prayer_method', value);
        toast.success("Calculation Method Updated", {
            description: "Prayer times will be recalculated based on " +
                CALCULATION_METHODS.find(m => m.id === value)?.name
        });
        window.dispatchEvent(new Event('fursan_prayer_settings_updated'));
    };

    const handleMadhabChange = (value: string) => {
        setMadhab(value);
        localStorage.setItem('fursan_prayer_madhab', value);
        toast.success("Madhab Updated", {
            description: "Asr calculation adjusted to " +
                MADHABS.find(m => m.id === value)?.name
        });
        window.dispatchEvent(new Event('fursan_prayer_settings_updated'));
    };

    return (
        <Card className="royal-card overflow-hidden border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5 ml-1">
                            <Compass className="w-3 h-3" />
                            Calculation Method
                        </label>
                        <Select value={method} onValueChange={handleMethodChange}>
                            <SelectTrigger className="royal-card bg-white border-amber-100 h-11 text-xs font-bold text-amber-900 focus:ring-amber-400">
                                <SelectValue placeholder="Select Method" />
                            </SelectTrigger>
                            <SelectContent className="royal-card border-amber-100 shadow-xl">
                                {CALCULATION_METHODS.map((m) => (
                                    <SelectItem
                                        key={m.id}
                                        value={m.id}
                                        className="text-[11px] font-bold text-amber-900 focus:bg-amber-50 focus:text-amber-900"
                                    >
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5 ml-1">
                            <Scale className="w-3 h-3" />
                            Madhab (Asr Timing)
                        </label>
                        <Select value={madhab} onValueChange={handleMadhabChange}>
                            <SelectTrigger className="royal-card bg-white border-amber-100 h-11 text-xs font-bold text-amber-900 focus:ring-amber-400">
                                <SelectValue placeholder="Select Madhab" />
                            </SelectTrigger>
                            <SelectContent className="royal-card border-amber-100 shadow-xl">
                                {MADHABS.map((m) => (
                                    <SelectItem
                                        key={m.id}
                                        value={m.id}
                                        className="text-[11px] font-bold text-amber-900 focus:bg-amber-50 focus:text-amber-900"
                                    >
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[9px] text-amber-600/60 font-medium px-1 italic">
                            *Hanafi uses a later timing for Asr prayer.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
