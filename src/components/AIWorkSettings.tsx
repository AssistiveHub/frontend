'use client'

import { useState, useEffect } from 'react'
import { UserSettingResponse, UserSettingRequest } from '@/types/auth'

interface AIWorkSettingsProps {
  onSettingsChange?: (settings: UserSettingResponse) => void
}

export default function AIWorkSettings({ onSettingsChange }: AIWorkSettingsProps) {
  const [settings, setSettings] = useState<UserSettingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const settingItems = [
    {
      key: 'weeklyWorkLogEnabled',
      title: '주간 업무일지 작성',
      description: 'AI가 주간 업무 내용을 정리하고 일지를 자동으로 작성합니다.',
      icon: '📊'
    },
    {
      key: 'dailyWorkLogEnabled', 
      title: '일일 업무일지',
      description: '매일의 업무 활동을 기록하고 AI가 요약해서 정리합니다.',
      icon: '📝'
    },
    {
      key: 'feedbackReviewEnabled',
      title: '업무 피드백 및 리뷰 관리',
      description: 'AI가 업무 성과를 분석하고 개선점을 제안합니다.',
      icon: '💬'
    },
    {
      key: 'skillGrowthTrackingEnabled',
      title: '스킬 성장 측정',
      description: '기술 스택과 역량 발전을 추적하고 성장 방향을 제시합니다.',
      icon: '📈'
    },
    {
      key: 'notificationManagementEnabled',
      title: '알람 정돈',
      description: '중요한 알림을 우선순위에 따라 정리하고 관리합니다.',
      icon: '🔔'
    }
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSettings(result.data)
        }
      }
    } catch (error) {
      console.error('설정 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (settingKey: string) => {
    if (!settings || updating) return

    setUpdating(settingKey)

    try {
      const token = localStorage.getItem('authToken')
      const currentValue = settings[settingKey as keyof UserSettingResponse] as boolean
      
      const updateRequest: UserSettingRequest = {
        [settingKey]: !currentValue
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateRequest)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSettings(result.data)
          onSettingsChange?.(result.data)
        }
      } else {
        const error = await response.json()
        alert(error.message || '설정 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('설정 업데이트 실패:', error)
      alert('설정 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdating(null)
    }
  }

  const handleResetSettings = async () => {
    if (!confirm('모든 AI 작업 설정을 기본값으로 초기화하시겠습니까?')) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSettings(result.data)
          onSettingsChange?.(result.data)
        }
      } else {
        const error = await response.json()
        alert(error.message || '설정 초기화에 실패했습니다.')
      }
    } catch (error) {
      console.error('설정 초기화 실패:', error)
      alert('설정 초기화 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-8 text-gray-500">
        설정을 불러올 수 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI 작업 설정</h3>
          <p className="text-sm text-gray-600 mt-1">
            AI가 수행할 작업들을 개별적으로 설정할 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleResetSettings}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          기본값으로 초기화
        </button>
      </div>

      {/* 설정 목록 */}
      <div className="space-y-4">
        {settingItems.map((item) => {
          const isEnabled = settings[item.key as keyof UserSettingResponse] as boolean
          const isUpdating = updating === item.key

          return (
            <div
              key={item.key}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* 토글 스위치 */}
                <div className="flex items-center ml-4">
                  <button
                    onClick={() => handleToggle(item.key)}
                    disabled={isUpdating}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={isEnabled}
                  >
                    {isUpdating ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    )}
                  </button>
                  <span className="ml-3 text-sm text-gray-600">
                    {isEnabled ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-indigo-900 mb-1">설정 안내</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• 비활성화된 기능은 AI가 자동으로 수행하지 않습니다</li>
              <li>• 언제든지 개별 설정을 변경할 수 있습니다</li>
              <li>• 설정 변경은 즉시 적용됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 