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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Wifi className="w-4 h-4" /> Relay Network
                </h3>
                <span className="text-[10px] font-medium uppercase text-muted-foreground">
                    {connectedRelays.length} Connected
                </span>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2">
                <Input
                    value={newRelay}
                    onChange={(e) => setNewRelay(e.target.value)}
                    placeholder="WSS://RELAY.DAMUS.IO"
                    className="border-black rounded-none h-12 text-xs font-mono bg-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                    type="submit"
                    variant="outline"
                    className="border-black rounded-none h-12 w-12 bg-black text-white hover:bg-black/90"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </form>

            <div className="border-t border-black/10 pt-4 space-y-2">
                {relays.map((url) => {
                    const isConnected = connectedRelays.includes(url);
                    return (
                        <div key={url} className="flex items-center justify-between p-4 border border-black bg-white">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-3 h-3 border ${isConnected ? 'bg-black border-black' : 'bg-transparent border-black/20'}`} />
                                <span className="text-xs font-mono font-bold truncate uppercase tracking-tighter">
                                    {url.replace('wss://', '').replace(/\/$/, '')}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRelay(url)}
                                className="text-black hover:bg-black hover:text-white rounded-none h-8 w-8"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
