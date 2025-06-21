'use client'

import { useState, useEffect, useCallback } from 'react'

interface GitContentProps {
    serviceId: string;
    serviceName: string;
    config: Record<string, string>;
    repositoryUrl?: string;
}

interface RepositoryInfo {
    name: string;
    fullName: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    openIssues: number;
    lastUpdated: string;
}

interface CommitInfo {
    hash: string;
    message: string;
    author: string;
    date: string;
}

export default function GitContent({ serviceName, repositoryUrl }: GitContentProps) {
    const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo | null>(null)
    const [commits, setCommits] = useState<CommitInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadRepositoryData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Mock data for demonstration
            setRepositoryInfo({
                name: serviceName,
                fullName: `owner/${serviceName}`,
                description: '리포지토리 설명이 여기에 표시됩니다.',
                language: 'TypeScript',
                stars: 24,
                forks: 8,
                openIssues: 3,
                lastUpdated: new Date().toISOString()
            })

            setCommits([
                {
                    hash: 'a1b2c3d',
                    message: 'feat: 새로운 기능 추가',
                    author: 'developer',
                    date: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    hash: 'e4f5g6h',
                    message: 'fix: 버그 수정',
                    author: 'developer',
                    date: new Date(Date.now() - 172800000).toISOString()
                }
            ])

        } catch (err: unknown) {
            const error = err as Error
            setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }, [serviceName])

    useEffect(() => {
        loadRepositoryData()
    }, [loadRepositoryData])

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
                        {repositoryInfo?.fullName || serviceName}
                    </h1>
                    <p className="text-gray-600">{repositoryInfo?.description || '리포지토리 정보를 확인하세요'}</p>
                    {repositoryUrl && (
                        <a 
                            href={repositoryUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                            <span className="mr-1">🔗</span>
                            리포지토리 보기
                        </a>
                    )}
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

                {/* 리포지토리 통계 */}
                {repositoryInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">언어</h3>
                                <span className="text-blue-600">💻</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{repositoryInfo.language}</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">스타</h3>
                                <span className="text-yellow-600">⭐</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{repositoryInfo.stars}</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">포크</h3>
                                <span className="text-green-600">🍴</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{repositoryInfo.forks}</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">이슈</h3>
                                <span className="text-red-600">🐛</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{repositoryInfo.openIssues}</div>
                        </div>
                    </div>
                )}

                {/* 최근 커밋 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">최근 커밋</h3>
                        <p className="text-sm text-gray-600 mt-1">최신 개발 활동을 확인하세요</p>
                    </div>

                    {commits.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">커밋이 없습니다</h4>
                            <p className="text-gray-600">아직 커밋 데이터가 없습니다</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {commits.map((commit) => (
                                <div key={commit.hash} className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-mono text-gray-600">{commit.hash.substring(0, 3)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{commit.message}</p>
                                            <div className="mt-1 flex items-center text-xs text-gray-500">
                                                <span>{commit.author}</span>
                                                <span className="mx-2">•</span>
                                                <span>{new Date(commit.date).toLocaleDateString('ko-KR')}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            {commit.hash}
                                        </span>
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