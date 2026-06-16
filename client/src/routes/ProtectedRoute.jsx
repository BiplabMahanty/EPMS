import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';

export default function ProtectedRoute({ children, roles, permission }) {
  const { isAuthenticated, user } = useAuth();
  const hasPermission = usePermission(permission);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  if (permission && !hasPermission) return <Navigate to="/dashboard" replace />;
  return children;
}
