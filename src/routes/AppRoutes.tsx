import { useRoutes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserDashboard from '../components/user/Dashboard';
import AdminDashboard from '../components/admin/AdminDashboard';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  const routes = useRoutes([
    {
      path: '/login',
      element: !isAuthenticated ? <Login /> : <Navigate to="/" />,
    },
    {
      path: '/register',
      element: !isAuthenticated ? <Register /> : <Navigate to="/" />,
    },
    {
      path: '/',
      element: isAuthenticated ? (
        user?.role === 'ROLE_ADMIN' ? (
          <AdminDashboard />
        ) : (
          <UserDashboard />
        )
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: '*',
      element: <Navigate to="/" />,
    },
  ]);

  return routes;
};

export default AppRoutes;