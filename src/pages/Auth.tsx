import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { importKey, generateOrLoadKeys } from "@/services/nostr";

const Auth = () => {
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateOrLoadKeys();
      toast.success("Identity Created", {
        description: "New keys generated and stored in local vault."
      });
      navigate("/");
    } catch (error) {
      toast.error("Initialization Failed");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!privateKey.startsWith("nsec")) {
        toast.error("Invalid Format", {
          description: "Keys must begin with 'nsec' prefix."
        });
        setLoading(false);
        return;
      }

      const success = await importKey(privateKey);
      if (success) {
        toast.success("Identity Merged", {
          description: "Secure protocol established."
        });
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Authentication Error", {
        description: "Verify private key integrity."
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <Button
          variant="ghost"
          className="mb-8 rounded-none border-black hover:bg-black hover:text-white uppercase text-[10px] font-black tracking-widest"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Abort Protocol
        </Button>

        <div className="border-[3px] border-black p-8 md:p-12 space-y-8 bg-white">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Hydra Sync</h1>
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-black/40 text-center">Identity Encryption Protocol</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="privateKey" className="text-[10px] font-black uppercase tracking-widest text-black/40">Credential Input (nsec)</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <Input
                  id="privateKey"
                  type="password"
                  placeholder="NSEC_PROTOCOL_KEY..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="pl-10 h-14 rounded-none border-black border-2 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-xs uppercase"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading || !privateKey}
              className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-none border border-black uppercase text-xs font-black tracking-widest transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Initialize Link
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-black/10"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-4 text-black/40">Alternative Initialization</span></div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            variant="outline"
            className="w-full h-14 rounded-none border-black border-2 hover:bg-black hover:text-white uppercase text-xs font-black tracking-widest transition-all active:scale-95"
          >
            <User className="w-4 h-4 mr-2" />
            Generate Random ID
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[9px] font-mono text-black/20 uppercase tracking-widest">Hydra Persistence Engine v2.4.0 // Unauthorized access is strictly prohibited</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
