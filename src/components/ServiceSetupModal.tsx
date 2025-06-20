'use client'

import { useState } from 'react'
import { integrationApi } from '@/utils/api'

interface ServiceSetupModalProps {
    serviceId: string
    onConnect: (serviceType: string, config: Record<string, string>) => void
    onClose: () => void
}

export default function ServiceSetupModal({ serviceId, onConnect, onClose }: ServiceSetupModalProps) {
    const [setupMethod, setSetupMethod] = useState<'oauth' | 'manual'>('oauth')
    const [serviceName, setServiceName] = useState('')
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const serviceConfig = {
        slack: {
            name: '슬랙',
            icon: '💬',
            color: 'purple',
            tokenLabel: 'Bot User OAuth Token',
            tokenPlaceholder: 'xoxb-your-bot-token',
            description: '슬랙 워크스페이스와 연동하여 메시지를 추적하고 분석합니다.'
        },
        notion: {
            name: '노션',
            icon: '📝',
            color: 'gray',
            tokenLabel: 'Integration Token',
            tokenPlaceholder: 'secret_your-integration-token',
            description: '노션 워크스페이스와 연동하여 페이지와 데이터베이스를 관리합니다.'
        },
        git: {
            name: '깃허브',
            icon: '🔧',
            color: 'gray',
            tokenLabel: 'Personal Access Token',
            tokenPlaceholder: 'ghp_your-personal-access-token',
            description: '깃허브 리포지토리와 연동하여 커밋과 이슈를 추적합니다.'
        }
    }

    const config = serviceConfig[serviceId as keyof typeof serviceConfig]
    if (!config) return null

    const handleOAuthConnect = async () => {
        try {
            setLoading(true)
            setError(null)

            let result
            switch (serviceId) {
                case 'slack':
                    result = await integrationApi.slack.getAuthUrl()
                    break
                case 'notion':
                    result = await integrationApi.notion.getAuthUrl()
                    break
                case 'git':
                    result = await integrationApi.github.getAuthUrl()
                    break
                default:
                    throw new Error('지원하지 않는 서비스입니다.')
            }

            if (result.success && result.authUrl) {
                window.location.href = result.authUrl
            } else {
                throw new Error(result.message || 'OAuth URL을 가져올 수 없습니다.')
            }

        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || 'OAuth 연동 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleManualConnect = async () => {
        if (!serviceName.trim()) {
            setError('서비스 이름을 입력해주세요.')
            return
        }

        if (!token.trim()) {
            setError('토큰을 입력해주세요.')
            return
        }

        try {
            setLoading(true)
            setError(null)

            // 토큰 유효성 검증
            let validateResult
            switch (serviceId) {
                case 'slack':
                    validateResult = await integrationApi.slack.validateToken(token)
                    break
                case 'notion':
                    validateResult = await integrationApi.notion.validateToken(token)
                    break
                case 'git':
                    validateResult = await integrationApi.github.validateToken(token)
                    break
                default:
                    throw new Error('지원하지 않는 서비스입니다.')
            }

            if (!validateResult.success || !validateResult.isValid) {
                setError('유효하지 않은 토큰입니다.')
                return
            }

            // 수동 연동 생성
            const setupData = {
                token,
                serviceName,
                ...(serviceId === 'slack' && {
                    enableMentions: true,
                    enableDirectMessages: true,
                    enableChannelMessages: false,
                    enableThreadReplies: true
                })
            }

            let result
            switch (serviceId) {
                case 'slack':
                    result = await integrationApi.slack.createManualSetup(setupData)
                    break
                case 'notion':
                    result = await integrationApi.notion.createManualSetup(setupData)
                    break
                case 'git':
                    result = await integrationApi.github.createManualSetup(setupData)
                    break
                default:
                    throw new Error('지원하지 않는 서비스입니다.')
            }

            if (result.success) {
                // 성공 시 부모 컴포넌트에 알림
                onConnect(serviceId, {
                    name: serviceName,
                    token: token,
                    method: 'manual'
                })
            } else {
                throw new Error(result.message || '연동 생성에 실패했습니다.')
            }

        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || '수동 연동 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <span className="text-2xl mr-3">{config.icon}</span>
                            {config.name} 연동
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-gray-600 mb-6">{config.description}</p>

                    {/* 오류 메시지 */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex">
                                <div className="text-red-400">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 연동 방법 선택 */}
                    <div className="mb-6">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setSetupMethod('oauth')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                                    setupMethod === 'oauth'
                                        ? `border-${config.color}-500 bg-${config.color}-50 text-${config.color}-700`
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="text-lg mb-1">🔗</div>
                                    <div className="text-sm font-medium">OAuth 연동</div>
                                    <div className="text-xs">권장 방법</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setSetupMethod('manual')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                                    setupMethod === 'manual'
                                        ? `border-${config.color}-500 bg-${config.color}-50 text-${config.color}-700`
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="text-lg mb-1">⚙️</div>
                                    <div className="text-sm font-medium">수동 연동</div>
                                    <div className="text-xs">토큰 입력</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* OAuth 연동 */}
                    {setupMethod === 'oauth' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    서비스 이름
                                </label>
                                <input
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    placeholder={`${config.name} 연동`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleOAuthConnect}
                                disabled={loading}
                                className={`w-full py-3 px-4 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 disabled:bg-gray-400 transition-colors flex items-center justify-center`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        연동 중...
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">🔗</span>
                                        {config.name}에서 인증하기
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* 수동 연동 */}
                    {setupMethod === 'manual' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    서비스 이름
                                </label>
                                <input
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    placeholder={`${config.name} 연동`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {config.tokenLabel}
                                </label>
                                <input
                                    type="password"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder={config.tokenPlaceholder}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {serviceId === 'slack' && '슬랙 앱 설정에서 Bot User OAuth Token을 복사하여 입력하세요'}
                                    {serviceId === 'notion' && '노션 Integration 설정에서 Internal Integration Token을 복사하여 입력하세요'}
                                    {serviceId === 'git' && '깃허브 설정에서 Personal Access Token을 생성하여 입력하세요 (repo 권한 필요)'}
                                </p>
                            </div>
                            <button
                                onClick={handleManualConnect}
                                disabled={loading || !serviceName.trim() || !token.trim()}
                                className={`w-full py-3 px-4 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 disabled:bg-gray-400 transition-colors flex items-center justify-center`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        연동 중...
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">⚙️</span>
                                        수동으로 연동하기
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full mt-4 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    )
} 