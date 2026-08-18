"use client";

import { useState, useEffect, useRef } from "react";
import { getNextCards, submitCardReview } from "@/actions/cards";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, Brain, CheckCircle2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GameEngine({ deckSlug }: { deckSlug: string }) {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deckType, setDeckType] = useState<string>("theory");
  const [deckName, setDeckName] = useState<string>("");
  
  // Math specific
  const [mathInput, setMathInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Theory/Brainteaser specific
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Tracking
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    loadCards();
  }, [deckSlug]);

  const loadCards = async () => {
    setLoading(true);
    const result = await getNextCards({ deckSlug, limit: 15 });
    if (!("error" in result)) {
      setCards(result.cards);
      setDeckType(result.type);
      setDeckName(result.deckName);
    }
    setLoading(false);
    setStartTime(Date.now());
  };

  const handleMathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMathInput(val);
    
    // Auto check if answer matches
    const currentCard = cards[currentIndex];
    if (val.trim() === currentCard.back.trim()) {
      handleQualitySubmit(5); // Perfect score for instant math answer
    }
  };

  const handleQualitySubmit = async (quality: number) => {
    if (submitting) return;
    setSubmitting(true);
    
    const timeMs = Date.now() - startTime;
    const currentCard = cards[currentIndex];
    
    await submitCardReview({
      cardId: currentCard.id,
      quality,
      timeMs,
      sessionMode: "review"
    });

    if (currentIndex + 1 >= cards.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setMathInput("");
      setStartTime(Date.now());
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (deckType === "math" && !sessionComplete && !loading) {
      inputRef.current?.focus();
    }
  }, [currentIndex, deckType, sessionComplete, loading]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (cards.length === 0 || sessionComplete) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Session Complete!</h2>
          <p className="text-zinc-400 mt-2 max-w-sm">You have finished all due cards for {deckName}. Check back tomorrow for more.</p>
        </div>
        <Button onClick={() => window.location.href = "/"} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isMath = deckType === "math";

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 justify-center">
      <div className="mb-8 flex justify-between items-center text-sm font-bold text-zinc-500 tracking-widest uppercase">
        <div className="flex items-center gap-2">
          {isMath ? <Zap className="w-4 h-4 text-purple-500" /> : <Brain className="w-4 h-4 text-purple-500" />}
          {deckName}
        </div>
        <div>
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col justify-center"
        >
          <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden group mb-8 min-h-[300px] flex flex-col justify-center">
            <CardContent className="p-8 md:p-12 text-center flex flex-col items-center justify-center h-full">
              
              <h2 className={`font-bold text-white tracking-tight ${isMath ? 'text-5xl md:text-7xl mb-8' : 'text-3xl md:text-4xl'}`}>
                {currentCard.front}
              </h2>
              
              {isMath ? (
                <div className="w-full max-w-[200px] relative">
                  <input
                    ref={inputRef}
                    value={mathInput}
                    onChange={handleMathChange}
                    className="w-full bg-black/50 border-b-2 border-white/10 p-4 text-center text-3xl font-mono text-white focus:outline-none focus:border-purple-500 transition-colors rounded-t-lg"
                    placeholder="?"
                    autoFocus
                  />
                  {submitting && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full mt-8">
                  {!showAnswer ? (
                    <Button 
                      onClick={() => setShowAnswer(true)} 
                      className="w-full max-w-xs mx-auto h-12 text-base font-bold bg-white/5 hover:bg-white/10"
                    >
                      Show Answer
                    </Button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div className="p-6 bg-black/50 rounded-xl border border-white/5 inline-block min-w-full">
                        <p className="text-xl text-zinc-300 font-medium">
                          {currentCard.back}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <Button 
                          onClick={() => handleQualitySubmit(1)} 
                          className="h-14 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 flex flex-col gap-1"
                        >
                          <span className="font-bold">Again</span>
                          <span className="text-[10px] opacity-70">(1)</span>
                        </Button>
                        <Button 
                          onClick={() => handleQualitySubmit(3)} 
                          className="h-14 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/20 flex flex-col gap-1"
                        >
                          <span className="font-bold">Hard</span>
                          <span className="text-[10px] opacity-70">(3)</span>
                        </Button>
                        <Button 
                          onClick={() => handleQualitySubmit(4)} 
                          className="h-14 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 flex flex-col gap-1"
                        >
                          <span className="font-bold">Good</span>
                          <span className="text-[10px] opacity-70">(4)</span>
                        </Button>
                        <Button 
                          onClick={() => handleQualitySubmit(5)} 
                          className="h-14 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 flex flex-col gap-1"
                        >
                          <span className="font-bold">Easy</span>
                          <span className="text-[10px] opacity-70">(5)</span>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
