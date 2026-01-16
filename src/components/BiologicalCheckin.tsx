import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { luxuryClickVibrate } from "@/lib/vibrationUtils";

interface BiologicalCheckinProps {
    onCheckin: (npt: boolean) => void;
    saving?: boolean;
}

export function BiologicalCheckin({ onCheckin, saving }: BiologicalCheckinProps) {
    return (
        <div className="royal-card p-6 space-y-6 page-transition">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/40">Physical Pillar</p>
                <h4 className="text-lg font-black text-amber-900 uppercase tracking-tighter">Morning Signal Detected?</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={() => { luxuryClickVibrate(); onCheckin(true); }}
                    disabled={saving}
                    className="h-16 rounded-2xl border-2 border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-700 font-black text-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    YES <CheckCircle2 className="ml-2 w-5 h-5 text-emerald-500" />
                </Button>
                <Button
                    onClick={() => { luxuryClickVibrate(); onCheckin(false); }}
                    disabled={saving}
                    className="h-16 rounded-2xl border-2 border-rose-100 bg-white hover:bg-rose-50 text-rose-700 font-black text-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    NO <AlertCircle className="ml-2 w-5 h-5 text-rose-500" />
                </Button>
            </div>
            <div className="flex items-center gap-2 justify-center pt-2">
                <Shield className="w-3 h-3 text-amber-600/30" />
                <p className="text-[9px] font-bold text-amber-600/30 uppercase tracking-widest">Biological Integrity Verification</p>
            </div>
        </div>
    );
}
