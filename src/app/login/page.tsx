"use client";

import { useState, useTransition } from "react";
import { login, signup } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";
import { Loader2, Check, X } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isPending, startTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (formData: FormData) => {
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
    "bg-zinc-700", 
    "bg-red-500",  
    "bg-orange-500", 
    "bg-yellow-500", 
    "bg-primary" 
  ];

  const variants: Variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
      position: "absolute",
      width: "100%",
    }),
    animate: {
      x: 0,
      opacity: 1,
      position: "relative",
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -30 : 30,
      opacity: 0,
      position: "absolute",
      width: "100%",
      transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
    })
  };

  const isSignupValid = mode === "login" || (password.length >= 8 && password === confirmPassword);

  return (
    <Card className="w-full max-w-md relative z-10 border-white/5 bg-zinc-950/80 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <CardHeader className="flex flex-col items-center pt-8 pb-4">
        <Logo />
        <CardTitle className="mt-6 text-2xl font-bold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <p className="text-zinc-400 text-sm mt-2 text-center">
          {mode === "login" 
            ? "Enter your credentials to access your dashboard"
            : "Sign up to start tracking your cognitive performance"
          }
        </p>
      </CardHeader>
      
      <CardContent>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full p-3 mb-6 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
            {message}
          </motion.div>
        )}

        <form action={handleSubmit} className="w-full flex flex-col gap-4 relative">
          
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            required
            placeholder="you@example.com"
          />

          <div className="relative w-full min-h-[100px] overflow-hidden">
            <AnimatePresence initial={false} custom={mode === "login" ? -1 : 1}>
              
              {mode === "login" && (
                <motion.div
                  key="login-fields"
                  custom={-1}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col gap-1.5 pb-2"
                >
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    required
                    placeholder="••••••••"
                  />
                </motion.div>
              )}

              {mode === "signup" && (
                <motion.div
                  key="signup-fields"
                  custom={1}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col gap-4 pb-2"
                >
                  <div className="flex flex-col gap-1.5">
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      label="Choose Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />

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
                        <span className={password.length >= 8 ? 'text-primary' : ''}>8+ chars</span>
                        <span className={/[A-Z]/.test(password) ? 'text-primary' : ''}>Upper</span>
                        <span className={/[0-9]/.test(password) ? 'text-primary' : ''}>Number</span>
                        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-primary' : ''}>Symbol</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type="password"
                        label="Confirm Password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : confirmPassword && password === confirmPassword ? 'border-primary focus:border-primary focus:ring-primary/20' : ''}
                      />
                      <div className="absolute right-4 top-[38px]">
                        {confirmPassword && password === confirmPassword && <Check className="w-4 h-4 text-primary" />}
                        {confirmPassword && password !== confirmPassword && <X className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            disabled={isPending || !isSignupValid}
            variant="primary"
            className="w-full mt-2 py-6 text-lg"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Secure Log In" : "Create Account"}
          </Button>

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
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
