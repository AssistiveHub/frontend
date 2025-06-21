'use client'

import { useState, useEffect } from 'react'
import { integrationApi, tokenUtils } from '@/utils/api'

interface ServiceSetupModalProps {
    serviceId: string
    onConnect: (serviceType: string, config: Record<string, string>) => void
    onClose: () => void
}

export default function ServiceSetupModal({ serviceId, onConnect, onClose }: ServiceSetupModalProps) {
    const [setupMethod, setSetupMethod] = useState<'oauth' | 'manual'>('oauth')
    const [serviceName, setServiceName] = useState('')
    const [token, setToken] = useState('')
    const [repositoryUrl, setRepositoryUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // GitHub OAuth 후 리포지토리 선택을 위한 상태
    const [showRepositorySelect, setShowRepositorySelect] = useState(false)
    const [githubAccessToken, setGithubAccessToken] = useState('')
    const [repositories, setRepositories] = useState<GitHubRepo[]>([])
    const [selectedRepository, setSelectedRepository] = useState<GitHubRepo | null>(null)

    // GitHub OAuth 완료 감지
    useEffect(() => {
        if (serviceId === 'git') {
            const tempToken = localStorage.getItem('github_temp_token')
            const authMode = localStorage.getItem('github_auth_mode')
            
            if (tempToken && authMode === 'repo_select') {
                // 임시 토큰으로 리포지토리 목록 가져오기
                fetchGitHubRepositories(tempToken)
                
                // localStorage에서 임시 데이터 제거
                localStorage.removeItem('github_temp_token')
                localStorage.removeItem('github_auth_mode')
            }
        }
    }, [serviceId])

    interface GitHubRepo {
        id: number
        name: string
        full_name: string
        html_url: string
        description: string | null
        private: boolean
        language: string | null
        stargazers_count: number
        updated_at: string
        is_already_added?: boolean
    }

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

            if (serviceId === 'git') {
                // GitHub OAuth for repository selection - Vercel style
                const params = new URLSearchParams({
                    client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
                    redirect_uri: `${window.location.origin}/integrations/github/callback`,
                    scope: 'repo',
                    state: 'repo_select'
                })
                
                window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
                return
            }

            let result
            switch (serviceId) {
                case 'slack':
                    result = await integrationApi.slack.getAuthUrl()
                    break
                case 'notion':
                    result = await integrationApi.notion.getAuthUrl()
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

    // GitHub OAuth 콜백 후 리포지토리 목록 가져오기
    const fetchGitHubRepositories = async (accessToken: string) => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/github/repositories?accessToken=${encodeURIComponent(accessToken)}`, {
                headers: {
                    'Authorization': `Bearer ${tokenUtils.getToken()}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                throw new Error('GitHub API 호출에 실패했습니다')
            }
            
            const result = await response.json()
            if (result.success) {
                setRepositories(result.data)
                setGithubAccessToken(accessToken)
                setShowRepositorySelect(true)
            } else {
                throw new Error(result.message || 'GitHub 리포지토리를 불러오는데 실패했습니다')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'GitHub 리포지토리를 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    // 선택한 리포지토리로 연동 생성
    const handleRepositorySelect = async (repo: GitHubRepo) => {
        try {
            setLoading(true)
            setError(null)
            
            const token = tokenUtils.getToken()
            console.log('DEBUG - Token:', token ? 'EXISTS' : 'NULL')
            console.log('DEBUG - Token length:', token?.length || 0)
            
            if (!token) {
                throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.')
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/github`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    repositoryUrl: repo.html_url,
                    accessToken: githubAccessToken
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || '리포지토리 추가에 실패했습니다')
            }

            await response.json()
            onConnect('git', {
                name: repo.name,
                repositoryUrl: repo.html_url,
                token: githubAccessToken,
                method: 'oauth'
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : '리포지토리 추가에 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    const handleManualConnect = async () => {
        if (serviceId === 'git') {
            if (!token.trim()) {
                setError('GitHub Personal Access Token을 입력해주세요.')
                return
            }
            if (!repositoryUrl.trim()) {
                setError('리포지토리 URL을 입력해주세요.')
                return
            }
        } else {
            if (!serviceName.trim()) {
                setError('서비스 이름을 입력해주세요.')
                return
            }
            if (!token.trim()) {
                setError('토큰을 입력해주세요.')
                return
            }
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
            let setupData
            let result

            if (serviceId === 'git') {
                // GitHub 리포지토리 추가
                setupData = {
                    accessToken: token,
                    repositoryUrl: repositoryUrl
                }
                result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/github`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenUtils.getToken()}`
                    },
                    body: JSON.stringify(setupData)
                }).then(res => res.json())
            } else {
                // 기존 서비스 연동
                setupData = {
                    token,
                    serviceName,
                    ...(serviceId === 'slack' && {
                        enableMentions: true,
                        enableDirectMessages: true,
                        enableChannelMessages: false,
                        enableThreadReplies: true
                    })
                }

                switch (serviceId) {
                    case 'slack':
                        result = await integrationApi.slack.createManualSetup(setupData)
                        break
                    case 'notion':
                        result = await integrationApi.notion.createManualSetup(setupData)
                        break
                    default:
                        throw new Error('지원하지 않는 서비스입니다.')
                }
            }

            if (result.success) {
                // 성공 시 부모 컴포넌트에 알림
                if (serviceId === 'git') {
                    onConnect(serviceId, {
                        name: result.data?.repositoryName || 'GitHub Repository',
                        repositoryUrl: repositoryUrl,
                        token: token,
                        method: 'manual'
                    })
                } else {
                    onConnect(serviceId, {
                        name: serviceName,
                        token: token,
                        method: 'manual'
                    })
                }
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

                    {/* Git OAuth 방식 안내 */}
                    {serviceId === 'git' && setupMethod === 'oauth' && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="text-green-600 mr-3">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-green-900">Vercel 스타일 연동</h4>
                                    <p className="text-sm text-green-700">GitHub에서 인증 후 리포지토리 목록에서 원하는 리포지토리를 선택하세요.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Git Manual 방식 안내 */}
                    {serviceId === 'git' && setupMethod === 'manual' && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="text-blue-600 mr-3">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900">수동 리포지토리 연동</h4>
                                    <p className="text-sm text-blue-700">Personal Access Token과 리포지토리 URL을 직접 입력하여 연동합니다.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OAuth 연동 */}
                    {setupMethod === 'oauth' && !showRepositorySelect && (
                        <div className="space-y-4">
                            {serviceId !== 'git' && (
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
                            )}
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
                                        {serviceId === 'git' ? 'GitHub에서 인증하기' : `${config.name}에서 인증하기`}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* GitHub 리포지토리 선택 화면 */}
                    {setupMethod === 'oauth' && serviceId === 'git' && showRepositorySelect && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">리포지토리 선택</h3>
                                <span className="text-sm text-gray-500">{repositories.length}개 리포지토리</span>
                            </div>
                            
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                                {repositories.map((repo) => {
                                    const isAlreadyAdded = repo.is_already_added
                                    const isSelected = selectedRepository?.id === repo.id
                                    const isDisabled = isAlreadyAdded
                                    
                                    return (
                                        <div
                                            key={repo.id}
                                            className={`p-4 border-b border-gray-100 transition-colors ${
                                                isDisabled 
                                                    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                                    : isSelected
                                                        ? 'bg-blue-50 border-blue-200 cursor-pointer'
                                                        : 'hover:bg-gray-50 cursor-pointer'
                                            }`}
                                            onClick={() => !isDisabled && setSelectedRepository(repo)}
                                        >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <h4 className={`text-sm font-medium truncate ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                                                        {repo.full_name}
                                                    </h4>
                                                    {repo.private && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            Private
                                                        </span>
                                                    )}
                                                    {isAlreadyAdded && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            ✓ 추가됨
                                                        </span>
                                                    )}
                                                </div>
                                                {repo.description && (
                                                    <p className={`text-sm truncate mt-1 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {repo.description}
                                                    </p>
                                                )}
                                                <div className={`flex items-center mt-2 text-xs ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`}>
                                                    {repo.language && (
                                                        <span className="flex items-center mr-4">
                                                            <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                                                            {repo.language}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center mr-4">
                                                        ⭐ {repo.stargazers_count}
                                                    </span>
                                                    <span>
                                                        {new Date(repo.updated_at).toLocaleDateString('ko-KR')}
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedRepository?.id === repo.id && !isDisabled && (
                                                <div className="ml-3 text-blue-600">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        </div>
                                    )
                                })}
                                
                                {repositories.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-4xl mb-2">📁</div>
                                        <p>리포지토리가 없습니다</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowRepositorySelect(false)}
                                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    뒤로가기
                                </button>
                                <button
                                    onClick={() => selectedRepository && handleRepositorySelect(selectedRepository)}
                                    disabled={!selectedRepository || loading || selectedRepository?.is_already_added}
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            추가 중...
                                        </>
                                    ) : (
                                        '리포지토리 추가하기'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 수동 연동 */}
                    {setupMethod === 'manual' && (
                        <div className="space-y-4">
                            {serviceId === 'git' ? (
                                // Git 리포지토리 연동
                                <>
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
                                            깃허브 설정에서 Personal Access Token을 생성하여 입력하세요 (repo 권한 필요)
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            리포지토리 URL
                                        </label>
                                        <input
                                            type="url"
                                            value={repositoryUrl}
                                            onChange={(e) => setRepositoryUrl(e.target.value)}
                                            placeholder="https://github.com/username/repository"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            연동할 깃허브 리포지토리의 URL을 입력하세요
                                        </p>
                                    </div>
                                </>
                            ) : (
                                // 기존 서비스 연동
                                <>
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
                                        </p>
                                    </div>
                                </>
                            )}
                            <button
                                onClick={handleManualConnect}
                                disabled={loading || (serviceId === 'git' ? (!token.trim() || !repositoryUrl.trim()) : (!serviceName.trim() || !token.trim()))}
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
                                        {serviceId === 'git' ? '리포지토리 추가하기' : '수동으로 연동하기'}
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