"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Zap, ArrowRight, Loader2 } from "lucide-react";
import { completeOnboarding } from "@/actions/completeOnboarding";
import { Logo } from "@/components/ui/Logo";

type Step = 1 | 2 | 3;
type Persona = "quant" | "generalist" | null;
type Horizon = "14_days" | "30_days" | "3_months" | null;

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [persona, setPersona] = useState<Persona>(null);
  const [horizon, setHorizon] = useState<Horizon>(null);
  const [isSubmittingDiagnostic, setIsSubmittingDiagnostic] = useState(false);
  const [isSubmittingSkip, setIsSubmittingSkip] = useState(false);

  const handleComplete = async (runDiagnostic: boolean) => {
    if (!persona || !horizon) return;
    
    if (runDiagnostic) {
      setIsSubmittingDiagnostic(true);
    } else {
      setIsSubmittingSkip(true);
    }
    
    try {
      if (runDiagnostic) {
        // Route to the new shared diagnostic flow
        router.push(`/practice/diagnostic?source=onboarding&persona=${persona}&horizon=${horizon}`);
      } else {
        // Skip diagnostic, complete onboarding directly
        await completeOnboarding(persona, horizon);
        router.refresh();
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setIsSubmittingDiagnostic(false);
      setIsSubmittingSkip(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-4 flex flex-col items-center w-full">
        <Logo size="lg" className="mb-2" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">System Configuration</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Calibrate the NeuroQuant engine to your target objectives.
        </p>
      </div>

      <div className="w-full flex flex-col min-h-[420px]">
        
        {/* Dynamic Content Area (Fixed minimum height to prevent layout jumps) */}
        <div className="flex-1 w-full flex flex-col justify-center">
          
          {/* Step 1: Persona */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 w-full">
              <h2 className="text-xl font-semibold text-center text-white">Select your persona</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <button
                  onClick={() => setPersona("quant")}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
                    persona === "quant" 
                      ? "bg-[#00FF9D]/10 border-[#00FF9D] shadow-[0_0_30px_rgba(0,255,157,0.15)]" 
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${persona === "quant" ? "bg-[#00FF9D]/20 text-[#00FF9D]" : "bg-zinc-800 text-zinc-400 group-hover:text-white"}`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 transition-colors ${persona === "quant" ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>The Quant</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    20x20 multiplication. Sub-second targets. Built for trading floors.
                  </p>
                </button>

                <button
                  onClick={() => setPersona("generalist")}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
                    persona === "generalist" 
                      ? "bg-[#FF9500]/10 border-[#FF9500] shadow-[0_0_30px_rgba(255,149,0,0.15)]" 
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${persona === "generalist" ? "bg-[#FF9500]/20 text-[#FF9500]" : "bg-zinc-800 text-zinc-400 group-hover:text-white"}`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 transition-colors ${persona === "generalist" ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>The Generalist</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    12x12 multiplication. Standard timers. Solid arithmetic foundation.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Horizon */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 w-full">
              <h2 className="text-xl font-semibold text-center text-white">Select target horizon</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(["14_days", "30_days", "3_months"] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`flex-1 px-6 py-5 rounded-xl border font-bold transition-all cursor-pointer hover:-translate-y-1 ${
                      horizon === h
                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white hover:bg-zinc-800/80"
                    }`}
                  >
                    {h.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>

              <div className="text-center h-8 flex items-center justify-center">
                {horizon && (
                  <p className="text-zinc-400 text-sm animate-in fade-in slide-in-from-bottom-2">
                    Calculated Quota: <span className="text-white font-mono font-bold px-2 py-1 bg-zinc-800 rounded mx-1">
                      {horizon === "14_days" ? 150 : horizon === "30_days" ? 50 : 25}
                    </span> new cards/day
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Diagnostic */}
          {step === 3 && (
            <div className="space-y-8 w-full max-w-md mx-auto text-center animate-in fade-in slide-in-from-right-8 duration-500">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Baseline Diagnostic</h2>
                <p className="text-zinc-400 leading-relaxed">
                  Take a 60 second diagnostic to calibrate starting difficulty, or skip and start fresh.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  onClick={() => handleComplete(true)}
                  disabled={isSubmittingDiagnostic || isSubmittingSkip}
                  className="w-full py-4 btn-glow-green font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                  {isSubmittingDiagnostic ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <span className="text-black">Run 60s Diagnostic</span>}
                </button>
                
                <button
                  onClick={() => handleComplete(false)}
                  disabled={isSubmittingDiagnostic || isSubmittingSkip}
                  className="w-full py-4 bg-zinc-900 text-zinc-300 font-semibold rounded-xl border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingSkip ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Skip and start fresh</span>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons Area (Fixed Position at bottom of container) */}
        <div className="w-full flex justify-center items-center gap-6 mt-8 h-[60px]">
          {step === 1 && (
            <button
              disabled={!persona}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 text-zinc-400 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={!horizon}
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 3 && (
            <button
              onClick={() => setStep(2)}
              disabled={isSubmittingDiagnostic || isSubmittingSkip}
              className="px-6 py-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
