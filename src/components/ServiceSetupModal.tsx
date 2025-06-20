'use client'

import { useState } from 'react'

interface ServiceSetupModalProps {
    serviceId: string
    onConnect: (serviceId: string, config: Record<string, string>) => void
    onClose: () => void
}

const serviceConfigs = {
    slack: {
        name: '슬랙',
        icon: '💬',
        fields: [
            { key: 'name', label: '계정 이름', type: 'text', placeholder: '예: 회사 슬랙, 개인 슬랙' },
            { key: 'token', label: 'Bot Token', type: 'password', placeholder: 'xoxb-your-bot-token' },
            { key: 'channel', label: '기본 채널', type: 'text', placeholder: '#general' },
        ]
    },
    notion: {
        name: '노션',
        icon: '📝',
        fields: [
            { key: 'name', label: '계정 이름', type: 'text', placeholder: '예: 업무용 노션, 개인 노션' },
            { key: 'token', label: 'Integration Token', type: 'password', placeholder: 'secret_your-token' },
            { key: 'database', label: '기본 데이터베이스 ID', type: 'text', placeholder: 'database-id' },
        ]
    },
    git: {
        name: '깃',
        icon: '🔧',
        fields: [
            { key: 'name', label: '계정 이름', type: 'text', placeholder: '예: GitHub 개인, GitLab 회사' },
            { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_your-token' },
            { key: 'repository', label: '기본 저장소', type: 'text', placeholder: 'username/repository' },
        ]
    }
}

export default function ServiceSetupModal({ serviceId, onConnect, onClose }: ServiceSetupModalProps) {
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)

    const service = serviceConfigs[serviceId as keyof typeof serviceConfigs]

    if (!service) return null

    const handleInputChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // 실제로는 여기서 API 호출로 연결 테스트
        // 임시로 2초 지연 후 성공 처리
        setTimeout(() => {
            onConnect(serviceId, formData)
            setIsLoading(false)
        }, 2000)
    }

    const isFormValid = service.fields.every(field => formData[field.key]?.trim())

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">{service.icon}</span>
                        <h2 className="text-xl font-bold text-gray-900">{service.name} 계정 추가</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {service.fields.map(field => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {field.label}
                                {field.key === 'name' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={formData[field.key] || ''}
                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            {field.key === 'name' && (
                                <p className="text-xs text-gray-500 mt-1">
                                    여러 계정을 구분하기 위한 이름입니다
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">연결 가이드</h3>
                        <div className="text-xs text-blue-700 space-y-1">
                            {serviceId === 'slack' && (
                                <>
                                    <p>• Slack API에서 Bot Token을 생성하세요</p>
                                    <p>• bot, channels:read 권한이 필요합니다</p>
                                    <p>• 여러 워크스페이스의 계정을 추가할 수 있습니다</p>
                                </>
                            )}
                            {serviceId === 'notion' && (
                                <>
                                    <p>• Notion Integration을 생성하세요</p>
                                    <p>• 데이터베이스에 접근 권한을 부여하세요</p>
                                    <p>• 개인용/업무용 노션을 각각 추가할 수 있습니다</p>
                                </>
                            )}
                            {serviceId === 'git' && (
                                <>
                                    <p>• GitHub Personal Access Token을 생성하세요</p>
                                    <p>• repo 범위 권한이 필요합니다</p>
                                    <p>• GitHub, GitLab 등 여러 플랫폼 계정을 추가할 수 있습니다</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    연결 중...
                                </>
                            ) : (
                                '계정 추가'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 