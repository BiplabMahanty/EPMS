import { Navigate } from 'react-router-dom';
import { useEmployeeStore } from '../store';

export default function EmployeeRoute({ children }) {
  const isAuthenticated = useEmployeeStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
