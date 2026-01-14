import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function CommunityButton() {
  return (
    <div className="streak-card text-center relative">
      <div className="flex items-center justify-center gap-2 mb-3">
        <MessageCircle className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-display text-foreground">Accountability Circle</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">
        Share your struggles, support others, and stay accountable with people on the same journey.
      </p>
      <Link to="/community" className="block relative z-10">
        <Button variant="fire" className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          Find Your Tribe
        </Button>
      </Link>
    </div>
  );
}
