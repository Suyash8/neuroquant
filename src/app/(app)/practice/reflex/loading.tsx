import { Brain } from "lucide-react";

export default function ReflexLoading() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary/50" />
          <div className="h-9 w-48 bg-white/10 rounded-lg"></div>
        </h1>
        <div className="h-5 w-96 bg-white/5 rounded-lg"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Progress Ring */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center col-span-1 h-64">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4 rounded-full bg-white/5 border-8 border-white/10"></div>
          <div className="h-5 w-24 bg-white/10 rounded mb-1"></div>
          <div className="h-4 w-32 bg-white/5 rounded"></div>
        </div>

        {/* Action Cards */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-6 flex flex-col gap-4 h-48">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0"></div>
            <div>
              <div className="h-6 w-32 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-full bg-white/5 rounded mb-1"></div>
              <div className="h-4 w-2/3 bg-white/5 rounded"></div>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col gap-4 h-48">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0"></div>
            <div>
              <div className="h-6 w-32 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-full bg-white/5 rounded mb-1"></div>
              <div className="h-4 w-2/3 bg-white/5 rounded"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
