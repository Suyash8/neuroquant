import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";

export default function DashboardLoading() {
  return (
    <PageContainer>
      {/* PageHeader Skeleton */}
      <div className="mb-8 space-y-4 animate-pulse pt-4">
        <div className="h-10 w-64 bg-white/10 rounded-lg"></div>
        <div className="h-5 w-96 max-w-full bg-white/5 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
        {/* Progress Card Skeleton */}
        <Card className="col-span-1 md:col-span-2 relative overflow-hidden border-white/5 bg-zinc-900/30">
           <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
           <CardContent className="p-6">
             <div className="flex items-start justify-between">
               <div className="space-y-3">
                 <div className="h-6 w-40 bg-white/10 rounded"></div>
                 <div className="h-4 w-32 bg-white/5 rounded mb-6"></div>
               </div>
               <div className="h-10 w-20 bg-white/10 rounded"></div>
             </div>
             
             <div className="w-full h-3 bg-white/5 rounded-full shadow-inner mt-4"></div>
           </CardContent>
        </Card>

        {/* Streak Card Skeleton */}
        <Card className="col-span-1 bg-zinc-900/30 border-white/5">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="h-4 w-24 bg-white/5 rounded mb-3"></div>
            <div className="flex items-baseline gap-2">
              <div className="h-8 w-12 bg-white/10 rounded"></div>
              <div className="h-4 w-8 bg-white/5 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-pulse">
        {/* Schedule Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
          
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="block w-full p-4 rounded-xl border border-white/5 bg-[#09090b]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 w-32 bg-white/5 rounded mb-2"></div>
                  <div className="h-5 w-56 max-w-[80%] bg-white/10 rounded"></div>
                </div>
                <div className="shrink-0 w-5 h-5 bg-white/5 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Integrations Skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
          
          <div className="h-[180px] bg-zinc-900/30 rounded-xl border border-white/5 w-full"></div>
          <div className="h-[300px] bg-zinc-900/30 rounded-xl border border-white/5 w-full"></div>
        </div>
      </div>
    </PageContainer>
  );
}
