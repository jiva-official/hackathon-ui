import { Box, Container } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth';

const Layout = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const publicPaths = ['/login', '/register'];

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
      navigate('/login', { replace: true });
      return;
    }

    if (isAuthenticated) {
      if (publicPaths.includes(location.pathname)) {
        navigate('/', { replace: true });
        return;
      }
      if (location.pathname === '/' && user?.role === 'ROLE_ADMIN') {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;