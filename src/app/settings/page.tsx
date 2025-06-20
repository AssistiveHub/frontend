'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'
import OpenAIKeyManagement from '@/components/OpenAIKeyManagement'
import AIWorkSettings from '@/components/AIWorkSettings'
import UserProfileManagement from '@/components/UserProfileManagement'

export default function Settings() {
    const { isLoggedIn, isLoading } = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        // 로딩이 완료되고 로그인되지 않은 경우 홈으로 리다이렉트
        if (!isLoading && !isLoggedIn) {
            router.push('/')
            return
        }
    }, [isLoading, isLoggedIn, router])

    const handleBack = () => {
        router.push('/dashboard')
    }



    // 로딩 중이거나 로그인되지 않은 경우
    if (isLoading || !isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={handleBack}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="text-xl">←</span>
                            </button>
                            <div className="flex items-center">
                                <Image
                                    src="/logo_small.png"
                                    alt="AssistiveHub Logo"
                                    width={24}
                                    height={24}
                                    className="mr-3"
                                />
                                <h1 className="text-xl font-bold text-gray-900">설정</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">계정 설정</h2>

                        {/* 사용자 정보 */}
                        <div className="mb-8">
                            <UserProfileManagement />
                        </div>

                        {/* API 설정 */}
                        <div className="mb-8 border-t border-gray-200 pt-8">
                            <OpenAIKeyManagement />
                        </div>

                        {/* AI 작업 설정 */}
                        <div className="mb-8 border-t border-gray-200 pt-8">
                            <AIWorkSettings />
                        </div>
                    </div>
                </div>

                {/* 추가 정보 */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">데이터 관리</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <span className="text-green-500 text-xl mr-3 flex-shrink-0">🔒</span>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">개인정보 보호</h4>
                                    <p className="text-sm text-gray-600">
                                        모든 API 키는 서버에서 안전하게 암호화되어 저장되며, 오직 인증된 요청에만 사용됩니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="text-blue-500 text-xl mr-3 flex-shrink-0">🛡️</span>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">보안</h4>
                                    <p className="text-sm text-gray-600">
                                        API 키는 AES-256 암호화를 사용하여 보호되며, 언제든지 비활성화하거나 삭제할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="text-purple-500 text-xl mr-3 flex-shrink-0">⚡</span>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">성능</h4>
                                    <p className="text-sm text-gray-600">
                                        개인 API 키를 사용하므로 사용량 제한 없이 모든 기능을 자유롭게 사용할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
} 