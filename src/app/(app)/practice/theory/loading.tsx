import { Card, CardContent } from "@/components/ui/Card";
import { Brain } from "lucide-react";

export default function TheoryLoading() {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 justify-center animate-pulse">
      <div className="mb-8 flex justify-between items-center text-sm font-bold text-zinc-500 tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500/50" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
        <div>
          <div className="h-4 w-12 bg-white/10 rounded" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden group mb-8 min-h-[300px] flex flex-col justify-center">
          <CardContent className="p-8 md:p-12 text-center flex flex-col items-center justify-center h-full">
            
            {/* Theory specific: Normal sized text for sentences */}
            <div className="space-y-3 w-full flex flex-col items-center mb-8">
              <div className="h-10 w-full max-w-md bg-white/10 rounded-xl"></div>
              <div className="h-10 w-3/4 max-w-sm bg-white/10 rounded-xl"></div>
            </div>
            
            {/* Theory specific: "Show Answer" button */}
            <div className="w-full mt-8 flex justify-center">
              <div className="h-12 w-full max-w-xs bg-white/5 rounded-md border border-transparent"></div>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
