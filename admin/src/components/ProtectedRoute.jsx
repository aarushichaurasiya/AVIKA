import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isLoggedIn } = useAuth();
  if (loading) return <div style={{ padding: 60 }}>Checking your session…</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
