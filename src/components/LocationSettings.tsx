import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { MapPin, Search, Globe, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LocationSettings() {
    const [mode, setMode] = useState<"auto" | "manual">("auto");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [timezone, setTimezone] = useState("");
    const [city, setCity] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [timezones, setTimezones] = useState<string[]>([]);

    useEffect(() => {
        const storedMode = localStorage.getItem('fursan_location_mode') as "auto" | "manual" || "auto";
        setMode(storedMode);
        setLat(localStorage.getItem('fursan_manual_lat') || "");
        setLng(localStorage.getItem('fursan_manual_lng') || "");
        setTimezone(localStorage.getItem('fursan_manual_timezone') || "");
        setCity(localStorage.getItem('fursan_manual_city') || "");

        // Load all available timezones
        try {
            const tzList = (Intl as any).supportedValuesOf('timeZone');
            setTimezones(tzList);
        } catch (e) {
            setTimezones([]);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('fursan_location_mode', mode);
        localStorage.setItem('fursan_manual_lat', lat);
        localStorage.setItem('fursan_manual_lng', lng);
        localStorage.setItem('fursan_manual_timezone', timezone);
        localStorage.setItem('fursan_manual_city', city);

        toast.success("Location Protocol Updated", {
            description: mode === 'auto' ? "Reverted to satellite detection." : `Manual coordinate locked: ${city || 'Sector X'}`
        });

        // Notify other components to update
        window.dispatchEvent(new Event('fursan_location_settings_updated'));
        window.dispatchEvent(new Event('fursan_prayer_settings_updated'));
    };

    const searchCity = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                setLat(result.lat);
                setLng(result.lon);
                // Nominatim doesn't give timezone directly, but we can try to find a city name
                const cityName = result.display_name.split(',')[0];
                setCity(cityName);

                toast.success("Sector Located", {
                    description: `Coordinates for ${cityName} synchronized.`
                });
            } else {
                toast.error("Sector Not Found", {
                    description: "Could not locate these coordinates in the database."
                });
            }
        } catch (e) {
            toast.error("Connection Error", {
                description: "Map data retrieval failed."
            });
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 royal-card bg-amber-50/30 border-amber-100">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all",
                        mode === 'auto' ? "bg-amber-400 text-white" : "bg-gray-200 text-gray-500"
                    )}>
                        <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-amber-900">Auto-Detect</p>
                        <p className="text-[10px] font-bold text-amber-600/60 uppercase">Satellite Guidance</p>
                    </div>
                </div>
                <Switch
                    checked={mode === 'auto'}
                    onCheckedChange={(checked) => setMode(checked ? 'auto' : 'manual')}
                />
            </div>

            {mode === 'manual' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="relative">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchCity()}
                            placeholder="Search City (e.g. London, Karachi)"
                            className="royal-card bg-white border-amber-100 h-12 pl-10 pr-24 text-xs font-bold text-amber-900 placeholder:text-amber-200"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300" />
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSearching}
                            onClick={searchCity}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-800"
                        >
                            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Locate"}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-amber-800 ml-1">Latitude</Label>
                            <Input
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                className="royal-card bg-white border-amber-100 h-10 text-xs font-bold text-amber-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-amber-800 ml-1">Longitude</Label>
                            <Input
                                value={lng}
                                onChange={(e) => setLng(e.target.value)}
                                className="royal-card bg-white border-amber-100 h-10 text-xs font-bold text-amber-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-amber-800 ml-1">Timezone</Label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="flex h-10 w-full royal-card bg-white border-amber-100 px-3 py-2 text-xs font-bold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        >
                            <option value="">Select Timezone</option>
                            {timezones.map(tz => (
                                <option key={tz} value={tz}>{tz}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-amber-800 ml-1">City/Sector Name</Label>
                        <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Optional display name"
                            className="royal-card bg-white border-amber-100 h-10 text-xs font-bold text-amber-900"
                        />
                    </div>
                </div>
            )}

            <Button
                onClick={handleSave}
                className="w-full h-12 bg-amber-900 text-white hover:bg-black font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg active:scale-95"
            >
                Lock Location Protocol
            </Button>
        </div>
    );
}
