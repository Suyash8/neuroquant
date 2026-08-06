import { create } from 'zustand';
import { syncReflexSession } from '@/actions/syncReflex';

// Math question format
export interface ReflexQuestion {
  id: string;
  cardId: string;
  question: string;
  answer: string;
  ef: number; // Current Ease Factor
  interval: number; // Current Interval
  consecutiveHit: number; // Current Streak
}

export interface ReflexLog {
  cardId: string;
  timeMs: number;
  quality: number; // 0-5
  newEf: number;
  newInterval: number;
  newConsecutiveHit: number;
}

interface ReflexSessionState {
  userId: string | null;
  isActive: boolean;
  queue: ReflexQuestion[];
  currentIndex: number;
  currentInput: string;
  startTime: number | null;
  logs: ReflexLog[];
  isCustom: boolean;
  
  // Actions
  startSession: (userId: string, questions: ReflexQuestion[], isCustom?: boolean) => void;
  endSession: () => Promise<void>;
  setInput: (input: string) => void;
  clearInput: () => void;
  submitAnswer: (isCorrect: boolean, isAutoClear: boolean) => boolean; // Returns true if it advanced
  skipToNext: () => void;
}

function calculateFSRS(q: number, oldEf: number, oldInterval: number, oldConsecutiveHit: number) {
  // FSRS Simplified Intra-day Spacing
  // Intervals are in MINUTES
  let newEf = oldEf + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEf < 1.3) newEf = 1.3;

  let newConsecutiveHit = oldConsecutiveHit;
  let newInterval = 0;

  if (q < 3) {
    // Answer took > 2.0s or blackout -> Fail (1 minute)
    newConsecutiveHit = 0;
    newInterval = 1; 
  } else {
    newConsecutiveHit += 1;
    
    // Minute steps: 10m, 1h (60m), 1d (1440m), 3d (4320m), 7d (10080m)
    if (newConsecutiveHit === 1) {
      newInterval = 10;
    } else if (newConsecutiveHit === 2) {
      newInterval = 60;
    } else if (newConsecutiveHit === 3) {
      newInterval = 1440; // 1 day
    } else if (newConsecutiveHit === 4) {
      newInterval = 4320; // 3 days
    } else {
      // Scale based on EF for subsequent days
      const days = (oldInterval / 1440) * newEf;
      newInterval = Math.ceil(days * 1440);
    }
  }

  return { newEf, newInterval, newConsecutiveHit };
}

export const useReflexSessionStore = create<ReflexSessionState>((set, get) => ({
  userId: null,
  isActive: false,
  queue: [],
  currentIndex: 0,
  currentInput: "",
  startTime: null,
  logs: [],

  isCustom: false,

  startSession: (userId, questions, isCustom = false) => {
    set({
      userId,
      isActive: true,
      queue: questions,
      currentIndex: 0,
      currentInput: "",
      startTime: performance.now(),
      logs: [],
      isCustom,
    });
  },

  endSession: async () => {
    const { userId, logs, isCustom } = get();
    set({ isActive: false, startTime: null });

    if (userId && logs.length > 0 && !isCustom) {
      // Fire and forget to prevent blocking the UI
      syncReflexSession({ logs }).catch(console.error);
    }
  },

  setInput: (input) => {
    set({ currentInput: input });
  },

  clearInput: () => {
    set({ currentInput: "" });
  },

  submitAnswer: (isCorrect: boolean, isAutoClear: boolean) => {
    const state = get();
    const currentQ = state.queue[state.currentIndex];
    if (!currentQ) return false;

    const endTime = performance.now();
    const timeMs = state.startTime ? endTime - state.startTime : 0;
    
    // Step 1: Mapping Velocity to Quality (q)
    let q = 0;
    if (isAutoClear) {
      q = 0; // Blackout / Wrong digits
    } else {
      const timeS = timeMs / 1000;
      if (timeS <= 1.0) q = 5;
      else if (timeS <= 1.5) q = 4;
      else if (timeS <= 2.0) q = 3;
      else q = 1; // > 2.0s
    }

    const { newEf, newInterval, newConsecutiveHit } = calculateFSRS(
      q,
      currentQ.ef,
      currentQ.interval,
      currentQ.consecutiveHit
    );

    const log: ReflexLog = {
      cardId: currentQ.cardId,
      timeMs,
      quality: q,
      newEf,
      newInterval,
      newConsecutiveHit,
    };

    if (isCorrect) {
      // Correct but too slow (q < 3 means > 2.0s) — re-queue the card
      // so the user gets another attempt this session
      if (q < 3) {
        const reQueuedCard: ReflexQuestion = {
          ...currentQ,
          id: crypto.randomUUID(), // Fresh transient ID
          ef: newEf,
          interval: newInterval,
          consecutiveHit: newConsecutiveHit,
        };

        set((prev) => ({
          logs: [...prev.logs, log],
          queue: [...prev.queue, reQueuedCard],
          currentIndex: prev.currentIndex + 1,
          currentInput: "",
          startTime: performance.now(),
        }));
        return true;
      }

      // Fast correct — advance normally
      const nextIndex = state.currentIndex + 1;
      const isFinished = nextIndex >= state.queue.length;

      set((prev) => ({
        logs: [...prev.logs, log],
        currentIndex: nextIndex,
        currentInput: "",
        startTime: isFinished ? null : performance.now(),
        isActive: !isFinished,
      }));
      return true;
    } else {
      // Wrong answer (auto-clear) — log the mistake, clear input, reset timer
      set((prev) => ({
        logs: [...prev.logs, log],
        currentInput: "",
        startTime: performance.now(), // Reset timer for the retry
      }));
      return false;
    }
  },

  skipToNext: () => {
     set((state) => ({
        currentIndex: state.currentIndex + 1,
        currentInput: "",
        startTime: performance.now(),
     }))
  }
}));
