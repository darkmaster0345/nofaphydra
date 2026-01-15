import { THEMES } from "@/data/themes";
import { useTheme } from "@/context/ThemeContext";
import { Lock, Check, Sparkles, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function ThemeSelector() {
    const { currentTheme, setTheme, previewTheme, unlockedThemes } = useTheme();

    const handleSetTheme = (themeId: string, isUnlocked: boolean) => {
        if (!isUnlocked) {
            toast.error("Protocol Locked", {
                description: "Deepen your Sabr to unlock this visual realm."
            });
            return;
        }
        setTheme(themeId);
        toast.success("Aesthetics Updated", {
            description: `Activated ${THEMES.find(t => t.id === themeId)?.name}.`
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-800">Visual Protocols</h3>
                <span className="text-[10px] font-bold text-amber-600/40 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    {unlockedThemes.length}/{THEMES.length} Unlocked
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((theme) => {
                    const isUnlocked = unlockedThemes.includes(theme.id);
                    const isSelected = currentTheme.id === theme.id;

                    return (
                        <div
                            key={theme.id}
                            onClick={() => handleSetTheme(theme.id, isUnlocked)}
                            className={`
                                relative p-5 rounded-2xl border-2 transition-all duration-500 text-left group overflow-hidden
                                ${isSelected
                                    ? 'border-amber-400 bg-amber-50/50 shadow-lg shadow-amber-200/50'
                                    : 'border-amber-100 bg-white hover:border-amber-300 hover:shadow-md'}
                                ${!isUnlocked ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer'}
                            `}
                        >
                            {/* Theme color hint in background */}
                            <div
                                className="absolute -top-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-20 transition-all group-hover:opacity-40"
                                style={{ backgroundColor: theme.preview }}
                            />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-md ring-1 ring-amber-100"
                                    style={{ backgroundColor: theme.preview }}
                                />
                                {!isUnlocked ? (
                                    <div className="bg-amber-100 text-amber-400 p-1.5 rounded-lg">
                                        <Lock className="w-3.5 h-3.5" />
                                    </div>
                                ) : isSelected ? (
                                    <div className="bg-amber-400 text-white p-1.5 rounded-lg shadow-lg shadow-amber-500/20">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                ) : null}
                            </div>

                            <div className="relative z-10">
                                <p className="text-[11px] font-black uppercase tracking-widest text-amber-900">{theme.name}</p>
                                <p className="text-[9px] uppercase font-bold text-amber-700/40 leading-tight mt-1 mb-5">
                                    {isUnlocked ? theme.description : `Unlocks at DAY ${theme.minDays}`}
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-9 px-3 text-[9px] border border-amber-100 rounded-xl uppercase font-black tracking-widest hover:bg-amber-50 transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            previewTheme(theme.id);
                                            toast.info("Aesthetic Preview", {
                                                description: `Witnessing ${theme.name} for 3 seconds.`,
                                                duration: 3000
                                            });
                                        }}
                                    >
                                        <Eye className="w-3 h-3 mr-1.5 text-amber-500" />
                                        Preview
                                    </Button>
                                    {isUnlocked && !isSelected && (
                                        <Button
                                            size="sm"
                                            className="h-9 px-4 text-[9px] bg-amber-900 text-white hover:bg-amber-950 rounded-xl uppercase font-black tracking-widest transition-all shadow-md active:scale-95"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetTheme(theme.id, true);
                                            }}
                                        >
                                            Activate
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isSelected && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
