import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function AccountLoading() {
  return (
    <PageContainer>
      <div className="animate-pulse">
        <PageHeader 
          title="Account Settings" 
          description="Manage your identity and core operator profile."
        />

        <GlassPanel className="p-8">
          <div className="space-y-8">
            
            <div className="space-y-3">
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="w-full bg-[#050505] border border-white/5 rounded-xl h-12"></div>
              <div className="h-3 w-64 bg-white/5 rounded"></div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="w-full h-12 bg-white/5 rounded-xl"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="w-full h-12 bg-white/5 rounded-xl"></div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

            <div className="space-y-4">
              <div className="h-4 w-40 bg-white/10 rounded"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-28 bg-white/5 rounded-2xl border border-white/10"></div>
                <div className="h-28 bg-white/5 rounded-2xl border border-white/10"></div>
              </div>
            </div>
            
          </div>
        </GlassPanel>
      </div>
    </PageContainer>
  );
}
