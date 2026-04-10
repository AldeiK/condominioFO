import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="loading">Validando permisos...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || 'resident';

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}