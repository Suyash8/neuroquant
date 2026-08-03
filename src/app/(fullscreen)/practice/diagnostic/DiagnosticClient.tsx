"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Trophy, Zap, Clock, ArrowRight, Loader2, X, Target } from "lucide-react";
import { saveDiagnosticResult } from "@/actions/saveDiagnosticResult";
import { generateMathQuestion, OperationLevel } from "@/lib/mathGenerator";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

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

  // Timer Effect
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // Next Card Generation
  const generateNextCard = useCallback(() => {
    const nextQ = generateMathQuestion(difficulty as OperationLevel, true);
    setCurrentCard({
      id: Math.random().toString(),
      cardId: nextQ.question,
      question: nextQ.question,
      answer: nextQ.answer,
      difficulty: difficulty
    });
    startTimeRef.current = Date.now();
  }, [difficulty]);

  // Initial Card
  useEffect(() => {
    if (!currentCard && !isGameOver) {
      generateNextCard();
    }
  }, [currentCard, isGameOver, generateNextCard]);

  // Focus Keep
  useEffect(() => {
    if (!isGameOver) {
      inputRef.current?.focus();
    }
  }, [currentCard, isGameOver]);

  const handleCorrect = useCallback(() => {
    const timeMs = Date.now() - startTimeRef.current;
    setTotalVelocityMs(prev => prev + timeMs);
    setScore(s => s + 1);
    setAttempts(a => a + 1);
    setIsSuccess(true);
    setInputVal("");
    
    setStreak(s => {
      const newStreak = s + 1;
      if (newStreak >= 3 && difficulty < 7) {
        setDifficulty(d => {
          const next = d + 1;
          setMaxDifficultyReached(m => Math.max(m, next));
          return next;
        });
        return 0; // reset streak on level up
      }
      return newStreak;
    });

    setTimeout(() => {
      setIsSuccess(false);
      generateNextCard();
    }, 150);
  }, [difficulty, generateNextCard]);

  const triggerError = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(100);
    setIsError(true);
    setInputVal("");
    setAttempts(a => a + 1);
    setStreak(0);
    
    // Drop difficulty on mistake
    setDifficulty(d => Math.max(1, d - 1));

    setTimeout(() => {
      setIsError(false);
    }, 250);
  }, []);

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
    setIsSaving(true);
    const avgVelocity = score > 0 ? totalVelocityMs / score : 0;
    const accuracy = attempts > 0 ? (score / attempts) * 100 : 0;
    
    try {
      const res = await saveDiagnosticResult({
        persona: persona || 'generalist',
        horizon: horizon || 'none',
        source: source || 'none',
        metrics: {
          score,
          accuracy,
          averageVelocityMs: avgVelocity,
          maxDifficultyReached,
        }
      });

      if (res && 'success' in res && res.success) {
        router.push("/");
      } else {
        alert((res && 'error' in res ? (res as any).error : undefined) || "Failed to save data");
        setIsSaving(false);
      }
    } catch (e) {
      alert("An unexpected error occurred. Please try again.");
      setIsSaving(false);
    }
  };

  // Derived metrics for game over screen
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  const avgVelocity = score > 0 ? (totalVelocityMs / score / 1000).toFixed(2) : "0.00";
  const progressPct = ((60 - timeLeft) / 60) * 100;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col items-center justify-between p-4 pb-8 min-h-screen select-none bg-black text-white relative">
      <AnimatePresence mode="wait">
        
        {/* ===================== ACTIVE GAME ===================== */}
        {!isGameOver && currentCard && (
          <motion.div
            key="game-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex-1 flex flex-col"
          >
            {/* Top Bar / Progress */}
            <ProgressBar progress={progressPct} className="rounded-none absolute top-0 inset-x-0 h-1 bg-white/5" />

            <div className="w-full max-w-sm mx-auto flex items-center justify-between mt-8 relative z-10">
              <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 backdrop-blur-md">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 backdrop-blur-md">
                <span className="text-xs text-zinc-400 font-bold uppercase">Tier</span>
                <span className="font-bold text-primary">{difficulty}</span>
              </div>
              <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 backdrop-blur-md">
                <span className="text-xs text-zinc-400 font-bold uppercase">Score</span>
                <span className="font-bold text-white">{score}</span>
              </div>
            </div>

            {/* Main Testing Area */}
            <div 
              className="flex-1 flex flex-col items-center justify-center w-full relative z-10 p-6 mt-12 cursor-text touch-manipulation select-none"
              onClick={() => inputRef.current?.focus()}
            >
              <input
                ref={inputRef}
                type="text"
                inputMode="none"
                autoComplete="off"
                value={inputVal}
                onChange={() => {}}
                onKeyDown={handleKeyDown}
                className="absolute opacity-0 w-0 h-0"
                tabIndex={-1}
                autoFocus
              />

              <div className={`w-full flex flex-col items-center justify-center text-center transition-transform ${isError ? 'animate-shake' : ''}`}>
                <h1 className="text-7xl md:text-[9rem] font-mono font-bold tracking-tighter text-white mb-8">
                  {currentCard.question}
                </h1>

                <div className="h-24 w-full flex items-center justify-center">
                  <span className={`text-[80px] font-mono font-bold leading-none transition-colors ${
                    isSuccess ? 'text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]'
                      : isError ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'text-zinc-400'
                  }`}>
                    {inputVal || "_"}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Numpad (Mobile Only) */}
            <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-3 mb-safe md:hidden z-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onPointerDown={(e) => { e.preventDefault(); handleNumpadClick(num.toString()); }}
                  className="h-16 text-3xl font-semibold bg-zinc-900 hover:bg-zinc-800 active:bg-white/20 active:scale-95 text-white rounded-xl transition-all border border-white/5 shadow-sm touch-none"
                >
                  {num}
                </button>
              ))}
              <div className="h-16 pointer-events-none"></div>
              <button
                onPointerDown={(e) => { e.preventDefault(); handleNumpadClick("0"); }}
                className="h-16 text-3xl font-semibold bg-zinc-900 hover:bg-zinc-800 active:bg-white/20 active:scale-95 text-white rounded-xl transition-all border border-white/5 shadow-sm touch-none"
              >
                0
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); handleNumpadClick("backspace"); }}
                className="h-16 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 active:bg-white/20 active:scale-95 text-zinc-400 rounded-xl transition-all border border-white/5 shadow-sm touch-none"
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
            <Card className="w-full max-w-md text-center bg-zinc-950/90 shadow-[0_0_50px_rgba(var(--primary-rgb),0.05)] border-primary/10">
              <CardContent className="p-8 space-y-8">
                <motion.div variants={itemVariants} className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center mx-auto relative z-10">
                  <Trophy className="w-10 h-10 text-primary" />
                </motion.div>

                <motion.div variants={itemVariants} className="relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    Calibration Complete
                  </h2>
                  <p className="text-zinc-400">Your cognitive baseline has been logged.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5 relative overflow-hidden transition-colors">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-zinc-500" />
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Score</div>
                    </div>
                    <div className="text-4xl font-bold text-white">{score}</div>
                  </div>

                  <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 relative overflow-hidden shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.05)]">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <div className="text-xs font-bold text-primary uppercase tracking-widest">Accuracy</div>
                    </div>
                    <div className="text-4xl font-bold text-white">{accuracy}%</div>
                  </div>

                  <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5 relative overflow-hidden transition-colors">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Speed</div>
                    </div>
                    <div className="text-3xl font-bold text-white mt-1">{avgVelocity}<span className="text-lg text-zinc-500 ml-1">s</span></div>
                  </div>

                  <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5 relative overflow-hidden transition-colors">
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
                  className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black font-semibold rounded-xl transition-all hover:bg-gray-200 active:scale-95 disabled:opacity-50 relative z-10"
                >
                  {isSaving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Syncing Data...</>
                  ) : (
                    <>Continue to Dashboard <ArrowRight className="w-5 h-5" /></>
                  )}
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
