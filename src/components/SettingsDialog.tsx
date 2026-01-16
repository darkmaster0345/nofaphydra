import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Settings,
    Bell,
    Shield,
    MapPin,
    Palette,
    Volume2,
    VolumeX,
    Download,
    Trash2,
    Lock,
    Eye
} from "lucide-react";
import { LocationSettings } from "./LocationSettings";
import { ThemeSelector } from "./ThemeSelector";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { toast } from "sonner";
import { exportKeys, clearKeys } from "@/services/nostr";
import { luxuryClickVibrate } from "@/lib/vibrationUtils";

export function SettingsDialog() {
    const [silentMode, setSilentMode] = useState(() => localStorage.getItem('fursan_silent_mode') === 'true');
    const [volume, setVolume] = useState(() => Number(localStorage.getItem('fursan_adhan_volume') || 80));

    const toggleSilentMode = (checked: boolean) => {
        setSilentMode(checked);
        localStorage.setItem('fursan_silent_mode', String(checked));
        luxuryClickVibrate();
        toast.success(checked ? "Silent Mode Engaged" : "Silent Mode Disengaged");
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        localStorage.setItem('fursan_adhan_volume', String(newVolume));
    };

    const handleExportKey = async () => {
        const keys = await exportKeys();
        if (keys) {
            await navigator.clipboard.writeText(keys.nsec);
            luxuryClickVibrate();
            toast.success("Private Key (nsec) copied to clipboard. KEEP IT SECRET.");
        }
    };

    const handleWipeStorage = async () => {
        if (confirm("CRITICAL: This will PERMANENTLY WIPE all local data and reset your identity. Are you sure?")) {
            await clearKeys();
            luxuryClickVibrate();
            window.location.reload();
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-amber-100/50">
                    <Settings className="w-5 h-5 text-amber-900" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-amber-200 bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-amber-900 uppercase tracking-tighter">Command Center</DialogTitle>
                    <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/50">System Configuration & Protocol Settings</DialogDescription>
                </DialogHeader>

                <div className="space-y-8 py-4">
                    {/* Sector Settings */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                            <MapPin className="w-4 h-4 text-amber-500" />
                            Sector Settings
                        </div>
                        <div className="royal-card p-4">
                            <LocationSettings />
                        </div>
                    </section>

                    {/* Notification Protocol */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                            <Bell className="w-4 h-4 text-amber-500" />
                            Notification Protocol
                        </div>
                        <div className="royal-card p-5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-black uppercase text-amber-900">Silent Mode</p>
                                    <p className="text-[10px] text-amber-600/60 font-bold uppercase">Mute all Adhan signals</p>
                                </div>
                                <Switch checked={silentMode} onCheckedChange={toggleSilentMode} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black uppercase text-amber-900">Adhan Volume</p>
                                    <span className="text-[10px] font-black text-amber-600">{volume}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {volume === 0 ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                                    <Slider
                                        value={[volume]}
                                        onValueChange={handleVolumeChange}
                                        max={100}
                                        step={1}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Display */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                            <Palette className="w-4 h-4 text-amber-500" />
                            Display Protocol
                        </div>
                        <div className="royal-card p-5">
                            <ThemeSelector />
                        </div>
                    </section>

                    {/* Data Fortress */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                            <Shield className="w-4 h-4 text-amber-500" />
                            Data Fortress
                        </div>
                        <div className="royal-card p-5 space-y-4">
                            <Button
                                onClick={handleExportKey}
                                variant="outline"
                                className="w-full h-12 rounded-xl border-amber-200 text-amber-900 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-amber-50"
                            >
                                <Lock className="w-4 h-4" />
                                Export Private Key
                            </Button>
                            <Button
                                onClick={handleWipeStorage}
                                variant="ghost"
                                className="w-full h-12 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Wipe Local Storage
                            </Button>
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
