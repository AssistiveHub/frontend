'use client'

import { useState } from 'react'

interface OpenAIKeyManagerProps {
    onKeyRegistered?: () => void
}

type ValidationState = 'idle' | 'validating' | 'success' | 'error'

export default function OpenAIKeyManager({ onKeyRegistered }: OpenAIKeyManagerProps) {
    const [apiKey, setApiKey] = useState('')
    const [keyName, setKeyName] = useState('')
    const [isKeyVisible, setIsKeyVisible] = useState(false)
    const [validationState, setValidationState] = useState<ValidationState>('idle')
    const [validationMessage, setValidationMessage] = useState('')
    const [showAnimation, setShowAnimation] = useState(false)

    const validateAndSaveKey = async () => {
        if (!apiKey.trim()) {
            setValidationMessage('API 키를 입력해주세요.')
            return
        }

        if (!keyName.trim()) {
            setValidationMessage('키 이름을 입력해주세요.')
            return
        }

        setValidationState('validating')
        setValidationMessage('키 검증중이에요...')
        setShowAnimation(true)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('로그인이 필요합니다.')
            }

            // 1. 먼저 키 검증
            const validateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/openai-keys/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    apiKey: apiKey.trim(),
                    name: keyName.trim()
                })
            })

            const validateResult = await validateResponse.json()

            if (!validateResult.success) {
                setValidationState('error')
                setValidationMessage(validateResult.message || '키 검증에 실패했어요')
                setTimeout(() => {
                    setValidationState('idle')
                    setShowAnimation(false)
                }, 3000)
                return
            }

            // 2. 검증 성공 시 키 저장
            const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/openai-keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    apiKey: apiKey.trim(),
                    name: keyName.trim()
                })
            })

            const saveResult = await saveResponse.json()

            if (saveResult.success) {
                setValidationState('success')
                setValidationMessage('확인이 됐어요!')
                setTimeout(() => {
                    setApiKey('')
                    setKeyName('')
                    setValidationState('idle')
                    setShowAnimation(false)
                    onKeyRegistered?.()
                }, 2000)
            } else {
                setValidationState('error')
                setValidationMessage(saveResult.message || '키 저장에 실패했어요')
                setTimeout(() => {
                    setValidationState('idle')
                    setShowAnimation(false)
                }, 3000)
            }

        } catch (error) {
            console.error('OpenAI key validation error:', error)
            setValidationState('error')
            setValidationMessage('네트워크 오류가 발생했어요')
            setTimeout(() => {
                setValidationState('idle')
                setShowAnimation(false)
            }, 3000)
        }
    }

    const CheckAnimation = () => {
        return (
            <div className="flex items-center justify-center">
                {validationState === 'validating' && (
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-blue-600 font-medium">검증 중...</span>
                    </div>
                )}
                
                {validationState === 'success' && (
                    <div className="flex items-center space-x-2">
                        <div className="relative w-6 h-6">
                            <svg 
                                className="w-6 h-6 text-green-500 animate-bounce" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={3} 
                                    d="M5 13l4 4L19 7"
                                    className="animate-[draw_0.5s_ease-out_forwards]"
                                    style={{
                                        strokeDasharray: '20',
                                        strokeDashoffset: validationState === 'success' ? '0' : '20',
                                        transition: 'stroke-dashoffset 0.5s ease-out'
                                    }}
                                />
                            </svg>
                        </div>
                        <span className="text-green-600 font-medium">성공!</span>
                    </div>
                )}
                
                {validationState === 'error' && (
                    <div className="flex items-center space-x-2">
                        <div className="relative w-6 h-6">
                            <svg 
                                className="w-6 h-6 text-red-500 animate-pulse" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={3} 
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <span className="text-red-600 font-medium">실패</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                    <span className="text-blue-500 text-2xl mr-4 flex-shrink-0">🔑</span>
                    <div>
                        <h4 className="text-lg font-medium text-blue-900 mb-2">OpenAI API 키 등록</h4>
                        <p className="text-sm text-blue-700 mb-4">
                            AssistiveHub의 모든 기능을 사용하려면 OpenAI API 키가 필요합니다. 
                            키는 안전하게 암호화되어 저장됩니다.
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-2">
                                    키 이름 (구분용)
                                </label>
                                <input
                                    type="text"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    placeholder="예: 개인용 키, 프로젝트용 키"
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    disabled={validationState === 'validating'}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-2">
                                    OpenAI API 키
                                </label>
                                <div className="relative">
                                    <input
                                        type={isKeyVisible ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full px-3 py-2 pr-12 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-white"
                                        disabled={validationState === 'validating'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                                        disabled={validationState === 'validating'}
                                    >
                                        {isKeyVisible ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-blue-600">
                                    <a 
                                        href="https://platform.openai.com/api-keys" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hover:underline"
                                    >
                                        OpenAI에서 API 키 발급받기 →
                                    </a>
                                </div>
                                <button
                                    onClick={validateAndSaveKey}
                                    disabled={validationState === 'validating' || !apiKey.trim() || !keyName.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                                >
                                    {validationState === 'validating' ? '검증 중...' : '키 등록하기'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 검증 상태 표시 */}
            {showAnimation && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CheckAnimation />
                        </div>
                        <div className="text-sm text-gray-600">
                            {validationMessage}
                        </div>
                    </div>
                    
                    {/* 진행 바 */}
                    {validationState === 'validating' && (
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <style jsx>{`
                @keyframes draw {
                    from {
                        stroke-dashoffset: 20;
                    }
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </div>
    )
} 