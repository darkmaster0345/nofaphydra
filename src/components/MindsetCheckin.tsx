import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, CloudLightning, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { luxuryClickVibrate } from "@/lib/vibrationUtils";
import { HealthCheck } from "@/services/nostr";

interface MindsetCheckinProps {
    onCheckin: (mindset: HealthCheck['mindset']) => void;
    saving?: boolean;
}

export function MindsetCheckin({ onCheckin, saving }: MindsetCheckinProps) {
    return (
        <div className="royal-card p-6 space-y-6 page-transition">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/40">Mental Pillar</p>
                <h4 className="text-lg font-black text-amber-900 uppercase tracking-tighter">Current Mindset Status?</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => { luxuryClickVibrate(); onCheckin('sharp'); }}
                    disabled={saving}
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 group"
                >
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <Sun className="w-5 h-5" />
                    </div>
                    Sharp
                </button>
                <button
                    onClick={() => { luxuryClickVibrate(); onCheckin('foggy'); }}
                    disabled={saving}
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-amber-100 bg-white hover:bg-amber-50 text-amber-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 group"
                >
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                        <CloudLightning className="w-5 h-5 opacity-40" />
                    </div>
                    Foggy
                </button>
                <button
                    onClick={() => { luxuryClickVibrate(); onCheckin('stormy'); }}
                    disabled={saving}
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-red-100 bg-white hover:bg-red-50 text-red-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 group"
                >
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <CloudLightning className="w-5 h-5 text-red-500" />
                    </div>
                    Stormy
                </button>
            </div>
        </div>
    );
}
