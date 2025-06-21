'use client'

import { useState, useEffect, useCallback } from 'react'
import { tokenUtils } from '@/utils/api'

interface GitLabContentProps {
    serviceId: string;
    serviceName: string;
    config: Record<string, string>;
}

interface RepositoryInfo {
    name: string;
    path_with_namespace: string;
    description: string;
    web_url: string;
    http_url_to_repo: string;
    default_branch: string;
    visibility: string;
    created_at: string;
    last_activity_at: string;
    star_count: number;
    forks_count: number;
    open_issues_count: number;
    namespace: {
        name: string;
        path: string;
        avatar_url: string;
    };
}

interface CommitInfo {
    id: string;
    message: string;
    author_name: string;
    author_email: string;
    created_at: string;
    web_url: string;
}

interface ContributorInfo {
    name: string;
    email: string;
    commits: number;
    additions: number;
    deletions: number;
}

export default function GitLabContent({ serviceId, serviceName, config }: GitLabContentProps) {
    const [activeTab, setActiveTab] = useState('overview')
    const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo | null>(null)
    const [commits, setCommits] = useState<CommitInfo[]>([])
    const [contributors, setContributors] = useState<ContributorInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    const loadRepositoryData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const token = tokenUtils.getToken()
            if (!token) {
                throw new Error('로그인이 필요합니다.')
            }

            // GitLab 프로젝트 ID는 config에서 projectPath를 사용
            const projectPath = config.projectPath || serviceId.replace('gitlab-repo-', '')
            const projectId = encodeURIComponent(projectPath)
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            // 병렬로 데이터 요청
            const [detailsResponse, commitsResponse, contributorsResponse] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/gitlab/${projectId}/details`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/gitlab/${projectId}/commits?page=1&per_page=5`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories/gitlab/${projectId}/contributors`, { headers })
            ])

            // 프로젝트 상세 정보
            const detailsResult = await detailsResponse.json()
            if (detailsResult.success) {
                setRepositoryInfo(detailsResult.data)
            } else {
                throw new Error(detailsResult.message || 'GitLab 프로젝트 정보를 가져올 수 없습니다.')
            }

            // 커밋 정보
            const commitsResult = await commitsResponse.json()
            if (commitsResult.success) {
                // GitLab API 응답을 GitHub 호환 형식으로 변환
                const formattedCommits = commitsResult.data.map((commit: {
                    id: string;
                    message: string;
                    author_name: string;
                    author_email: string;
                    created_at: string;
                    web_url: string;
                }) => ({
                    sha: commit.id,
                    message: commit.message,
                    author_name: commit.author_name,
                    author_email: commit.author_email,
                    date: commit.created_at,
                    html_url: commit.web_url
                }))
                setCommits(formattedCommits)
            }

            // 기여자 정보
            const contributorsResult = await contributorsResponse.json()
            if (contributorsResult.success) {
                // GitLab API 응답을 GitHub 호환 형식으로 변환
                const formattedContributors = contributorsResult.data.map((contributor: {
                    name: string;
                    commits: number;
                }) => ({
                    login: contributor.name,
                    avatar_url: '', // GitLab contributors API는 avatar를 제공하지 않음
                    html_url: '#',
                    contributions: contributor.commits,
                    type: 'User'
                }))
                setContributors(formattedContributors)
            }

        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }, [serviceId])



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

    const tabs = [
        { id: 'overview', label: '개요', icon: '📊' },
        { id: 'commits', label: '커밋', icon: '📝', count: commits.length },
        { id: 'contributors', label: '기여자', icon: '👥', count: contributors.length },
    ]

    if (loading) {
        return (
            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
                        <span className="text-2xl mr-3">🦊</span>
                        {repositoryInfo?.path_with_namespace || serviceName}
                    </h1>
                    <p className="text-gray-600 mb-3">
                        {repositoryInfo?.description || 'GitLab 리포지토리 설명이 없습니다.'}
                    </p>
                    
                    {/* 리포지토리 메타 정보 */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        {repositoryInfo?.namespace && (
                            <div className="flex items-center">
                                <span className="w-5 h-5 bg-orange-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">
                                    {repositoryInfo.namespace.name.charAt(0).toUpperCase()}
                                </span>
                                <span>{repositoryInfo.namespace.name}</span>
                            </div>
                        )}
                        {repositoryInfo?.visibility && (
                            <span className={`px-2 py-1 rounded text-xs ${
                                repositoryInfo.visibility === 'private' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {repositoryInfo.visibility === 'private' ? 'Private' : 'Public'}
                            </span>
                        )}
                        {repositoryInfo?.last_activity_at && (
                            <span>마지막 활동: {formatDate(repositoryInfo.last_activity_at)}</span>
                        )}
                    </div>

                    {/* 리포지토리 링크들 */}
                    <div className="flex flex-wrap gap-3">
                        {repositoryInfo?.web_url && repositoryInfo.web_url !== '#' && (
                            <a 
                                href={repositoryInfo.web_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                            >
                                <span className="mr-2">🔗</span>
                                GitLab에서 보기
                            </a>
                        )}
                        {repositoryInfo?.http_url_to_repo && repositoryInfo.http_url_to_repo !== '#' && (
                            <button
                                onClick={() => navigator.clipboard.writeText(repositoryInfo.http_url_to_repo)}
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
                                        ? 'border-orange-500 text-orange-600'
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-500">스타</h3>
                                        <span className="text-yellow-600">⭐</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{repositoryInfo.star_count}</div>
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
                            </div>
                        )}

                        {/* GitLab 준비 중 메시지 */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                            <div className="text-4xl mb-4">🚧</div>
                            <h3 className="text-lg font-semibold text-orange-900 mb-2">GitLab 연동 준비 중</h3>
                            <p className="text-orange-700">
                                GitLab 리포지토리 연동 기능이 곧 추가됩니다.<br/>
                                현재는 기본 정보만 표시됩니다.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'commits' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">커밋</h3>
                            <p className="text-sm text-gray-600 mt-1">GitLab 커밋 기능 준비 중입니다.</p>
                        </div>
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">커밋 기능 준비 중</h4>
                            <p className="text-gray-600">GitLab API 연동이 완료되면 커밋 정보를 확인할 수 있습니다.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'contributors' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">기여자</h3>
                            <p className="text-sm text-gray-600 mt-1">GitLab 기여자 기능 준비 중입니다.</p>
                        </div>
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">👥</div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">기여자 기능 준비 중</h4>
                            <p className="text-gray-600">GitLab API 연동이 완료되면 기여자 정보를 확인할 수 있습니다.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 