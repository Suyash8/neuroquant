"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReflexSessionStore } from "@/store/reflex";
import { ChevronRight, ArrowLeft, Trophy, Clock, Target, Zap, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ReflexSummaryPage() {
  const router = useRouter();
  const { logs, queue } = useReflexSessionStore();
  const [stats, setStats] = useState({
    avgVelocityMs: 0,
    accuracy: 0,
    totalAttempts: 0,
    correctCount: 0,
  });

  useEffect(() => {
    if (!logs || logs.length === 0) {
      router.push("/practice/reflex");
      return;
    }

    // Calculate stats based on logs
    const totalAttempts = logs.length;
    // Every log is an attempt. A correct attempt has q >= 1. Incorrect has q = 0.
    // Wait, submitAnswer logs q=0 for incorrect, and q>0 for correct.
    const correctLogs = logs.filter(l => l.quality > 0);
    const correctCount = correctLogs.length;
    
    // Average velocity ONLY for correct answers to avoid skewing
    const totalCorrectTime = correctLogs.reduce((acc, l) => acc + l.timeMs, 0);
    const avgVelocityMs = correctCount > 0 ? totalCorrectTime / correctCount : 0;
    
    const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;

    setStats({
      avgVelocityMs,
      accuracy,
      totalAttempts,
      correctCount
    });
  }, [logs, router]);

  if (!logs || logs.length === 0) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-xs font-bold uppercase tracking-wider mb-6">
          Done
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Practice Summary</h1>
        <p className="text-zinc-400 text-lg">Here is how you performed today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <Card className="bg-zinc-950/80 border-white/5 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Avg Speed</div>
            </div>
            <div className="text-4xl font-black text-white">{(stats.avgVelocityMs / 1000).toFixed(2)}s</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/80 border-white/5 relative overflow-hidden group hover:border-green-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Accuracy</div>
            </div>
            <div className="text-4xl font-black text-white">{Math.round(stats.accuracy)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/80 border-white/5 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-orange-400" />
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Attempts</div>
            </div>
            <div className="text-4xl font-black text-white">{stats.totalAttempts}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/80 border-white/5 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Questions</div>
            </div>
            <div className="text-4xl font-black text-white">{queue.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-950/80 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <Trophy className="w-16 h-16 text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" />
            <h2 className="text-2xl font-bold text-white">Session Complete</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Keep practicing every day to improve your mental math speed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full max-w-sm">
              <Link href="/practice/reflex" className="flex-1">
                <Button className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-black">
                  Back to Hub
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
