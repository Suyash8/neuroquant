import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function LoginLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 border-white/5 bg-zinc-950/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-pulse">
        <CardHeader className="flex flex-col items-center pt-8 pb-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 mb-6"></div>
          <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
          <div className="h-4 w-64 bg-white/5 rounded-lg mt-2"></div>
        </CardHeader>
        
        <CardContent>
          <div className="w-full flex flex-col gap-4 relative">
            <div className="space-y-1.5">
              <div className="h-4 w-12 bg-white/10 rounded"></div>
              <div className="h-14 w-full bg-white/5 rounded-xl"></div>
            </div>

            <div className="space-y-1.5">
              <div className="h-4 w-20 bg-white/10 rounded"></div>
              <div className="h-14 w-full bg-white/5 rounded-xl"></div>
            </div>

            <div className="w-full mt-2 h-14 bg-white/10 rounded-xl"></div>
            <div className="mt-4 mx-auto h-4 w-48 bg-white/5 rounded"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
