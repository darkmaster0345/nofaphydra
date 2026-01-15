import { useState, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function LocationTimeCard() {
    const [time, setTime] = useState(new Date());
    const [location, setLocation] = useState("Sanctum");

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Get timezone-based location name
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz) {
                // Asia/Karachi -> Karachi
                const city = tz.split('/').pop()?.replace('_', ' ');
                if (city) setLocation(city);
            }
        } catch (e) {
            console.error("Failed to detect timezone", e);
        }

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="royal-card p-5 overflow-hidden page-transition" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Clock className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-amber-800">Local Vigil</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-500/50" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/50">
                                {location} Sector
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <motion.p
                        key={time.getSeconds()}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-black text-gradient-gold tabular-nums leading-none"
                    >
                        {formatTime(time)}
                    </motion.p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600/40 mt-1">
                        {formatDate(time)}
                    </p>
                </div>
            </div>
        </div>
    );
}
