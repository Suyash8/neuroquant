import Link from "next/link";
import { Brain, Zap, Target, Activity } from "lucide-react";
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

  if (user) {
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
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          Reflex Engine
        </h1>
        <p className="text-gray-400">Speed-drill mental math. Build reflexes that fire before you think.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Progress Ring */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center col-span-1">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * dailyProgress) / 100}
                className="text-primary transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{dailyProgress}%</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Today</span>
            </div>
          </div>
          <h3 className="font-semibold text-white">Daily Quota</h3>
          <p className="text-sm text-gray-400 text-center mt-1">{pendingCount} cards remaining</p>
        </div>

        {/* Action Cards */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/practice/reflex/session" className="glass-panel p-6 flex flex-col gap-4 group hover-glow transition-colors cursor-pointer border-white/10 hover:border-primary/50">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Daily Review</h3>
              <p className="text-sm text-gray-400 mt-1">Execute your spaced repetition queue. Required to maintain neural retention.</p>
            </div>
          </Link>

          <Link href="/practice/reflex/sudden-death" className="glass-panel p-6 flex flex-col gap-4 group hover-glow transition-colors cursor-pointer border-white/10 hover:border-red-500/50">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">Sudden Death</h3>
              <p className="text-sm text-gray-400 mt-1">Max speed stress test. 3 strikes and you're out. Unlocks high-tier badges.</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
