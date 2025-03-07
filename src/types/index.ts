// src/types/index.ts

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    createdBy: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}