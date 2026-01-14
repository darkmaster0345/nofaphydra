import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { User } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { Leaderboard } from "@/components/Leaderboard";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { ChatRules } from "@/components/chat/ChatRules";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, User as UserIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateOrLoadKeys, clearKeys } from "@/services/nostr";

const Community = () => {
  // const [user, setUser] = useState<User | null>(null);
  const [identity, setIdentity] = useState<{ publicKey: string, privateKey: string } | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>("global"); // Default to global room
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    generateOrLoadKeys().then(id => {
      if (id && id.privateKey) {
        setIdentity(id);
      }
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await clearKeys();
    setIdentity(null);
    toast({
      title: "Signed out",
      description: "Your local key has been cleared.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 pb-24">
        <Header />

        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tracker
          </Button>
          {identity ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="fire" onClick={() => navigate("/auth")}>
              Sign In to Chat
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
          <div className="md:col-span-3">
            <ChatRules />
            {selectedRoom ? (
              <ChatRoom roomId={selectedRoom} />
            ) : (
              <div className="streak-card h-96 flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Select a room to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Community;
