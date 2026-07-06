"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Target, Zap, ArrowRight, Loader2 } from "lucide-react";
import { completeOnboarding } from "@/actions/completeOnboarding";

type Step = 1 | 2 | 3;
type Persona = "quant" | "generalist" | null;
type Horizon = "14_days" | "30_days" | "3_months" | null;

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [persona, setPersona] = useState<Persona>(null);
  const [horizon, setHorizon] = useState<Horizon>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (runDiagnostic: boolean) => {
    if (!persona || !horizon) return;
    setIsSubmitting(true);
    try {
      // In a real scenario, runDiagnostic would route to a diagnostic test
      // and pass the result here. For now, we use a placeholder score.
      await completeOnboarding(persona, horizon, 0);
      
      // Force hard navigation to reload the app with new layout states
      if (runDiagnostic) {
        window.location.href = "/practice/reflex/sudden-death";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-2">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">System Configuration</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Calibrate the NeuroQuant engine to your target objectives.
        </p>
      </div>

      {/* Step 1: Persona */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-white">Select Persona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPersona("quant")}
              className={`text-left p-6 rounded-xl border transition-all duration-300 ${
                persona === "quant" 
                  ? "bg-[#00FF9D]/10 border-[#00FF9D] shadow-[0_0_20px_rgba(0,255,157,0.2)]" 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-[#00FF9D]/20 text-[#00FF9D] flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">The Quant</h3>
              <p className="text-sm text-gray-400">
                20x20 multiplication. Sub-second targets. Built for trading floors.
              </p>
            </button>

            <button
              onClick={() => setPersona("generalist")}
              className={`text-left p-6 rounded-xl border transition-all duration-300 ${
                persona === "generalist" 
                  ? "bg-[#FF9500]/10 border-[#FF9500] shadow-[0_0_20px_rgba(255,149,0,0.2)]" 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-[#FF9500]/20 text-[#FF9500] flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">The Generalist</h3>
              <p className="text-sm text-gray-400">
                12x12 multiplication. Standard timers. Solid arithmetic foundation.
              </p>
            </button>
          </div>
          
          <div className="flex justify-end pt-8">
            <button
              disabled={!persona}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg disabled:opacity-50 transition-opacity"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Horizon */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-white">Target Horizon</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(["14_days", "30_days", "3_months"] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-6 py-4 rounded-xl border font-semibold transition-all ${
                  horizon === h
                    ? "bg-white text-black border-white"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-white/30"
                }`}
              >
                {h.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          <div className="text-center h-8">
            {horizon && (
              <p className="text-gray-400 text-sm animate-in fade-in">
                Calculated Quota: <span className="text-white font-mono font-medium">
                  {horizon === "14_days" ? 150 : horizon === "30_days" ? 50 : 25}
                </span> new cards/day
              </p>
            )}
          </div>

          <div className="flex justify-between pt-8">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium"
            >
              Back
            </button>
            <button
              disabled={!horizon}
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg disabled:opacity-50 transition-opacity"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Diagnostic */}
      {step === 3 && (
        <div className="space-y-8 max-w-lg mx-auto text-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Baseline Diagnostic</h2>
            <p className="text-gray-400">
              Take a 60 second diagnostic to calibrate starting difficulty, or start fresh.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleComplete(true)}
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Run 60s Diagnostic"}
            </button>
            
            <button
              onClick={() => handleComplete(false)}
              disabled={isSubmitting}
              className="w-full py-4 bg-white/5 text-gray-300 font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Skip and start fresh
            </button>
          </div>
          
          <div className="flex justify-start">
            <button
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-500 hover:text-white transition-colors text-sm font-medium"
            >
              Back
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
