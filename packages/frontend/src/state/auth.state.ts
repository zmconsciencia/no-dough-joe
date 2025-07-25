import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  isAuthenticated: false,
  logout: () => set({ token: null, isAuthenticated: false }),
}));
