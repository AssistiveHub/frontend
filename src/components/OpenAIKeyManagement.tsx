'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

interface OpenAIKey {
    id: number
    keyName: string
    maskedApiKey: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

type ValidationState = 'idle' | 'validating' | 'success' | 'error'

export default function OpenAIKeyManagement() {
    const router = useRouter()
    const { updateUser } = useAuthContext()
    const [keys, setKeys] = useState<OpenAIKey[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingKey, setEditingKey] = useState<number | null>(null)
    const [activatingKey, setActivatingKey] = useState<number | null>(null)
    
    // 새 키 추가 폼
    const [newKeyName, setNewKeyName] = useState('')
    const [newApiKey, setNewApiKey] = useState('')
    const [isKeyVisible, setIsKeyVisible] = useState(false)
    const [validationState, setValidationState] = useState<ValidationState>('idle')
    const [validationMessage, setValidationMessage] = useState('')
    
    // 키 수정
    const [editKeyName, setEditKeyName] = useState('')

    useEffect(() => {
        fetchKeys()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchKeys = async () => {
        try {
            const token = localStorage.getItem('authToken')
            if (!token) {
                router.push('/login')
                return
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/openai-keys`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    const maskedKeys = result.data.map((key: OpenAIKey) => ({
                        ...key,
                        maskedApiKey: maskApiKey(key.maskedApiKey || '')
                    }))
                    setKeys(maskedKeys)
                }
            } else {
                console.error('키 목록 로드 실패:', response.status)
            }
        } catch (error) {
            console.error('키 목록 로드 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const maskApiKey = (apiKey: string) => {
        if (!apiKey) return ''
        if (apiKey.includes('*')) return apiKey // 이미 마스킹된 경우
        
        // OpenAI 키 형식: sk-로 시작하는 경우
        if (apiKey.startsWith('sk-')) {
            // sk- + 다음 8자리 + **** + 마지막 4자리
            if (apiKey.length >= 15) {
                const prefix = apiKey.substring(0, 11) // sk- + 8자리
                const suffix = apiKey.substring(apiKey.length - 4)
                return prefix + '****' + suffix
            } else {
                // 짧은 키의 경우
                return apiKey.substring(0, Math.min(7, apiKey.length)) + '****'
            }
        } else {
            // 일반 API 키의 경우: 앞 6자리 + **** + 마지막 4자리
            const prefix = apiKey.substring(0, Math.min(6, apiKey.length))
            const suffix = apiKey.length > 10 ? apiKey.substring(apiKey.length - 4) : ''
            return prefix + '****' + suffix
        }
    }

    const handleAddKey = async () => {
        if (!newKeyName.trim() || !newApiKey.trim()) {
            setValidationMessage('키 이름과 API 키를 모두 입력해주세요.')
            setValidationState('error')
            setTimeout(() => {
                setValidationState('idle')
                setValidationMessage('')
            }, 3000)
            return
        }

        setValidationState('validating')
        setValidationMessage('키 검증중이에요...')

        try {
            const token = localStorage.getItem('authToken')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/openai-keys`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keyName: newKeyName.trim(),
                    apiKey: newApiKey.trim()
                })
            })

            const result = await response.json()

            if (result.success) {
                setValidationState('success')
                setValidationMessage('키가 성공적으로 추가되었습니다!')
                
                setTimeout(() => {
                    setNewKeyName('')
                    setNewApiKey('')
                    setValidationState('idle')
                    setValidationMessage('')
                    setShowAddForm(false)
                    setIsKeyVisible(false)
                    fetchKeys()
                    updateUser({ hasOpenAIKey: true })
                }, 1500)
            } else {
                setValidationState('error')
                setValidationMessage(result.message || '키 추가에 실패했습니다.')
                setTimeout(() => {
                    setValidationState('idle')
                    setValidationMessage('')
                }, 3000)
            }
        } catch {
            setValidationState('error')
            setValidationMessage('네트워크 오류가 발생했습니다.')
            setTimeout(() => {
                setValidationState('idle')
                setValidationMessage('')
            }, 3000)
        }
    }

    const handleActivateKey = async (keyId: number) => {
        setActivatingKey(keyId)
        
        try {
            const token = localStorage.getItem('authToken')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/openai-keys/${keyId}/activate`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                await fetchKeys()
            } else {
                const result = await response.json()
                alert(result.message || '키 활성화에 실패했습니다.')
            }
        } catch (error) {
            console.error('키 활성화 실패:', error)
            alert('키 활성화 중 오류가 발생했습니다.')
        } finally {
            setActivatingKey(null)
        }
    }

    const handleDeleteKey = async (keyId: number) => {
        if (!confirm('정말로 이 키를 삭제하시겠습니까?')) {
            return
        }

        try {
            const token = localStorage.getItem('authToken')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/openai-keys/${keyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const updatedKeys = keys.filter(key => key.id !== keyId)
                if (updatedKeys.length === 0) {
                    updateUser({ hasOpenAIKey: false })
                }
                await fetchKeys()
            } else {
                const result = await response.json()
                alert(result.message || '키 삭제에 실패했습니다.')
            }
        } catch (error) {
            console.error('키 삭제 실패:', error)
            alert('키 삭제 중 오류가 발생했습니다.')
        }
    }

    const handleEditKeyName = async (keyId: number) => {
        if (!editKeyName.trim()) {
            return
        }

        try {
            const token = localStorage.getItem('authToken')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/openai-keys/${keyId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keyName: editKeyName.trim()
                })
            })

            if (response.ok) {
                setEditingKey(null)
                setEditKeyName('')
                await fetchKeys()
            } else {
                const result = await response.json()
                alert(result.message || '키 이름 수정에 실패했습니다.')
            }
        } catch (error) {
            console.error('키 이름 수정 실패:', error)
            alert('키 이름 수정 중 오류가 발생했습니다.')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">OpenAI API 키 관리</h2>
                <p className="text-gray-600">
                    최대 5개의 키를 등록할 수 있으며, 활성 키는 하나만 선택됩니다. ({keys.length}/5)
                </p>
            </div>

            {/* 키 추가 버튼 */}
            {keys.length < 5 && !showAddForm && (
                <div className="mb-6">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        새 키 추가
                    </button>
                </div>
            )}

            {/* 키 추가 폼 */}
            {showAddForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">새 OpenAI API 키 추가</h3>
                        <button
                            onClick={() => {
                                setShowAddForm(false)
                                setNewKeyName('')
                                setNewApiKey('')
                                setValidationState('idle')
                                setValidationMessage('')
                                setIsKeyVisible(false)
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={validationState === 'validating'}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                키 이름 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="예: 개인용 키, 프로젝트용 키"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                disabled={validationState === 'validating'}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                OpenAI API 키 <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={isKeyVisible ? "text" : "password"}
                                    value={newApiKey}
                                    onChange={(e) => setNewApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm transition-colors"
                                    disabled={validationState === 'validating'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsKeyVisible(!isKeyVisible)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={validationState === 'validating'}
                                >
                                    {isKeyVisible ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                <a 
                                    href="https://platform.openai.com/api-keys" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-indigo-600 hover:text-indigo-700 underline"
                                >
                                    OpenAI에서 API 키 발급받기 →
                                </a>
                            </p>
                        </div>
                        
                        {/* 검증 상태 */}
                        {validationState !== 'idle' && (
                            <div className={`p-3 rounded-lg ${
                                validationState === 'success' ? 'bg-green-50 border border-green-200' :
                                validationState === 'error' ? 'bg-red-50 border border-red-200' :
                                'bg-blue-50 border border-blue-200'
                            }`}>
                                <div className="flex items-center">
                                    {validationState === 'validating' && (
                                        <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                                    )}
                                    {validationState === 'success' && (
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {validationState === 'error' && (
                                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                    <span className={`text-sm font-medium ${
                                        validationState === 'success' ? 'text-green-700' :
                                        validationState === 'error' ? 'text-red-700' :
                                        'text-blue-700'
                                    }`}>
                                        {validationMessage}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setShowAddForm(false)
                                    setNewKeyName('')
                                    setNewApiKey('')
                                    setValidationState('idle')
                                    setValidationMessage('')
                                    setIsKeyVisible(false)
                                }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={validationState === 'validating'}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddKey}
                                disabled={validationState === 'validating' || !newApiKey.trim() || !newKeyName.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {validationState === 'validating' ? '검증 중...' : '키 추가'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 키 목록 */}
            <div className="space-y-4">
                {keys.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 OpenAI API 키가 없습니다</h3>
                        <p className="text-gray-500 mb-4">첫 번째 키를 등록하여 AI 기능을 사용해보세요.</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            키 추가하기
                        </button>
                    </div>
                ) : (
                    keys.map((key) => (
                        <div
                            key={key.id}
                            className={`bg-white border rounded-xl p-6 transition-all ${
                                key.isActive 
                                    ? 'border-green-300 bg-green-50 shadow-md' 
                                    : 'border-gray-200 hover:border-gray-300 shadow-sm'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-3">
                                        {/* Active 상태 표시 */}
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            key.isActive ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                        
                                        {/* 키 이름 */}
                                        {editingKey === key.id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={editKeyName}
                                                    onChange={(e) => setEditKeyName(e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleEditKeyName(key.id)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingKey(null)
                                                        setEditKeyName('')
                                                    }}
                                                    className="text-gray-600 hover:text-gray-700 text-sm"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-3">
                                                <h3 className={`text-lg font-semibold ${
                                                    key.isActive ? 'text-green-900' : 'text-gray-900'
                                                }`}>
                                                    {key.keyName}
                                                </h3>
                                                {key.isActive && (
                                                    <span className="px-3 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                                                        활성
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                                            {key.maskedApiKey}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            등록일: {new Date(key.createdAt).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* 액션 버튼들 */}
                                <div className="flex items-center space-x-2 ml-6">
                                    {!key.isActive && (
                                        <button
                                            onClick={() => handleActivateKey(key.id)}
                                            disabled={activatingKey === key.id}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center"
                                        >
                                            {activatingKey === key.id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    활성화 중...
                                                </>
                                            ) : (
                                                '활성화'
                                            )}
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => {
                                            setEditingKey(key.id)
                                            setEditKeyName(key.keyName)
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        수정
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 안내 메시지 */}
            {keys.length > 0 && (
                <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-indigo-900 mb-2">사용 안내</h4>
                            <ul className="text-sm text-indigo-800 space-y-1">
                                <li>• 활성화된 키만 실제 AI 기능에서 사용됩니다</li>
                                <li>• 다른 키를 활성화하면 기존 활성 키는 자동으로 비활성화됩니다</li>
                                <li>• 모든 키는 AES-256 암호화로 안전하게 저장됩니다</li>
                                <li>• 키를 삭제하면 복구할 수 없으니 신중히 결정해주세요</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 