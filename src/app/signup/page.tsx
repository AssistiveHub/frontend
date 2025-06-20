'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import SignupScreen from '@/components/SignupScreen'

export default function SignupPage() {
  const { isLoggedIn, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인된 경우 대시보드로 리다이렉트
    if (!isLoading && isLoggedIn) {
      router.push('/dashboard')
    }
  }, [isLoading, isLoggedIn, router])

  const handleBackToLogin = () => {
    router.push('/login')
  }

  // 로그인 상태 확인 중일 때 로딩 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 상태를 확인 중입니다...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우에만 SignupScreen 표시
  if (!isLoggedIn) {
    return <SignupScreen onBackToLogin={handleBackToLogin} />
  }

  // 로그인된 경우는 위의 useEffect에서 리다이렉트 처리
  return null
} 