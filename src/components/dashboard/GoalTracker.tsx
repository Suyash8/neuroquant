import React from "react";
import Link from "next/link";
import { CheckCircle2, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface GoalTrackerProps {
  dailyGoal: number;
  cardsDoneTodayCount: number;
  progressPct: number;
  suddenDeathHighScore: number;
}

export function GoalTracker({
  dailyGoal,
  cardsDoneTodayCount,
  progressPct,
  suddenDeathHighScore,
}: GoalTrackerProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-500" /> Daily goals
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 flex flex-col gap-4">
        {/* Goal Item 1 */}
        <div className={`flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5 transition-all ${cardsDoneTodayCount >= dailyGoal ? 'opacity-70' : ''}`}>
          <div className="flex items-center gap-4">
            {cardsDoneTodayCount >= dailyGoal ? (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            ) : (
              <div className="relative w-6 h-6 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-primary"
                    strokeDasharray={`${progressPct}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            )}
            <div>
              <h4 className="text-white font-medium">Daily minimum</h4>
              <p className="text-xs text-zinc-400">Clear {dailyGoal} cards in Reflex Engine.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">{cardsDoneTodayCount} / {dailyGoal}</div>
            <div className="text-xs text-primary">{progressPct}%</div>
          </div>
        </div>

        {/* Goal Item 2 */}
        <div className={`flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5 transition-all ${suddenDeathHighScore >= 20 ? 'opacity-70' : ''}`}>
          <div className="flex items-center gap-4">
            {suddenDeathHighScore >= 20 ? (
              <CheckCircle2 className="w-6 h-6 text-orange-500" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-zinc-700" />
            )}
            <div>
              <h4 className="text-white font-medium">Survive Sudden Death</h4>
              <p className="text-xs text-zinc-400">Reach a streak of 20 without missing.</p>
            </div>
          </div>
          {suddenDeathHighScore < 20 && (
            <Link href="/practice/reflex/sudden-death" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-medium transition-colors">
              Start
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
