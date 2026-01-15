import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { DailyHealthCheck } from "@/components/DailyHealthCheck";
import { fetchHealthChecks, HealthCheck } from "@/services/nostr";
import { getActivityLog } from "@/lib/activityLog";
import { useStreak } from "@/hooks/useStreak";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Label, ReferenceDot
} from "recharts";
import { Heart, Brain, Activity, ShieldCheck, Info, Flame, Target } from "lucide-react";
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

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const checks = await fetchHealthChecks();
                setHealthHistory(checks || []);
            } catch (e) {
                console.error("Failed to fetch health checks", e);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    // Prepare Streak Chart Data (Mental Discipline) - FOG OF WAR IMPLEMENTED
    const streakChartData = useMemo(() => {
        const data = [];
        const today = startOfDay(new Date());
        const start = streakData.startDate ? new Date(streakData.startDate) : null;

        for (let i = 14; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, "MMM d");

            // Fog of war: Future dates or "ahead of today" shouldn't exist in historical record
            // but since we are always looking back from today, every point i>=0 is <= today.

            let dayValue = 0;
            if (start && date >= startOfDay(start)) {
                dayValue = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            }

            // Milestone flags
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

    // Prepare NPT Chart Data (Physical Recovery)
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
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40 animate-pulse">Scanning Vitals...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="container max-w-4xl mx-auto px-4">
                <Header />

                <header className="mb-8 mt-4">
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                        <Activity className="w-8 h-8" />
                        Biological Vitals
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mt-1">
                        Real-time tracking of mental and physical recovery
                    </p>
                </header>

                <div className="mb-8">
                    <DailyHealthCheck />
                </div>

                <div className="grid gap-6">
                    {/* Mental Discipline Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="rounded-none border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                            <CardHeader className="pb-2 border-b border-black/5 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-tight">Mental Discipline</CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-black/40">Streak Continuity (15D)</CardDescription>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                            <Info className="w-4 h-4 text-black/40" />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-none border-black">
                                        <DialogHeader>
                                            <DialogTitle className="font-black uppercase italic tracking-tighter">Willpower Telemetry</DialogTitle>
                                            <DialogDescription className="text-black font-medium text-sm pt-4">
                                                Tracks your streak continuity. Higher peaks represent stabilized dopamine levels and improved prefrontal cortex control.
                                                Each day of discipline strengthens the neural pathways associated with self-regulation.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={streakChartData} margin={{ left: 10, right: 10, top: 20 }}>
                                            <defs>
                                                <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" strokeOpacity={0.05} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 9, fontWeight: 900, fill: '#0008' }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 9, fontWeight: 900, fill: '#0008' }}
                                                allowDecimals={false}
                                            >
                                                <Label
                                                    value="WILLPOWER LEVEL"
                                                    angle={-90}
                                                    position="insideLeft"
                                                    style={{ fontSize: '8px', fontWeight: 900, fill: '#0004' }}
                                                    offset={0}
                                                />
                                            </YAxis>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid black', borderRadius: '0', fontSize: '10px', fontWeight: 'bold' }}
                                                cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="days"
                                                stroke="#8b5cf6"
                                                strokeWidth={3}
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
                                                        fill="#000"
                                                        stroke="#fff"
                                                        strokeWidth={2}
                                                        isFront={true}
                                                    />
                                                )
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-3 bg-purple-50 border border-purple-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Info className="w-4 h-4 text-purple-600 shrink-0" />
                                        <p className="text-[10px] text-purple-900 font-bold leading-tight uppercase tracking-tight">
                                            Current Strength: {currentLiveDays} Days. {daysToNext > 0 ? `${daysToNext} days away from ${nextLevel?.name || 'Milestone'}.` : 'Max biological level achieved.'}
                                        </p>
                                    </div>
                                    <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Physical Recovery Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <Card className="rounded-none border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                            <CardHeader className="pb-2 border-b border-black/5 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-600" />
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-tight">Physical recovery</CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-black/40">NPT Frequency (15D)</CardDescription>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                            <Info className="w-4 h-4 text-black/40" />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-none border-black">
                                        <DialogHeader>
                                            <DialogTitle className="font-black uppercase italic tracking-tighter">Vascular Telemetry</DialogTitle>
                                            <DialogDescription className="text-black font-medium text-sm pt-4">
                                                Tracks NPT (Nocturnal Penile Tumescence) frequency. Regular signals indicate recovering cardiovascular health, proper blood flow, and hormonal balance.
                                                NPT is a primary biological indicator of physical vitality.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={nptChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" strokeOpacity={0.05} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 9, fontWeight: 900, fill: '#0008' }}
                                            />
                                            <YAxis width={20}>
                                                <Label
                                                    value="VASCULAR SIGNAL"
                                                    angle={-90}
                                                    position="insideLeft"
                                                    style={{ fontSize: '8px', fontWeight: 900, fill: '#0004' }}
                                                    offset={5}
                                                />
                                            </YAxis>
                                            <Tooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-white border border-black p-2 shadow-sm">
                                                                <p className="text-[10px] font-black uppercase">{data.date}</p>
                                                                <p className={`text-xs font-black ${data.status === 'YES' ? 'text-green-600' : data.status === 'NO' ? 'text-red-500' : 'text-gray-400'}`}>
                                                                    NPT: {data.status}
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                                                {nptChartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.status === 'YES' ? '#ef4444' : entry.status === 'NO' ? '#7f1d1d' : '#e5e7eb'}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                                        <p className="text-[10px] text-red-900 font-bold leading-tight uppercase tracking-tight">
                                            Status: {healthHistory.filter(h => h.npt).length > 4 ? 'Vascular Optimal' : 'Monitoring Signal'}. Vascular integrity protocol in effect.
                                        </p>
                                    </div>
                                    <Target className="w-4 h-4 text-black animate-spin-slow" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <footer className="mt-12 text-center text-muted-foreground">
                    <p className="font-bold uppercase tracking-widest text-[9px] opacity-40">NoFap Hydra Protocol // Stay disciplined. Become legendary. 🐉</p>
                </footer>
            </div>
            <BottomNav />
        </div>
    );
}
