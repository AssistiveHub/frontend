import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tokenUtils, userUtils, authApi, ApiError } from '@/utils/api'
import { AuthResponse, LoginRequest, SignupRequest } from '@/types/auth'

interface UseAuthReturn {
  user: Partial<AuthResponse> | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string
  login: (credentials: LoginRequest) => Promise<void>
  signup: (userData: SignupRequest) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<Partial<AuthResponse> | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = tokenUtils.isLoggedIn()
      const userData = userUtils.getUser()

      if (authenticated && userData) {
        setUser(userData)
        setIsLoggedIn(true)
      } else {
        // 토큰이나 사용자 정보가 없으면 정리
        tokenUtils.removeToken()
        userUtils.removeUser()
        setUser(null)
        setIsLoggedIn(false)
      }
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await authApi.login(credentials)
      
      // 토큰과 사용자 정보 저장
      tokenUtils.setToken(response.token)
      userUtils.setUser(response)
      
      setUser(response)
      setIsLoggedIn(true)
      
      // 대시보드로 리다이렉트
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('로그인 중 오류가 발생했습니다.')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: SignupRequest) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await authApi.signup(userData)
      
      // 토큰과 사용자 정보 저장
      tokenUtils.setToken(response.token)
      userUtils.setUser(response)
      
      setUser(response)
      setIsLoggedIn(true)
      
      // 대시보드로 리다이렉트
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('회원가입 중 오류가 발생했습니다.')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    tokenUtils.removeToken()
    userUtils.removeUser()
    setUser(null)
    setIsLoggedIn(false)
    
    // 로그인 페이지로 리다이렉트
    router.push('/')
  }

  const clearError = () => {
    setError('')
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  }
} 