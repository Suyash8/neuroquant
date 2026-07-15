"use client";

import { login, signup } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (mode === "login") {
        await login(formData);
      } else {
        await signup(formData);
      }
    });
  };

  return (
    <div className="w-full max-w-md p-8 mynt-card flex flex-col items-center">
      <Logo size="lg" className="mb-6 shadow-primary/20" />
      <h2 className="text-2xl font-bold text-white mb-8">
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h2>

      {error && (
        <div className="w-full p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="w-full p-3 mb-6 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
          {message}
        </div>
      )}

      <form action={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold tracking-wider uppercase text-zinc-500" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold tracking-wider uppercase text-zinc-500" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 flex items-center justify-center gap-2 btn-glow-green py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {mode === "login" 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Log in"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
