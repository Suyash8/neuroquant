"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Heart, Trophy, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { saveSuddenDeath } from "@/actions/saveSuddenDeath";
import { Card, CardContent } from "@/components/ui/Card";

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
      saveSuddenDeath({ score, logs }).then(() => {
        setIsSaving(false);
      });
    }
  }, [isGameOver, isSaving, score, logs]);

  if (isGameOver) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black text-white animate-in fade-in duration-500 min-h-screen">
        <Card className="max-w-md w-full text-center border-red-500/20 bg-zinc-950/90 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <CardContent className="p-8 space-y-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              {lives <= 0 ? (
                <AlertTriangle className="w-10 h-10 text-red-500" />
              ) : (
                <Trophy className="w-10 h-10 text-orange-500" />
              )}
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {lives <= 0 ? "System Failure" : "Deck Exhausted"}
              </h2>
              <p className="text-zinc-400">Survival sequence terminated.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-zinc-400 font-medium mb-1">Final Score</div>
                <div className="text-4xl font-bold text-white">{score}</div>
              </div>
              <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                <div className="text-sm text-orange-500 font-medium mb-1">High Score</div>
                <div className="text-4xl font-bold text-orange-500">{Math.max(score, highScore)}</div>
              </div>
            </div>

            <button
              onClick={() => router.push("/practice/reflex")}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Syncing Data..." : "Return to Hub"} <ArrowRight className="w-5 h-5" />
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 pb-8 min-h-screen select-none bg-black text-white relative">
      {/* Danger Overlay Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mt-4 z-10">
        <button
          onClick={() => router.push("/practice/reflex")}
          className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md border border-white/5"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map(i => (
            <Heart
              key={i}
              className={`w-6 h-6 transition-colors ${i <= lives ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-zinc-800'}`}
            />
          ))}
        </div>

        <div className="px-5 py-2.5 bg-orange-500/10 rounded-full border border-orange-500/20 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-orange-500">{score}</span>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative z-10">
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

        <div className={`w-full flex flex-col items-center justify-center transition-transform ${isError ? 'animate-shake' : ''}`}>
          <div className="text-[120px] font-bold text-white tracking-tighter leading-none mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {currentCard.question}
          </div>

          <div className="h-24 w-full flex items-center justify-center">
            <span className={`text-[80px] font-mono font-bold leading-none transition-colors ${isSuccess ? 'text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]' : isError ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'text-zinc-400'}`}>
              {inputVal || "_"}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Numpad */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-safe md:hidden z-10">
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
    </div>
  );
}
