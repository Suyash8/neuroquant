"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useReflexSessionStore, ReflexQuestion } from "@/store/reflex";
import { X } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function SpeedEngineSession({ userId, initialQuestions, isCustom = false }: { userId: string, initialQuestions: ReflexQuestion[], isCustom?: boolean }) {
  const router = useRouter();
  const {
    isActive, queue, currentIndex, currentInput, startTime,
    startSession, endSession, setInput, submitAnswer
  } = useReflexSessionStore();

  const [feedback, setFeedback] = useState<"neutral" | "correct" | "incorrect">("neutral");

  // Ref for the timer display element to avoid React state re-renders
  const timerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(null);
  // Hidden input ref for mobile keyboard suppression
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Initialize session on mount
  useEffect(() => {
    if (initialQuestions.length > 0) {
      startSession(userId, initialQuestions, isCustom);
    }
    return () => { endSession(); };
  }, [startSession, endSession, userId, initialQuestions, isCustom]);

  // Fallback: sync data on tab close via sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = useReflexSessionStore.getState();
      if (state.userId && state.logs.length > 0 && !state.isCustom) {
        const payload = JSON.stringify({
          userId: state.userId,
          logs: state.logs,
        });
        navigator.sendBeacon("/api/sync-reflex", payload);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // High-performance timer loop
  useEffect(() => {
    if (!isActive || !startTime) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const updateTimer = () => {
      if (timerRef.current && startTime) {
        const elapsed = (performance.now() - startTime) / 1000;
        timerRef.current.textContent = elapsed.toFixed(2) + "s";
      }
      rafRef.current = requestAnimationFrame(updateTimer);
    };

    rafRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, startTime]);

  const currentQ = queue[currentIndex];

  // Handle Input Logic
  const handleInput = useCallback((val: string) => {
    if (!currentQ || feedback !== "neutral") return;

    const newInput = currentInput + val;
    setInput(newInput);

    // Check correctness
    if (newInput === currentQ.answer) {
      setFeedback("correct");
      submitAnswer(true, false);

      // Flash is visible for ~120ms, then advance
      setTimeout(async () => {
        setFeedback("neutral");
        const state = useReflexSessionStore.getState();
        if (!state.isActive) {
          // Session is finished, sync and redirect
          await state.endSession();
          router.push("/practice/reflex/summary");
        }
      }, 120);

    } else if (newInput.length >= currentQ.answer.length) {
      // Wrong answer — digits match expected length, auto-clear
      setFeedback("incorrect");
      submitAnswer(false, true);

      setTimeout(() => {
        setFeedback("neutral");
      }, 350); // Let the CSS shake animation (300ms) finish plus a beat
    }
  }, [currentQ, currentInput, feedback, setInput, submitAnswer, router]);

  const handleBackspace = useCallback(() => {
    if (currentInput.length > 0 && feedback === "neutral") {
      setInput(currentInput.slice(0, -1));
    }
  }, [currentInput, feedback, setInput]);

  // Desktop Keydown Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleInput(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput, handleBackspace]);

  // Focus hidden input on mobile to prevent native keyboard issues
  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [currentIndex]);

  if (!isActive || !currentQ) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progressPct = ((currentIndex) / queue.length) * 100;

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden touch-manipulation select-none">
      {/* Hidden input to trap focus and prevent native keyboard on mobile */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="none"
        autoComplete="off"
        readOnly
        aria-hidden="true"
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
      />

      {/* Top Bar / Progress */}
      <ProgressBar progress={progressPct} className="rounded-none absolute top-0 inset-x-0 h-1 bg-white/5" />

      <div className="absolute top-6 inset-x-6 flex justify-between items-center z-10">
        <button
          onClick={async () => {
            const state = useReflexSessionStore.getState();
            if (state.userId && state.logs.length > 0 && !state.isCustom) {
              const payload = {
                userId: state.userId,
                logs: state.logs,
              };
              await fetch("/api/sync-reflex", {
                method: "POST",
                body: JSON.stringify(payload)
              });
            }
            router.push("/practice/reflex");
          }}
          className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full backdrop-blur-md border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Ticking Timer */}
        <div
          ref={timerRef}
          className="font-mono text-zinc-400 font-medium tracking-wider bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5 text-sm"
        >
          0.00s
        </div>
      </div>

      {/* Main Testing Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-12 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.1 }}
            className="text-center"
          >
            {/* The Question */}
            <h1 className={`text-[5rem] md:text-[10rem] lg:text-[12rem] font-mono font-black tracking-tighter transition-all duration-200 ${feedback === "correct" ? "text-primary drop-shadow-[0_0_40px_rgba(var(--primary-rgb),0.8)] scale-105" : "text-white"}`}>
              {currentQ.question}
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* The Input Display */}
        <div className={`w-full flex flex-col items-center justify-center transition-transform mt-4 ${feedback === "incorrect" ? 'animate-shake' : ''}`}>
          <div className="h-32 w-full flex items-center justify-center">
            <span className={`text-[5rem] md:text-[8rem] font-mono font-bold leading-none transition-all duration-150 ${feedback === "correct" ? 'text-primary scale-110 drop-shadow-[0_0_40px_rgba(var(--primary-rgb),1)] opacity-0' : feedback === "incorrect" ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'text-zinc-300'}`}>
              {currentInput || (
                <span className="opacity-30 animate-pulse">_</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Custom Numpad */}
      <div className="md:hidden bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 p-4 grid grid-cols-3 gap-3 pb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0].map((key, i) => (
          <button
            key={i}
            onClick={() => key === "⌫" ? handleBackspace() : handleInput(key.toString())}
            className={`
              h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-semibold text-white
              active:bg-white/10 active:scale-95 transition-all touch-manipulation shadow-sm border border-white/5
              ${key === "⌫" ? "text-red-400" : ""}
              ${key === 0 ? "col-start-2" : ""}
            `}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
