// ================================================================
// VELARIS — ProtectedRoute.jsx  (src/routes/ProtectedRoute.jsx)
// ================================================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuth, isAdmin, ready } = useAuth();
  if (!ready) return null;
  if (!isAuth) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
