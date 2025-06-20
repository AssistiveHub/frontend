'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { authApi, ApiError } from '@/utils/api'
import { useAuthContext } from '@/contexts/AuthContext'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuthContext()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email || !password) {
            setError('이메일과 비밀번호를 입력해주세요.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await authApi.login({ email, password })
            
            // AuthContext를 통해 로그인 상태 업데이트
            login(response)
            
            // 대시보드로 이동
            router.push('/dashboard')
        } catch (error) {
            if (error instanceof ApiError) {
                setError(error.message)
            } else {
                setError('로그인 중 오류가 발생했습니다.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSignupClick = () => {
        router.push('/signup')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src="/logo_small.png"
                            alt="AssistiveHub Logo"
                            width={48}
                            height={48}
                            className="mr-3"
                        />
                        <h1 className="text-3xl font-bold text-gray-900">AssistiveHub</h1>
                    </div>
                    <p className="text-gray-600">업무 효율성을 위한 통합 플랫폼</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            이메일
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        계정이 없으신가요?{' '}
                        <button 
                            onClick={handleSignupClick}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            회원가입
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
} 