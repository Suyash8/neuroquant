"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, Zap, ArrowRight, Loader2, Check } from "lucide-react";
import { completeOnboarding } from "@/actions/completeOnboarding";
import { checkUsernameAvailability } from "@/actions/checkUsername";
import { Logo } from "@/components/ui/Logo";
import { motion, AnimatePresence, Variants } from "framer-motion";

type Step = 1 | 2 | 3 | 4;
type Persona = "quant" | "generalist" | null;
type Horizon = "14_days" | "30_days" | "3_months" | null;

interface SelectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  colorBase: string; // e.g. "0, 255, 157" for quant
}

function SelectionCard({ title, description, icon, isActive, onClick, colorBase }: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-4 rounded-xl text-left transition-all duration-300
        border overflow-hidden
        ${isActive ? 'border-transparent' : 'border-white/10 hover:border-white/20'}
      `}
      style={{
        background: isActive 
          ? `linear-gradient(135deg, rgba(${colorBase}, 0.15), rgba(${colorBase}, 0.05))` 
          : 'rgba(255, 255, 255, 0.03)',
        boxShadow: isActive 
          ? `rgba(${colorBase}, 0.19) 0px 8px 32px, rgba(${colorBase}, 0.25) 0px 0px 0px 1px` 
          : 'none',
        transform: isActive ? 'scale(1.02)' : 'none'
      }}
    >
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-500" 
        style={{
          border: `2px solid rgb(${colorBase})`, 
          opacity: isActive ? 1 : 0, 
          transform: isActive ? 'scale(1)' : 'scale(1.05)'
        }} 
      />
      
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500" 
        style={{
          background: `radial-gradient(circle at 50% 0%, rgba(${colorBase}, 0.2), transparent 70%)`, 
          opacity: isActive ? 1 : 0
        }} 
      />

      <div 
        className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center z-20 transition-all duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} 
        style={{
          background: `linear-gradient(135deg, rgb(${colorBase}), rgba(${colorBase}, 0.8))`, 
          boxShadow: `rgba(${colorBase}, 0.3) 0px 2px 10px`
        }}
      >
        <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div 
          className="p-3 rounded-lg mb-3 transition-all duration-300" 
          style={{
            background: isActive ? `linear-gradient(135deg, rgba(${colorBase}, 0.25), rgba(${colorBase}, 0.1))` : 'rgba(255, 255, 255, 0.05)', 
            transform: isActive ? 'scale(1.1)' : 'none',
            color: isActive ? `rgb(${colorBase})` : 'rgb(156, 163, 175)'
          }}
        >
          {icon}
        </div>
        <h4 
          className="font-bold text-lg mb-1 transition-colors duration-300" 
          style={{ color: isActive ? '#fff' : '#d1d5db' }}
        >
          {title}
        </h4>
        <p 
          className="text-xs transition-colors duration-300 leading-relaxed max-w-[200px]" 
          style={{ color: isActive ? '#a1a1aa' : '#6b7280' }}
        >
          {description}
        </p>
      </div>
    </button>
  );
}

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  const [persona, setPersona] = useState<Persona>(null);
  const [horizon, setHorizon] = useState<Horizon>(null);
  
  const [isSubmittingDiagnostic, setIsSubmittingDiagnostic] = useState(false);
  const [isSubmittingSkip, setIsSubmittingSkip] = useState(false);

  // Debounced username check
  useEffect(() => {
    if (username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      const available = await checkUsernameAvailability(username);
      setIsUsernameAvailable(available);
      setIsCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleComplete = async (runDiagnostic: boolean) => {
    if (!persona || !horizon || !username || !isUsernameAvailable) return;
    
    if (runDiagnostic) {
      setIsSubmittingDiagnostic(true);
    } else {
      setIsSubmittingSkip(true);
    }
    
    try {
      if (runDiagnostic) {
        // First save the username before redirecting
        await completeOnboarding(persona, horizon, username);
        router.push(`/practice/diagnostic?source=onboarding&persona=${persona}&horizon=${horizon}`);
      } else {
        await completeOnboarding(persona, horizon, username);
        router.refresh();
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setIsSubmittingDiagnostic(false);
      setIsSubmittingSkip(false);
    }
  };

  const variants: Variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      scale: 0.95,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    })
  };

  const [direction, setDirection] = useState(1);
  
  const changeStep = (newStep: Step) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-center space-y-4 flex flex-col items-center w-full mb-12"
      >
        <Logo size="lg" className="mb-2" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">System Configuration</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Calibrate the NeuroQuant engine to your target objectives.
        </p>
      </motion.div>

      <div className="w-full max-w-2xl relative min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          
          {/* STEP 1: USERNAME */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md mx-auto space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Claim your handle</h2>
                <p className="text-zinc-400 text-sm">Your unique identifier on the global leaderboard.</p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. operator_99"
                  className={`
                    w-full bg-zinc-900/50 border-2 rounded-xl px-6 py-4 text-white text-lg font-medium outline-none transition-all duration-300
                    focus:bg-zinc-900
                    ${username.length > 0 && username.length < 3 ? 'border-red-500/50 focus:border-red-500' : ''}
                    ${isUsernameAvailable === true ? 'border-[#00FF9D]/50 focus:border-[#00FF9D] shadow-[0_0_20px_rgba(0,255,157,0.15)]' : ''}
                    ${isUsernameAvailable === false ? 'border-red-500/50 focus:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : ''}
                    ${isUsernameAvailable === null && username.length >= 3 ? 'border-zinc-700 focus:border-white/20' : 'border-zinc-800'}
                  `}
                />
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isCheckingUsername && <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />}
                  {isUsernameAvailable === true && !isCheckingUsername && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#00FF9D] flex items-center text-sm font-bold gap-1">
                      <Check className="w-5 h-5" /> Available
                    </motion.div>
                  )}
                  {isUsernameAvailable === false && !isCheckingUsername && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500 text-sm font-bold">
                      Taken
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PERSONA */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-8"
            >
              <h2 className="text-xl font-semibold text-center text-white">Select your persona</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <SelectionCard
                  title="The Quant"
                  description="20x20 multiplication. Sub-second targets. Built for trading floors."
                  icon={<Zap className="w-7 h-7" />}
                  isActive={persona === "quant"}
                  onClick={() => setPersona("quant")}
                  colorBase="0, 255, 157" // #00FF9D
                />
                <SelectionCard
                  title="The Generalist"
                  description="12x12 multiplication. Standard timers. Solid arithmetic foundation."
                  icon={<Target className="w-7 h-7" />}
                  isActive={persona === "generalist"}
                  onClick={() => setPersona("generalist")}
                  colorBase="255, 149, 0" // #FF9500
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: HORIZON */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-8"
            >
              <h2 className="text-xl font-semibold text-center text-white">Select target horizon</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <SelectionCard
                  title="14 Days"
                  description="150 new cards/day. Extreme intensity."
                  icon={<Zap className="w-6 h-6" />}
                  isActive={horizon === "14_days"}
                  onClick={() => setHorizon("14_days")}
                  colorBase="239, 68, 68" // Red
                />
                <SelectionCard
                  title="30 Days"
                  description="50 new cards/day. Balanced steady pace."
                  icon={<Target className="w-6 h-6" />}
                  isActive={horizon === "30_days"}
                  onClick={() => setHorizon("30_days")}
                  colorBase="59, 130, 246" // Blue
                />
                <SelectionCard
                  title="3 Months"
                  description="25 new cards/day. Casual learning."
                  icon={<Target className="w-6 h-6" />}
                  isActive={horizon === "3_months"}
                  onClick={() => setHorizon("3_months")}
                  colorBase="168, 85, 247" // Purple
                />
              </div>
            </motion.div>
          )}

          {/* STEP 4: DIAGNOSTIC */}
          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md mx-auto text-center space-y-8"
            >
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
                  className="w-full py-4 btn-glow-green font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                  {isSubmittingDiagnostic ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <span className="text-black">Run 60s Diagnostic</span>}
                </button>
                
                <button
                  onClick={() => handleComplete(false)}
                  disabled={isSubmittingDiagnostic || isSubmittingSkip}
                  className="w-full py-4 bg-zinc-900 text-zinc-300 font-semibold rounded-xl border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmittingSkip ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Skip and start fresh</span>}
                </button>
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>

      {/* Navigation Buttons Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full flex justify-center items-center gap-6 mt-12 h-[60px]"
      >
        {step > 1 && step < 4 && (
          <button
            onClick={() => changeStep((step - 1) as Step)}
            className="px-6 py-4 text-zinc-500 hover:text-white transition-colors font-medium cursor-pointer"
          >
            Back
          </button>
        )}

        {step === 1 && (
          <button
            disabled={!isUsernameAvailable}
            onClick={() => changeStep(2)}
            className={`
              flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all
              ${isUsernameAvailable 
                ? 'bg-[#00FF9D] hover:bg-[#00e68d] text-black shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:scale-105 active:scale-95 cursor-pointer' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'}
            `}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {step === 2 && (
          <button
            disabled={!persona}
            onClick={() => changeStep(3)}
            className={`
              flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all
              ${persona 
                ? 'bg-white hover:bg-zinc-200 text-black hover:scale-105 active:scale-95 cursor-pointer' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'}
            `}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {step === 3 && (
          <button
            disabled={!horizon}
            onClick={() => changeStep(4)}
            className={`
              flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all
              ${horizon 
                ? 'bg-white hover:bg-zinc-200 text-black hover:scale-105 active:scale-95 cursor-pointer' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'}
            `}
          >
            Complete Setup <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {step === 4 && (
          <button
            onClick={() => changeStep(3)}
            disabled={isSubmittingDiagnostic || isSubmittingSkip}
            className="px-6 py-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            Back
          </button>
        )}
      </motion.div>
    </div>
  );
}
