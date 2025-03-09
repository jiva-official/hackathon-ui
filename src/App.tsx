import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/common/Layout';
import Loading from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import ErrorPage from './components/common/ErrorPage';

// Lazy load components that aren't immediately needed
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const UserDashboard = lazy(() => import('./components/user/Dashboard'));
const Profile = lazy(() => import('./components/profile/Profile'));
const Register = lazy(() => import('./pages/Register'));

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CssBaseline />
        <NotificationProvider>
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route index element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="admin" element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<ErrorPage />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;