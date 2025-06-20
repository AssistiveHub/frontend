import { LoginRequest, SignupRequest, AuthResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // JWT 토큰이 있으면 헤더에 추가
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      } catch {
        // 에러 응답을 읽을 수 없는 경우 기본 메시지 사용
      }
      
      throw new ApiError(errorMessage, response.status);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return (await response.text()) as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`네트워크 오류: ${(error as Error).message}`);
  }
};

// 인증 API 함수들
export const authApi = {
  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  },

  signup: async (signupData: SignupRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  },

  // 인증 상태 확인을 위한 테스트 엔드포인트
  test: async (): Promise<string> => {
    return apiRequest<string>('/api/auth/test');
  },
};

// 토큰 관리 함수들
export const tokenUtils = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  removeToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};

// 사용자 정보 관리 함수들
export const userUtils = {
  setUser: (user: Partial<AuthResponse>) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): Partial<AuthResponse> | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  removeUser: () => {
    localStorage.removeItem('user');
  },
};

export { ApiError }; 