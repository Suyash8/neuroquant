import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, Code, Terminal, BrainCircuit, Activity, ChevronRight, CheckCircle2, Clock, Lock } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import DashboardLoading from "./loading";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import LeetCodeWidget from "@/components/dashboard/LeetCodeWidget";
import ProjectTrackerWidget from "@/components/dashboard/ProjectTrackerWidget";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData />
    </Suspense>
  );
}

const BOOTCAMP_SCHEDULE = [
  { time: "08:00 AM - 10:30 AM", title: "DSA & Competitive Programming", type: "dsa", icon: Code, href: "#", color: "orange" },
  { time: "10:30 AM - 11:30 AM", title: "Quant Math & Brainteasers", type: "math", icon: Brain, href: "/practice/math", color: "blue" },
  { time: "11:30 AM - 01:00 PM", title: "Core C++ & Systems Theory", type: "theory", icon: BrainCircuit, href: "/practice/theory", color: "green" },
  { time: "02:00 PM - 06:00 PM", title: "Project Building", type: "project", icon: Terminal, href: "/projects", color: "purple" },
  { time: "07:00 PM - 09:30 PM", title: "Mock Interviews / System Design", type: "system_design", icon: Activity, href: "#", color: "zinc" },
];

async function DashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      settings: true,
      bootcampDays: {
        orderBy: { dayNumber: 'desc' },
        take: 1,
        include: { tasks: true }
      }
    }
  });

  if (!dbUser || !dbUser.onboarded) {
    redirect("/onboarding");
  }

  let currentDay = dbUser.bootcampDays[0];
  
  // If no day exists, or the current day is completed and it's a new calendar day, we'd roll over. 
  // For simplicity right now, if no day exists, we create Day 1.
  if (!currentDay) {
    currentDay = await prisma.bootcampDay.create({
      data: {
        userId: user.id,
        dayNumber: 1,
        date: new Date(),
        status: "in_progress",
        tasks: {
          create: BOOTCAMP_SCHEDULE.map(s => ({
            type: s.type,
            title: s.title,
            status: "pending"
          }))
        }
      },
      include: { tasks: true }
    });
  }

  const completedTasks = currentDay.tasks.filter(t => t.status === "completed").length;
  const totalTasks = currentDay.tasks.length;
  const progressPct = Math.round((completedTasks / Math.max(1, totalTasks)) * 100);

  return (
    <PageContainer>
      <PageHeader 
        title={`Bootcamp: Day ${currentDay.dayNumber} of 60`}
        description="Your strict daily military schedule. Complete all tasks to unlock tomorrow."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 md:col-span-2 relative overflow-hidden group border-white/5">
           <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
           <CardContent className="p-6">
             <div className="flex items-start justify-between">
               <div>
                 <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Today's Progress</h3>
                 <p className="text-sm text-zinc-400 mb-6">{completedTasks} of {totalTasks} blocks completed.</p>
               </div>
               <div className="text-4xl font-bold text-white">{progressPct}%</div>
             </div>
             
             <div className="relative w-full h-3 bg-zinc-900 rounded-full overflow-hidden shadow-inner">
               <div 
                 className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 ease-out" 
                 style={{ width: `${Math.max(2, progressPct)}%` }} 
               />
             </div>
           </CardContent>
        </Card>

        <Card className="col-span-1 bg-zinc-900/50 border-white/5">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Global Streak</h3>
            <div className="text-3xl font-bold text-white flex items-baseline gap-2">
              {dbUser.globalStreak} <span className="text-sm font-normal text-zinc-500">days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">The Schedule</h3>
          
          {BOOTCAMP_SCHEDULE.map((schedule, index) => {
          const task = currentDay.tasks.find(t => t.type === schedule.type);
          const isCompleted = task?.status === "completed";
          const Icon = schedule.icon;

          return (
            <Link 
              key={index} 
              href={schedule.href}
              className={cn(
                "block w-full p-4 rounded-xl border border-white/5 transition-all duration-300 relative overflow-hidden group",
                isCompleted ? "bg-white/5 border-white/10" : "bg-[#09090b] hover:bg-white/5 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isCompleted ? "bg-white/10 text-white" : "bg-zinc-900 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Icon className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span className="text-xs font-mono text-zinc-500 uppercase">{schedule.time}</span>
                  </div>
                  <h4 className={cn("text-base font-bold truncate", isCompleted ? "text-zinc-300" : "text-white")}>
                    {schedule.title}
                  </h4>
                </div>

                <div className="shrink-0 text-zinc-600 group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white mb-4">Integrations</h3>
          
          {/* LeetCode Widget */}
          <div className="h-[180px]">
            <Suspense fallback={<div className="h-full bg-zinc-900/50 rounded-xl animate-pulse" />}>
              <LeetCodeWidget username={dbUser.settings?.leetcodeUsername} />
            </Suspense>
          </div>
          
          {/* AI Project Tracker */}
          <div className="h-[300px]">
            <ProjectTrackerWidget 
              taskId={currentDay.tasks.find(t => t.type === 'project')?.id} 
              initialDetails={currentDay.tasks.find(t => t.type === 'project')?.details} 
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
