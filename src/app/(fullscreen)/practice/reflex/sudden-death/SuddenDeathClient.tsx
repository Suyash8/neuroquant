"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trophy, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { saveSuddenDeath } from "@/actions/saveSuddenDeath";

interface QueuedCard {
  id: string;
  cardId: string;
  question: string;
  answer: string;
}

export default function SuddenDeathClient({ 
  userId, 
  initialQuestions,
  highScore 
}: { 
  userId: string, 
  initialQuestions: QueuedCard[],
  highScore: number
}) {
  const router = useRouter();
  
  // Game State
  const [deck, setDeck] = useState<QueuedCard[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Input & Animation State
  const [inputVal, setInputVal] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentCard = deck[currentIndex];

  useEffect(() => {
    // Keep focus
    if (!isGameOver) {
      inputRef.current?.focus();
    }
  }, [currentIndex, isGameOver]);

  const triggerError = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(100);
    setIsError(true);
    setInputVal("");
    setLives(l => l - 1);
    
    setTimeout(() => {
      setIsError(false);
      if (lives - 1 <= 0) {
        setIsGameOver(true);
      }
    }, 250);
  }, [lives]);

  const handleCorrect = useCallback(() => {
    const timeMs = Date.now() - startTimeRef.current;
    
    setLogs(prev => [...prev, {
      cardId: currentCard.cardId,
      timeMs,
      quality: 5,
    }]);

    setScore(s => s + 1);
    setIsSuccess(true);
    setInputVal("");

    setTimeout(() => {
      setIsSuccess(false);
      if (currentIndex + 1 < deck.length) {
        setCurrentIndex(i => i + 1);
        startTimeRef.current = Date.now();
      } else {
        // Out of cards
        setIsGameOver(true);
      }
    }, 150);
  }, [currentCard, currentIndex, deck.length]);

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

  useEffect(() => {
    if (isGameOver && !isSaving) {
      setIsSaving(true);
      saveSuddenDeath(score, logs).then(() => {
        setIsSaving(false);
      });
    }
  }, [isGameOver, isSaving, score, logs]);

  if (isGameOver) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background text-foreground animate-in fade-in duration-500">
        <div className="glass-panel p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            {lives <= 0 ? (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            ) : (
              <Trophy className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {lives <= 0 ? "System Failure" : "Deck Exhausted"}
            </h2>
            <p className="text-gray-400">Survival sequence terminated.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl">
              <div className="text-sm text-gray-400 mb-1">Final Score</div>
              <div className="text-3xl font-bold text-white">{score}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-primary/20">
              <div className="text-sm text-primary mb-1">High Score</div>
              <div className="text-3xl font-bold text-white">{Math.max(score, highScore)}</div>
            </div>
          </div>

          <button 
            onClick={() => router.push("/practice/reflex")}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Syncing Data..." : "Return to Hub"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 pb-8 h-[100dvh] select-none bg-background text-foreground">
      
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mt-4">
        <button 
          onClick={() => router.push("/practice/reflex")}
          className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
        
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(i => (
            <Heart 
              key={i} 
              className={`w-6 h-6 ${i <= lives ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
            />
          ))}
        </div>

        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-bold text-white">{score}</span>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative">
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
          animate={isSuccess ? { scale: 1.05 } : { scale: 1 }}
          transition={isSuccess ? { duration: 0.15, ease: "easeOut" } : { duration: 0 }}
          className={`w-full flex flex-col items-center justify-center ${isError ? 'animate-shake' : ''}`}
        >
          <div className="text-[120px] font-bold text-white tracking-tighter leading-none mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
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
      <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-safe md:hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onPointerDown={(e) => { e.preventDefault(); handleNumpadClick(num.toString()); }}
            className="h-16 text-3xl font-semibold bg-[#2A2E36] hover:bg-[#343943] active:bg-white/20 active:scale-95 text-white rounded-xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none"
          >
            {num}
          </button>
        ))}
        <div className="h-16 pointer-events-none"></div>
        <button
          onPointerDown={(e) => { e.preventDefault(); handleNumpadClick("0"); }}
          className="h-16 text-3xl font-semibold bg-[#2A2E36] hover:bg-[#343943] active:bg-white/20 active:scale-95 text-white rounded-xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none"
        >
          0
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); handleNumpadClick("backspace"); }}
          className="h-16 flex items-center justify-center bg-[#2A2E36] hover:bg-[#343943] active:bg-white/20 active:scale-95 text-gray-400 rounded-xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 touch-none"
        >
          <X className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
