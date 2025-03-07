import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Give auth state time to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    // Prevent redirect loops
    if (location.pathname === '/login') {
      return null;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For admin routes
  if (requireAdmin && user?.role !== 'ROLE_ADMIN') {
    // Prevent redirect loops
    if (location.pathname === '/') {
      return null;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;