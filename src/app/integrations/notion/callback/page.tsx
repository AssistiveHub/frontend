'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { integrationApi } from '@/utils/api'

function NotionCallbackContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code')
                const error = searchParams.get('error')
                const state = searchParams.get('state')

                if (error) {
                    setStatus('error')
                    setMessage(`Notion 인증이 취소되었습니다: ${error}`)
                    return
                }

                if (!code) {
                    setStatus('error')
                    setMessage('인증 코드가 없습니다.')
                    return
                }

                // 백엔드 콜백 API 호출
                const result = await integrationApi.notion.handleCallback(code, state || '')

                if (result.success) {
                    setStatus('success')
                    setMessage('Notion 연동이 성공적으로 완료되었습니다!')
                    
                    // 3초 후 대시보드로 리다이렉트
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 3000)
                } else {
                    setStatus('error')
                    setMessage(result.error || 'Notion 연동 중 오류가 발생했습니다.')
                }
            } catch (error) {
                console.error('Notion callback error:', error)
                setStatus('error')
                setMessage('Notion 연동 처리 중 오류가 발생했습니다.')
            }
        }

        handleCallback()
    }, [searchParams, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    {status === 'loading' && (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    )}
                    {status === 'success' && (
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>

                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    {status === 'loading' && 'Notion 연동 처리 중...'}
                    {status === 'success' && 'Notion 연동 완료!'}
                    {status === 'error' && 'Notion 연동 실패'}
                </h1>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                {status === 'success' && (
                    <p className="text-sm text-gray-500">
                        잠시 후 대시보드로 이동합니다...
                    </p>
                )}

                {status === 'error' && (
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        대시보드로 돌아가기
                    </button>
                )}
            </div>
        </div>
    )
}

export default function NotionCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <NotionCallbackContent />
        </Suspense>
    )
} 