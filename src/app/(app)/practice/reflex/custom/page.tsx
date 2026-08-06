"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Play, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CustomSkirmishPage() {
  const router = useRouter();
  
  const [op, setOp] = useState<string>("mixed");
  const [tier, setTier] = useState<string>("standard");
  const [dur, setDur] = useState<string>("20");

  const handleLaunch = () => {
    router.push(`/practice/reflex/session?mode=custom&op=${op}&tier=${tier}&dur=${dur}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <Link href="/practice/reflex" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Reflex Engine
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-xs font-bold uppercase tracking-wider mb-4">
          Sandbox Mode
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Custom Skirmish</h1>
        <p className="text-zinc-400 text-lg">Target your specific weaknesses. Configure operators, digits, and constraints.</p>
      </header>

      <Card className="bg-zinc-950/80 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Settings2 className="w-5 h-5 text-blue-500" />
            </div>
            <CardTitle className="text-xl">Mission Parameters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8 relative z-10">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Operators</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'addition', label: 'Addition (+)' },
                { id: 'subtraction', label: 'Subtraction (-)' },
                { id: 'multiplication', label: 'Multiplication (×)' },
                { id: 'division', label: 'Division (÷)' },
                { id: 'mixed', label: 'Mixed' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  onClick={() => setOp(opt.id)}
                  className={`px-5 py-3 rounded-lg border font-medium transition-colors ${op === opt.id ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'border-white/10 bg-white/5 hover:bg-white/10 text-white'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Difficulty Tier</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'warmup', name: 'Warmup', desc: '1x1, 2x1' },
                { id: 'standard', name: 'Standard', desc: '2x2, 3x1' },
                { id: 'hard', name: 'Hard', desc: '3x2, 3x3' },
                { id: 'insane', name: 'Insane', desc: '4x2, 4x3' }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTier(t.id)} 
                  className={`flex flex-col items-start p-4 rounded-xl border transition-colors text-left ${tier === t.id ? 'bg-blue-500/20 border-blue-500/50' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <span className={`font-bold mb-1 ${tier === t.id ? 'text-blue-400' : 'text-white'}`}>{t.name}</span>
                  <span className="text-xs text-zinc-500">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Duration</h3>
            <div className="flex gap-3">
              {[
                { id: '20', label: '20 Questions' },
                { id: '50', label: '50 Questions' },
                { id: '100', label: '100 Questions' },
                { id: 'endless', label: 'Endless' }
              ].map(d => (
                <button 
                  key={d.id} 
                  onClick={() => setDur(d.id)}
                  className={`px-5 py-3 rounded-lg border font-medium transition-colors ${dur === d.id ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'border-white/10 bg-white/5 hover:bg-white/10 text-white'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5">
            <Button onClick={handleLaunch} className="w-full py-6 text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] border-none">
              <Play className="w-5 h-5 mr-2" /> Launch Skirmish
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
