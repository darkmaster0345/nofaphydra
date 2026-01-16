import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { DailyHealthCheck } from "@/components/DailyHealthCheck";
import { LoadingScreen } from "@/components/LoadingScreen";
import { fetchHealthChecks, HealthCheck } from "@/services/nostr";
import { getActivityLog } from "@/lib/activityLog";
import { useStreak } from "@/hooks/useStreak";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Label, ReferenceDot
} from "recharts";
import { Heart, Brain, Activity, ShieldCheck, Info, Flame, Target, Sparkles, Lock } from "lucide-react";
import { PrivacySettings } from "@/components/PrivacySettings";
import { NotificationToggle } from "@/components/NotificationToggle";
import { format, subDays, startOfDay, isSameDay, isAfter } from "date-fns";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getDaysUntilNextLevel, getNextAvatarLevel } from "@/lib/streakUtils";

export default function Vitals() {
    const { streakData } = useStreak();
    const [healthHistory, setHealthHistory] = useState<HealthCheck[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const checks = await fetchHealthChecks();
            setHealthHistory(checks || []);
        } catch (e) {
            console.error("Failed to fetch health checks", e);
        }
        if (!silent) setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRefresh = () => {
        loadData(true);
    };

    // Prepare Streak Chart Data
    const streakChartData = useMemo(() => {
        const data = [];
        const today = startOfDay(new Date());
        const start = streakData.startDate ? new Date(streakData.startDate) : null;

        for (let i = 14; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, "MMM d");

            let dayValue = 0;
            if (start && date >= startOfDay(start)) {
                dayValue = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            }

            const isMilestone = dayValue === 7 || dayValue === 14 || dayValue === 30;

            data.push({
                date: dateStr,
                days: Math.max(0, dayValue),
                milestone: isMilestone ? dayValue : null
            });
        }
        return data;
    }, [streakData.startDate]);

    const currentLiveDays = useMemo(() => {
        if (!streakData.startDate) return 0;
        return Math.floor((new Date().getTime() - new Date(streakData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    }, [streakData.startDate]);

    const nextLevel = getNextAvatarLevel(currentLiveDays);
    const daysToNext = getDaysUntilNextLevel(currentLiveDays);

    // Prepare NPT Chart Data
    const nptChartData = useMemo(() => {
        const data = [];
        const today = new Date();

        for (let i = 14; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, "MMM d");
            const check = healthHistory.find(h => isSameDay(new Date(h.timestamp), date));

            data.push({
                date: dateStr,
                value: check ? (check.npt ? 1 : 0.1) : 0,
                status: check ? (check.npt ? "YES" : "NO") : "MISSING"
            });
        }
        return data;
    }, [healthHistory]);

    if (loading) {
        return <LoadingScreen message="Syncing Bio-Signals" subMessage="Decoding Health Blockchain" />;
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="container max-w-4xl mx-auto px-4">
                <Header />

                <header className="mb-8 mt-4 page-transition" style={{ animationDelay: "0.1s" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display text-amber-900 tracking-tight">The Fortress</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/50">Vitals & Privacy Protocol</p>
                        </div>
                    </div>
                </header>

                <div className="mb-8 page-transition" style={{ animationDelay: "0.15s" }}>
                    <DailyHealthCheck onUpdate={handleRefresh} days={currentLiveDays} />
                </div>

                <div className="mb-8 page-transition" style={{ animationDelay: "0.2s" }}>
                    <div className="royal-card p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                                <ShieldCheck className="w-4 h-4 text-amber-500" />
                                Privacy Protocol
                            </div>
                            <PrivacySettings />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-amber-100">
                            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-widest px-1">
                                <Lock className="w-4 h-4 text-amber-500" />
                                Notification Protocol
                            </div>
                            <NotificationToggle />
                        </div>
                    </div>
                </div>

                <div className="grid gap-8">
                    {/* Mental Discipline Chart */}
                    <div className="royal-card overflow-hidden page-transition" style={{ animationDelay: "0.2s" }}>
                        <div className="p-5 border-b border-amber-200/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-amber-800">Mental Aql (العقل)</h3>
                                    <p className="text-[10px] font-bold text-amber-600/50 uppercase tracking-widest">Persistence Metrics</p>
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="p-2 hover:bg-amber-100/50 rounded-full transition-colors">
                                        <Info className="w-4 h-4 text-amber-400" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="rounded-2xl border-amber-200 bg-white">
                                    <DialogHeader>
                                        <DialogTitle className="text-amber-900 text-2xl font-display">Willpower Metrics</DialogTitle>
                                        <DialogDescription className="text-amber-800/70 font-medium text-sm pt-4">
                                            This reflects your Nafs al-Ammarah being tamed by Nafs al-Lawwama. Stay consistent to reach Nafs al-Mutma'innah.
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="p-6">
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={streakChartData} margin={{ left: -20, right: 10, top: 20 }}>
                                        <defs>
                                            <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d97706" strokeOpacity={0.1} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 700, fill: '#92400e' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 700, fill: '#92400e' }}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #fde68a',
                                                borderRadius: '12px',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="days"
                                            stroke="#d97706"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorDays)"
                                            animationDuration={1500}
                                        />
                                        {streakChartData.map((entry, idx) => (
                                            entry.milestone && (
                                                <ReferenceDot
                                                    key={`milestone-${idx}`}
                                                    x={entry.date}
                                                    y={entry.days}
                                                    r={6}
                                                    fill="#d97706"
                                                    stroke="#fff"
                                                    strokeWidth={2}
                                                    isFront={true}
                                                />
                                            )
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    <p className="text-[11px] text-amber-900 font-bold leading-tight uppercase tracking-tight">
                                        Current: {currentLiveDays} Days. {daysToNext > 0 ? `${daysToNext} days to ${nextLevel?.name}.` : 'Apex level achieved.'}
                                    </p>
                                </div>
                                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Physical Fitra Restoration Chart */}
                    <div className="royal-card overflow-hidden page-transition" style={{ animationDelay: "0.25s" }}>
                        <div className="p-5 border-b border-amber-200/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                    <Heart className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-amber-800">Physical Amanah (الأمانة)</h3>
                                    <p className="text-[10px] font-bold text-amber-600/50 uppercase tracking-widest">Vascular Bio-Signals</p>
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="p-2 hover:bg-amber-100/50 rounded-full transition-colors">
                                        <Info className="w-4 h-4 text-amber-400" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="rounded-2xl border-amber-200 bg-white">
                                    <DialogHeader>
                                        <DialogTitle className="text-amber-900 text-2xl font-display">Biological Amanah</DialogTitle>
                                        <DialogDescription className="text-amber-800/70 font-medium text-sm pt-4">
                                            Your body is a trust. Tracking NPT health ensures your biological Fitra is returning to its natural, healthy state.
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="p-6">
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={nptChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ec4899" strokeOpacity={0.05} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 700, fill: '#9d174d' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(244, 114, 182, 0.05)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white border border-rose-100 p-3 rounded-xl shadow-xl">
                                                            <p className="text-[10px] font-black uppercase text-rose-300 mb-1">{data.date}</p>
                                                            <p className={`text-xs font-black ${data.status === 'YES' ? 'text-rose-600' : data.status === 'NO' ? 'text-rose-900' : 'text-gray-300'}`}>
                                                                SIGNAL: {data.status}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                                            {nptChartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.status === 'YES' ? '#f43f5e' : entry.status === 'NO' ? '#9f1239' : '#fbcfe8'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-rose-500" />
                                    <p className="text-[11px] text-rose-900 font-bold leading-tight uppercase tracking-tight">
                                        Status: {healthHistory.filter(h => h.npt).length > 4 ? 'Optimal Integrity' : 'Gathering Data'}.
                                    </p>
                                </div>
                                <Target className="w-5 h-5 text-rose-900 animate-spin-slow" />
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-16 mb-8 text-center text-amber-800/20">
                    <p className="font-bold uppercase tracking-[0.5em] text-[10px]">NoFap Fursan Protocol // Persistence is Legend ⚔️</p>
                </footer>
            </div>
            <BottomNav />
        </div>
    );
}
