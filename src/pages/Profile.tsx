import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User } from "lucide-react";
import { z } from "zod";
import { getNostrIdentity } from "@/lib/nostr";
import { SecuritySettings } from "@/components/SecuritySettings";

const AVATAR_EMOJIS = [
  "🌱", "🔥", "💪", "🏆", "⭐", "🌟", "💎", "🦁",
  "🐺", "🦅", "🐉", "🎯", "⚡", "🌊", "🏔️", "🌙",
  "☀️", "🌈", "🍀", "🌸", "🎭", "🎪", "🚀", "🎮",
  "🎸", "🎨", "📚", "💡", "🔮", "🛡️", "⚔️", "👑"
];

const profileSchema = z.object({
  username: z.string().trim().min(2, "Username must be at least 2 characters").max(30, "Username must be less than 30 characters"),
});

// Placeholder for Nostr profile data (NIP-05)
interface NostrProfile {
  name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
}

const Profile = () => {
  const [username, setUsername] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🌱");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [identity, setIdentity] = useState<{ publicKey: string, privateKey: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const id = await getNostrIdentity();
      if (!id || !id.privateKey) {
        navigate("/auth");
        return;
      }
      setIdentity(id);

      // TODO: Fetch Nostr profile (NIP-05) from relays
      // const profile = await fetchNostrProfile(id.publicKey);
      // if (profile) {
      //   setUsername(profile.name || "");
      //   // A bit tricky to map emoji from picture url, so we'll use localStorage for now
      //   const storedEmoji = localStorage.getItem(`nostr_avatar_${id.publicKey}`);
      //   setAvatarEmoji(storedEmoji || "🌱");
      // }
      const storedUsername = localStorage.getItem(`nostr_username_${id.publicKey}`);
      const storedEmoji = localStorage.getItem(`nostr_avatar_${id.publicKey}`);
      setUsername(storedUsername || "");
      setAvatarEmoji(storedEmoji || "🌱");

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) return;

    const validation = profileSchema.safeParse({ username });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // TODO: Publish a kind 0 event to update Nostr profile
    // const profileEvent = {
    //   kind: 0,
    //   content: JSON.stringify({ name: username.trim(), picture: avatarEmoji }),
    //   // ... other event fields
    // };
    // await publishNostrEvent(profileEvent);
    localStorage.setItem(`nostr_username_${identity.publicKey}`, username.trim());
    localStorage.setItem(`nostr_avatar_${identity.publicKey}`, avatarEmoji);

    toast({
      title: "Profile updated! ✨",
      description: "Your local profile has been saved.",
    });

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pb-24">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="streak-card">
          <div className="flex items-center justify-center gap-3 mb-8">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-display tracking-wider text-foreground">
              PROFILE SETTINGS
            </h1>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-3">
              <Label className="text-muted-foreground">Choose Your Avatar</Label>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-4xl border-2 border-primary/30">
                  {avatarEmoji}
                </div>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${avatarEmoji === emoji
                      ? "bg-primary/20 border-2 border-primary scale-110"
                      : "bg-secondary hover:bg-secondary/80 border border-border"
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-muted-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary border-border"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                This is how other users will see you in the community.
              </p>
            </div>

            <Button
              type="submit"
              variant="fire"
              size="lg"
              className="w-full"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <SecuritySettings />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
