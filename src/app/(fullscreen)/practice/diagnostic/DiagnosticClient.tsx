"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Trophy, Zap, Clock, ArrowRight, Loader2, X, Target } from "lucide-react";
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
      cardId: crypto.randomUUID(),
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

      await saveDiagnosticResult({ source, persona, horizon, metrics: {
        score,
        maxDifficultyReached,
        averageVelocityMs: avgVelocity,
        accuracy,
      } });

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

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const avgVelocity = score > 0 ? (totalVelocityMs / score / 1000).toFixed(2) : "0.00";

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden select-none">
      
      {/* Ambient Glows based on state (removed) */}

      <AnimatePresence mode="wait">
        
        {/* ===================== ACTIVE GAME ===================== */}
        {!isGameOver && currentCard && (
          <motion.div
            key="game"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-between p-4 pb-8 h-[100dvh] w-full max-w-sm mx-auto z-10"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                <Clock className={`w-4 h-4 transition-colors duration-300 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                <span className={`font-mono font-bold transition-colors duration-300 ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                  00:{timeLeft.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                      i < difficulty 
                        ? 'bg-[#00FF9D] shadow-[0_0_8px_rgba(0,255,157,0.8)] scale-110' 
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 shadow-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00FF9D]" />
                <span className="font-bold text-white">{score}</span>
              </div>
            </div>

            {/* Main Card Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
              <input 
                ref={inputRef}
                type="text" 
                inputMode="none"
                value={inputVal}
                onChange={() => {}}
                onKeyDown={handleKeyDown}
                className="absolute opacity-0 pointer-events-none"
                autoFocus
              />

              <motion.div
                key={currentCard.id}
                animate={isSuccess ? { scale: 1.05 } : { scale: 1 }}
                transition={isSuccess ? { duration: 0.15, ease: "easeOut" } : { duration: 0 }}
                className={`w-full flex flex-col items-center justify-center ${isError ? 'animate-shake' : ''}`}
              >
                <div className="text-[100px] sm:text-[120px] font-bold text-white tracking-tighter leading-none mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  {currentCard.question}
                </div>
                
                <div className="h-24 w-full flex items-center justify-center">
                  <span className={`text-[80px] font-mono font-bold leading-none transition-colors duration-200 ${
                    isSuccess 
                      ? 'text-[#00FF9D] drop-shadow-[0_0_20px_rgba(0,255,157,0.5)]' 
                      : isError 
                        ? 'text-[#FF453A] drop-shadow-[0_0_20px_rgba(255,69,58,0.5)]' 
                        : 'text-gray-400'
                  }`}>
                    {inputVal || "_"}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Custom Numpad (Mobile Only) */}
            <div className="w-full grid grid-cols-3 gap-3 mb-safe md:hidden">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onPointerDown={(e) => { e.preventDefault(); handleNumpadClick(num.toString()); }}
                  className="h-16 text-3xl font-semibold bg-[#2A2E36]/80 hover:bg-[#343943] active:bg-white/20 active:scale-95 text-white rounded-2xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none cursor-pointer backdrop-blur-md"
                >
                  {num}
                </button>
              ))}
              <div className="h-16 pointer-events-none"></div>
              <button
                onPointerDown={(e) => { e.preventDefault(); handleNumpadClick("0"); }}
                className="h-16 text-3xl font-semibold bg-[#2A2E36]/80 hover:bg-[#343943] active:bg-white/20 active:scale-95 text-white rounded-2xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none cursor-pointer backdrop-blur-md"
              >
                0
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); handleNumpadClick("backspace"); }}
                className="h-16 flex items-center justify-center bg-[#2A2E36]/80 hover:bg-[#343943] active:bg-white/20 active:scale-95 text-gray-400 rounded-2xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none cursor-pointer backdrop-blur-md"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================== GAME OVER ===================== */}
        {isGameOver && (
          <motion.div
            key="game-over"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col items-center justify-center w-full z-10 px-4"
          >
            <div className="mynt-card p-8 w-full max-w-md text-center space-y-8 relative overflow-hidden">
              
              {/* Premium Glow effect behind the trophy (removed) */}

              <motion.div variants={itemVariants} className="w-20 h-20 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center mx-auto relative z-10">
                <Trophy className="w-10 h-10 text-[var(--primary)]" />
              </motion.div>
              
              <motion.div variants={itemVariants} className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  Calibration Complete
                </h2>
                <p className="text-zinc-400">Your cognitive baseline has been logged.</p>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 relative z-10">
                
                {/* Score */}
                <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-zinc-500" />
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Score</div>
                  </div>
                  <div className="text-4xl font-bold text-white">{score}</div>
                </div>

                {/* Accuracy */}
                <div className="bg-[var(--primary)]/5 p-5 rounded-2xl border border-[var(--primary)]/20 relative overflow-hidden shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.05)]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[var(--primary)]" />
                    <div className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest">Accuracy</div>
                  </div>
                  <div className="text-4xl font-bold text-white">{accuracy}%</div>
                </div>

                {/* Avg Speed */}
                <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Speed</div>
                  </div>
                  <div className="text-3xl font-bold text-white mt-1">{avgVelocity}<span className="text-lg text-zinc-500 ml-1">s</span></div>
                </div>

                {/* Max Tier */}
                <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-zinc-500" />
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Max Tier</div>
                  </div>
                  <div className="text-3xl font-bold text-white mt-1">Lvl {maxDifficultyReached}</div>
                </div>

              </motion.div>

              <motion.button 
                variants={itemVariants}
                onClick={handleComplete}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-4 btn-glow-green text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 relative z-10"
              >
                {isSaving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Syning Data...</>
                ) : (
                  <>Continue to Dashboard <ArrowRight className="w-5 h-5" /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
