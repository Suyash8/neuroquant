"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Clock, ArrowRight, Loader2, X } from "lucide-react";
import { saveDiagnosticResult } from "@/actions/saveDiagnosticResult";
import { generateMathQuestion, OperationLevel } from "@/lib/mathGenerator";

interface QueuedCard {
  id: string;
  cardId: string;
  question: string;
  answer: string;
  difficulty: number;
}

export default function DiagnosticClient({ 
  persona,
  horizon,
  source
}: { 
  persona: string | null;
  horizon: string | null;
  source: string | null;
}) {
  const router = useRouter();
  
  // Game State
  const [timeLeft, setTimeLeft] = useState(60);
  const [difficulty, setDifficulty] = useState(1);
  const [maxDifficultyReached, setMaxDifficultyReached] = useState(1);
  const [streak, setStreak] = useState(0);
  
  const [score, setScore] = useState(0); // correct answers
  const [attempts, setAttempts] = useState(0); // total answers
  const [totalVelocityMs, setTotalVelocityMs] = useState(0); // sum of time for correct answers

  const [isGameOver, setIsGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentCard, setCurrentCard] = useState<QueuedCard | null>(null);

  // Input & Animation State
  const [inputVal, setInputVal] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  const getNextCard = useCallback((targetDifficulty: number) => {
    const level = Math.min(10, Math.max(1, targetDifficulty)) as OperationLevel;
    const math = generateMathQuestion(level, true);
    
    return {
      id: crypto.randomUUID(),
      cardId: crypto.randomUUID(), // fake id for diagnostic tracking
      question: math.question,
      answer: math.answer,
      difficulty: level
    };
  }, []);

  // Initial load
  useEffect(() => {
    setCurrentCard(getNextCard(1));
  }, [getNextCard]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timerId = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft <= 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  useEffect(() => {
    if (!isGameOver) {
      inputRef.current?.focus();
    }
  }, [currentCard, isGameOver]);

  const triggerError = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(100);
    setIsError(true);
    setInputVal("");
    setStreak(0);
    setAttempts(a => a + 1);
    
    // Drop difficulty slightly if they fail, down to 1
    if (difficulty > 1) {
      setDifficulty(d => d - 1);
    }

    setTimeout(() => {
      setIsError(false);
      startTimeRef.current = Date.now();
      setCurrentCard(getNextCard(Math.max(1, difficulty - 1)));
    }, 250);
  }, [difficulty, getNextCard]);

  const handleCorrect = useCallback(() => {
    const timeTaken = Date.now() - startTimeRef.current;
    
    setScore(s => s + 1);
    setAttempts(a => a + 1);
    setTotalVelocityMs(v => v + timeTaken);
    
    setIsSuccess(true);
    setInputVal("");

    let newStreak = streak + 1;
    let newDifficulty = difficulty;

    // Promote difficulty after 3 correct in a row
    if (newStreak >= 3) {
      newDifficulty = Math.min(10, difficulty + 1);
      newStreak = 0;
    }

    setStreak(newStreak);
    setDifficulty(newDifficulty);
    setMaxDifficultyReached(prev => Math.max(prev, newDifficulty));

    setTimeout(() => {
      setIsSuccess(false);
      startTimeRef.current = Date.now();
      setCurrentCard(getNextCard(newDifficulty));
    }, 150);
  }, [streak, difficulty, getNextCard]);

  const handleInput = (val: string) => {
    if (isError || isSuccess || isGameOver || !currentCard) return;

    const newVal = inputVal + val;
    setInputVal(newVal);

    if (newVal === currentCard.answer) {
      handleCorrect();
    } else if (newVal.length >= currentCard.answer.length || (newVal.length > 0 && !currentCard.answer.startsWith(newVal))) {
      triggerError();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      setInputVal(prev => prev.slice(0, -1));
      return;
    }
    if (/^[0-9]$/.test(e.key)) {
      handleInput(e.key);
    }
  };

  const handleNumpadClick = (key: string) => {
    if (key === "backspace") {
      setInputVal(prev => prev.slice(0, -1));
      return;
    }
    handleInput(key);
  };

  const handleComplete = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const accuracy = attempts > 0 ? (score / attempts) * 100 : 0;
      const avgVelocity = score > 0 ? totalVelocityMs / score : 0;

      await saveDiagnosticResult(source, persona, horizon, {
        score,
        maxDifficultyReached,
        averageVelocityMs: avgVelocity,
        accuracy,
      });

      router.refresh();
      if (source === "settings") {
        router.push("/settings");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };

  if (isGameOver) {
    const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
    const avgVelocity = score > 0 ? (totalVelocityMs / score / 1000).toFixed(2) : "0.00";

    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500 w-full">
        <div className="mynt-card p-8 w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-[var(--primary)]" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Calibration Complete
            </h2>
            <p className="text-gray-400">Your baseline has been logged.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl">
              <div className="text-sm text-gray-400 mb-1">Score</div>
              <div className="text-3xl font-bold text-white">{score}</div>
            </div>
            <div className="bg-[var(--primary)]/10 p-4 rounded-xl border border-[var(--primary)]/20">
              <div className="text-sm text-[var(--primary)] mb-1">Accuracy</div>
              <div className="text-3xl font-bold text-white">{accuracy}%</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <div className="text-sm text-gray-400 mb-1">Avg Speed</div>
              <div className="text-3xl font-bold text-white">{avgVelocity}s</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Max Tier</div>
              <div className="text-3xl font-bold text-white">Lvl {maxDifficultyReached}</div>
            </div>
          </div>

          <button 
            onClick={handleComplete}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-4 btn-glow-green text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
            ) : (
              <>Continue to Dashboard <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 pb-8 h-[100dvh] w-full max-w-sm mx-auto select-none">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
          <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty indicator (up to 10 levels) */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${i < difficulty ? 'bg-[var(--primary)]' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--primary)]" />
          <span className="font-bold text-white">{score}</span>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <input 
          ref={inputRef}
          type="text" 
          inputMode="none" // Prevent mobile keyboard
          value={inputVal}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 pointer-events-none"
          autoFocus
        />

        <motion.div
          key={currentCard.id} // Re-animate entry for new card? Optional. Let's just animate scaling.
          animate={isSuccess ? { scale: 1.05 } : { scale: 1 }}
          transition={isSuccess ? { duration: 0.15, ease: "easeOut" } : { duration: 0 }}
          className={`w-full flex flex-col items-center justify-center ${isError ? 'animate-shake' : ''}`}
        >
          <div className="text-[100px] sm:text-[120px] font-bold text-white tracking-tighter leading-none mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {currentCard.question}
          </div>
          
          <div className="h-24 w-full flex items-center justify-center">
            <span className={`text-[80px] font-mono font-bold leading-none ${isSuccess ? 'text-[var(--primary)] drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]' : isError ? 'text-[#FF453A] drop-shadow-[0_0_20px_rgba(255,69,58,0.5)]' : 'text-gray-400'}`}>
              {inputVal || "_"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Custom Numpad */}
      <div className="w-full grid grid-cols-3 gap-3 mb-safe">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onPointerDown={(e) => { e.preventDefault(); handleNumpadClick(num.toString()); }}
            className="h-16 text-3xl font-semibold bg-[#2A2E36] hover:bg-[#343943] active:bg-white/20 active:scale-95 text-white rounded-xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none cursor-pointer"
          >
            {num}
          </button>
        ))}
        <div className="h-16 pointer-events-none"></div>
        <button
          onPointerDown={(e) => { e.preventDefault(); handleNumpadClick("0"); }}
          className="h-16 text-3xl font-semibold bg-[#2A2E36] hover:bg-[#343943] active:bg-white/20 active:scale-95 text-white rounded-xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none cursor-pointer"
        >
          0
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); handleNumpadClick("backspace"); }}
          className="h-16 flex items-center justify-center bg-[#2A2E36] hover:bg-[#343943] active:bg-white/20 active:scale-95 text-gray-400 rounded-xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none cursor-pointer"
        >
          <X className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
