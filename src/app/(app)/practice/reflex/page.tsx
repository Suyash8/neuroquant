import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Calculator, Target, Zap, Play, Trophy, Info, Activity, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { withPerf } from "@/lib/perf";
import { Suspense } from "react";
import ReflexLoading from "./loading";
import { Card, CardContent } from "@/components/ui/Card";
import { GameCard } from "@/components/ui/GameCard";
import { StatCard } from "@/components/ui/StatCard";

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
    { label: "SPD", value: 85, color: "bg-primary" },
    { label: "ACC", value: 73, color: "bg-orange-500" },
    { label: "STR", value: 20, color: "bg-blue-500" },
    { label: "CNT", value: 95, color: "bg-purple-500" }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-wider mb-4">
          Bootcamp Block: 10:30 AM - 11:30 AM
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Reflex Engine</h1>
        <p className="text-zinc-400 text-lg">Drill mental math, sequence recognition, and cognitive speed under extreme pressure.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Score Card */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-zinc-950/80 border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.05)]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Your Reflex Score</span>
              </div>
              <div className="flex items-end gap-6 mb-12">
                <span className="text-8xl font-bold text-white leading-none tracking-tighter drop-shadow-md">
                  {dailyProgress}
                </span>
                <div className="bg-primary/10 border border-primary/20 text-primary text-sm font-bold px-4 py-2 rounded-lg uppercase tracking-wider mb-2">
                  {dailyProgress === 100 ? "Goal Met" : "In Progress"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 w-full max-w-lg mt-auto">
              {mockStats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="text-xs text-zinc-500 font-bold uppercase">{stat.label}</div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color} shadow-[0_0_10px_currentColor]`} style={{ width: `${stat.value}%` }} />
                  </div>
                  <div className="text-sm text-white font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mini stats cards */}
        <div className="flex flex-col gap-6">
          <StatCard
            title="Avg Speed"
            value="1.2s"
            icon={Clock}
            iconColor="text-blue-500"
            trend={{ value: 12, isPositive: true }}
          />
          
          <Card className="flex-1 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors flex flex-col justify-center border-white/5 p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-zinc-500 uppercase">Quota</div>
                <div className="text-sm font-bold text-white">{pendingCount} Left</div>
              </div>
            </div>
            
            <p className="text-sm text-zinc-400 mb-6">
              Clear your spaced repetition queue to maximize neural retention.
            </p>
            
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
               <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" style={{ width: `${dailyProgress}%` }} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GameCard
          title="Morning Drill"
          description="Clear your daily Spaced Repetition queue. Mandatory for neural retention."
          href="/practice/reflex/session"
          icon={Calculator}
          colorTheme="primary"
          badgeText="Daily Required"
          difficulty="Adaptive"
          metrics={[
            { label: "Pending", value: pendingCount }
          ]}
        />

        <GameCard
          title="Sudden Death"
          description="One mistake and the run is over. Simulate interview pressure."
          href="/practice/reflex/sudden-death"
          icon={Zap}
          colorTheme="orange"
          badgeText="Stress Test"
          difficulty="Expert"
          metrics={[
            { label: "Mode", value: "Infinite" }
          ]}
        />

        <GameCard
          title="Custom Skirmish"
          description="Select specific operators, digit sizes, and constraints for targeted practice."
          href="/practice/reflex/custom"
          icon={Target}
          colorTheme="blue"
          badgeText="Sandbox"
          difficulty="Custom"
          metrics={[
            { label: "Modifiers", value: "Unlocked" }
          ]}
        />
      </div>
    </div>
  );
}
