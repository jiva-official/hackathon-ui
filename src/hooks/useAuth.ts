import { useEffect } from 'react';
import { create } from 'zustand';
// import { jwtDecode } from 'jwt-decode';
import { authAPI, userAPI } from '../services/api';
import { User, LoginRequest } from '../types/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      
      // Fetch user profile after successful login
      const { data: profile } = await userAPI.getCurrentUser();
      
      set({ 
        token: data.token,
        user: profile,
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Invalid credentials',
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false,
      error: null 
    });
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.register(userData);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: 'Registration failed',
        isLoading: false 
      });
      throw error;
    }
  }
}));

export const useAuth = () => {
  const auth = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (auth.token && !auth.user) {
        try {
          const { data } = await userAPI.getCurrentUser();
          useAuthStore.setState({ user: data });
        } catch (error) {
          auth.logout();
        }
      }
    };

    initAuth();
  }, [auth.token]);

  return auth;
};

export default useAuth;