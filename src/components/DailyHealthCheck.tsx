import { useState, useEffect } from "react";
import { saveHealthCheck, fetchHealthChecks, HealthCheck } from "@/services/nostr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Activity, AlertCircle, Heart, CheckCircle2, Info, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { logActivity } from "@/lib/activityLog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface DailyHealthCheckProps {
    onUpdate?: () => void;
}

export function DailyHealthCheck({ onUpdate }: DailyHealthCheckProps) {
    const [history, setHistory] = useState<HealthCheck[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMedicalAlert, setShowMedicalAlert] = useState(false);
    const [hasSubmitedToday, setHasSubmitedToday] = useState(false);

    useEffect(() => {
        loadHealthData();
    }, []);

    const loadHealthData = async () => {
        try {
            setLoading(true);
            const data = await fetchHealthChecks();
            setHistory(data);

            // Check if already submitted today
            const today = new Date().toDateString();
            const submittedToday = data.some(entry => new Date(entry.timestamp).toDateString() === today);
            setHasSubmitedToday(submittedToday);

            // Check for medical alert (14 days of 'No')
            if (data.length >= 14) {
                const last14 = data.slice(0, 14);
                const allNo = last14.every(entry => !entry.npt);
                if (allNo) {
                    setShowMedicalAlert(true);
                }
            }
        } catch (e) {
            console.error("Failed to load health data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCheck = async (npt: boolean) => {
        setSaving(true);
        const entry: HealthCheck = {
            npt,
            timestamp: Date.now(),
        };

        const success = await saveHealthCheck(entry);
        if (success) {
            // Haptic feedback for native feel
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
            toast.success("Health signal encrypted and synchronized. 🛡️");
            logActivity('health_check', `NPT Check: ${npt ? 'YES' : 'NO'}`);
            setHasSubmitedToday(true);
            setHistory([entry, ...history]);
            if (onUpdate) onUpdate();

            // Re-check medical alert after new entry
            const newHistory = [entry, ...history];
            if (newHistory.length >= 14) {
                const last14 = newHistory.slice(0, 14);
                const allNo = last14.every(e => !e.npt);
                if (allNo) setShowMedicalAlert(true);
            }
        } else {
            toast.error("Failed to broadcast health signal.");
        }
        setSaving(false);
    };

    const getHealthStatus = () => {
        if (history.length === 0) return null;

        // Use last 7 entries to determine weekly frequency status
        const last7 = history.slice(0, 7);
        const yesCount = last7.filter(e => e.npt).length;

        if (yesCount >= 4) return {
            status: "OPTIMAL",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            insight: "Hormones (Testosterone) and Blood Flow are in great shape.",
            icon: <CheckCircle2 className="w-4 h-4" />
        };
        if (yesCount >= 1) return {
            status: "WARNING",
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            insight: "Could be due to poor sleep quality, high stress, or early signs of low T.",
            icon: <AlertCircle className="w-4 h-4" />
        };

        // Check for 14 days of 'No'
        if (history.length >= 14 && history.slice(0, 14).every(e => !e.npt)) {
            return {
                status: "CRITICAL",
                color: "text-red-600",
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
                insight: "Critical: Early warning sign of heart disease or diabetes.",
                icon: <Activity className="w-4 h-4" />
            };
        }

        return {
            status: "MONITORING",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            insight: "Gathering biological data...",
            icon: <Info className="w-4 h-4" />
        };
    };

    const statusInfo = getHealthStatus();

    if (loading) return null;

    return (
        <div className="space-y-4 page-transition" style={{ animationDelay: "0.05s" }}>
            <div className="royal-card overflow-hidden">
                <div className="p-5 border-b border-amber-200/50">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight text-amber-800">Bio-Signal Check</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/50">Morning Health Marker</p>
                            </div>
                        </div>
                        {statusInfo && (
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border text-[9px] font-bold ${statusInfo.color}`}>
                                {statusInfo.icon}
                                {statusInfo.status}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-5 space-y-5">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50">
                        <p className="text-sm font-medium leading-relaxed text-amber-800">
                            Did you experience <span className="font-black italic text-amber-600">Morning Wood</span> (NPT) today?
                        </p>
                        <p className="text-[10px] text-amber-600/70 uppercase font-bold mt-2 flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" /> A quick check of your biological health markers.
                        </p>
                    </div>

                    {statusInfo && statusInfo.insight && (
                        <div className={`text-[11px] font-medium p-3 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border ${statusInfo.color}`}>
                            💡 {statusInfo.insight}
                        </div>
                    )}

                    {!hasSubmitedToday ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => handleCheck(true)}
                                disabled={saving}
                                className="h-16 rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-400 transition-all font-black text-lg text-emerald-700 group shadow-md hover:shadow-lg"
                            >
                                YES <CheckCircle2 className="ml-2 w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleCheck(false)}
                                disabled={saving}
                                className="h-16 rounded-xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 hover:border-rose-400 transition-all font-black text-lg text-rose-700 group shadow-md hover:shadow-lg"
                            >
                                NO <AlertCircle className="ml-2 w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </div>
                    ) : (
                        <div className="py-5 text-center rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Daily Check Complete</p>
                            <p className="text-[11px] font-medium mt-1 text-emerald-600/70">Biological markers logged. Stay disciplined.</p>
                        </div>
                    )}

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
                        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-tight text-blue-800">Privacy Protocol Active</p>
                            <p className="text-[10px] text-blue-700/80 font-medium leading-tight mt-0.5">
                                This data is encrypted using NIP-44. Only your private key can decrypt this signal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showMedicalAlert} onOpenChange={setShowMedicalAlert}>
                <DialogContent className="rounded-2xl border-amber-200 bg-white max-w-md shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 font-black uppercase text-xl">
                            <Activity className="w-6 h-6" /> Health Insight
                        </DialogTitle>
                        <DialogDescription className="text-gray-700 font-medium text-sm pt-4">
                            🛡️ We've noticed a lack of NPT for 2 weeks. While this can be caused by stress, it is also a primary indicator of vascular health.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 my-4">
                        <p className="text-sm text-red-900 font-bold italic">
                            "We recommend a routine check-up with a urologist to ensure your cardiovascular system is 100%."
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black uppercase tracking-widest h-12 shadow-lg shadow-amber-500/30 hover:shadow-xl"
                            onClick={() => setShowMedicalAlert(false)}
                        >
                            ACKNOWLEDGED
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
