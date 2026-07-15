"use client";

import { Bell, Flame, Zap, HelpCircle } from "lucide-react";
import { useGlobalStore } from "@/store/global";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function TopBar() {
  const user = useGlobalStore(state => state.user);
  const pathname = usePathname();

  const streak = user?.globalStreak || 0;
  const points = user?.totalPoints || 0;

  // Determine current page name for breadcrumb
  let pageName = "Dashboard";
  if (pathname?.includes("/settings")) pageName = "Settings";
  if (pathname?.includes("/practice/reflex")) pageName = "Games";
  if (pathname?.includes("/analytics")) pageName = "Analytics";

  return (
    <header className="h-20 border-b border-white/5 bg-[#09090b] flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-3 text-lg font-bold text-white">
        <Logo size="sm" className="md:hidden" />
        <div className="hidden md:flex items-center gap-3 text-zinc-500">
           <Logo size="sm" />
           <span>/</span>
        </div>
        <span className="capitalize">{pageName}</span>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>{points.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-5 ml-2 border-l border-white/10 pl-6">
          <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Feedback
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>

        <Link href="/settings" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center ml-2 border border-zinc-700 hover:border-zinc-500 transition-colors">
          <span className="text-xs font-bold text-zinc-400">{user?.persona === "quant" ? "Q" : "G"}</span>
        </Link>
      </div>
    </header>
  );
}
