import React from "react";
import { Calendar, CheckCircle2, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface ActivityCalendarProps {
  currentDayOfWeek: number;
  activeDateStrings: Set<string>;
  cardsDoneTodayCount: number;
  globalStreak: number;
  totalPoints: number;
}

export function ActivityCalendar({
  currentDayOfWeek,
  activeDateStrings,
  cardsDoneTodayCount,
  globalStreak,
  totalPoints
}: ActivityCalendarProps) {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" /> Activity calendar
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1">
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, i) => {
            const jsCurrentDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
            const daysAgo = jsCurrentDay - i;

            const cellDate = new Date();
            cellDate.setDate(cellDate.getDate() - daysAgo);
            const cellDateStr = cellDate.toISOString().split('T')[0];

            const isActive = activeDateStrings.has(cellDateStr) || (daysAgo === 0 && cardsDoneTodayCount > 0);
            const isToday = daysAgo === 0;
            const isFuture = daysAgo < 0;

            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-zinc-500'}`}>{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isActive && !isToday ? 'bg-primary shadow-[0_0_10px_rgba(163,230,53,0.3)]' : ''}
                  ${isActive && isToday ? 'bg-primary shadow-[0_0_10px_rgba(163,230,53,0.5)] scale-110' : ''}
                  ${!isActive && isToday ? 'bg-zinc-800 border-2 border-zinc-600 scale-110' : ''}
                  ${!isActive && !isToday && !isFuture ? 'bg-zinc-800/50' : ''}
                  ${isFuture ? 'bg-transparent border border-white/5' : ''}
                `}>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-black" />}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-auto p-4 bg-zinc-900/50 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Current Streak</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" /> {globalStreak} day{globalStreak === 1 ? '' : 's'}
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Total Points</div>
             <div className="text-2xl font-bold text-blue-400">{totalPoints.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
