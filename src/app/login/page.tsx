"use client";

import { useState, useTransition } from "react";
import { login, signup } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { Loader2, Check, X } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isPending, startTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (formData: FormData) => {
    // Basic frontend validation for signup
    if (mode === "signup" && password !== confirmPassword) {
      return;
    }

    startTransition(async () => {
      if (mode === "login") {
        await login(formData);
      } else {
        await signup(formData);
      }
    });
  };

  // Calculate password strength (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  
  const strengthColors = [
    "bg-zinc-700", // 0
    "bg-red-500",  // 1
    "bg-orange-500", // 2
    "bg-yellow-500", // 3
    "bg-[#00FF9D]" // 4
  ];

  const variants: Variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
      position: "absolute" as const,
      width: "100%"
    }),
    animate: {
      x: 0,
      opacity: 1,
      position: "relative" as const,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -30 : 30,
      opacity: 0,
      position: "absolute" as const,
      width: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    })
  };

  const isSignupValid = mode !== "signup" || (password.length >= 8 && password === confirmPassword);

  return (
    <div className="w-full max-w-md mynt-card flex flex-col items-center overflow-hidden relative min-h-[550px]">
      <div className="p-8 w-full flex flex-col items-center z-10 relative">
        <Logo size="lg" className="mb-6 shadow-primary/20" />
        
        <h2 className="text-2xl font-bold text-white mb-8 transition-all">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full p-3 mb-6 rounded-lg bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] text-sm">
            {message}
          </motion.div>
        )}

        <form action={handleSubmit} className="w-full flex flex-col gap-4 relative">
          
          <div className="flex flex-col gap-1.5 z-20">
            <label className="text-xs font-bold tracking-wider uppercase text-zinc-500" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-zinc-900 focus:border-[#00FF9D]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]"
              placeholder="you@example.com"
            />
          </div>

          <div className="relative w-full min-h-[220px]">
            <AnimatePresence initial={false} custom={mode === "login" ? -1 : 1}>
              
              {/* LOGIN FIELDS */}
              {mode === "login" && (
                <motion.div
                  key="login-fields"
                  custom={-1}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col gap-1.5"
                >
                  <label className="text-xs font-bold tracking-wider uppercase text-zinc-500" htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-zinc-900 focus:border-[#00FF9D]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]"
                    placeholder="••••••••"
                  />
                </motion.div>
              )}

              {/* SIGNUP FIELDS */}
              {mode === "signup" && (
                <motion.div
                  key="signup-fields"
                  custom={1}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold tracking-wider uppercase text-zinc-500" htmlFor="signup-password">Choose Password</label>
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-zinc-900 focus:border-[#00FF9D]/50 focus:shadow-[0_0_15px_rgba(0,255,157,0.1)]"
                      placeholder="••••••••"
                    />
                    
                    {/* Password Strength Meter */}
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div 
                          key={level} 
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${strength >= level ? strengthColors[strength] : 'bg-zinc-800'}`} 
                        />
                      ))}
                    </div>
                    {password && (
                      <div className="flex gap-4 mt-1 text-[10px] text-zinc-500">
                        <span className={password.length >= 8 ? 'text-[#00FF9D]' : ''}>8+ chars</span>
                        <span className={/[A-Z]/.test(password) ? 'text-[#00FF9D]' : ''}>Upper</span>
                        <span className={/[0-9]/.test(password) ? 'text-[#00FF9D]' : ''}>Number</span>
                        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-[#00FF9D]' : ''}>Symbol</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold tracking-wider uppercase text-zinc-500" htmlFor="confirm-password">Confirm Password</label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full bg-zinc-900/80 border rounded-xl px-4 py-3.5 text-white outline-none transition-all duration-300 focus:bg-zinc-900 ${
                          confirmPassword && password !== confirmPassword 
                            ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                            : confirmPassword && password === confirmPassword
                              ? 'border-[#00FF9D]/50 focus:border-[#00FF9D] focus:shadow-[0_0_15px_rgba(0,255,157,0.15)]'
                              : 'border-zinc-800 focus:border-white/20'
                        }`}
                        placeholder="••••••••"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {confirmPassword && password === confirmPassword && <Check className="w-4 h-4 text-[#00FF9D]" />}
                        {confirmPassword && password !== confirmPassword && <X className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isPending || !isSignupValid}
            className={`
              w-full mt-2 flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all duration-300 
              ${isPending || !isSignupValid 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                : 'btn-glow-green text-black hover:scale-[1.02] active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(0,255,157,0.2)]'
              }
            `}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Secure Log In" : "Create Account"}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {mode === "login" 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FF9D]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
