import { Card, CardContent } from "@/components/ui/Card";
import { Zap } from "lucide-react";

export default function MathLoading() {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 justify-center animate-pulse">
      <div className="mb-8 flex justify-between items-center text-sm font-bold text-zinc-500 tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-500/50" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
        <div>
          <div className="h-4 w-12 bg-white/10 rounded" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden group mb-8 min-h-[300px] flex flex-col justify-center">
          <CardContent className="p-8 md:p-12 text-center flex flex-col items-center justify-center h-full">
            
            {/* Math specific: Huge text for numbers */}
            <div className="h-20 md:h-24 w-1/2 bg-white/10 rounded-2xl mb-8"></div>
            
            {/* Math specific: Input field with bottom border */}
            <div className="w-full max-w-[200px] mt-8">
              <div className="w-full h-16 bg-black/50 border-b-2 border-white/10 rounded-t-lg"></div>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
