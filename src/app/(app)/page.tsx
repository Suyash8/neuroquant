import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, Flame, Target, Trophy, Activity, ArrowRight, Star, Zap, ChevronRight, CheckCircle2, Calendar } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { DashboardGraph } from "./DashboardGraph";
import { withPerf } from "@/lib/perf";
import { Suspense } from "react";
import DashboardLoading from "./loading";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { GoalTracker } from "@/components/dashboard/GoalTracker";
import { GameCard } from "@/components/ui/GameCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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

  const [dbUser, activityHistory, cardsDoneTodayCount, userSettings, velocityLogs, userBadges] = await withPerf("Prisma: Ultimate Parallel Fetch", () => Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: { reflexProfile: true }
    }),
    prisma.userActivity.findMany({
      where: { userId: user.id, date: { gte: sevenDaysAgo } },
      select: { date: true, count: true }
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
      where: { userId: user.id }
    })
  ]));

  if (!dbUser || !dbUser.onboarded) {
    redirect("/onboarding");
  }

  const dailyGoal = userSettings?.dailyGoal || 25;
  const progressPct = Math.min(100, Math.round((cardsDoneTodayCount / dailyGoal) * 100));
  
  const currentDayOfWeek = new Date().getDay();
  const activeDateStrings = new Set(
    activityHistory.map(a => a.date.toISOString().split('T')[0])
  );

  // Group velocity logs by day for the graph
  const groupedLogs = new Map<string, { totalMs: number, count: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    groupedLogs.set(d.toISOString().split('T')[0], { totalMs: 0, count: 0 });
  }

  velocityLogs.forEach(log => {
    const dateStr = log.createdAt.toISOString().split('T')[0];
    if (groupedLogs.has(dateStr)) {
      const current = groupedLogs.get(dateStr)!;
      current.totalMs += log.timeMs;
      current.count += 1;
    }
  });

  const graphData = Array.from(groupedLogs.entries()).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    avgVelocity: data.count > 0 ? Math.round(data.totalMs / data.count) : 0
  }));

  const level = Math.floor(Math.sqrt(dbUser.totalPoints / 100)) + 1;
  const nextLevelPoints = Math.pow(level, 2) * 100;
  const prevLevelPoints = Math.pow(level - 1, 2) * 100;
  const levelProgress = ((dbUser.totalPoints - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100;

  return (
    <PageContainer
      title={`Welcome back, ${dbUser.displayName}`}
      subtitle="Here's a breakdown of your cognitive performance."
    >
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
           <CardContent className="p-6">
             <div className="flex items-start justify-between">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <h3 className="text-xl font-bold text-white">Level {level}</h3>
                   <Badge variant="primary">Rank: {dbUser.persona === 'quant' ? 'Quant' : 'Generalist'}</Badge>
                 </div>
                 <p className="text-sm text-zinc-400 mb-6">You're {nextLevelPoints - dbUser.totalPoints} points away from Level {level + 1}. Keep pushing your limits.</p>
               </div>
               <Trophy className="w-12 h-12 text-primary opacity-20" />
             </div>
             
             <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
               <div 
                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000 ease-out shadow-primary-glow" 
                 style={{ width: `${Math.max(5, levelProgress)}%` }} 
               />
             </div>
           </CardContent>
        </Card>

        <Card className="p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Average Velocity</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {Math.round(dbUser.averageVelocityMs)} <span className="text-lg text-zinc-500 font-medium">ms</span>
          </div>
          <div className="text-xs text-primary font-medium mt-2">
            Top 15% of users
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GoalTracker
          dailyGoal={dailyGoal}
          cardsDoneTodayCount={cardsDoneTodayCount}
          progressPct={progressPct}
          suddenDeathHighScore={dbUser.reflexProfile?.suddenDeathHighScore || 0}
        />
        <ActivityCalendar
          currentDayOfWeek={currentDayOfWeek}
          activeDateStrings={activeDateStrings}
          cardsDoneTodayCount={cardsDoneTodayCount}
          globalStreak={dbUser.globalStreak}
          totalPoints={dbUser.totalPoints}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Study plans</h3>
            <Link href="/practice/reflex" className="text-sm font-medium text-primary hover:text-white transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[200px]">
             <GameCard 
                title="Reflex Engine"
                description="Mental math and speed drills to sharpen arithmetic speed."
                href="/practice/reflex/session"
                icon={Brain}
                colorTheme="primary"
             />
             <GameCard 
                title="Sudden Death"
                description="High-stakes stress testing. One strike and you're out."
                href="/practice/reflex/sudden-death"
                icon={Target}
                colorTheme="orange"
             />
          </div>
        </div>

        <div className="flex flex-col h-full pt-10">
          <Card className="flex flex-col flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> Velocity Trend
              </CardTitle>
              <p className="text-xs text-zinc-400">Avg. response time over 7 days.</p>
            </CardHeader>
            <CardContent className="flex-1 w-full relative min-h-[150px]">
              <DashboardGraph data={graphData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
