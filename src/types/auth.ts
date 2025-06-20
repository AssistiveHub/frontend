export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  birthDate?: string; // yyyy-MM-dd 형식
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  profileImageUrl?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  profileImageUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  emailVerified: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  profileImageUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  emailVerified: boolean;
} 