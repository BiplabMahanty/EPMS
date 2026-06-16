import { useAuthStore } from '../store';

export const usePermission = (permission) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  if (user.role === 'owner' || user.role === 'admin') return true;
  return !!user.permissions?.[permission];
};
