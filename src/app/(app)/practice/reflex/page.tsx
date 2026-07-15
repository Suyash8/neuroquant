import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, Zap, Target, Calculator, Play, ChevronRight, Info, Trophy } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { withPerf } from "@/lib/perf";
import { Suspense } from "react";
import ReflexLoading from "./loading";

export default function ReflexPage() {
  return (
    <Suspense fallback={<ReflexLoading />}>
      <ReflexData />
    </Suspense>
  );
}

async function ReflexData() {
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  let pendingCount = 0;
  let dailyProgress = 0;

  if (!user) {
    redirect("/login");
  }

  const profile = await withPerf("Prisma: Squashed Profile Fetch", () => prisma.reflexProfile.findUnique({
    where: { userId: user.id },
    include: {
      _count: {
        select: {
          progress: {
            where: { nextReview: { lte: new Date() } }
          }
        }
      }
    }
  }));

  if (profile) {
      pendingCount = profile._count.progress;
      const dailyQuota = profile.horizon === "14_days" ? 150 : 50; 
      dailyProgress = Math.max(0, Math.min(100, Math.round(((dailyQuota - pendingCount) / dailyQuota) * 100)));
      if (pendingCount === 0) dailyProgress = 100;
  } else {
    redirect("/onboarding");
  }

  // Mock stats for the UI
  const mockStats = [
    { label: "SPD", value: 85, color: "bg-green-500" },
    { label: "ACC", value: 73, color: "bg-orange-500" },
    { label: "STR", value: 20, color: "bg-blue-500" },
    { label: "CNT", value: 95, color: "bg-purple-500" }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Games</h1>
        <p className="text-zinc-400">Train timed reasoning, mental math, and market intuition.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Score Card */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
            <span>Your Reflex Score</span>
            <Info className="w-4 h-4" />
            <Trophy className="w-4 h-4" />
          </div>
          <div className="flex items-end gap-4 mb-10">
            <span className="text-7xl font-bold text-[#0ea5e9] leading-none tracking-tighter">{dailyProgress}</span>
            <div className="bg-[#0ea5e9]/20 text-[#0ea5e9] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              {dailyProgress === 100 ? "Complete" : "Developing"}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 w-full max-w-md">
            {mockStats.map((stat, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="text-[10px] text-zinc-500 font-bold uppercase text-center">{stat.label}</div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color}`} style={{ width: `${stat.value}%` }} />
                </div>
                <div className="text-xs text-white font-semibold text-center">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Completion / Mini card */}
        <div className="mynt-card p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center">
               <Target className="w-4 h-4 text-[#0ea5e9]" />
             </div>
             <h3 className="text-white font-semibold">Complete Your Daily Quota</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Clear your spaced repetition queue to maximize neural retention. <strong className="text-white">{pendingCount} cards remaining.</strong>
          </p>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-6">
             <div className="h-full bg-[#0ea5e9]" style={{ width: `${dailyProgress}%` }} />
          </div>
          <button className="w-full py-3 px-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors">
            Continue Practicing <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Standard Session (Speed Engine style) */}
        <div className="mynt-card relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-80" />
          <div className="p-8 flex flex-col h-full">
             <div className="flex justify-between items-start mb-16">
               <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 relative z-10 group-hover:scale-110 transition-transform duration-500">
                 <Calculator className="w-8 h-8" />
               </div>
               <div className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1 border border-green-500/30">
                 <Zap className="w-3 h-3" /> Core
               </div>
             </div>
             
             <div className="mb-8">
               <h3 className="text-2xl font-bold text-white mb-2">Daily Review</h3>
               <p className="text-zinc-400">Mental math. Under fire.</p>
             </div>
             
             <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6">
               <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {pendingCount} cards</span>
               <span>★ Beginner</span>
             </div>

             <Link href="/practice/reflex/session" className="mt-auto block">
               <button className="w-full py-4 rounded-xl btn-glow-green flex items-center justify-center gap-2 text-lg">
                 <Play className="w-5 h-5 fill-black" /> Play Again <ChevronRight className="w-5 h-5" />
               </button>
             </Link>
          </div>
        </div>

        {/* Sudden Death (Risk Lab style) */}
        <div className="mynt-card relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 opacity-80" />
          <div className="p-8 flex flex-col h-full">
             <div className="flex justify-between items-start mb-16">
               <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 relative z-10 group-hover:scale-110 transition-transform duration-500">
                 <Target className="w-8 h-8" />
               </div>
               <div className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1 border border-orange-500/30">
                 <Zap className="w-3 h-3" /> Sudden Death
               </div>
             </div>
             
             <div className="mb-8">
               <h3 className="text-2xl font-bold text-white mb-2">Stress Test</h3>
               <p className="text-zinc-400">Bet sizing the Kelly way.</p>
             </div>
             
             <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6">
               <span className="flex items-center gap-1"><Play className="w-3 h-3" /> Infinite</span>
               <span>★ Expert</span>
             </div>

             <Link href="/practice/reflex/sudden-death" className="mt-auto block">
               <button className="w-full py-4 rounded-xl btn-glow-orange flex items-center justify-center gap-2 text-lg">
                 <Play className="w-5 h-5 fill-black" /> Play Again <ChevronRight className="w-5 h-5" />
               </button>
             </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
