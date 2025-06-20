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
  updatedAt: string;
  lastLoginAt?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  emailVerified: boolean;
  hasOpenAIKey?: boolean;
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

export interface UserSettingRequest {
  weeklyWorkLogEnabled?: boolean;
  dailyWorkLogEnabled?: boolean;
  feedbackReviewEnabled?: boolean;
  skillGrowthTrackingEnabled?: boolean;
  notificationManagementEnabled?: boolean;
}

export interface UserSettingResponse {
  id: number;
  userId: number;
  weeklyWorkLogEnabled: boolean;
  dailyWorkLogEnabled: boolean;
  feedbackReviewEnabled: boolean;
  skillGrowthTrackingEnabled: boolean;
  notificationManagementEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateRequest {
  name?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  profileImageUrl?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
} 