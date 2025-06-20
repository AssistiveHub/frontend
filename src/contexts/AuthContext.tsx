'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { tokenUtils, userUtils } from '@/utils/api'
import { AuthResponse } from '@/types/auth'

interface AuthContextType {
  user: Partial<AuthResponse> | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (userData: AuthResponse) => void
  logout: () => void
  updateUser: (userData: Partial<AuthResponse>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Partial<AuthResponse> | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const isAuthenticated = tokenUtils.isLoggedIn()
        const userData = userUtils.getUser()

        if (isAuthenticated && userData) {
          setUser(userData)
          setIsLoggedIn(true)
        } else {
          // 토큰이나 사용자 정보가 유효하지 않으면 정리
          tokenUtils.removeToken()
          userUtils.removeUser()
          setUser(null)
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // 오류 발생 시 안전하게 로그아웃 상태로 설정
        tokenUtils.removeToken()
        userUtils.removeUser()
        setUser(null)
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (userData: AuthResponse) => {
    try {
      tokenUtils.setToken(userData.token)
      userUtils.setUser(userData)
      setUser(userData)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Login error:', error)
      logout()
    }
  }

  const logout = () => {
    try {
      tokenUtils.removeToken()
      userUtils.removeUser()
      setUser(null)
      setIsLoggedIn(false)
      
      // 로그아웃 시 연결된 서비스 정보도 정리
      localStorage.removeItem('connectedServices')
      Object.keys(localStorage).forEach(key => {
        if (key.includes('_config')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateUser = (userData: Partial<AuthResponse>) => {
    try {
      const updatedUser = { ...user, ...userData }
      userUtils.setUser(updatedUser)
      setUser(updatedUser)
    } catch (error) {
      console.error('Update user error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 로그인 상태 확인용 커스텀 훅
export const useAuthCheck = () => {
  const { isLoggedIn, isLoading } = useAuthContext()
  
  return {
    isLoggedIn,
    isLoading,
    isReady: !isLoading, // 로딩이 완료되었는지 확인
  }
} 