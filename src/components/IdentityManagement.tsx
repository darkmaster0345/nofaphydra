import React, { useState } from 'react';
import { finalizeEvent } from 'nostr-tools';
import { hexToBytes } from '@noble/hashes/utils';
import { Save, RefreshCw, Download } from 'lucide-react';
import { RELAYS } from '@/services/nostr';
import { SimplePool } from 'nostr-tools';

interface IdentityManagementProps {
    userPrivateKey: string;
    pool: SimplePool;
    initialAlias?: string;
    onUpdateSuccess?: (newName: string) => void;
    onSync?: () => void;
    onFetch?: () => void;
}

export const IdentityManagement = ({
    userPrivateKey,
    pool,
    initialAlias = "HYDRO_OPERATIVE",
    onUpdateSuccess,
    onSync,
    onFetch
}: IdentityManagementProps) => {
    const [alias, setAlias] = useState(initialAlias);
    const [isUpdating, setIsUpdating] = useState(false);

    const updateMetadata = async () => {
        if (!alias.trim()) return;
        setIsUpdating(true);

        try {
            const eventTemplate = {
                kind: 0,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: JSON.stringify({
                    name: alias.trim(),
                    display_name: alias.trim(),
                    about: "Hydra Operative | NoFap Warrior 🐉",
                }),
            };

            // Sign using the key stored in your app
            const sk = hexToBytes(userPrivateKey);
            const signedEvent = finalizeEvent(eventTemplate, sk);

            // Publish to active relays
            await Promise.all(
                RELAYS.map(url => pool.publish([url], signedEvent))
            );

            console.log("[HYDRA] Metadata Broadcasted:", alias);
            alert(`IDENTITY UPDATED: ${alias}`);
            if (onUpdateSuccess) onUpdateSuccess(alias.trim());
        } catch (err) {
            console.error("[HYDRA] Metadata Failure:", err);
            alert("Failed to update metadata. Check relay connections.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="w-full space-y-8 bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Alias Input Section */}
            <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
                    Broadcasting Alias
                </label>
                <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="w-full bg-white border-2 border-black p-4 font-mono text-lg uppercase tracking-tighter outline-none focus:bg-zinc-50 transition-colors"
                    placeholder="ENTER_ALIAS..."
                />
                <p className="text-[8px] font-mono text-black/30 uppercase tracking-widest">
                    Nostr NIP-01 identification name.
                </p>
            </div>

            {/* Main Action Button */}
            <button
                onClick={updateMetadata}
                disabled={isUpdating}
                className={`w-full flex items-center justify-center gap-3 p-5 font-black uppercase italic tracking-tighter border-2 border-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none
          ${isUpdating ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' : 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-zinc-800'}`}
            >
                <Save size={18} className={isUpdating ? "animate-pulse" : ""} />
                {isUpdating ? "Broadcasting..." : "Update Metadata"}
            </button>

            {/* Sync/Fetch Sub-grid */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onSync}
                    className="flex items-center justify-center gap-2 p-3 border-2 border-black font-bold text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95"
                >
                    <RefreshCw size={14} /> SYNC
                </button>
                <button
                    onClick={onFetch}
                    className="flex items-center justify-center gap-2 p-3 border-2 border-black font-bold text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95"
                >
                    <Download size={14} /> FETCH
                </button>
            </div>

            {/* Terminal UI Style Footer */}
            <div className="pt-4 border-t border-black/10">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase text-black/40">
                    <span>Status: Verified</span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                        <span className="text-green-600">Protocol Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
