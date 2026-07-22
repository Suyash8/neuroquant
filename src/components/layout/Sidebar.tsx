"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, Settings, Trophy, Activity, LogOut, Users, BookOpen } from "lucide-react";
import { useGlobalStore } from "@/store/global";
import { createBrowserClient } from '@supabase/ssr'
import { Logo } from "@/components/ui/Logo";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function Sidebar() {
  const user = useGlobalStore(state => state.user);
  const pathname = usePathname();

  const globalItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: Activity, locked: true },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy, locked: true },
  ];

  const practiceItems = [
    { name: "Games", href: "/practice/reflex", icon: Brain },
    { name: "Training", href: "/training", icon: Activity, locked: true },
    { name: "Study Plans", href: "/plans", icon: BookOpen, locked: true },
    { name: "Topics", href: "/topics", icon: Users, locked: true },
  ];

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const NavItem = ({ item }: { item: any }) => {
    // If it's the dashboard, exact match. Otherwise prefix match.
    const isActive = item.href === "/"
      ? pathname === "/"
      : pathname?.startsWith(item.href);

    return (
      <Link
        href={item.href}
        onClick={e => item.locked && e.preventDefault()}
        className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors group relative ${
          item.locked
            ? 'text-zinc-600 cursor-not-allowed'
            : isActive
              ? 'text-primary'
              : 'text-zinc-400 hover:text-white'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-primary-glow" />
        )}
        <item.icon className={`w-4 h-4 ${item.locked ? 'opacity-50' : isActive ? 'text-primary' : 'group-hover:text-white transition-colors'}`} />
        {item.name}
        {item.locked && <div className="ml-auto text-[9px] font-bold uppercase bg-white/5 px-1.5 py-0.5 rounded text-zinc-500">Beta</div>}
      </Link>
    );
  };

  return (
    <aside className="w-64 border-r border-white/5 bg-[#09090b] hidden md:flex flex-col">
      <div className="h-20 flex items-center px-6">
        <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Logo size="sm" />
          <span>NeuroQuant</span>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-8 overflow-y-auto">
        <div>
          <div className="flex flex-col gap-1">
            {globalItems.map((item) => <NavItem key={item.name} item={item} />)}
          </div>
        </div>

        <div>
          <div className="px-5 mb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Practice</div>
          <div className="flex flex-col gap-1">
            {practiceItems.map((item) => <NavItem key={item.name} item={item} />)}
          </div>
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <GlassPanel interactive hoverGlow className="p-4 relative group">
          <button onClick={handleLogout} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut className="w-4 h-4" />
          </button>
          <div className="flex gap-4 items-center mb-3">
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
             </div>
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
               <span className="text-xs">+1</span>
             </div>
          </div>
          <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">New • Referral</div>
          <div className="text-sm font-semibold text-white leading-tight">Invite friends, earn premium</div>
          <div className="text-xs text-zinc-400 mt-1">Free Pro days for every signup.</div>
        </GlassPanel>
      </div>
    </aside>
  );
}
