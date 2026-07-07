"use client";

import Link from "next/link";
import { Brain, LayoutDashboard, Settings, Trophy, Activity, LogOut } from "lucide-react";
import { useGlobalStore } from "@/store/global";
import { createBrowserClient } from '@supabase/ssr'

export function Sidebar() {
  const user = useGlobalStore(state => state.user);

  const globalItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Analytics", href: "#", icon: Activity, locked: true },
    { name: "Leaderboard", href: "#", icon: Trophy, locked: true },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const practiceItems = [
    { name: "Reflex Engine", href: "/practice/reflex", icon: Brain },
    { name: "Probability Lab", href: "#", icon: Activity, locked: true },
    { name: "Logic Games", href: "#", icon: Brain, locked: true },
  ];

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0a0c10] hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span>NeuroQuant</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 flex flex-col gap-6 overflow-y-auto">
        
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Global Core</div>
          <div className="flex flex-col gap-1">
            {globalItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${item.locked ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                onClick={e => item.locked && e.preventDefault()}
              >
                <item.icon className={`w-5 h-5 ${item.locked ? 'opacity-50' : 'group-hover:text-primary transition-colors'}`} />
                {item.name}
                {item.locked && <div className="ml-auto text-[10px] uppercase bg-white/5 px-1.5 py-0.5 rounded text-gray-500">Locked</div>}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Practice Modules</div>
          <div className="flex flex-col gap-1">
            {practiceItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${item.locked ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                onClick={e => item.locked && e.preventDefault()}
              >
                <item.icon className={`w-5 h-5 ${item.locked ? 'opacity-50' : 'group-hover:text-primary transition-colors'}`} />
                {item.name}
                {item.locked && <div className="ml-auto text-[10px] uppercase bg-white/5 px-1.5 py-0.5 rounded text-gray-500">Locked</div>}
              </Link>
            ))}
          </div>
        </div>

      </nav>

      <div className="p-4 mt-auto">
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center relative group">
          <button onClick={handleLogout} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <span className="text-primary font-bold">{user?.persona === "quant" ? "Q" : "G"}</span>
          </div>
          <div className="text-sm font-medium text-white capitalize">{user?.persona} Persona</div>
          <div className="text-xs text-gray-500 mt-1">Free Tier</div>
        </div>
      </div>
    </aside>
  );
}
