'use client'

import { useState, useEffect, useCallback } from 'react'
import { tokenUtils } from '@/utils/api'

interface GitContentProps {
    serviceId: string;
    serviceName: string;
    config: Record<string, string>;
}

interface RepositoryInfo {
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    clone_url: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    watchers_count: number;
    size: number;
    default_branch: string;
    private: boolean;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    owner: {
        login: string;
        avatar_url: string;
        html_url: string;
    };
}

interface CommitInfo {
    sha: string;
    message: string;
    author_name: string;
    author_email: string;
    date: string;
    github_username?: string;
    avatar_url?: string;
    html_url: string;
}

interface ContributorInfo {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
    type: string;
}

interface LanguageInfo {
    language: string;
    bytes: number;
    percentage: number;
}

export default function GitContent({ serviceId, serviceName }: GitContentProps) {
    const [activeTab, setActiveTab] = useState('overview')
    const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo | null>(null)
    const [commits, setCommits] = useState<CommitInfo[]>([])
    const [contributors, setContributors] = useState<ContributorInfo[]>([])
    const [languages, setLanguages] = useState<{ total_bytes: number; languages: LanguageInfo[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // 상세 보기 상태 추가
    const [showAllCommits, setShowAllCommits] = useState(false)
    const [showAllContributors, setShowAllContributors] = useState(false)
    const [showAllLanguages, setShowAllLanguages] = useState(false)
    // 커밋 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMoreCommits, setHasMoreCommits] = useState(true)
    const COMMITS_PER_PAGE = 5

    const loadRepositoryData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const token = tokenUtils.getToken()
            if (!token) {
                throw new Error('로그인이 필요합니다.')
            }

            const repositoryId = serviceId.replace('git-repo-', '')
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            // 병렬로 데이터 요청 (커밋은 첫 페이지만)
            const [detailsResponse, commitsResponse, contributorsResponse, languagesResponse] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/github/${repositoryId}/details`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/github/${repositoryId}/commits?page=1&per_page=${COMMITS_PER_PAGE}`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/github/${repositoryId}/contributors`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/github/${repositoryId}/languages`, { headers })
            ])

            // 리포지토리 상세 정보
            const detailsResult = await detailsResponse.json()
            if (detailsResult.success) {
                setRepositoryInfo(detailsResult.data)
            } else {
                throw new Error(detailsResult.message || '리포지토리 정보를 가져올 수 없습니다.')
            }

            // 나머지 데이터들
            const results = await Promise.allSettled([
                commitsResponse.json(),
                contributorsResponse.json(),
                languagesResponse.json()
            ])

            if (results[0].status === 'fulfilled' && results[0].value.success) {
                const commitsData = results[0].value.data
                setCommits(commitsData)
                // 첫 페이지에서 가져온 커밋이 COMMITS_PER_PAGE보다 적으면 더 이상 없음
                setHasMoreCommits(commitsData.length === COMMITS_PER_PAGE)
                setCurrentPage(1)
            }
            if (results[1].status === 'fulfilled' && results[1].value.success) {
                setContributors(results[1].value.data)
            }
            if (results[2].status === 'fulfilled' && results[2].value.success) {
                setLanguages(results[2].value.data)
            }

        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }, [serviceId, COMMITS_PER_PAGE])

    // 추가 커밋을 불러오는 함수
    const loadMoreCommits = useCallback(async () => {
        if (!hasMoreCommits || loadingMore) return

        try {
            setLoadingMore(true)
            const token = tokenUtils.getToken()
            if (!token) {
                throw new Error('로그인이 필요합니다.')
            }

            const repositoryId = serviceId.replace('git-repo-', '')
            const nextPage = currentPage + 1
            
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/repositories/github/${repositoryId}/commits?page=${nextPage}&per_page=${COMMITS_PER_PAGE}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            const result = await response.json()
            if (result.success) {
                const newCommits = result.data
                setCommits(prev => [...prev, ...newCommits])
                setCurrentPage(nextPage)
                // 새로 불러온 커밋이 COMMITS_PER_PAGE보다 적으면 더 이상 불러올 게 없음
                setHasMoreCommits(newCommits.length === COMMITS_PER_PAGE)
            } else {
                throw new Error(result.message || '추가 커밋을 불러올 수 없습니다.')
            }
        } catch (err: unknown) {
            const error = err as Error
            console.error('추가 커밋 로딩 실패:', error.message)
        } finally {
            setLoadingMore(false)
        }
    }, [serviceId, currentPage, hasMoreCommits, loadingMore, COMMITS_PER_PAGE])

    useEffect(() => {
        loadRepositoryData()
    }, [loadRepositoryData])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatFileSize = (sizeInKB: number) => {
        if (sizeInKB < 1024) {
            return `${sizeInKB} KB`
        }
        return `${(sizeInKB / 1024).toFixed(1)} MB`
    }

    const getLanguageColor = (language: string) => {
        const colors: Record<string, string> = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'HTML': '#e34c26',
            'CSS': '#1572B6',
            'Shell': '#89e051',
            'Dockerfile': '#384d54'
        }
        return colors[language] || '#6e7681'
    }

    const tabs = [
        { id: 'overview', label: '개요', icon: '📊' },
        { id: 'weekly-log', label: '주간 업무일지', icon: '📊' },
        { id: 'daily-log', label: '일일 업무일지', icon: '📝' },
        { id: 'feedback', label: '업무 피드백', icon: '💬' },
        { id: 'skill-growth', label: '스킬 성장', icon: '📈' },
        { id: 'notifications', label: '알람 정돈', icon: '🔔' },
        { id: 'commits', label: '커밋', icon: '📝', count: commits.length },
        { id: 'contributors', label: '기여자', icon: '👥', count: contributors.length },
        { id: 'languages', label: '언어', icon: '💻' },
    ]

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
                {/* 헤더 */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                        <span className="text-2xl mr-3">🔧</span>
                        {repositoryInfo?.full_name || serviceName}
                    </h1>
                    <p className="text-gray-600 mb-3">
                        {repositoryInfo?.description || '리포지토리 설명이 없습니다.'}
                    </p>
                    
                    {/* 리포지토리 메타 정보 */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        {repositoryInfo?.owner && (
                            <div className="flex items-center">
                                <img 
                                    src={repositoryInfo.owner.avatar_url} 
                                    alt={repositoryInfo.owner.login}
                                    className="w-5 h-5 rounded-full mr-2"
                                />
                                <span>{repositoryInfo.owner.login}</span>
                            </div>
                        )}
                        {repositoryInfo?.language && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {repositoryInfo.language}
                            </span>
                        )}
                        {repositoryInfo?.private && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                Private
                            </span>
                        )}
                        {repositoryInfo?.size && (
                            <span>크기: {formatFileSize(repositoryInfo.size)}</span>
                        )}
                        {repositoryInfo?.pushed_at && (
                            <span>마지막 푸시: {formatDate(repositoryInfo.pushed_at)}</span>
                        )}
                    </div>

                    {/* 리포지토리 링크들 */}
                    <div className="flex flex-wrap gap-3">
                        {repositoryInfo?.html_url && (
                            <a 
                                href={repositoryInfo.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <span className="mr-2">🔗</span>
                                GitHub에서 보기
                            </a>
                        )}
                        {repositoryInfo?.clone_url && (
                            <button
                                onClick={() => navigator.clipboard.writeText(repositoryInfo.clone_url)}
                                className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                <span className="mr-2">📋</span>
                                Clone URL 복사
                            </button>
                        )}
                    </div>
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
                                    onClick={() => {
                                        setError(null)
                                        loadRepositoryData()
                                    }}
                                    className="mt-2 text-sm text-red-600 hover:text-red-500"
                                >
                                    다시 시도
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 탭 네비게이션 */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 탭 컨텐츠 */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* 리포지토리 통계 */}
                        {repositoryInfo && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-500">스타</h3>
                                        <span className="text-yellow-600">⭐</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{repositoryInfo.stargazers_count}</div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-500">포크</h3>
                                        <span className="text-green-600">🍴</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{repositoryInfo.forks_count}</div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-500">이슈</h3>
                                        <span className="text-red-600">🐛</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{repositoryInfo.open_issues_count}</div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-500">워처</h3>
                                        <span className="text-blue-600">👁️</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{repositoryInfo.watchers_count}</div>
                                </div>
                            </div>
                        )}

                        {/* AI 기능 섹션 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 주간 업무일지 */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-2xl mr-3">📊</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">주간 업무일지 작성</h3>
                                        <p className="text-sm text-gray-600">AI가 주간 업무 내용을 정리하고 일지를 자동으로 작성합니다.</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">이번 주 작업 요약</h4>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        <li>• 새로운 사용자 인증 기능 구현 완료</li>
                                        <li>• API 성능 최적화 작업 진행 (80% 완료)</li>
                                        <li>• 데이터베이스 마이그레이션 스크립트 작성</li>
                                        <li>• 프론트엔드 UI 컴포넌트 3개 리팩토링</li>
                                    </ul>
                                </div>
                                <button className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                                    주간 일지 자동 생성
                                </button>
                            </div>

                            {/* 일일 업무일지 */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-2xl mr-3">📝</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">일일 업무일지</h3>
                                        <p className="text-sm text-gray-600">매일의 업무 활동을 기록하고 AI가 요약해서 정리합니다.</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">오늘의 활동 (12월 13일)</h4>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            <span>로그인 API 테스트 완료</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                            <span>데이터베이스 쿼리 최적화 진행 중</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                            <span>코드 리뷰 3건 처리</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                                    일일 일지 업데이트
                                </button>
                            </div>

                            {/* 업무 피드백 및 리뷰 관리 */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-2xl mr-3">💬</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">업무 피드백 및 리뷰 관리</h3>
                                        <p className="text-sm text-gray-600">AI가 업무 성과를 분석하고 개선점을 제안합니다.</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">이번 주 성과 분석</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">코드 품질</span>
                                            <div className="flex items-center">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                                    <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                                                </div>
                                                <span className="text-sm font-medium text-green-600">85%</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">일정 준수</span>
                                            <div className="flex items-center">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                                    <div className="w-14 h-2 bg-blue-500 rounded-full"></div>
                                                </div>
                                                <span className="text-sm font-medium text-blue-600">92%</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700">협업 효율성</span>
                                            <div className="flex items-center">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                                    <div className="w-11 h-2 bg-purple-500 rounded-full"></div>
                                                </div>
                                                <span className="text-sm font-medium text-purple-600">78%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                                    개선점 분석 보기
                                </button>
                            </div>

                            {/* 스킬 성장 측정 */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-2xl mr-3">📈</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">스킬 성장 측정</h3>
                                        <p className="text-sm text-gray-600">기술 스택과 역량 발전을 추적하고 성장 방향을 제시합니다.</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-900 mb-3">기술 스택 성장도</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-700">React/TypeScript</span>
                                                <span className="text-sm font-medium text-blue-600">+15%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-700">Node.js/Express</span>
                                                <span className="text-sm font-medium text-green-600">+8%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-700">데이터베이스</span>
                                                <span className="text-sm font-medium text-yellow-600">+12%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full bg-yellow-100 text-yellow-700 py-2 px-4 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                                    성장 계획 수립
                                </button>
                            </div>
                        </div>

                        {/* 알람 정돈 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">🔔</span>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">알람 정돈</h3>
                                    <p className="text-sm text-gray-600">중요한 알림을 우선순위에 따라 정리하고 관리합니다.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                        <span className="text-sm font-medium text-red-800">긴급</span>
                                    </div>
                                    <p className="text-sm text-red-700 mb-2">프로덕션 서버 응답 지연</p>
                                    <p className="text-xs text-red-600">2시간 전</p>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                        <span className="text-sm font-medium text-yellow-800">중요</span>
                                    </div>
                                    <p className="text-sm text-yellow-700 mb-2">코드 리뷰 요청 대기 중</p>
                                    <p className="text-xs text-yellow-600">4시간 전</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                        <span className="text-sm font-medium text-blue-800">일반</span>
                                    </div>
                                    <p className="text-sm text-blue-700 mb-2">주간 회의 일정 안내</p>
                                    <p className="text-xs text-blue-600">1일 전</p>
                                </div>
                            </div>
                            <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                모든 알림 관리
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'commits' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">최근 커밋</h3>
                                    <p className="text-sm text-gray-600 mt-1">최신 개발 활동을 확인하세요</p>
                                </div>
                                {commits.length > 0 && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setShowAllCommits(!showAllCommits)}
                                            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            {showAllCommits ? '간단히 보기' : '전체 보기'}
                                        </button>
                                        <button
                                            onClick={() => window.open(repositoryInfo?.html_url + '/commits', '_blank')}
                                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            GitHub에서 보기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {commits.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-4">📝</div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">커밋이 없습니다</h4>
                                <p className="text-gray-600">아직 커밋 데이터가 없거나 접근할 수 없습니다</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {commits.map((commit, index) => (
                                    <div key={commit.sha} className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {commit.avatar_url ? (
                                                    <img 
                                                        src={commit.avatar_url} 
                                                        alt={commit.github_username || commit.author_name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {commit.author_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                                            {commit.message.split('\n')[0]}
                                                        </p>
                                                        {showAllCommits && commit.message.includes('\n') && (
                                                            <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">
                                                                {commit.message.split('\n').slice(1).join('\n').trim()}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                                                            <span>
                                                                {commit.github_username || commit.author_name}
                                                            </span>
                                                            <span>{formatDate(commit.date)}</span>
                                                            <a 
                                                                href={commit.html_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                커밋 보기
                                                            </a>
                                                            {commit.author_email && showAllCommits && (
                                                                <span className="text-gray-400">{commit.author_email}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                            {commit.sha.substring(0, 7)}
                                                        </span>
                                                        {showAllCommits && (
                                                            <span className="text-xs text-gray-400">
                                                                #{index + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {hasMoreCommits && (
                                    <div className="p-4 text-center border-t border-gray-200">
                                        <button
                                            onClick={loadMoreCommits}
                                            disabled={loadingMore}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loadingMore ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                    <span>불러오는 중...</span>
                                                </div>
                                            ) : (
                                                '더 많은 커밋 불러오기'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'contributors' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">기여자</h3>
                                    <p className="text-sm text-gray-600 mt-1">프로젝트에 기여한 개발자들</p>
                                </div>
                                {contributors.length > 0 && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setShowAllContributors(!showAllContributors)}
                                            className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                        >
                                            {showAllContributors ? '주요 기여자' : '전체 기여자'}
                                        </button>
                                        <button
                                            onClick={() => window.open(repositoryInfo?.html_url + '/graphs/contributors', '_blank')}
                                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            GitHub에서 보기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {contributors.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-4">👥</div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">기여자 정보가 없습니다</h4>
                                <p className="text-gray-600">기여자 데이터를 불러올 수 없습니다</p>
                            </div>
                        ) : (
                            <div className="p-6">
                                {/* 기여도 통계 */}
                                {showAllContributors && (
                                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-blue-900">
                                                {contributors.length}
                                            </div>
                                            <div className="text-sm text-blue-700">총 기여자 수</div>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-green-900">
                                                {contributors.reduce((sum, c) => sum + c.contributions, 0)}
                                            </div>
                                            <div className="text-sm text-green-700">총 기여 횟수</div>
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-yellow-900">
                                                {Math.round(contributors.reduce((sum, c) => sum + c.contributions, 0) / contributors.length)}
                                            </div>
                                            <div className="text-sm text-yellow-700">평균 기여 횟수</div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {contributors.slice(0, showAllContributors ? contributors.length : 6).map((contributor, index) => (
                                        <div key={contributor.login} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="relative">
                                                <img 
                                                    src={contributor.avatar_url} 
                                                    alt={contributor.login}
                                                    className="w-12 h-12 rounded-full mr-4"
                                                />
                                                {showAllContributors && index < 3 && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                                        {index + 1}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900">{contributor.login}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-sm text-gray-500">{contributor.contributions} 기여</p>
                                                    {showAllContributors && contributor.type && (
                                                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                                            {contributor.type}
                                                        </span>
                                                    )}
                                                </div>
                                                {showAllContributors && (
                                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-blue-600 h-1.5 rounded-full" 
                                                            style={{ 
                                                                width: `${Math.min((contributor.contributions / Math.max(...contributors.map(c => c.contributions))) * 100, 100)}%` 
                                                            }}
                                                        ></div>
                                                    </div>
                                                )}
                                            </div>
                                            <a 
                                                href={contributor.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 ml-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                
                                {!showAllContributors && contributors.length > 6 && (
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setShowAllContributors(true)}
                                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                        >
                                            {contributors.length - 6}명의 기여자 더 보기
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'languages' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">언어 통계</h3>
                                    <p className="text-sm text-gray-600 mt-1">코드베이스의 언어 구성</p>
                                </div>
                                {languages && languages.languages.length > 0 && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setShowAllLanguages(!showAllLanguages)}
                                            className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                        >
                                            {showAllLanguages ? '주요 언어' : '전체 언어'}
                                        </button>
                                        <button
                                            onClick={() => window.open(repositoryInfo?.html_url + '/pulse', '_blank')}
                                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            GitHub에서 보기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!languages || languages.languages.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-4">💻</div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">언어 정보가 없습니다</h4>
                                <p className="text-gray-600">언어 통계를 불러올 수 없습니다</p>
                            </div>
                        ) : (
                            <div className="p-6">
                                {/* 언어 통계 개요 */}
                                {showAllLanguages && (
                                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-blue-900">
                                                {languages.languages.length}
                                            </div>
                                            <div className="text-sm text-blue-700">사용 언어 수</div>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-green-900">
                                                {formatFileSize(Math.round(languages.total_bytes / 1024))}
                                            </div>
                                            <div className="text-sm text-green-700">총 코드 크기</div>
                                        </div>
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-purple-900">
                                                {languages.languages[0]?.language || 'N/A'}
                                            </div>
                                            <div className="text-sm text-purple-700">주요 언어</div>
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-yellow-900">
                                                {languages.languages[0]?.percentage.toFixed(1) || 0}%
                                            </div>
                                            <div className="text-sm text-yellow-700">주요 언어 비율</div>
                                        </div>
                                    </div>
                                )}

                                {/* 언어 차트 */}
                                <div className="mb-6">
                                    <div className="flex rounded-lg overflow-hidden h-6">
                                        {languages.languages.slice(0, showAllLanguages ? languages.languages.length : 8).map((lang) => (
                                            <div 
                                                key={lang.language}
                                                className="h-full transition-all duration-300 hover:opacity-80"
                                                style={{ 
                                                    backgroundColor: getLanguageColor(lang.language),
                                                    width: `${lang.percentage}%`
                                                }}
                                                title={`${lang.language}: ${lang.percentage.toFixed(1)}% (${formatFileSize(Math.round(lang.bytes / 1024))})`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {/* 언어 목록 */}
                                <div className="space-y-4">
                                    {languages.languages.slice(0, showAllLanguages ? languages.languages.length : 8).map((lang, index) => (
                                        <div key={lang.language} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center">
                                                <div className="flex items-center space-x-3">
                                                    <div 
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: getLanguageColor(lang.language) }}
                                                    ></div>
                                                    <span className="text-sm font-medium text-gray-700">{lang.language}</span>
                                                    {showAllLanguages && index === 0 && (
                                                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                            주요 언어
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                {showAllLanguages && (
                                                    <div className="flex-1 min-w-24 max-w-32">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="h-2 rounded-full transition-all duration-300"
                                                                style={{ 
                                                                    backgroundColor: getLanguageColor(lang.language),
                                                                    width: `${(lang.percentage / languages.languages[0].percentage) * 100}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 min-w-32">
                                                    <span className="font-medium">{lang.percentage.toFixed(1)}%</span>
                                                    <span>{formatFileSize(Math.round(lang.bytes / 1024))}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {!showAllLanguages && languages.languages.length > 8 && (
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => setShowAllLanguages(true)}
                                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                                        >
                                            {languages.languages.length - 8}개의 언어 더 보기
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 주간 업무일지 탭 */}
                {activeTab === 'weekly-log' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">주간 업무일지 작성</h3>
                                    <p className="text-sm text-gray-600 mt-1">AI가 주간 업무 내용을 정리하고 일지를 자동으로 작성합니다</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        새 일지 작성
                                    </button>
                                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        설정
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 주간 업무 요약 */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-blue-900 mb-4">이번 주 업무 요약 (12월 9일 - 12월 13일)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-800">23</div>
                                        <div className="text-sm text-blue-600">완료된 작업</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-800">8</div>
                                        <div className="text-sm text-green-600">진행 중인 작업</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-800">42시간</div>
                                        <div className="text-sm text-yellow-600">총 작업 시간</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">주요 성과</span>
                                        <span className="text-blue-600">85% 완료</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* 주간 일지 목록 */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900">최근 주간 일지</h4>
                                <div className="space-y-3">
                                    {[
                                        { week: '12월 2일 - 12월 8일', status: '완료', tasks: 18, hours: 38 },
                                        { week: '11월 25일 - 12월 1일', status: '완료', tasks: 21, hours: 40 },
                                        { week: '11월 18일 - 11월 24일', status: '완료', tasks: 15, hours: 35 }
                                    ].map((log, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{log.week}</h5>
                                                    <p className="text-sm text-gray-600">{log.tasks}개 작업, {log.hours}시간</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                        {log.status}
                                                    </span>
                                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                        보기
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 일일 업무일지 탭 */}
                {activeTab === 'daily-log' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">일일 업무일지</h3>
                                    <p className="text-sm text-gray-600 mt-1">매일의 업무 활동을 기록하고 AI가 요약해서 정리합니다</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                        오늘 일지 작성
                                    </button>
                                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        캘린더 보기
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 오늘의 활동 현황 */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-green-900 mb-4">오늘의 활동 (12월 13일)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-800">5</div>
                                        <div className="text-sm text-green-600">완료된 작업</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-800">2</div>
                                        <div className="text-sm text-yellow-600">진행 중</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-800">7.5시간</div>
                                        <div className="text-sm text-blue-600">작업 시간</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-800">3</div>
                                        <div className="text-sm text-purple-600">미팅 참석</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                                        <span className="text-sm text-green-700">로그인 API 테스트 완료</span>
                                        <span className="ml-auto text-xs text-green-600">14:30</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                                        <span className="text-sm text-yellow-700">데이터베이스 쿼리 최적화 진행 중</span>
                                        <span className="ml-auto text-xs text-yellow-600">진행 중</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                                        <span className="text-sm text-blue-700">팀 스탠드업 미팅 참석</span>
                                        <span className="ml-auto text-xs text-blue-600">09:00</span>
                                    </div>
                                </div>
                            </div>

                            {/* 주간 일지 달력 */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900">이번 주 일지</h4>
                                <div className="grid grid-cols-7 gap-2">
                                    {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}
                                    {[9, 10, 11, 12, 13, 14, 15].map((date) => (
                                        <div key={date} className={`p-3 rounded-lg border text-center cursor-pointer transition-colors ${
                                            date === 13 
                                                ? 'bg-green-100 border-green-300 text-green-800' 
                                                : date < 13 
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                                                    : 'bg-gray-50 border-gray-200 text-gray-400'
                                        }`}>
                                            <div className="text-sm font-medium">{date}</div>
                                            {date < 13 && (
                                                <div className="text-xs mt-1">
                                                    {date === 13 ? '진행 중' : '완료'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 업무 피드백 탭 */}
                {activeTab === 'feedback' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">업무 피드백 및 리뷰 관리</h3>
                                    <p className="text-sm text-gray-600 mt-1">AI가 업무 성과를 분석하고 개선점을 제안합니다</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                        성과 분석
                                    </button>
                                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        리포트 내보내기
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 전체 성과 지표 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-green-900">코드 품질</h4>
                                        <span className="text-green-600">💎</span>
                                    </div>
                                    <div className="text-3xl font-bold text-green-800 mb-2">85%</div>
                                    <div className="w-full bg-green-200 rounded-full h-2 mb-3">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                    <p className="text-sm text-green-700">지난 주 대비 +5% 향상</p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-blue-900">일정 준수</h4>
                                        <span className="text-blue-600">⏰</span>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-800 mb-2">92%</div>
                                    <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                    <p className="text-sm text-blue-700">목표 달성률 우수</p>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-purple-900">협업 효율성</h4>
                                        <span className="text-purple-600">🤝</span>
                                    </div>
                                    <div className="text-3xl font-bold text-purple-800 mb-2">78%</div>
                                    <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
                                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                                    </div>
                                    <p className="text-sm text-purple-700">개선 여지 있음</p>
                                </div>
                            </div>

                            {/* AI 추천 개선점 */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI 추천 개선점</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-yellow-600 text-sm">⚡</span>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900">코드 리뷰 응답 시간 단축</h5>
                                            <p className="text-sm text-gray-600">평균 응답 시간이 4.2시간입니다. 2시간 이내로 단축을 권장합니다.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-blue-600 text-sm">📋</span>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900">문서화 품질 향상</h5>
                                            <p className="text-sm text-gray-600">API 문서와 주석의 상세도를 높이면 팀 협업이 더 원활해집니다.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-green-600 text-sm">🎯</span>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900">테스트 커버리지 확대</h5>
                                            <p className="text-sm text-gray-600">현재 72%에서 85% 이상으로 확대하여 코드 안정성을 높이세요.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 스킬 성장 탭 */}
                {activeTab === 'skill-growth' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">스킬 성장 측정</h3>
                                    <p className="text-sm text-gray-600 mt-1">기술 스택과 역량 발전을 추적하고 성장 방향을 제시합니다</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                                        성장 계획 수립
                                    </button>
                                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        히스토리 보기
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 스킬 레벨 대시보드 */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-800">7</div>
                                    <div className="text-sm text-blue-600">전문 기술</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-800">4</div>
                                    <div className="text-sm text-green-600">성장 중</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-800">2</div>
                                    <div className="text-sm text-yellow-600">학습 필요</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-800">82%</div>
                                    <div className="text-sm text-purple-600">전체 진행률</div>
                                </div>
                            </div>

                            {/* 기술 스택 성장도 */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-gray-900">기술 스택 성장도</h4>
                                <div className="space-y-4">
                                    {[
                                        { skill: 'React/TypeScript', level: 85, growth: 15, color: 'blue', status: '전문가' },
                                        { skill: 'Node.js/Express', level: 72, growth: 8, color: 'green', status: '숙련' },
                                        { skill: 'Database (SQL/NoSQL)', level: 68, growth: 12, color: 'yellow', status: '중급' },
                                        { skill: 'AWS/DevOps', level: 45, growth: 18, color: 'purple', status: '초급' },
                                        { skill: 'System Design', level: 52, growth: 22, color: 'red', status: '학습 중' }
                                    ].map((item, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        item.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                        item.color === 'green' ? 'bg-green-100 text-green-800' :
                                                        item.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                        item.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-gray-700">{item.level}%</span>
                                                    <span className="text-xs text-green-600">+{item.growth}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${
                                                        item.color === 'blue' ? 'bg-blue-500' :
                                                        item.color === 'green' ? 'bg-green-500' :
                                                        item.color === 'yellow' ? 'bg-yellow-500' :
                                                        item.color === 'purple' ? 'bg-purple-500' :
                                                        'bg-red-500'
                                                    }`}
                                                    style={{ width: `${item.level}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 학습 추천 */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 이번 달 학습 목표</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                        <span className="text-sm text-gray-700">AWS Lambda와 서버리스 아키텍처 학습</span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">높은 우선순위</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input type="checkbox" className="rounded border-gray-300" checked readOnly />
                                        <span className="text-sm text-gray-700 line-through">Docker 컨테이너 기초 완료</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">완료</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                        <span className="text-sm text-gray-700">PostgreSQL 고급 쿼리 최적화</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">진행 중</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 알람 정돈 탭 */}
                {activeTab === 'notifications' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">알람 정돈</h3>
                                    <p className="text-sm text-gray-600 mt-1">중요한 알림을 우선순위에 따라 정리하고 관리합니다</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                        모두 읽음 처리
                                    </button>
                                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        알림 설정
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 알림 통계 */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-red-800">3</div>
                                    <div className="text-sm text-red-600">긴급</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-800">7</div>
                                    <div className="text-sm text-yellow-600">중요</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-800">15</div>
                                    <div className="text-sm text-blue-600">일반</div>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-800">25</div>
                                    <div className="text-sm text-gray-600">총 알림</div>
                                </div>
                            </div>

                            {/* 우선순위별 알림 */}
                            <div className="space-y-4">
                                {/* 긴급 알림 */}
                                <div className="bg-red-50 border border-red-200 rounded-lg">
                                    <div className="p-4 border-b border-red-200">
                                        <h4 className="text-lg font-semibold text-red-900 flex items-center">
                                            🚨 긴급 알림
                                            <span className="ml-2 text-sm bg-red-200 text-red-800 px-2 py-1 rounded-full">3</span>
                                        </h4>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {[
                                            { title: '프로덕션 서버 응답 지연', time: '2시간 전', action: '즉시 확인 필요' },
                                            { title: '데이터베이스 연결 오류', time: '30분 전', action: '시스템 점검 중' },
                                            { title: '보안 취약점 발견', time: '1시간 전', action: '패치 적용 필요' }
                                        ].map((alert, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                                                <div>
                                                    <h5 className="font-medium text-red-900">{alert.title}</h5>
                                                    <p className="text-sm text-red-600">{alert.time} • {alert.action}</p>
                                                </div>
                                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                                    처리
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 중요 알림 */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="p-4 border-b border-yellow-200">
                                        <h4 className="text-lg font-semibold text-yellow-900 flex items-center">
                                            ⚠️ 중요 알림
                                            <span className="ml-2 text-sm bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">7</span>
                                        </h4>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {[
                                            { title: '코드 리뷰 요청 대기 중', time: '4시간 전', author: 'john.doe' },
                                            { title: 'PR 병합 승인 필요', time: '6시간 전', author: 'jane.smith' },
                                            { title: '테스트 케이스 실패', time: '1일 전', author: 'system' }
                                        ].map((alert, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-yellow-200">
                                                <div>
                                                    <h5 className="font-medium text-yellow-900">{alert.title}</h5>
                                                    <p className="text-sm text-yellow-600">{alert.time} • {alert.author}</p>
                                                </div>
                                                <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                                                    확인
                                                </button>
                                            </div>
                                        ))}
                                        <button className="w-full text-yellow-600 hover:text-yellow-800 text-sm font-medium py-2">
                                            4개 더 보기
                                        </button>
                                    </div>
                                </div>

                                {/* 일반 알림 */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="p-4 border-b border-blue-200">
                                        <h4 className="text-lg font-semibold text-blue-900 flex items-center">
                                            📢 일반 알림
                                            <span className="ml-2 text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded-full">15</span>
                                        </h4>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {[
                                            { title: '주간 회의 일정 안내', time: '1일 전', type: '일정' },
                                            { title: '새로운 팀원 합류', time: '2일 전', type: '공지' },
                                            { title: '시스템 업데이트 완료', time: '3일 전', type: '시스템' }
                                        ].map((alert, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
                                                <div>
                                                    <h5 className="font-medium text-blue-900">{alert.title}</h5>
                                                    <p className="text-sm text-blue-600">{alert.time} • {alert.type}</p>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    보기
                                                </button>
                                            </div>
                                        ))}
                                        <button className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2">
                                            12개 더 보기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 