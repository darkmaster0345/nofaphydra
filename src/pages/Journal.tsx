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
        setLoading(true);
        const data = await fetchJournalEntries();
        setEntries(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!content.trim()) {
            toast.error("Please write something!");
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
            toast.success("Journal saved securely to Nostr!");
            setContent("");
            setMood([5]);
            setEnergy([5]);
            setShowForm(false);
            // Optimistic update
            setEntries([entry, ...entries]);
        } else {
            toast.error("Failed to save entry.");
        }
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto px-4 pb-24">
                <Header />

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-display text-foreground">Daily Check-In</h1>
                    <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"}>
                        {showForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> New Entry</>}
                    </Button>
                </div>

                {/* Entry Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-xl p-6 mb-8 space-y-6 shadow-sm"
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2"><Smile className="w-4 h-4 text-primary" /> Mood ({mood[0]}/10)</Label>
                                    <Slider value={mood} onValueChange={setMood} min={1} max={10} step={1} className="py-2" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2"><Battery className="w-4 h-4 text-yellow-500" /> Energy ({energy[0]}/10)</Label>
                                    <Slider value={energy} onValueChange={setEnergy} min={1} max={10} step={1} className="py-2" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Learnings & Reflections</Label>
                                <Textarea
                                    placeholder="How are you feeling today? What did you learn?"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[120px] bg-secondary/50 font-sans text-base"
                                />
                            </div>

                            <Button onClick={handleSave} disabled={saving} className="w-full">
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PenLine className="w-4 h-4 mr-2" />}
                                {saving ? "Encrypting & Saving..." : "Save Entry"}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Entries List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No journal entries yet. Start tracking your journey!</p>
                        </div>
                    ) : (
                        entries.map((entry, i) => (
                            <motion.div
                                key={entry.id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-card/50 border border-border/50 rounded-xl p-5 hover:bg-card transition-colors"
                            >
                                <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                                    <span>{format(entry.timestamp, "MMM d, yyyy • h:mm a")}</span>
                                    <div className="flex gap-3">
                                        <span className="flex items-center gap-1"><Smile className="w-3 h-3" /> {entry.mood}</span>
                                        <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> {entry.energy}</span>
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-sans">
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
