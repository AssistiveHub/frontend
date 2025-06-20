'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { integrationApi } from '@/utils/api'

export default function SlackCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code')
                const error = searchParams.get('error')

                if (error) {
                    setStatus('error')
                    setMessage(`인증이 취소되었습니다: ${error}`)
                    return
                }

                if (!code) {
                    setStatus('error')
                    setMessage('인증 코드를 받지 못했습니다.')
                    return
                }

                // 백엔드에 콜백 처리 요청
                const result = await integrationApi.slack.handleCallback(
                    code,
                    window.location.origin + '/integrations/slack/callback'
                )

                if (result.success) {
                    setStatus('success')
                    setMessage('Slack 연동이 성공적으로 완료되었습니다!')
                    
                    // 3초 후 대시보드로 리다이렉트
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 3000)
                } else {
                    setStatus('error')
                    setMessage(result.message || '연동 처리 중 오류가 발생했습니다.')
                }

            } catch (err: unknown) {
                const error = err as Error
                setStatus('error')
                setMessage(error.message || '연동 처리 중 오류가 발생했습니다.')
            }
        }

        handleCallback()
    }, [searchParams, router])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mb-6">
                        <div className="text-6xl mb-4">💬</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Slack 연동
                        </h1>
                    </div>

                    {status === 'loading' && (
                        <div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">연동을 처리하고 있습니다...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div>
                            <div className="text-green-600 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-green-700 font-medium mb-4">{message}</p>
                            <p className="text-gray-600 text-sm">잠시 후 대시보드로 이동합니다...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div>
                            <div className="text-red-600 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-red-700 font-medium mb-6">{message}</p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    대시보드로 돌아가기
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    다시 시도
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 