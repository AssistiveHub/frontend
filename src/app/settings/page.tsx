'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Settings() {
    const { user, isLoggedIn, isLoading } = useAuthContext()
    const router = useRouter()
    const [openaiKey, setOpenaiKey] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [isKeyVisible, setIsKeyVisible] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')

    useEffect(() => {
        // 로딩이 완료되고 로그인되지 않은 경우 홈으로 리다이렉트
        if (!isLoading && !isLoggedIn) {
            router.push('/')
            return
        }

        // 사용자 정보 로드
        if (user) {
            setName(user.name || '')
            setEmail(user.email || '')
        }

        // OpenAI API 키 로드
        const savedKey = localStorage.getItem('openai_api_key')
        if (savedKey) {
            setOpenaiKey(savedKey)
        }
    }, [isLoading, isLoggedIn, user, router])

    const handleSave = async () => {
        setIsSaving(true)
        setSaveMessage('')

        try {
            // OpenAI API 키 저장
            if (openaiKey.trim()) {
                localStorage.setItem('openai_api_key', openaiKey.trim())
            } else {
                localStorage.removeItem('openai_api_key')
            }

            setSaveMessage('설정이 저장되었습니다!')
            setTimeout(() => setSaveMessage(''), 3000)
        } catch (error) {
            console.error('설정 저장 실패:', error)
            setSaveMessage('설정 저장에 실패했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

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
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">프로필 정보</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        이름
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">프로필 정보는 현재 수정할 수 없습니다.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        이메일
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* API 설정 */}
                        <div className="mb-8 border-t border-gray-200 pt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">API 설정</h3>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <span className="text-blue-500 text-xl mr-3 flex-shrink-0">💡</span>
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900 mb-1">OpenAI API 키가 필요한 이유</h4>
                                        <p className="text-sm text-blue-700">
                                            AssistiveHub는 개인 API 키를 사용하여 완전 무료로 서비스를 제공합니다. 
                                            API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    OpenAI API 키
                                </label>
                                <div className="relative">
                                    <input
                                        type={isKeyVisible ? "text" : "password"}
                                        value={openaiKey}
                                        onChange={(e) => setOpenaiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {isKeyVisible ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-gray-500">
                                        • OpenAI API 키는 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">여기서</a> 발급받을 수 있습니다.
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        • API 키는 브라우저에만 저장되며, 외부 서버로 전송되지 않습니다.
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        • GPT-3.5-turbo 또는 GPT-4 모델을 사용할 수 있어야 합니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 저장 버튼 */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <div>
                                {saveMessage && (
                                    <div className={`text-sm ${saveMessage.includes('실패') ? 'text-red-600' : 'text-green-600'}`}>
                                        {saveMessage}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            저장 중...
                                        </>
                                    ) : (
                                        '저장하기'
                                    )}
                                </button>
                            </div>
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
                                        모든 데이터는 브라우저에 로컬 저장되며, 외부 서버로 전송되지 않습니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <span className="text-blue-500 text-xl mr-3 flex-shrink-0">💾</span>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">데이터 백업</h4>
                                    <p className="text-sm text-gray-600">
                                        중요한 데이터는 정기적으로 백업하는 것을 권장합니다.
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