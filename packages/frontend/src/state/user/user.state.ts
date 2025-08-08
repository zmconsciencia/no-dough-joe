import { create } from 'zustand';
import type { User } from '../../models/user.model';

interface UserState {
  user: User | null;
  setUser: (u: User | null) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  clear: () => set({ user: null }),
}));
