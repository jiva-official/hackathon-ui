import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './components/user/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ErrorPage from './components/common/ErrorPage';
import ProtectedRoute from './routes/ProtectedRoute';
import Profile from './components/profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CssBaseline />
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Layout><Outlet /></Layout>}>
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
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;