import Link from "next/link";
import { Brain, Flame, Target, Trophy, Activity, ArrowRight, Star, Zap } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { DashboardGraph } from "./DashboardGraph";
import { withPerf } from "@/lib/perf";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  if (!user) return null;

  const dbUser = await withPerf("Prisma: User Data (findUnique)", () => prisma.user.findUnique({
    where: { id: user.id },
    include: {
      reflexProfile: true,
      badges: {
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
        take: 5
      }
    }
  }));

  if (!dbUser) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Parallelize secondary queries
  const [cardsDoneTodayCount, userSettings, velocityLogs] = await withPerf("Prisma: Parallel Stats Fetch", () => Promise.all([
    prisma.reflexVelocityLogs.count({
      where: {
        reflexProfileId: dbUser.reflexProfile?.id,
        createdAt: { gte: today }
      }
    }),
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
    prisma.reflexVelocityLogs.findMany({
      where: {
        reflexProfileId: dbUser.reflexProfile?.id,
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true, timeMs: true },
      orderBy: { createdAt: "asc" }
    })
  ]));

  const dailyGoal = userSettings?.dailyGoal || 50; 
  const progressPct = Math.min(100, Math.round((cardsDoneTodayCount / dailyGoal) * 100));

  // Aggregate by day
  const dailyVelocityMap = new Map<string, { sum: number, count: number }>();
  velocityLogs.forEach(log => {
    const dateStr = log.createdAt.toISOString().split("T")[0];
    if (!dailyVelocityMap.has(dateStr)) {
      dailyVelocityMap.set(dateStr, { sum: 0, count: 0 });
    }
    const entry = dailyVelocityMap.get(dateStr)!;
    entry.sum += log.timeMs;
    entry.count += 1;
  });

  const graphData = Array.from(dailyVelocityMap.entries()).map(([date, data]) => ({
    date,
    velocity: data.sum / data.count
  }));

  const arv = dbUser.averageVelocityMs > 0 ? (dbUser.averageVelocityMs / 1000).toFixed(2) : "--";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Global Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {dbUser.displayName || "Operator"}.</p>
        </div>
      </header>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Global Streak</h3>
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white">{dbUser.globalStreak} <span className="text-xl text-gray-500 font-normal">days</span></div>
            <p className="text-sm text-gray-500 mt-2">{dbUser.streakFreezes} freezes available</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Ecosystem Points</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white">{dbUser.totalPoints.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-2 text-primary">Top 12% globally</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Avg. Response Velocity</h3>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-mono font-bold text-white">{arv}<span className="text-xl text-gray-500 font-sans font-normal">s</span></div>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1 text-green-500">
              <ArrowRight className="w-3 h-3 rotate-45" /> 0.15s improvement
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Progress */}
        <div className="glass-panel p-6 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Today's Objectives
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * progressPct) / 100}
                  className="text-primary transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{progressPct}%</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Reflex Engine</span>
                  <span className="text-white font-medium">{cardsDoneTodayCount} / {dailyGoal} cards</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Link href="/practice/reflex/session" className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity text-center text-sm">
                  Start Daily Review
                </Link>
                <Link href="/practice/reflex" className="flex-1 py-2.5 bg-white/5 text-gray-300 font-semibold rounded-lg hover:bg-white/10 transition-colors text-center text-sm">
                  View Module
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Badges */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {dbUser.badges.length > 0 ? (
              dbUser.badges.map(ub => (
                <div key={ub.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 flex-shrink-0 border border-yellow-500/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{ub.badge.name}</div>
                    <div className="text-xs text-gray-400 truncate">{ub.badge.description}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
                <Trophy className="w-8 h-8 opacity-20" />
                <p className="text-sm">No badges earned yet.</p>
              </div>
            )}
          </div>
          {/* Performance Graph */}
        <div className="glass-panel p-6 flex flex-col col-span-1 lg:col-span-3 h-[300px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" /> Velocity Trend (7 Days)
          </h3>
          <div className="flex-1 w-full relative">
            <DashboardGraph data={graphData} />
          </div>
        </div>

      </div>
        
      </div>
    </div>
  );
}
