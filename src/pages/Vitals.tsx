import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { fetchHealthChecks, HealthCheck } from "@/services/nostr";
import { getActivityLog } from "@/lib/activityLog";
import { useStreak } from "@/hooks/useStreak";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from "recharts";
import { Heart, Brain, Activity, ShieldCheck, Info } from "lucide-react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { motion } from "framer-motion";

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

    // Prepare Streak Chart Data (Mental Discipline)
    const streakChartData = useMemo(() => {
        const data = [];
        const today = new Date();
        const start = streakData.startDate ? new Date(streakData.startDate) : null;

        for (let i = 14; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, "MMM d");

            let dayValue = 0;
            if (start && date >= startOfDay(start)) {
                dayValue = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            }

            data.push({ date: dateStr, days: Math.max(0, dayValue) });
        }
        return data;
    }, [streakData.startDate]);

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

                <div className="grid gap-6">
                    {/* Mental Discipline Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="rounded-none border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader className="pb-2 border-b border-black/5">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-tight">Mental Discipline</CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-black/40">Streak Continuity (15D)</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={streakChartData}>
                                            <defs>
                                                <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
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
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid black', borderRadius: '0', fontSize: '10px', fontWeight: 'bold' }}
                                                cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            />
                                            <Area
                                                type="stepAfter"
                                                dataKey="days"
                                                stroke="#000"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorDays)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-3 bg-purple-50 border border-purple-100 flex items-center gap-3">
                                    <Info className="w-4 h-4 text-purple-600 shrink-0" />
                                    <p className="text-[10px] text-purple-900 font-bold leading-tight uppercase tracking-tight">
                                        resilience is built in the gaps between relapses. keep climbing.
                                    </p>
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
                        <Card className="rounded-none border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader className="pb-2 border-b border-black/5">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-600" />
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-tight">Physical recovery</CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-black/40">NPT Frequency (15D)</CardDescription>
                                    </div>
                                </div>
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
                                            <YAxis hide />
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
                                                        fill={entry.status === 'YES' ? '#16a34a' : entry.status === 'NO' ? '#ef4444' : '#e5e7eb'}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 flex items-center gap-3">
                                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                                    <p className="text-[10px] text-blue-900 font-bold leading-tight uppercase tracking-tight">
                                        bio-dashboard monitoring vascular health. encrypted signal active.
                                    </p>
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
