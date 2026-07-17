import { create } from 'zustand';

type Persona = 'quant' | 'generalist';

interface GlobalState {
  user: {
    id: string;
    persona: Persona;
    globalStreak: number;
    totalPoints: number;
    username: string | null;
    displayName: string | null;
  } | null;
  setUser: (user: GlobalState['user']) => void;
  addPoints: (points: number) => void;
  incrementStreak: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  addPoints: (points) => set((state) => ({
    user: state.user ? { ...state.user, totalPoints: state.user.totalPoints + points } : null
  })),
  incrementStreak: () => set((state) => ({
    user: state.user ? { ...state.user, globalStreak: state.user.globalStreak + 1 } : null
  }))
}));
