import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface LoadingScreenProps {
    message?: string;
    subMessage?: string;
}

export function LoadingScreen({
    message = "Scanning Bio-Signals",
    subMessage = "Decrypting Local Protocol"
}: LoadingScreenProps) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-8 overflow-hidden">
            <div className="relative">
                {/* Glowing outer ring */}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse scale-150" />

                {/* Animated Hydra Scanline */}
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center p-1"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                        className="bg-white p-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                    >
                        <Activity className="w-8 h-8 text-black" />
                    </motion.div>
                </motion.div>

                {/* Radar ping */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 border-2 border-white rounded-full"
                />
            </div>

            <div className="text-center space-y-3">
                <h2 className="text-white text-2xl font-black uppercase italic tracking-tighter">{message}</h2>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">{subMessage}</p>
                    <div className="w-48 h-[2px] bg-white/10 mt-2 overflow-hidden relative">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
