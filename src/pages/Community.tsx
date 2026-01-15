import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { Leaderboard } from "@/components/Leaderboard";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { ChatRules } from "@/components/chat/ChatRules";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateOrLoadKeys, clearKeys, NostrKeys } from "@/services/nostr";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useNostr } from "@/hooks/useNostr";

const Community = () => {
  const { connectedRelays } = useNostr();
  const [identity, setIdentity] = useState<NostrKeys | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>("global");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    generateOrLoadKeys().then(id => {
      if (id?.privateKey) {
        setIdentity(id);
      }
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    try {
      await clearKeys();
      setIdentity(null);
      toast.success("Identity Disconnected", {
        description: "Local vault has been purged."
      });
      navigate("/");
    } catch (e) {
      toast.error("Logout failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-black animate-spin" strokeWidth={3} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-black/40">Contacting Relays...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary>
        <div className="container max-w-4xl mx-auto px-4 pb-24">
          <Header />

          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="rounded-none border-black hover:bg-black hover:text-white uppercase text-[10px] font-black tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tracker
            </Button>
            {identity ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="rounded-none border-black hover:bg-black hover:text-white uppercase text-[10px] font-black tracking-widest"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  ID
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="rounded-none border-black hover:bg-black hover:text-white uppercase text-[10px] font-black tracking-widest"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Purge
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-black text-white hover:bg-black/90 rounded-none border border-black uppercase text-[10px] font-black tracking-widest px-6 h-10"
              >
                Authenticate to Chat
              </Button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-1 space-y-4">
              <ChatRoomList
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
              />
              <Leaderboard />
            </div>
            <div className="md:col-span-3 space-y-4">
              <ChatRules />
              {selectedRoom ? (
                <ChatRoom key={selectedRoom} roomId={selectedRoom} />
              ) : (
                <div className="border border-black border-dashed h-96 flex items-center justify-center bg-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/20 text-center">
                    SELECT FREQUENCY TO<br />RECEIVE SIGNALS
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>

      <div className="fixed bottom-20 left-0 right-0 px-4 pointer-events-none z-50">
        <div className="max-w-4xl mx-auto flex justify-end">
          <div className="bg-black text-white px-3 py-1 flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase border border-white/20">
            <div className={`w-1.5 h-1.5 rounded-full ${connectedRelays.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span>RELAYS: {connectedRelays.length > 0 ? connectedRelays.length : '0'} ACTIVE</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Community;
