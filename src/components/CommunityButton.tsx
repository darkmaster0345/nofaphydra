import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Sparkles } from "lucide-react";

export function CommunityButton() {
  return (
    <div className="royal-card p-6 text-center relative page-transition" style={{ animationDelay: "0.35s" }}>
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Users className="w-20 h-20 text-amber-500" />
      </div>

      <div className="flex flex-col items-center gap-3 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-display text-amber-900 tracking-wide">Fursan Brotherhood</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/50 mt-1">Community & Support</p>
        </div>
      </div>

      <p className="text-amber-800/70 text-sm mb-8 leading-relaxed px-2">
        Share your struggles, support others, and stay accountable with warriors on the same path.
      </p>

      <Link to="/community" className="block relative z-10 group">
        <Button className="w-full rounded-xl h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-500/25 group-hover:shadow-xl group-hover:scale-[1.02] transition-all">
          <Sparkles className="w-4 h-4 mr-2" />
          Join The Resistance
        </Button>
      </Link>
    </div>
  );
}
