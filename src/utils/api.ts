/* eslint-disable @typescript-eslint/no-explicit-any */
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

// 범용 API 클라이언트
export const api = {
  get: <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'GET' });
  },

  post: <T>(endpoint: string, data?: unknown): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T>(endpoint: string, data?: unknown): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch: <T>(endpoint: string, data?: unknown): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },
};

export { ApiError };

// Integration API Functions
export const integrationApi = {
  // Slack Integration APIs
  slack: {
    // 슬랙 OAuth 인증 URL 생성
    getAuthUrl: async (): Promise<any> => {
      return api.get<any>('/api/integrations/slack/auth-url')
    },

    // 슬랙 OAuth 콜백 처리
    handleCallback: async (code: string, redirectUri: string): Promise<any> => {
      return api.post<any>('/api/integrations/slack/callback', {
        code,
        redirectUri
      })
    },

    // 사용자의 슬랙 연동 목록 조회
    getIntegrations: async (activeOnly: boolean = false): Promise<any> => {
      return api.get<any>(`/api/integrations/slack?activeOnly=${activeOnly}`)
    },

    // 특정 슬랙 연동 조회
    getIntegration: async (integrationId: number): Promise<any> => {
      return api.get<any>(`/api/integrations/slack/${integrationId}`)
    },

    // 슬랙 연동 해제
    disconnect: async (integrationId: number): Promise<any> => {
      return api.delete<any>(`/api/integrations/slack/${integrationId}`)
    },

    // 슬랙 연동 상태 확인
    validate: async (integrationId: number): Promise<any> => {
      return api.get<any>(`/api/integrations/slack/${integrationId}/validate`)
    },

    // 슬랙 연동 활성화/비활성화
    toggle: async (integrationId: number): Promise<any> => {
      return api.patch<any>(`/api/integrations/slack/${integrationId}/toggle`)
    },

    // 수동 슬랙 연동 생성
    createManualSetup: async (setupData: any): Promise<any> => {
      return api.post<any>('/api/integrations/slack/manual-setup', setupData)
    },

    // 슬랙 토큰 유효성 검증
    validateToken: async (token: string): Promise<any> => {
      return api.post<any>('/api/integrations/slack/validate-token', { token })
    },

    // 슬랙 연동 통계 조회
    getStats: async (): Promise<any> => {
      return api.get<any>('/api/integrations/slack/stats')
    }
  },

  // Notion Integration APIs
  notion: {
    // 노션 OAuth 인증 URL 생성
    getAuthUrl: async (): Promise<any> => {
      return api.get<any>('/api/integrations/notion/auth-url')
    },

    // 노션 OAuth 콜백 처리
    handleCallback: async (code: string, redirectUri: string): Promise<any> => {
      return api.post<any>('/api/integrations/notion/callback', {
        code,
        redirectUri
      })
    },

    // 사용자의 노션 연동 목록 조회
    getIntegrations: async (activeOnly: boolean = false): Promise<any> => {
      return api.get<any>(`/api/integrations/notion?activeOnly=${activeOnly}`)
    },

    // 특정 노션 연동 조회
    getIntegration: async (integrationId: number): Promise<any> => {
      return api.get<any>(`/api/integrations/notion/${integrationId}`)
    },

    // 노션 연동 해제
    disconnect: async (integrationId: number): Promise<any> => {
      return api.delete<any>(`/api/integrations/notion/${integrationId}`)
    },

    // 노션 연동 활성화/비활성화
    toggle: async (integrationId: number): Promise<any> => {
      return api.patch<any>(`/api/integrations/notion/${integrationId}/toggle`)
    },

    // 수동 노션 연동 생성
    createManualSetup: async (setupData: any): Promise<any> => {
      return api.post<any>('/api/integrations/notion/manual-setup', setupData)
    },

    // 노션 토큰 유효성 검증
    validateToken: async (token: string): Promise<any> => {
      return api.post<any>('/api/integrations/notion/validate-token', { token })
    },

    // 노션 연동 통계 조회
    getStats: async (): Promise<any> => {
      return api.get<any>('/api/integrations/notion/stats')
    }
  },

  // GitHub Integration APIs
  github: {
    // 깃허브 OAuth 인증 URL 생성
    getAuthUrl: async (): Promise<any> => {
      return api.get<any>('/api/integrations/github/auth-url')
    },

    // 깃허브 OAuth 콜백 처리
    handleCallback: async (code: string, redirectUri: string): Promise<any> => {
      return api.post<any>('/api/integrations/github/callback', {
        code,
        redirectUri
      })
    },

    // 사용자의 깃허브 연동 목록 조회
    getIntegrations: async (activeOnly: boolean = false): Promise<any> => {
      return api.get<any>(`/api/integrations/github?activeOnly=${activeOnly}`)
    },

    // 특정 깃허브 연동 조회
    getIntegration: async (integrationId: number): Promise<any> => {
      return api.get<any>(`/api/integrations/github/${integrationId}`)
    },

    // 깃허브 연동 해제
    disconnect: async (integrationId: number): Promise<any> => {
      return api.delete<any>(`/api/integrations/github/${integrationId}`)
    },

    // 깃허브 연동 활성화/비활성화
    toggle: async (integrationId: number): Promise<any> => {
      return api.patch<any>(`/api/integrations/github/${integrationId}/toggle`)
    },

    // 수동 깃허브 연동 생성
    createManualSetup: async (setupData: any): Promise<any> => {
      return api.post<any>('/api/integrations/github/manual-setup', setupData)
    },

    // 깃허브 토큰 유효성 검증
    validateToken: async (token: string): Promise<any> => {
      return api.post<any>('/api/integrations/github/validate-token', { token })
    },

    // 깃허브 연동 통계 조회
    getStats: async (): Promise<any> => {
      return api.get<any>('/api/integrations/github/stats')
    }
  },

  // GitLab Integration APIs
  gitlab: {
    // 깃랩 OAuth 인증 URL 생성
    getAuthUrl: async (): Promise<any> => {
      return api.get<any>('/api/integrations/gitlab/auth-url')
    },

    // 깃랩 OAuth 콜백 처리
    handleCallback: async (code: string, state?: string | null): Promise<any> => {
      return api.post<any>('/api/integrations/gitlab/callback', {
        code,
        state
      })
    },

    // 사용자의 깃랩 연동 목록 조회
    getIntegrations: async (activeOnly: boolean = false): Promise<any> => {
      return api.get<any>(`/api/integrations/gitlab?activeOnly=${activeOnly}`)
    },

    // 특정 깃랩 연동 조회
    getIntegration: async (integrationId: number): Promise<any> => {
      return api.get<any>(`/api/integrations/gitlab/${integrationId}`)
    },

    // 깃랩 연동 해제
    disconnect: async (integrationId: number): Promise<any> => {
      return api.delete<any>(`/api/integrations/gitlab/${integrationId}`)
    },

    // 깃랩 연동 활성화/비활성화
    toggle: async (integrationId: number): Promise<any> => {
      return api.patch<any>(`/api/integrations/gitlab/${integrationId}/toggle`)
    },

    // 수동 깃랩 연동 생성
    createManualSetup: async (setupData: any): Promise<any> => {
      return api.post<any>('/api/integrations/gitlab/manual-setup', setupData)
    },

    // 깃랩 토큰 유효성 검증
    validateToken: async (token: string): Promise<any> => {
      return api.post<any>('/api/integrations/gitlab/validate-token', { token })
    },

    // 깃랩 연동 통계 조회
    getStats: async (): Promise<any> => {
      return api.get<any>('/api/integrations/gitlab/stats')
    }
  }
} 