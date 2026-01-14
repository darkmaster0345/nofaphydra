import React, { useState } from 'react';
import { useNostrContext } from '@/context/NostrContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wifi, WifiOff, Plus, Trash2 } from 'lucide-react';

export const RelaySettings = () => {
    const { relays, connectedRelays, addRelay, removeRelay } = useNostrContext();
    const [newRelay, setNewRelay] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newRelay.trim()) {
            await addRelay(newRelay.trim());
            setNewRelay('');
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <Wifi className="w-5 h-5" /> Relay Management
            </h3>

            <form onSubmit={handleAdd} className="flex gap-2">
                <Input
                    value={newRelay}
                    onChange={(e) => setNewRelay(e.target.value)}
                    placeholder="wss://relay.example.com"
                    className="bg-transparent border-black/10"
                />
                <Button type="submit" size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                </Button>
            </form>

            <div className="space-y-2">
                {relays.map((url) => (
                    <div key={url} className="flex items-center justify-between p-3 rounded-xl border border-black/5 bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${connectedRelays.includes(url) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                            <span className="text-xs font-mono truncate max-w-[200px]">{url}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRelay(url)}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
