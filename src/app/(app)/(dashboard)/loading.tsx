import { Activity, Calendar, ChevronRight, Star } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-pulse">
      
      <header>
        <div className="h-10 w-64 bg-white/10 rounded-lg"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Goals Skeleton */}
        <div className="mynt-card p-6 col-span-1 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white/50 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary/30 fill-primary/30" /> Today's goals
            </h3>
            <span className="h-4 w-12 bg-white/10 rounded"></span>
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Goal 1 */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full border-2 border-zinc-700/50" />
                <div>
                  <div className="h-5 w-36 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 w-48 bg-white/5 rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-5 w-12 bg-white/10 rounded mb-2 ml-auto"></div>
                <div className="h-3 w-8 bg-white/5 rounded ml-auto"></div>
              </div>
            </div>
            
            {/* Goal 2 */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full border-2 border-zinc-700/50" />
                <div>
                  <div className="h-5 w-40 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 w-52 bg-white/5 rounded"></div>
                </div>
              </div>
              <div className="h-8 w-16 bg-white/5 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Activity Calendar Skeleton */}
        <div className="mynt-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white/50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400/50" /> Activity calendar
            </h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-3 w-3 bg-white/10 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-zinc-800/50"></div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto p-4 bg-zinc-900/50 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <div className="h-3 w-20 bg-white/10 rounded mb-2"></div>
              <div className="h-6 w-24 bg-white/20 rounded"></div>
            </div>
            <div className="text-right">
               <div className="h-3 w-20 bg-white/10 rounded mb-2 ml-auto"></div>
               <div className="h-6 w-16 bg-white/20 rounded ml-auto"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Modes Skeleton */}
        <div className="mynt-card p-6 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white/50">Study plans</h3>
            <div className="flex items-center gap-1">
              <div className="h-4 w-16 bg-white/10 rounded"></div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-xl h-40">
               <div className="w-8 h-8 rounded-full bg-white/10 mb-4" />
               <div className="h-5 w-32 bg-white/20 rounded mb-2"></div>
               <div className="h-3 w-48 bg-white/10 rounded"></div>
             </div>
             <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-xl h-40">
               <div className="w-8 h-8 rounded-full bg-white/10 mb-4" />
               <div className="h-5 w-32 bg-white/20 rounded mb-2"></div>
               <div className="h-3 w-48 bg-white/10 rounded"></div>
             </div>
          </div>
        </div>
        
        {/* Velocity Graph Skeleton */}
        <div className="mynt-card p-6 flex flex-col h-[300px]">
          <h3 className="text-lg font-bold text-white/50 mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400/50" /> Velocity Trend
          </h3>
          <div className="h-3 w-40 bg-white/10 rounded mb-4"></div>
          <div className="flex-1 w-full bg-white/5 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
