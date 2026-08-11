import { create } from "zustand";

export interface GlobalUser {
  id: string;
  email: string;
  persona: string;
  username: string | null;
  displayName: string | null;
  globalStreak: number;
  totalPoints: number;
}

export interface BootcampTaskState {
  id: string;
  type: string;
  title: string;
  status: "pending" | "completed";
  details: any;
}

export interface BootcampDayState {
  id: string;
  dayNumber: number;
  status: "locked" | "in_progress" | "completed";
  tasks: BootcampTaskState[];
}

export interface CardReviewState {
  id: string; // The session card ID
  cardId: string; // DB card ID
  front: string;
  back: string;
  ef: number;
  interval: number;
  consecutiveHit: number;
}

export interface ReviewLog {
  cardId: string;
  timeMs: number;
  quality: number;
}

interface GlobalStore {
  // 1. Identity & Bootcamp State
  user: GlobalUser | null;
  currentDay: BootcampDayState | null;
  days: BootcampDayState[];
  
  setUser: (user: GlobalUser) => void;
  setBootcampState: (days: BootcampDayState[], currentDay: BootcampDayState) => void;
  toggleTaskCompletion: (taskId: string, completed: boolean) => void;

  // 2. Unified Review Session State
  isActiveSession: boolean;
  sessionMode: string; // "math", "theory", "brainteaser"
  queue: CardReviewState[];
  currentIndex: number;
  logs: ReviewLog[];
  startTime: number | null;
  
  startSession: (mode: string, cards: CardReviewState[]) => void;
  submitAnswer: (quality: number, timeMs: number) => void;
  endSession: () => Promise<void>;
}

export const useGlobalStore = create<GlobalStore>((set, get) => ({
  user: null,
  currentDay: null,
  days: [],

  setUser: (user) => set({ user }),
  setBootcampState: (days, currentDay) => set({ days, currentDay }),
  
  toggleTaskCompletion: (taskId, completed) => {
    // Optimistic local update
    const { currentDay } = get();
    if (!currentDay) return;
    
    const updatedTasks: BootcampTaskState[] = currentDay.tasks.map(t => 
      t.id === taskId ? { ...t, status: completed ? "completed" as const : "pending" as const } : t
    );
    
    set({ currentDay: { ...currentDay, tasks: updatedTasks } });
    
    // Background sync to server
    fetch("/api/sync-task", {
      method: "POST",
      body: JSON.stringify({ taskId, status: completed ? "completed" : "pending" })
    }).catch(console.error);
  },

  // Session State
  isActiveSession: false,
  sessionMode: "math",
  queue: [],
  currentIndex: 0,
  logs: [],
  startTime: null,

  startSession: (mode, cards) => {
    set({
      isActiveSession: true,
      sessionMode: mode,
      queue: cards,
      currentIndex: 0,
      logs: [],
      startTime: performance.now()
    });
  },

  submitAnswer: (quality, timeMs) => {
    const state = get();
    const card = state.queue[state.currentIndex];
    if (!card) return;

    set({
      logs: [...state.logs, { cardId: card.cardId, quality, timeMs }],
      currentIndex: state.currentIndex + 1,
      startTime: performance.now() // reset timer for next card
    });
  },

  endSession: async () => {
    const { logs, sessionMode, user } = get();
    set({ isActiveSession: false, startTime: null });

    if (user && logs.length > 0) {
      // Background sync
      fetch("/api/sync-session", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, mode: sessionMode, logs })
      }).catch(console.error);
    }
  }
}));
