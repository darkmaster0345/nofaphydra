import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { importKey, generateOrLoadKeys } from "@/services/nostr";

const Auth = () => {
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateOrLoadKeys();
      toast({ title: "New identity created!", description: "Your new Nostr key is securely stored." });
      navigate("/");
    } catch (error) {
      toast({ title: "Error", description: "Could not create a new identity.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!privateKey.startsWith("nsec")) {
        toast({ title: "Error", description: "Key must start with 'nsec'", variant: "destructive" });
        setLoading(false);
        return;
      }

      const success = await importKey(privateKey);
      if (success) {
        toast({ title: "Logged in!", description: "Your identity has been imported." });
        navigate("/");
      }
    } catch (error) {
      toast({ title: "Error", description: "Invalid private key.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <div className="streak-card">
          <h1 className="text-3xl font-display text-center mb-6">Welcome</h1>
          <div className="space-y-4">
            <div>
              <Label htmlFor="privateKey">Private Key (nsec)</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="privateKey" type="password" placeholder="Enter your nsec..." value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Button onClick={handleLogin} disabled={loading || !privateKey} className="w-full">Login with private key</Button>
          </div>
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-muted" />
            <span className="mx-4 text-muted-foreground">OR</span>
            <div className="flex-grow border-t border-muted" />
          </div>
          <Button onClick={handleGenerate} disabled={loading} variant="outline" className="w-full">
            <User className="w-4 h-4 mr-2" />
            Generate a new identity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
