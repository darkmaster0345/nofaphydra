import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { saveJournalEntry, fetchJournalEntries, JournalEntry } from "@/services/nostr";
import { Loader2, Plus, PenLine, Battery, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { logActivity } from "@/lib/activityLog";

export default function Journal() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [mood, setMood] = useState([5]);
    const [energy, setEnergy] = useState([5]);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            setLoading(true);
            const data = await fetchJournalEntries();
            setEntries(data || []);
        } catch (e) {
            console.error("Failed to load journal", e);
            toast.error("Relay connection timed out.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!content.trim()) {
            toast.error("Entry content required.");
            return;
        }

        setSaving(true);
        const entry: JournalEntry = {
            content,
            mood: mood[0],
            energy: energy[0],
            timestamp: Date.now(),
        };

        const success = await saveJournalEntry(entry);
        if (success) {
            toast.success("Signal Encrypted & Broadcasted! 🐉");
            logActivity('journal_save', `Journal entry saved (Mood: ${mood[0]}/10, Energy: ${energy[0]}/10)`);
            setContent("");
            setMood([5]);
            setEnergy([5]);
            setShowForm(false);
            setEntries([entry, ...entries]);
        } else {
            toast.error("Transmission Failure.");
        }
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto px-4 pb-24">
                <Header />

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-tighter italic">Personal Logs</h1>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-none border border-black bg-black text-white hover:bg-black/90 uppercase text-[10px] font-black tracking-widest h-10 px-6"
                    >
                        {showForm ? "DISCARD" : <><Plus className="w-4 h-4 mr-2" /> NEW LOG</>}
                    </Button>
                </div>

                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-black p-6 mb-8 space-y-6 animate-in fade-in duration-300"
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-black/40">
                                        Mood Matrix ({mood[0]}/10)
                                    </Label>
                                    <Slider value={mood} onValueChange={setMood} min={1} max={10} step={1} className="py-2 grayscale" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-black/40">
                                        Energy Core ({energy[0]}/10)
                                    </Label>
                                    <Slider value={energy} onValueChange={setEnergy} min={1} max={10} step={1} className="py-2 grayscale" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-black/40">Cognitive Reflection</Label>
                                <Textarea
                                    placeholder="DOCUMENT YOUR JOURNEY..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[160px] bg-white border-black rounded-none font-sans text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-black/20"
                                />
                            </div>

                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-none uppercase text-xs font-black tracking-widest border border-black transition-all active:scale-95 shadow-none"
                            >
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PenLine className="w-4 h-4 mr-2" />}
                                {saving ? "ENCRYPTING SIGNAL..." : "BROADCAST LOG"}
                            </Button>
                        </div>
                    </motion.div>
                )}

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-black" strokeWidth={3} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Fetching Encrypted Records...</p>
                        </div>
                    ) : entries?.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-black/20">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">No archived history detected</p>
                        </div>
                    ) : (
                        entries?.map((entry, i) => (
                            <motion.div
                                key={entry.id || i}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white border border-black p-6 space-y-4 animate-in fade-in"
                            >
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest border-b border-black/5 pb-3">
                                    <span className="text-black">{format(entry.timestamp, "MMM d, yyyy • h:mm a")}</span>
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1.5"><Smile className="w-3 h-3" /> M:{entry.mood}</span>
                                        <span className="flex items-center gap-1.5"><Battery className="w-3 h-3" /> E:{entry.energy}</span>
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                                    {entry.content}
                                </p>
                            </motion.div>
                        ))
                    )}
                </div>

            </div>
            <BottomNav />
        </div>
    );
}
