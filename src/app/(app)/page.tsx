import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, Flame, Target, Trophy, Activity, ArrowRight, Star, Zap, ChevronRight, CheckCircle2, Calendar } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { DashboardGraph } from "./DashboardGraph";
import { withPerf } from "@/lib/perf";
import { Suspense } from "react";
import DashboardLoading from "./loading";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData />
    </Suspense>
  );
}

async function DashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  if (!user) {
    redirect("/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [dbUser, cardsDoneTodayCount, userSettings, velocityLogs, userBadges] = await withPerf("Prisma: Ultimate Parallel Fetch", () => Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: { reflexProfile: true }
    }),
    prisma.reflexVelocityLogs.count({
      where: { profile: { userId: user.id }, createdAt: { gte: today } }
    }),
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
    prisma.reflexVelocityLogs.findMany({
      where: { profile: { userId: user.id }, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, timeMs: true },
      orderBy: { createdAt: "asc" }
    }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
      take: 5
    })
  ]));

  if (!dbUser || !dbUser.onboarded) {
    redirect("/onboarding");
  }

  const dailyGoal = userSettings?.dailyGoal || 50; 
  const progressPct = Math.min(100, Math.round((cardsDoneTodayCount / dailyGoal) * 100));

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

  // Generate a mock 7-day activity calendar
  const currentDayOfWeek = new Date().getDay();
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white">Good morning, {dbUser.displayName?.split(" ")[0] || "Operator"}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Goals */}
        <div className="mynt-card p-6 col-span-1 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary" /> Today's goals
            </h3>
            <span className="text-xs font-semibold text-zinc-500 uppercase">Daily</span>
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Goal Item 1 */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                {progressPct >= 100 ? (
                  <CheckCircle2 className="w-6 h-6 text-primary fill-primary/20" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-zinc-700" />
                )}
                <div>
                  <h4 className="text-white font-medium">Complete Daily Review</h4>
                  <p className="text-xs text-zinc-400">Clear {dailyGoal} cards in Reflex Engine.</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{cardsDoneTodayCount} / {dailyGoal}</div>
                <div className="text-xs text-primary">{progressPct}%</div>
              </div>
            </div>
            
            {/* Goal Item 2 (Mock) */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full border-2 border-zinc-700" />
                <div>
                  <h4 className="text-white font-medium">Survive Sudden Death</h4>
                  <p className="text-xs text-zinc-400">Reach a streak of 20 without missing.</p>
                </div>
              </div>
              <Link href="/practice/reflex/sudden-death" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-medium transition-colors">
                Start
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Calendar (Streak) */}
        <div className="mynt-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Activity calendar
            </h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDays.map((day, i) => {
              // Mock active days based on global streak
              const isActive = i < dbUser.globalStreak;
              const isToday = i === currentDayOfWeek - 1; // Simplification
              
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500">{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${isActive && !isToday ? 'bg-primary text-black shadow-[0_0_10px_rgba(163,230,53,0.3)]' : ''}
                    ${isToday ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.3)] scale-110' : ''}
                    ${!isActive && !isToday ? 'bg-zinc-800 text-zinc-600' : ''}
                  `}>
                    {/* Optionally show a checkmark or number inside */}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-auto p-4 bg-zinc-900/50 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" /> {dbUser.globalStreak} days
              </div>
            </div>
            <div className="text-right">
               <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Total Points</div>
               <div className="text-2xl font-bold text-blue-400">{dbUser.totalPoints}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Modes */}
        <div className="mynt-card p-6 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Study plans</h3>
            <Link href="/practice/reflex" className="text-sm font-medium text-primary hover:text-white transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Link href="/practice/reflex/session" className="p-5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl transition-all group relative overflow-hidden">
               <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
               <Brain className="w-8 h-8 text-primary mb-4" />
               <h4 className="text-white font-bold mb-1 group-hover:text-primary transition-colors">Reflex Engine</h4>
               <p className="text-sm text-zinc-400">Mental math and speed drills.</p>
             </Link>
             <Link href="/practice/reflex/sudden-death" className="p-5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl transition-all group relative overflow-hidden">
               <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
               <Target className="w-8 h-8 text-orange-500 mb-4" />
               <h4 className="text-white font-bold mb-1 group-hover:text-orange-500 transition-colors">Sudden Death</h4>
               <p className="text-sm text-zinc-400">High-stakes stress testing.</p>
             </Link>
          </div>
        </div>
        
        {/* Velocity Graph */}
        <div className="mynt-card p-6 flex flex-col h-[300px]">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Velocity Trend
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Avg. response time over 7 days.</p>
          <div className="flex-1 w-full relative">
            <DashboardGraph data={graphData} />
          </div>
        </div>
      </div>
    </div>
  );
}
