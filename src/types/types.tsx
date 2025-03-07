export interface TeamMember {
  name: string;
  email: string;
  college: string;
  leader: boolean;
}

export interface User {
  id?: string;
  teamName: string;
  username: string;
  email: string;
  teamMembers: TeamMember[];
  assignedProblemId?: string;
  submissionUrl?: string;
  hostedUrl?: string;
  solutionSubmitted?: boolean;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface Problem {
  id?: string;
  title: string;
  description: string;
  track: string;
  requirements: string;
  releaseDate: string;
  deadline?: string;
}

export interface HackathonStatus {
  isActive: boolean;
  name?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  message: string;
}

export interface RegisterResponse {
  username: string;
  message: string;
}