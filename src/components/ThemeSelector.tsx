import { THEMES } from "@/data/themes";
import { useTheme } from "@/context/ThemeContext";
import { Lock, Check } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function ThemeSelector() {
    const { currentTheme, setTheme, unlockedThemes } = useTheme();

    const handleSetTheme = (themeId: string, isUnlocked: boolean) => {
        if (!isUnlocked) {
            toast.error("Theme Locked", {
                description: "Increase your streak to unlock this protocol."
            });
            return;
        }
        setTheme(themeId);
        toast.success("Theme Applied", {
            description: `Activated ${THEMES.find(t => t.id === themeId)?.name}.`
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.3em]">Visual Protocols</h3>
                <span className="text-[10px] font-mono opacity-40 uppercase">
                    {unlockedThemes.length}/{THEMES.length} Unlocked
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                    const isUnlocked = unlockedThemes.includes(theme.id);
                    const isSelected = currentTheme.id === theme.id;

                    return (
                        <button
                            key={theme.id}
                            onClick={() => handleSetTheme(theme.id, isUnlocked)}
                            className={`
                relative p-4 border transition-all duration-300 text-left group
                ${isSelected ? 'border-primary bg-primary text-background' : 'border-primary/20 bg-background text-foreground hover:border-primary/50'}
                ${!isUnlocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div
                                    className="w-4 h-4 rounded-full border border-current"
                                    style={{ backgroundColor: theme.preview }}
                                />
                                {!isUnlocked ? (
                                    <Lock className="w-3 h-3 opacity-40" />
                                ) : isSelected ? (
                                    <Check className="w-4 h-4" />
                                ) : null}
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-widest">{theme.name}</p>
                            <p className="text-[8px] uppercase opacity-60 font-medium leading-tight mt-1">
                                {isUnlocked ? theme.description : `Unlocks at ${theme.minDays} days`}
                            </p>

                            {isSelected && (
                                <div className="absolute inset-0 border-2 border-primary animate-pulse pointer-events-none" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
