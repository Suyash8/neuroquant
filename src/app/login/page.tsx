"use client";

import { login, signup } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/ui/Logo";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="w-full max-w-md p-8 mynt-card flex flex-col items-center">
      <Logo size="lg" className="mb-6 shadow-primary/20" />
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to NeuroQuant</h2>
      <p className="text-zinc-400 mb-8 text-center text-sm">
        Log in or sign up to save your progress and compete on the global leaderboard.
      </p>

      {error && (
        <div className="w-full p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form className="w-full flex flex-col gap-4">
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

        <div className="flex gap-4 mt-6">
          <button
            formAction={login}
            className="flex-1 btn-glow-green py-3 rounded-xl transition-colors"
          >
            Log In
          </button>
          <button
            formAction={signup}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Sign Up
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
