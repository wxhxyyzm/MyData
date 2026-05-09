import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function AuthGuard({ children }) {
  const { isOwner, isGuest, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isOwner && !isGuest) return <Navigate to="/" replace />;
  return children;
}
