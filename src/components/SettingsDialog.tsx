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
import { Slider } from "@/components/ui/slider";
import { LocationSettings } from "./LocationSettings";
import { ThemeSelector } from "./ThemeSelector";
import { PrivacySettings } from "./PrivacySettings";
import { NotificationToggle } from "./NotificationToggle";
import { exportKeys, clearKeys } from "@/services/nostr";
import { luxuryClickVibrate } from "@/lib/vibrationUtils";
import { toast } from "sonner";
import {
    Settings,
    Bell,
    Shield,
    MapPin,
    Palette,
    Download,
    Trash2,
    ChevronRight,
    Fingerprint,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsDialog() {
    const [volume, setVolume] = useState(() => {
        return parseInt(localStorage.getItem('fursan_adhan_volume') || '80');
    });

    const handleExportKey = async () => {
        const nsec = await exportKeys();
        if (nsec) {
            await navigator.clipboard.writeText(nsec);
            toast.success("Private key (nsec) copied to clipboard. Secure it immediately.");
            luxuryClickVibrate();
        }
    };

    const handleWipeData = () => {
        if (window.confirm("CRITICAL: This will wipe all local data and reset your identity. Are you sure?")) {
            clearKeys();
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full border-2 border-amber-900/40 bg-black hover:bg-amber-950/20 text-amber-500 transition-all active:scale-90"
                    onClick={() => luxuryClickVibrate()}
                >
                    <Settings className="w-6 h-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[95%] rounded-[2.5rem] bg-black border-2 border-amber-900 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden p-0">
                <div className="bg-gradient-to-b from-amber-950/20 to-black p-8 space-y-6 max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-2xl bg-black border-2 border-amber-900 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(217,119,6,0.2)]">
                            <Lock className="w-8 h-8 text-amber-500" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">Command Center</DialogTitle>
                        <DialogDescription className="text-amber-500/40 text-[10px] font-black uppercase tracking-[0.3em]">System Configuration Hub</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Sector Settings */}
                        <DropdownSection
                            icon={<MapPin className="w-4 h-4 text-amber-500" />}
                            title="Sector Settings"
                            description="GPS & Coordinate Protocol"
                        >
                            <LocationSettings />
                        </DropdownSection>

                        {/* Privacy Protocol */}
                        <DropdownSection
                            icon={<Fingerprint className="w-4 h-4 text-amber-500" />}
                            title="Privacy Protocol"
                            description="NIP-44 encryption & Identity"
                        >
                            <PrivacySettings />
                        </DropdownSection>

                        {/* Notification Protocol */}
                        <DropdownSection
                            icon={<Bell className="w-4 h-4 text-amber-500" />}
                            title="Notification Protocol"
                            description="System Alerts & Volume"
                        >
                            <div className="space-y-6 pt-2">
                                <NotificationToggle />
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase text-amber-500/60">Adhan Volume</span>
                                        <span className="text-[10px] font-black text-amber-500">{volume}%</span>
                                    </div>
                                    <Slider
                                        value={[volume]}
                                        onValueChange={(v) => {
                                            setVolume(v[0]);
                                            localStorage.setItem('fursan_adhan_volume', v[0].toString());
                                        }}
                                        max={100}
                                        step={1}
                                        className="py-2"
                                    />
                                </div>
                            </div>
                        </DropdownSection>

                        {/* Display Protocol */}
                        <DropdownSection
                            icon={<Palette className="w-4 h-4 text-amber-500" />}
                            title="Display Protocol"
                            description="Interface Selection"
                        >
                            <ThemeSelector />
                        </DropdownSection>
                    </div>

                    <div className="h-[1px] bg-amber-900/20 my-2" />

                    {/* Data Fortress */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/40 px-2">Data Fortress</p>
                        <div className="grid grid-cols-1 gap-2">
                            <Button
                                variant="outline"
                                className="h-12 justify-start gap-4 border-amber-900/30 bg-black hover:bg-amber-950/20 text-amber-500 rounded-2xl transition-all"
                                onClick={handleExportKey}
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Export Private Key</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 justify-start gap-4 border-red-900/30 bg-black hover:bg-red-950/20 text-red-500 rounded-2xl transition-all"
                                onClick={handleWipeData}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Wipe Data Fortress</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DropdownSection({ icon, title, description, children }: { icon: any, title: string, description: string, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-amber-900/20 rounded-2xl overflow-hidden bg-amber-950/10 transition-all">
            <button
                onClick={() => { setIsOpen(!isOpen); luxuryClickVibrate(); }}
                className="w-full flex items-center justify-between p-4 hover:bg-amber-900/10 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black border border-amber-900/30 flex items-center justify-center shadow-inner">
                        {icon}
                    </div>
                    <div className="text-left">
                        <p className="text-[11px] font-black uppercase text-amber-500 tracking-tighter leading-none mb-1">{title}</p>
                        <p className="text-[8px] font-bold uppercase text-amber-500/40 tracking-widest">{description}</p>
                    </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-amber-900/40 transition-all duration-300", isOpen && "rotate-90 text-amber-500")} />
            </button>
            <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="p-4 border-t border-amber-900/10 bg-black/60">
                    {children}
                </div>
            </div>
        </div>
    );
}
