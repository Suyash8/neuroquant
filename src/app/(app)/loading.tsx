import { Activity, Flame, Star, Target, Trophy, Zap } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="h-9 w-64 bg-white/10 rounded-lg mb-2"></div>
          <div className="h-5 w-48 bg-white/5 rounded-lg"></div>
        </div>
      </header>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Global Streak</h3>
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500/50" />
            </div>
          </div>
          <div>
            <div className="h-10 w-24 bg-white/10 rounded-lg mb-2"></div>
            <div className="h-4 w-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Ecosystem Points</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary/50" />
            </div>
          </div>
          <div>
            <div className="h-10 w-32 bg-white/10 rounded-lg mb-2"></div>
            <div className="h-4 w-28 bg-white/5 rounded-lg"></div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Avg. Response Velocity</h3>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white/50" />
            </div>
          </div>
          <div>
            <div className="h-10 w-28 bg-white/10 rounded-lg mb-2"></div>
            <div className="h-4 w-36 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Progress */}
        <div className="glass-panel p-6 col-span-1 lg:col-span-2 min-h-[250px]">
          <h3 className="text-lg font-bold text-white/50 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary/50" /> Today's Objectives
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0 rounded-full bg-white/5 border-8 border-white/10"></div>
            
            <div className="flex-1 space-y-4 w-full">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <div className="h-4 w-24 bg-white/10 rounded"></div>
                  <div className="h-4 w-24 bg-white/10 rounded"></div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"></div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <div className="flex-1 h-10 bg-white/10 rounded-lg"></div>
                <div className="flex-1 h-10 bg-white/5 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Badges */}
        <div className="glass-panel p-6 flex flex-col min-h-[250px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white/50 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500/50" /> Achievements
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-white/10 rounded mb-1"></div>
                  <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Performance Graph */}
        <div className="glass-panel p-6 flex flex-col col-span-1 lg:col-span-3 h-[300px]">
          <h3 className="text-lg font-bold text-white/50 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500/50" /> Velocity Trend (7 Days)
          </h3>
          <div className="flex-1 w-full bg-white/5 rounded-xl border border-white/5"></div>
        </div>

      </div>
        
    </div>
  );
}
