import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, AlertTriangle, Download, Upload } from "lucide-react";
import { exportKeys, importKey } from "@/services/nostr";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { useNostrStreak } from "@/hooks/useNostrStreak";
import { getStreakData, saveStreakData } from "@/lib/streakUtils";

export function SecuritySettings() {
    const [keys, setKeys] = useState<{ nsec: string; npub: string } | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [importNsec, setImportNsec] = useState("");
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);

    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const { fetchStreak, initializeKeys } = useNostrStreak();

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        const k = await exportKeys();
        setKeys(k);
    };

    // Hold to reveal logic
    const startHold = () => {
        if (isRevealed) {
            setIsRevealed(false);
            return;
        }

        setHoldProgress(0);
        const startTime = Date.now();
        const DURATION = 1000; // 1 second hold

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / DURATION) * 100, 100);
            setHoldProgress(progress);

            if (elapsed >= DURATION) {
                setIsRevealed(true);
                setHoldProgress(0);
                clearInterval(interval);
            }
        }, 50);

        holdTimerRef.current = interval;
    };

    const cancelHold = () => {
        if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        setHoldProgress(0);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handleImport = async () => {
        if (!importNsec.startsWith("nsec")) {
            toast.error("Invalid key format. Must start with 'nsec'.");
            return;
        }

        try {
            await importKey(importNsec);
            await initializeKeys(); // Reload hook state
            setImportDialogOpen(false);
            setImportNsec("");
            toast.success("Identity imported successfully!");

            // Auto-fetch streak
            toast.info("Restoring streak from relays...");
            const streak = await fetchStreak();

            if (streak) {
                // Save to local storage
                const localFormat = {
                    startDate: streak.startDate,
                    longestStreak: streak.longestStreak,
                    totalRelapses: streak.totalRelapses,
                };
                saveStreakData(localFormat);
                toast.success("Streak restored!");
                // Force refresh somehow? Window reload is nuclear but effective for this critical change
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.warning("No streak data found for this key.");
            }

            loadKeys(); // Refresh displayed keys
        } catch (error) {
            toast.error("Failed to import key. Please check it and try again.");
        }
    };

    return (
        <div className="space-y-6 p-4 border rounded-xl bg-card">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-semibold">Backup & Security</h2>
            </div>

            <div className="space-y-4">
                {/* Export Section */}
                <div className="space-y-3">
                    <Label>Your Private Key (nsec)</Label>
                    <div className="relative">
                        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background flex items-center overflow-hidden">
                            <span className="truncate font-mono">
                                {isRevealed && keys ? keys.nsec : "•••••••••••••••••••••••••••••••••••••"}
                            </span>
                        </div>

                        {/* Hold Progress Bar */}
                        {holdProgress > 0 && (
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full"
                            >
                                <div
                                    className="h-full bg-primary transition-all duration-75 ease-linear"
                                    style={{ width: `${holdProgress}%` }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={isRevealed ? "secondary" : "default"}
                            className="flex-1 select-none touch-none"
                            onMouseDown={startHold}
                            onMouseUp={cancelHold}
                            onMouseLeave={cancelHold}
                            onTouchStart={startHold}
                            onTouchEnd={cancelHold}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            {isRevealed ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                            {isRevealed ? "Hide Key" : "Hold to Reveal"}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => keys && copyToClipboard(keys.nsec, "Private Key")}
                            disabled={!isRevealed}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <AlertTriangle className="inline h-3 w-3 mr-1 text-amber-500" />
                        Never share your nsec! It gives full control over your account.
                    </p>
                </div>

                {/* Import Section */}
                <div className="pt-4 border-t">
                    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Import Existing Key
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Nostr Identity</DialogTitle>
                                <DialogDescription>
                                    Paste your private key (nsec) to restore your streak.
                                    <span className="block mt-2 font-bold text-destructive">
                                        Warning: This will overwrite your current identity on this device!
                                    </span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-2 py-4">
                                <Label htmlFor="nsec">Private Key</Label>
                                <Input
                                    id="nsec"
                                    placeholder="nsec1..."
                                    value={importNsec}
                                    onChange={(e) => setImportNsec(e.target.value)}
                                    className="font-mono"
                                />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleImport} disabled={!importNsec}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import & Restore
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
