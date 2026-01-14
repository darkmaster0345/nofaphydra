import { Flame } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-center gap-3 py-8 animate-fade-in">
      <div className="relative">
        <Flame className="w-10 h-10 text-primary animate-pulse-glow" />
        <div className="absolute inset-0 blur-xl bg-primary/30" />
      </div>
      <h1 className="text-4xl md:text-5xl font-display tracking-wider">
        <span className="text-foreground">NOFAP</span>
        <span className="text-gradient-fire ml-2">HYDRA</span>
      </h1>
    </header>
  );
}
