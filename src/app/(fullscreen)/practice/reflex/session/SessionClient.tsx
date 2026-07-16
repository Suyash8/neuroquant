"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useReflexSessionStore, ReflexQuestion } from "@/store/reflex";
import { X } from "lucide-react";

export default function SpeedEngineSession({ userId, initialQuestions }: { userId: string, initialQuestions: ReflexQuestion[] }) {
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
      startSession(userId, initialQuestions);
    }
    return () => { endSession(); };
  }, [startSession, endSession, userId, initialQuestions]);

  // Fallback: sync data on tab close via sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = useReflexSessionStore.getState();
      if (state.userId && state.logs.length > 0) {
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
      
      // Green flash is visible for ~120ms, then advance
      setTimeout(async () => {
        setFeedback("neutral");
        const state = useReflexSessionStore.getState();
        if (!state.isActive) {
          // Session is finished, sync and redirect
          await state.endSession();
          router.push("/practice/reflex");
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
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progressPct = ((currentIndex) / queue.length) * 100;

  return (
    <div className="h-full flex flex-col bg-[#0F1115] relative overflow-hidden touch-manipulation select-none">
      
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
      <div className="absolute top-0 inset-x-0 h-1 bg-white/10">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="absolute top-6 inset-x-6 flex justify-between items-center">
        <button 
          onClick={async () => {
            const state = useReflexSessionStore.getState();
            if (state.userId && state.logs.length > 0) {
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
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Ticking Timer */}
        <div 
          ref={timerRef} 
          className="font-mono text-gray-400 font-medium tracking-wider"
        >
          0.00s
        </div>
      </div>

      {/* Main Testing Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-12">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.05 }}
            transition={{ duration: 0.15 }}
            className="text-center"
          >
            {/* The Question */}
            <h1 className="text-7xl md:text-[9rem] font-mono font-bold tracking-tighter text-white mb-12">
              {currentQ.question}
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* The Input Display */}
        <motion.div
          animate={feedback === "correct" ? { scale: 1.05 } : { scale: 1 }}
          transition={feedback === "correct" ? { duration: 0.15, ease: "easeOut" } : { duration: 0 }}
          className={`w-full flex flex-col items-center justify-center ${feedback === "incorrect" ? 'animate-shake' : ''}`}
        >
          <AnimatePresence mode="wait">
            <div className="h-24 w-full flex items-center justify-center">
              <span className={`text-[80px] font-mono font-bold leading-none ${feedback === "correct" ? 'text-[var(--primary)] drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]' : feedback === "incorrect" ? 'text-[#FF453A] drop-shadow-[0_0_20px_rgba(255,69,58,0.5)]' : 'text-gray-400'}`}>
                {currentInput || "_"}
              </span>
            </div>
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Mobile Custom Numpad */}
      <div className="md:hidden bg-[#0a0c10] border-t border-white/5 p-4 grid grid-cols-3 gap-3 pb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0].map((key, i) => (
          <button
            key={i}
            onClick={() => key === "⌫" ? handleBackspace() : handleInput(key.toString())}
            className={`
              h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-semibold text-white
              active:bg-white/10 active:scale-95 transition-all touch-manipulation
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
