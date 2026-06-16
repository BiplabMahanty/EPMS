import { create } from 'zustand';
import { setAccessToken } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    setAccessToken(token);
    set({ user, accessToken: token, isAuthenticated: true });
  },
  clearAuth: () => {
    setAccessToken(null);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  updateUser: (user) => set({ user }),
}));

export const useSidebarStore = create((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setCollapsed: (v) => set({ collapsed: v }),
}));
