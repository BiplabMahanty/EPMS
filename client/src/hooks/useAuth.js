import { useAuthStore } from '../store';

export const useAuth = () => useAuthStore((s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, setAuth: s.setAuth, clearAuth: s.clearAuth }));
