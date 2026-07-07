"use client";

import { Bell, Flame } from "lucide-react";
import { useGlobalStore } from "@/store/global";

export function TopBar() {
  const user = useGlobalStore(state => state.user);

  const streak = user?.globalStreak || 0;
  const points = user?.totalPoints || 0;

  return (
    <header className="h-16 border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center md:hidden">
        <div className="text-xl font-bold tracking-tight text-white">NeuroQuant</div>
      </div>
      
      <div className="hidden md:block flex-1" />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center bg-orange-500/20 text-orange-500 rounded-full px-3 py-1 text-sm font-semibold gap-1.5 border border-orange-500/30">
            <Flame className="w-4 h-4" />
            <span>{streak}</span>
          </div>
          <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full px-3 py-1 text-sm font-semibold border border-primary/30">
            {points.toLocaleString()} PTS
          </div>
        </div>
        
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
