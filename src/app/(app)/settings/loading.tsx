import { Settings, Smartphone } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function SettingsLoading() {
  return (
    <PageContainer>
      <PageHeader 
        title="System Settings" 
        description="Configure preferences and engine parameters."
      />

      <div className="space-y-6 animate-pulse">
        {/* Engine Section */}
        <GlassPanel className="p-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Settings className="w-5 h-5 text-zinc-400/50" />
            </div>
            <div className="h-6 w-48 bg-white/10 rounded"></div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-48 bg-white/10 rounded mb-2"></div>
                <div className="h-4 w-72 bg-white/5 rounded"></div>
              </div>
              <div className="h-6 w-11 bg-white/10 rounded-full"></div>
            </div>

            <div className="space-y-3">
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="h-14 w-full bg-white/5 rounded-xl"></div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="h-4 w-40 bg-white/10 rounded"></div>
                <div className="h-6 w-20 bg-white/10 rounded"></div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full"></div>
            </div>
          </div>
        </GlassPanel>

        {/* Interface Section */}
        <GlassPanel className="p-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Smartphone className="w-5 h-5 text-zinc-400/50" />
            </div>
            <div className="h-6 w-48 bg-white/10 rounded"></div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10"></div>
                <div>
                  <div className="h-5 w-32 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 w-64 bg-white/5 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-11 bg-white/10 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10"></div>
                <div>
                  <div className="h-5 w-32 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 w-64 bg-white/5 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-11 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </PageContainer>
  );
}
