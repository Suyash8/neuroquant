import { Card, CardContent } from "@/components/ui/Card";

export default function PracticeLoading() {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 justify-center animate-pulse">
      <div className="mb-8 flex justify-between items-center text-sm font-bold text-zinc-500 tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-white/10" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
        <div>
          <div className="h-4 w-12 bg-white/10 rounded" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden group mb-8 min-h-[300px] flex flex-col justify-center">
          <CardContent className="p-8 md:p-12 text-center flex flex-col items-center justify-center h-full">
            
            <div className="h-12 md:h-16 w-2/3 bg-white/10 rounded-xl mb-8"></div>
            
            <div className="w-full mt-8">
              <div className="h-12 w-full max-w-xs mx-auto bg-white/5 rounded-md"></div>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
