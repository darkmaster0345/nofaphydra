export function Header() {
  return (
    <header className="flex flex-col items-center justify-center gap-4 py-8 animate-fade-in">
      <div className="relative group">
        <img
          src="/logo.png"
          alt="NoFap Hydra Logo"
          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-black/5 shadow-2xl transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 blur-2xl bg-black/5 -z-10 rounded-full" />
      </div>
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-display tracking-[0.2em] font-bold">
          <span className="text-foreground">NOFAP</span>
          <span className="text-black ml-2">HYDRA</span>
        </h1>
        <p className="text-[10px] tracking-[0.5em] text-muted-foreground uppercase mt-1 font-medium">
          FOSS Community
        </p>
      </div>
    </header>
  );
}
