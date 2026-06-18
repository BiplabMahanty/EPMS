import { create } from 'zustand';
import { setAccessToken, setEmployeeAccessToken } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, token) => { setAccessToken(token); set({ user, accessToken: token, isAuthenticated: true }); },
  clearAuth: () => { setAccessToken(null); set({ user: null, accessToken: null, isAuthenticated: false }); },
  updateUser: (user) => set((s) => ({ user: { ...s.user, ...user } })),
}));

export const useEmployeeStore = create((set) => ({
  employee: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (employee, token) => { setEmployeeAccessToken(token); set({ employee, accessToken: token, isAuthenticated: true }); },
  clearAuth: () => { setEmployeeAccessToken(null); set({ employee: null, accessToken: null, isAuthenticated: false }); },
}));

export const useSidebarStore = create((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setCollapsed: (v) => set({ collapsed: v }),
}));
