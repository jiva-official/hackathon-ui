import axios from 'axios';
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (username: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode(token);
      set({ token, user: decoded, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
  
  register: async (userData) => {
    try {
      await axios.post('http://localhost:8080/api/auth/register', userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
}));

// API instance with auth header
export const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);