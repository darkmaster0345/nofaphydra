import { useState, useEffect } from "react";
import { saveHealthCheck, fetchHealthChecks, HealthCheck } from "@/services/nostr";
import { Button } from "@/components/ui/button";
import { Shield, Activity, AlertCircle, Heart, CheckCircle2, Zap, CloudLightning, Sun } from "lucide-react";
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
import { luxuryClickVibrate } from "@/lib/vibrationUtils";
import { cn } from "@/lib/utils";

interface DailyHealthCheckProps {
    onUpdate?: () => void;
    days?: number;
}

export function DailyHealthCheck({ onUpdate, days = 0 }: DailyHealthCheckProps) {
    const [history, setHistory] = useState<HealthCheck[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMedicalAlert, setShowMedicalAlert] = useState(false);
    const [hasSubmitedToday, setHasSubmitedToday] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [tempNpt, setTempNpt] = useState<boolean | null>(null);
    const [isEmergencyLocked, setIsEmergencyLocked] = useState(false);
    const [isCompletionConfirmed, setIsCompletionConfirmed] = useState(false);

    useEffect(() => {
        loadHealthData();
    }, []);

    const loadHealthData = async () => {
        try {
            setLoading(true);
            const data = await fetchHealthChecks();
            setHistory(data);

            const latest = data[0];
            if (latest && latest.mindset === 'stormy' && !localStorage.getItem('fursan_stormy_resolved')) {
                setIsEmergencyLocked(true);
            }

            // Check if already submitted today
            const today = new Date().toDateString();
            const submittedToday = data.some(entry => new Date(entry.timestamp).toDateString() === today);
            setHasSubmitedToday(submittedToday);

            // Check for medical alert (14 days of 'No')
            if (data.length >= 14 && (days >= 4)) {
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

    const handleNptStep = (npt: boolean) => {
        setTempNpt(npt);
        setStep(2);
        luxuryClickVibrate();
    };

    const handleMindsetStep = async (mindset: HealthCheck['mindset']) => {
        if (tempNpt === null) return;

        setSaving(true);
        const entry: HealthCheck = {
            npt: tempNpt,
            mindset,
            timestamp: Date.now(),
        };

        const success = await saveHealthCheck(entry);
        if (success) {
            await luxuryClickVibrate();
            toast.success("Protocol data synchronized. 🛡️");
            logActivity('health_check', `Signal: ${tempNpt ? 'YES' : 'NO'}, Mindset: ${mindset.toUpperCase()}`);

            setHasSubmitedToday(true);
            setHistory([entry, ...history]);

            if (mindset === 'stormy') {
                localStorage.removeItem('fursan_stormy_resolved');
                setIsEmergencyLocked(true);
            }

            if (onUpdate) onUpdate();

            // Foggy Penalty Check
            if (mindset === 'foggy') {
                const last3 = [entry, ...history].slice(0, 3);
                if (last3.length === 3 && last3.every(e => e.mindset === 'foggy')) {
                    toast.warning("Mental Pollution detected. Tighten your discipline.");
                }
            }
        } else {
            toast.error("Failed to broadcast protocol results.");
        }
        setSaving(false);
    };

    const resolveEmergency = async () => {
        if (!isCompletionConfirmed) return;
        setIsEmergencyLocked(false);
        localStorage.setItem('fursan_stormy_resolved', 'true');
        toast.success("Protocol Restored. Stay vigilant.");
        await luxuryClickVibrate();
    };

    const getHealthStatus = () => {
        if (history.length === 0) return null;

        const last7 = history.slice(0, 7);
        const yesCount = last7.filter(e => e.npt).length;

        // Initial phase logic
        if (days < 4) {
            return {
                status: "STABILIZING",
                color: "text-blue-600",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
                insight: "System recalibrating. Focus on the Protocol.",
                icon: <Zap className="w-4 h-4" />
            };
        }

        if (yesCount >= 4) return {
            status: "OPTIMAL",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            insight: "Hormones and Blood Flow are in great shape.",
            icon: <Shield className="w-4 h-4" />
        };

        if (yesCount >= 1) return {
            status: "WARNING",
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            insight: "Markers below baseline. Refine sleep and discipline.",
            icon: <AlertCircle className="w-4 h-4" />
        };

        return {
            status: "CRITICAL",
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            insight: "Critical markers detected. Immediate protocol tightening required.",
            icon: <Activity className="w-4 h-4" />
        };
    };

    const statusInfo = getHealthStatus();

    if (loading) return null;

    if (isEmergencyLocked) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 page-transition">
                <div className="royal-card bg-white w-full max-w-md p-8 text-center space-y-6">
                    <CloudLightning className="w-16 h-16 mx-auto text-red-600 animate-pulse" />
                    <h2 className="text-3xl font-black text-amber-900 uppercase tracking-tighter">Mission At Risk</h2>
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 space-y-3">
                        <p className="text-sm font-bold text-red-900 leading-relaxed uppercase tracking-widest">
                            Execute Protocol: Cold Shower or 50 Pushups Immediately.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 justify-center p-3">
                        <input
                            type="checkbox"
                            id="confirm-emergency"
                            checked={isCompletionConfirmed}
                            onChange={(e) => setIsCompletionConfirmed(e.target.checked)}
                            className="w-5 h-5 accent-amber-900"
                        />
                        <label htmlFor="confirm-emergency" className="text-xs font-black uppercase text-amber-800">I have completed the recovery protocol</label>
                    </div>

                    <Button
                        disabled={!isCompletionConfirmed}
                        onClick={resolveEmergency}
                        className="w-full h-14 bg-amber-900 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl disabled:opacity-30"
                    >
                        Unlock Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 page-transition" style={{ animationDelay: "0.05s" }}>
            <div className="royal-card overflow-hidden">
                <div className="p-5 border-b border-amber-200/50">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-800/20 to-amber-900/10 flex items-center justify-center border border-amber-100">
                                <Shield className="w-5 h-5 text-amber-900" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight text-amber-800">Daily Protocol</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/50">Bio-Mental Verification</p>
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

                <div className="p-6">
                    {!hasSubmitedToday ? (
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2">
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600/40">Pillar 1: Biological Signal</p>
                                        <h4 className="text-lg font-black text-amber-900 uppercase">Morning Signal Detected?</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            onClick={() => handleNptStep(true)}
                                            className="h-20 rounded-2xl border-2 border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-700 font-black text-xl transition-all shadow-sm hover:shadow-md"
                                        >
                                            YES
                                        </Button>
                                        <Button
                                            onClick={() => handleNptStep(false)}
                                            className="h-20 rounded-2xl border-2 border-rose-100 bg-white hover:bg-rose-50 text-rose-700 font-black text-xl transition-all shadow-sm hover:shadow-md"
                                        >
                                            NO
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center space-y-2">
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600/40">Pillar 2: Mindset Status</p>
                                        <h4 className="text-lg font-black text-amber-900 uppercase">Current Mindset Status?</h4>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleMindsetStep('sharp')}
                                            disabled={saving}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                                        >
                                            <Sun className="w-5 h-5" />
                                            Sharp
                                        </button>
                                        <button
                                            onClick={() => handleMindsetStep('foggy')}
                                            disabled={saving}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-amber-100 bg-white hover:bg-amber-50 text-amber-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                                        >
                                            <CloudLightning className="w-5 h-5 opacity-40" />
                                            Foggy
                                        </button>
                                        <button
                                            onClick={() => handleMindsetStep('stormy')}
                                            disabled={saving}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-100 bg-white hover:bg-red-50 text-red-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                                        >
                                            <CloudLightning className="w-5 h-5" />
                                            Stormy
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/30 hover:text-amber-600/60"
                                    >
                                        Back to Physical signal
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Protocol Sealed</p>
                                <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Daily verification complete. Return at Fajr.</p>
                            </div>
                            {statusInfo && statusInfo.insight && (
                                <div className={cn("text-[10px] font-black uppercase tracking-widest p-3 rounded-xl border opacity-80", statusInfo.bgColor, statusInfo.borderColor, statusInfo.color)}>
                                    ⚡ {statusInfo.insight}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showMedicalAlert} onOpenChange={setShowMedicalAlert}>
                <DialogContent className="rounded-2xl border-amber-200 bg-white max-w-md shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 font-black uppercase text-xl">
                            <Activity className="w-6 h-6" /> Health Insight
                        </DialogTitle>
                        <DialogDescription className="text-gray-700 font-medium text-sm pt-4">
                            🛡️ We've noticed a lack of NPT for 2 weeks. This is a primary indicator of vascular health.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 my-4">
                        <p className="text-sm text-red-900 font-bold italic">
                            "We recommend a routine check-up with a urologist to ensure your cardiovascular system is 100%."
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full rounded-xl bg-amber-900 text-white font-black uppercase tracking-widest h-12 shadow-lg hover:bg-black"
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

