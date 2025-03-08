import axios from 'axios';
import { User, Problem, LoginRequest, LoginResponse, RegisterResponse } from '../types/types';

const BASE_URL = 'https://hackathon-api-v1-0.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/auth/login', data),
  
  register: (data: Partial<User>) => 
    api.post<RegisterResponse>('/auth/register', data),
};

export const userAPI = {
  getCurrentUser: () => 
    api.get<User>('/users/profile'),
  
  getAllUsers: () => 
    api.get<User[]>('/users'),
  
  getUserByTeam: (teamName: string) => 
    api.get<User>(`/users/team/${teamName}`),
  
  updateUser: (userId: string, data: Partial<User>) => 
    api.put<User>(`/users/${userId}`, data),
  
  deleteUser: (userId: string) => 
    api.delete(`/users/${userId}`),
  
  assignProblem: (userId: string, problemId: string) => 
    api.post(`/users/${userId}/problem/${problemId}`),
};

export const hackathonAPI = {
  getAllProblems: () => 
    api.get<Problem[]>('/hackathon/problems'),
  
  getProblem: (id: string) => 
    api.get<Problem>(`/hackathon/problems/${id}`),
  
  createProblem: (problem: Problem) => 
    api.post<Problem>('/hackathon/problems', problem),
  
  deleteProblem: (id: string) => 
    api.delete(`/hackathon/problems/${id}`),
  
  selectProblem: (problemId: string, teamId: string) => 
    api.post(`/hackathon/problems/${problemId}/select`, null, {
      params: { teamId }
    }),
  
  submitSolution: (teamId: string, githubUrl: string, hostedUrl?: string) => 
    api.post(`/hackathon/submit/${teamId}`, null, {
      params: { githubUrl, hostedUrl }
    }),
  
  startHackathon: (hackathonName: string, teamIds: string[], durationInHours: number) => 
    api.post('/hackathon/start', null, {
      params: { hackathonName, teamIds, durationInHours }
    }),
  
  getHackathonStatus: () => 
    api.get('/hackathon/status'),
};

export default api;
