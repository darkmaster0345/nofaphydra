import { Shield, Lock, Library } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { to: "/", icon: Shield, label: "Frontline" },
  { to: "/vitals", icon: Lock, label: "Fortress" },
  { to: "/archives", icon: Library, label: "Archives" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background with warm cream */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/98 to-white/95 backdrop-blur-xl" />

      {/* Top border with gold gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      {/* Decorative pattern hint */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%23B8860B' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px'
      }} />

      {/* Content area with proper safe-area handling */}
      <div
        className="relative flex items-center justify-around h-16 max-w-lg mx-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex flex-col items-center justify-center gap-1 px-2 sm:px-4 py-2 text-amber-700/50 transition-all duration-300 hover:text-amber-600 min-w-0"
            activeClassName="text-amber-600"
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                  <item.icon className="h-5 w-5" />
                  {isActive && (
                    <div className="absolute -inset-1.5 bg-amber-400/20 rounded-full blur-md -z-10" />
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-amber-700' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom safe area fill */}
      <div
        className="absolute inset-x-0 bottom-0 bg-white"
        style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
      />
    </nav>
  );
}
