'use client'

import { useRouter } from 'next/navigation'

export default function OpenAIKeyWarning() {
    const router = useRouter()

    const handleGoToSettings = () => {
        router.push('/settings')
    }

    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start">
                <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl">🔑</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-amber-900 mb-2">
                            OpenAI API 키 설정이 필요합니다
                        </h3>
                        <p className="text-amber-800 text-sm mb-4 leading-relaxed">
                            AssistiveHub의 모든 AI 기능을 사용하려면 OpenAI API 키가 필요합니다. 
                            키는 안전하게 암호화되어 저장되며, 안전하게 서비스를 이용할 수 있습니다.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleGoToSettings}
                                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm shadow-sm"
                            >
                                🚀 지금 설정하기
                            </button>
                        </div>
                        <div className="mt-3 text-xs text-amber-700">
                            💡 <a 
                                href="https://platform.openai.com/api-keys" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="underline hover:text-amber-800"
                            >
                                OpenAI에서 API 키 발급받기
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 특징 리스트 */}
            <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-800">
                    <div className="flex items-center space-x-2">
                        <span className="text-amber-600">🔒</span>
                        <span>AES-256 암호화</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-amber-600">⚡</span>
                        <span>무제한 사용량</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-amber-600">🛡️</span>
                        <span>완전 개인용</span>
                    </div>
                </div>
            </div>
        </div>
    )
} 