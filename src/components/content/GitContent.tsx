'use client'

import { useState, useEffect } from 'react'
import { integrationApi } from '@/utils/api'

interface GitContentProps {
    serviceId: string;
    serviceName: string;
    config: Record<string, string>;
}

interface GitHubIntegration {
    id: number;
    githubUsername: string;
    repositoryName: string;
    isActive: boolean;
    connectedAt: string;
    lastSyncAt: string;
}

interface GitHubStats {
    totalIntegrations: number;
    activeIntegrations: number;
    inactiveIntegrations: number;
}

export default function GitContent({ serviceName }: GitContentProps) {
    const [integrations, setIntegrations] = useState<GitHubIntegration[]>([])
    const [stats, setStats] = useState<GitHubStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showManualSetup, setShowManualSetup] = useState(false)
    const [manualToken, setManualToken] = useState('')
    const [tokenValidating, setTokenValidating] = useState(false)

    useEffect(() => {
        loadGitHubData()
    }, [])

    const loadGitHubData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [integrationsResult, statsResult] = await Promise.all([
                integrationApi.github.getIntegrations(),
                integrationApi.github.getStats()
            ])

            if (integrationsResult.success) {
                setIntegrations(integrationsResult.data || [])
            }

            if (statsResult.success) {
                setStats(statsResult.data)
            }

        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleOAuthConnect = async () => {
        try {
            const result = await integrationApi.github.getAuthUrl()
            if (result.success && result.authUrl) {
                window.location.href = result.authUrl
            }
        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || 'OAuth 연동 중 오류가 발생했습니다.')
        }
    }

    const handleManualConnect = async () => {
        if (!manualToken.trim()) {
            setError('토큰을 입력해주세요.')
            return
        }

        try {
            setTokenValidating(true)
            setError(null)

            const validateResult = await integrationApi.github.validateToken(manualToken)
            
            if (!validateResult.success || !validateResult.isValid) {
                setError('유효하지 않은 토큰입니다.')
                return
            }

            const setupData = {
                token: manualToken,
                serviceName: serviceName || 'GitHub Integration'
            }

            const result = await integrationApi.github.createManualSetup(setupData)
            
            if (result.success) {
                setShowManualSetup(false)
                setManualToken('')
                await loadGitHubData()
            }

        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || '수동 연동 중 오류가 발생했습니다.')
        } finally {
            setTokenValidating(false)
        }
    }

    const handleToggleIntegration = async (integrationId: number) => {
        try {
            const result = await integrationApi.github.toggle(integrationId)
            if (result.success) {
                await loadGitHubData()
            }
        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || '연동 상태 변경 중 오류가 발생했습니다.')
        }
    }

    const handleDisconnect = async (integrationId: number) => {
        if (!confirm('정말로 이 연동을 해제하시겠습니까?')) {
            return
        }

        try {
            const result = await integrationApi.github.disconnect(integrationId)
            if (result.success) {
                await loadGitHubData()
            }
        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || '연동 해제 중 오류가 발생했습니다.')
        }
    }

    if (loading) {
        return (
            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                        <span className="text-2xl mr-3">🔧</span>
                        {serviceName}
                    </h1>
                    <p className="text-gray-600">깃허브 리포지토리와의 연동을 관리하고 개발 활동을 추적하세요</p>
                </div>

                {/* 오류 메시지 */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="text-red-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                                <button 
                                    onClick={() => setError(null)}
                                    className="mt-2 text-sm text-red-600 hover:text-red-500"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 통계 카드 */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">전체 연동</h3>
                                <span className="text-blue-600">📊</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.totalIntegrations}</div>
                            <p className="text-xs text-gray-500">리포지토리</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">활성 연동</h3>
                                <span className="text-green-600">✅</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.activeIntegrations}</div>
                            <p className="text-xs text-green-600">정상 작동</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">비활성 연동</h3>
                                <span className="text-gray-600">⏸️</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.inactiveIntegrations}</div>
                            <p className="text-xs text-gray-500">일시 중지</p>
                        </div>
                    </div>
                )}

                {/* 연동 추가 버튼 */}
                <div className="mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">새 깃허브 리포지토리 연동</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleOAuthConnect}
                                className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <span className="mr-2">🔗</span>
                                OAuth로 연동하기
                            </button>
                            <button
                                onClick={() => setShowManualSetup(!showManualSetup)}
                                className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <span className="mr-2">⚙️</span>
                                수동으로 연동하기
                            </button>
                        </div>

                        {/* 수동 연동 폼 */}
                        {showManualSetup && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-md font-medium text-gray-900 mb-3">깃허브 Personal Access Token으로 연동</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            GitHub Personal Access Token
                                        </label>
                                        <input
                                            type="password"
                                            value={manualToken}
                                            onChange={(e) => setManualToken(e.target.value)}
                                            placeholder="ghp_your-personal-access-token"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            깃허브 설정에서 Personal Access Token을 생성하여 입력하세요 (repo 권한 필요)
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleManualConnect}
                                            disabled={tokenValidating || !manualToken.trim()}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                                        >
                                            {tokenValidating ? '검증 중...' : '연동하기'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowManualSetup(false)
                                                setManualToken('')
                                                setError(null)
                                            }}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 연동된 리포지토리 목록 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">연동된 리포지토리</h3>
                        <p className="text-sm text-gray-600 mt-1">현재 연결된 깃허브 리포지토리 목록입니다</p>
                    </div>

                    {integrations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">🔧</div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">연동된 리포지토리가 없습니다</h4>
                            <p className="text-gray-600 mb-4">위의 버튼을 사용하여 깃허브 리포지토리를 연동해보세요</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {integrations.map((integration) => (
                                <div key={integration.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                                                <span className="text-white text-xl">🔧</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900">{integration.repositoryName}</h4>
                                                <p className="text-sm text-gray-600">@{integration.githubUsername}</p>
                                                <p className="text-xs text-gray-500">
                                                    연결됨: {new Date(integration.connectedAt).toLocaleDateString('ko-KR')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                integration.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {integration.isActive ? '활성' : '비활성'}
                                            </div>
                                            
                                            <button
                                                onClick={() => handleToggleIntegration(integration.id)}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                    integration.isActive
                                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                }`}
                                            >
                                                {integration.isActive ? '일시정지' : '활성화'}
                                            </button>

                                            <button
                                                onClick={() => handleDisconnect(integration.id)}
                                                className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                            >
                                                연동해제
                                            </button>
                                        </div>
                                    </div>

                                    {/* 마지막 동기화 시간 */}
                                    <div className="mt-4 text-sm text-gray-500">
                                        마지막 동기화: {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString('ko-KR') : '없음'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 