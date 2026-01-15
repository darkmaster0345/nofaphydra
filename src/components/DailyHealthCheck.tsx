import { useState, useEffect } from "react";
import { saveHealthCheck, fetchHealthChecks, HealthCheck } from "@/services/nostr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Activity, AlertCircle, Heart, CheckCircle2, Info } from "lucide-react";
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
            color: "text-green-600",
            insight: "Hormones (Testosterone) and Blood Flow are in great shape.",
            icon: <CheckCircle2 className="w-4 h-4" />
        };
        if (yesCount >= 1) return {
            status: "WARNING",
            color: "text-yellow-600",
            insight: "Could be due to poor sleep quality, high stress, or early signs of low T.",
            icon: <AlertCircle className="w-4 h-4" />
        };

        // Check for 14 days of 'No'
        if (history.length >= 14 && history.slice(0, 14).every(e => !e.npt)) {
            return {
                status: "CRITICAL",
                color: "text-red-600",
                insight: "Critical: Early warning sign of heart disease or diabetes.",
                icon: <Activity className="w-4 h-4" />
            };
        }

        return { status: "MONITORING", color: "text-blue-600", insight: "Gathering biological data...", icon: <Info className="w-4 h-4" /> };
    };

    const statusInfo = getHealthStatus();

    if (loading) return null;

    return (
        <div className="space-y-4">
            <Card className="rounded-none border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Bio-Telemetry Input</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1">
                                Morning Wood / NPT Health Signal
                            </CardDescription>
                        </div>
                        {statusInfo && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 border border-black text-[9px] font-black ${statusInfo.color}`}>
                                {statusInfo.icon}
                                {statusInfo.status}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-black/5 p-4 border border-black/10">
                        <p className="text-sm font-medium leading-relaxed">
                            Did you experience <span className="font-black italic underline">Morning Wood</span> (NPT) today?
                        </p>
                        <p className="text-[10px] text-black/60 uppercase font-bold mt-2 flex items-center gap-1">
                            <Info className="w-3 h-3" /> A quick check of your biological health markers.
                        </p>
                    </div>

                    {statusInfo && statusInfo.insight && (
                        <div className={`text-[10px] font-bold uppercase tracking-wide p-2 border border-black/5 bg-black/[0.02] ${statusInfo.color}`}>
                            {statusInfo.insight}
                        </div>
                    )}

                    {!hasSubmitedToday ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => handleCheck(true)}
                                disabled={saving}
                                className="h-16 rounded-none border-black hover:bg-green-50 hover:text-green-600 transition-all font-black text-lg group"
                            >
                                YES <CheckCircle2 className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleCheck(false)}
                                disabled={saving}
                                className="h-16 rounded-none border-black hover:bg-red-50 hover:text-red-600 transition-all font-black text-lg group"
                            >
                                NO <AlertCircle className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </div>
                    ) : (
                        <div className="py-4 text-center border border-dashed border-black/20">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Daily Check Complete</p>
                            <p className="text-xs font-bold mt-1">Biological markers logged. Stay disciplined.</p>
                        </div>
                    )}

                    <div className="flex items-start gap-3 bg-blue-50/50 p-3 border border-blue-200/50">
                        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-tight text-blue-800">Privacy Protocol Active</p>
                            <p className="text-[10px] text-blue-700/80 font-medium leading-tight mt-0.5">
                                This data is encrypted using NIP-44. Not even the developers can see your health logs. Only your private key can decrypt this signal.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showMedicalAlert} onOpenChange={setShowMedicalAlert}>
                <DialogContent className="rounded-none border-black bg-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 font-black uppercase italic text-2xl">
                            <Activity className="w-8 h-8" /> Health Insight
                        </DialogTitle>
                        <DialogDescription className="text-black font-medium text-base pt-4">
                            🛡️ We've noticed a lack of NPT for 2 weeks. While this can be caused by stress, it is also a primary indicator of vascular health.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-red-50 p-4 border border-red-100 my-4">
                        <p className="text-sm text-red-900 font-bold italic">
                            "We recommend a routine check-up with a urologist to ensure your cardiovascular system is 100%."
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full rounded-none bg-black text-white font-black uppercase tracking-widest h-12"
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
