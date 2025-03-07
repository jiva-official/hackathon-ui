import React from 'react';
import UserDashboard from '../components/user/Dashboard';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const UserPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <UserDashboard />;
};

export default UserPage;