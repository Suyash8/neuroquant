"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, Zap, ArrowRight, Loader2, Check } from "lucide-react";
import { completeOnboarding } from "@/actions/completeOnboarding";
import { checkUsernameAvailability } from "@/actions/checkUsername";
import { Logo } from "@/components/ui/Logo";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Step = 1 | 2 | 3 | 4;
type Persona = "quant" | "generalist" | null;
type Horizon = "14_days" | "30_days" | "3_months" | null;

interface SelectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
}

function SelectionCard({ title, description, icon, isActive, onClick, colorClass }: SelectionCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`
        relative p-6 text-left transition-all duration-300 cursor-pointer border
        ${isActive ? 'border-transparent bg-zinc-900 shadow-lg scale-[1.02]' : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-white/20'}
      `}
    >
      <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-500 border-2 opacity-0 scale-105 ${colorClass}`} 
           style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'scale(1)' : 'scale(1.05)' }} />
      
      <div className="flex flex-col h-full gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/5 transition-colors ${isActive ? colorClass.replace('border-', 'text-') : 'text-zinc-500'}`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-lg font-bold mb-2 transition-colors ${isActive ? 'text-white' : 'text-zinc-300'}`}>{title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
        </div>
        
        <div className={`mt-auto w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? colorClass.replace('border-', 'bg-').replace('border-', 'border-') + ' text-black' : 'border-zinc-700 bg-transparent'}`}>
          {isActive && <Check className="w-4 h-4" />}
        </div>
      </div>
    </Card>
  );
}

export default function OnboardingClient({ userId, email }: { userId: string, email: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);

  // Step 1: Profile
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  // Step 2: Persona
  const [persona, setPersona] = useState<Persona>(null);

  // Step 3: Horizon
  const [horizon, setHorizon] = useState<Horizon>(null);

  // Submit states
  const [isSubmittingDiagnostic, setIsSubmittingDiagnostic] = useState(false);
  const [isSubmittingSkip, setIsSubmittingSkip] = useState(false);

  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setIsUsernameAvailable(null);
        return;
      }
      setIsCheckingUsername(true);
      const isAvailable = await checkUsernameAvailability(username);
      setIsUsernameAvailable(isAvailable);
      setIsCheckingUsername(false);
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const changeStep = (newStep: Step) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const handleComplete = async (doDiagnostic: boolean) => {
    if (!persona || !horizon || !username || !isUsernameAvailable) return;
    
    if (doDiagnostic) setIsSubmittingDiagnostic(true);
    else setIsSubmittingSkip(true);

    const result = await completeOnboarding({
      username,
      persona,
      horizon,
      source: "organic" // Defaulting to organic
    });

    if (result.success) {
      if (doDiagnostic) {
        router.push(`/practice/diagnostic?persona=${persona}&horizon=${horizon}&source=organic`);
      } else {
        router.push("/");
      }
    } else {
      if (doDiagnostic) setIsSubmittingDiagnostic(false);
      else setIsSubmittingSkip(false);
      alert(result.error || "Failed to complete setup");
    }
  };

  const variants: Variants = {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 40 : -40,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -40 : 40,
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
    })
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-3xl flex justify-between items-center mb-16 relative z-10">
        <Logo />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step ? 'w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md mx-auto space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Claim your identity</h2>
                <p className="text-zinc-400">Choose a unique handle for the leaderboards.</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="Username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. quant_master"
                    maxLength={20}
                  />
                  <div className="absolute right-4 top-[38px] flex items-center">
                    {isCheckingUsername && (
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                    )}
                    {isUsernameAvailable === true && !isCheckingUsername && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-primary text-sm font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Available
                      </motion.div>
                    )}
                    {isUsernameAvailable === false && !isCheckingUsername && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500 text-sm font-bold">
                        Taken
                      </motion.div>
                    )}
                  </div>
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
              className="w-full space-y-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Select your persona</h2>
                <p className="text-zinc-400">This calibrates your baseline difficulty.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <SelectionCard
                  title="The Quant"
                  description="20x20 multiplication. Sub-second targets. Built for trading floors."
                  icon={<Zap className="w-8 h-8" />}
                  isActive={persona === "quant"}
                  onClick={() => setPersona("quant")}
                  colorClass="border-primary text-primary bg-primary"
                />
                <SelectionCard
                  title="The Generalist"
                  description="12x12 multiplication. Standard timers. Solid arithmetic foundation."
                  icon={<Target className="w-8 h-8" />}
                  isActive={persona === "generalist"}
                  onClick={() => setPersona("generalist")}
                  colorClass="border-blue-500 text-blue-500 bg-blue-500"
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
              className="w-full space-y-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Select target horizon</h2>
                <p className="text-zinc-400">How intense should your daily practice be?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                <SelectionCard
                  title="14 Days"
                  description="150 new cards/day. Extreme intensity."
                  icon={<Zap className="w-6 h-6" />}
                  isActive={horizon === "14_days"}
                  onClick={() => setHorizon("14_days")}
                  colorClass="border-red-500 text-red-500 bg-red-500"
                />
                <SelectionCard
                  title="30 Days"
                  description="50 new cards/day. Balanced steady pace."
                  icon={<Target className="w-6 h-6" />}
                  isActive={horizon === "30_days"}
                  onClick={() => setHorizon("30_days")}
                  colorClass="border-blue-500 text-blue-500 bg-blue-500"
                />
                <SelectionCard
                  title="3 Months"
                  description="25 new cards/day. Casual learning."
                  icon={<Target className="w-6 h-6" />}
                  isActive={horizon === "3_months"}
                  onClick={() => setHorizon("3_months")}
                  colorClass="border-purple-500 text-purple-500 bg-purple-500"
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
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Baseline Diagnostic</h2>
                <p className="text-zinc-400 leading-relaxed">
                  Take a 60 second diagnostic to calibrate starting difficulty, or skip and start fresh.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  onClick={() => handleComplete(true)}
                  disabled={isSubmittingDiagnostic || isSubmittingSkip}
                  className="w-full py-6 text-lg"
                  variant="primary"
                >
                  {isSubmittingDiagnostic ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Run 60s Diagnostic</span>}
                </Button>

                <Button
                  onClick={() => handleComplete(false)}
                  disabled={isSubmittingDiagnostic || isSubmittingSkip}
                  className="w-full py-6 text-lg"
                  variant="secondary"
                >
                  {isSubmittingSkip ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Skip and start fresh</span>}
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation Buttons Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl flex justify-between items-center mt-12 h-[60px] relative z-10 border-t border-white/5 pt-8"
      >
        <div>
          {step > 1 && step < 4 && (
            <button
              onClick={() => changeStep((step - 1) as Step)}
              className="px-6 py-3 text-zinc-400 hover:text-white transition-colors font-medium cursor-pointer"
            >
              Back
            </button>
          )}
          {step === 4 && (
            <button
              onClick={() => changeStep(3)}
              disabled={isSubmittingDiagnostic || isSubmittingSkip}
              className="px-6 py-3 text-zinc-400 hover:text-white transition-colors font-medium cursor-pointer disabled:opacity-50"
            >
              Back
            </button>
          )}
        </div>

        <div>
          {step === 1 && (
            <Button
              disabled={!isUsernameAvailable}
              onClick={() => changeStep(2)}
              variant={isUsernameAvailable ? "primary" : "secondary"}
              className="px-8"
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === 2 && (
            <Button
              disabled={!persona}
              onClick={() => changeStep(3)}
              variant={persona ? "primary" : "secondary"}
              className="px-8"
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === 3 && (
            <Button
              disabled={!horizon}
              onClick={() => changeStep(4)}
              variant={horizon ? "primary" : "secondary"}
              className="px-8"
            >
              Complete Setup <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
