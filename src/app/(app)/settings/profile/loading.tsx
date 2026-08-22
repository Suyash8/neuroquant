import { GlassPanel } from "@/components/ui/GlassPanel";

export default function ProfileLoading() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 pb-32 animate-pulse">
      
      {/* 1. PANORAMIC HERO SKELETON */}
      <div className="w-full rounded-[2.5rem] border border-white/10 bg-primary/5 h-[200px] md:h-[180px] p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-white/10 shrink-0"></div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-48 bg-white/20 rounded-lg"></div>
              <div className="h-6 w-16 bg-white/10 rounded-full"></div>
            </div>
            <div className="h-6 w-64 bg-white/10 rounded-lg"></div>
            <div className="flex items-center gap-4 pt-2">
              <div className="h-8 w-24 bg-white/10 rounded"></div>
              <div className="h-4 w-32 bg-white/5 rounded"></div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 md:gap-12">
          <div className="space-y-3">
            <div className="h-4 w-20 bg-white/10 rounded"></div>
            <div className="h-10 w-24 bg-white/20 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-10 w-24 bg-white/20 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-20 bg-white/10 rounded"></div>
            <div className="h-10 w-24 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. PROGRESSION & COMMAND */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel className="p-8">
            <div className="flex justify-between items-end mb-6">
              <div className="space-y-3">
                <div className="h-8 w-48 bg-white/10 rounded"></div>
                <div className="h-4 w-72 bg-white/5 rounded"></div>
              </div>
              <div className="h-8 w-24 bg-white/20 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-white/10 rounded"></div>
                <div className="h-4 w-32 bg-white/5 rounded"></div>
              </div>
              <div className="h-3 w-full bg-[#050505] rounded-full"></div>
            </div>
          </GlassPanel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassPanel className="p-6 h-64 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 mb-6"></div>
                <div className="h-8 w-32 bg-white/10 rounded mb-3"></div>
                <div className="h-4 w-48 bg-white/5 rounded"></div>
              </div>
            </GlassPanel>
            <div className="grid grid-rows-2 gap-6">
              <GlassPanel className="p-5 flex items-center justify-between h-[116px]">
                <div className="space-y-3">
                  <div className="h-6 w-24 bg-white/10 rounded"></div>
                  <div className="h-3 w-32 bg-white/5 rounded"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5"></div>
              </GlassPanel>
              <GlassPanel className="p-5 flex items-center justify-between h-[116px]">
                <div className="space-y-3">
                  <div className="h-6 w-24 bg-white/10 rounded"></div>
                  <div className="h-3 w-32 bg-white/5 rounded"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5"></div>
              </GlassPanel>
            </div>
          </div>
        </div>

        {/* 3. SIDECAR */}
        <div className="space-y-6">
          <GlassPanel className="p-8">
            <div className="h-4 w-32 bg-white/10 rounded mb-8"></div>
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5"></div>
              <div className="h-4 w-48 bg-white/5 rounded"></div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="h-4 w-24 bg-white/10 rounded"></div>
              <div className="h-5 w-12 bg-white/5 rounded-md"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-[#050505] border border-white/5"></div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
