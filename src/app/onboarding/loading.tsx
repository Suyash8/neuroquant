import { Card, CardContent } from "@/components/ui/Card";

export default function OnboardingLoading() {
  return (
    <div className="w-full flex-1 min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-4xl flex items-center justify-center animate-pulse">
        <Card className="w-full max-w-2xl bg-zinc-900/50 border-white/5 p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 mb-8"></div>
          <div className="h-10 md:h-12 w-3/4 bg-white/10 rounded-xl mb-4"></div>
          <div className="h-5 w-2/3 bg-white/5 rounded-lg mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="h-32 bg-white/5 rounded-2xl"></div>
            <div className="h-32 bg-white/5 rounded-2xl"></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
