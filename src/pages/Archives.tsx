import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { StatsCard } from "@/components/StatsCard";
import { MotivationCard } from "@/components/MotivationCard";
import { ActivityHistory } from "@/components/ActivityHistory";
import { ActivityHeatmap } from "@/components/DynamicComponents";
import { useStreak } from "@/hooks/useStreak";
import { Library, ScrollText, BarChart3, History } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function Archives() {
    const { streakData } = useStreak();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading for smoother experience
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <LoadingScreen message="Retrieving Archives" subMessage="Decoding Sacred Records" />;
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="container max-w-lg mx-auto px-4">
                <Header />

                <header className="mb-8 mt-4 page-transition" style={{ animationDelay: "0.1s" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Library className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display text-amber-900 tracking-tight">The Archives</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/50">Statistics & Ancient Wisdom</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-8 flex flex-col items-center">
                    <div className="w-full page-transition" style={{ animationDelay: "0.15s" }}>
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1 mb-4">
                            <BarChart3 className="w-4 h-4 text-amber-500" />
                            Battle Statistics
                        </div>
                        <StatsCard data={streakData} />
                    </div>

                    <div className="w-full page-transition" style={{ animationDelay: "0.2s" }}>
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1 mb-4">
                            <ScrollText className="w-4 h-4 text-amber-500" />
                            Daily Wisdom
                        </div>
                        <MotivationCard />
                    </div>

                    <div className="w-full page-transition" style={{ animationDelay: "0.25s" }}>
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1 mb-4">
                            <History className="w-4 h-4 text-amber-500" />
                            Protocol Events
                        </div>
                        <ActivityHistory />
                    </div>

                    <div className="w-full page-transition" style={{ animationDelay: "0.3s" }}>
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1 mb-4">
                            <Library className="w-4 h-4 text-amber-500" />
                            Activity Heatmap
                        </div>
                        <ActivityHeatmap startDate={streakData?.startDate} />
                    </div>
                </div>

                <footer className="mt-16 mb-8 text-center text-amber-800/20">
                    <p className="font-bold uppercase tracking-[0.5em] text-[10px]">NoFap Fursan Protocol // Legend in Making ⚔️</p>
                </footer>
            </div>
            <BottomNav />
        </div>
    );
}
