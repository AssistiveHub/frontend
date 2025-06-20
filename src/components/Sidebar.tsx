'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ConnectedService {
    id: string
    type: string
    name: string
}

interface SidebarProps {
    selectedMenu: string
    onMenuSelect: (menu: string) => void
    connectedServices: ConnectedService[]
    onServiceAdd: (serviceType: string) => void
}

const allServices = [
    { id: 'slack', label: '슬랙', icon: '💬' },
    { id: 'notion', label: '노션', icon: '📝' },
    { id: 'git', label: '깃', icon: '🔧' },
]

export default function Sidebar({ selectedMenu, onMenuSelect, connectedServices, onServiceAdd }: SidebarProps) {
    const [showAddMenu, setShowAddMenu] = useState(false)
    const [showDebugMenu, setShowDebugMenu] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('connectedServices')
        // 모든 서비스 설정도 제거
        Object.keys(localStorage).forEach(key => {
            if (key.includes('_config')) {
                localStorage.removeItem(key)
            }
        })
        window.location.href = '/'
    }

    const handleServiceAdd = (serviceType: string) => {
        onServiceAdd(serviceType)
        setShowAddMenu(false)
    }

    const handleClearAllData = () => {
        localStorage.removeItem('connectedServices')
        Object.keys(localStorage).forEach(key => {
            if (key.includes('_config')) {
                localStorage.removeItem(key)
            }
        })
        window.location.reload()
    }

    return (
        <div className="w-64 bg-white shadow-lg flex flex-col">
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Image
                            src="/logo_small.png"
                            alt="AssistiveHub Logo"
                            width={24}
                            height={24}
                            className="mr-2"
                        />
                        <h1 className="text-xl font-bold text-gray-800">AssistiveHub</h1>
                    </div>
                    <button
                        onClick={() => setShowDebugMenu(!showDebugMenu)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                    >
                        ⚙️
                    </button>
                </div>
                {showDebugMenu && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="mb-1">연결된 서비스: {connectedServices.length}개</div>
                        <button
                            onClick={handleClearAllData}
                            className="text-red-600 hover:text-red-700"
                        >
                            모든 데이터 초기화
                        </button>
                    </div>
                )}
            </div>

            {/* 메뉴 아이템 */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {/* 종합 메뉴 (항상 표시) */}
                    <li>
                        <button
                            onClick={() => onMenuSelect('overview')}
                            className={`w-full flex items-center py-3 px-4 rounded-lg transition-colors text-left ${selectedMenu === 'overview'
                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-lg mr-3">📊</span>
                            종합
                        </button>
                    </li>

                    {/* 연결된 서비스들을 순서대로 나열 */}
                    {connectedServices.map((service) => (
                        <li key={service.id}>
                            <button
                                onClick={() => onMenuSelect(service.id)}
                                className={`w-full flex items-center py-3 px-4 rounded-lg transition-colors text-left ${selectedMenu === service.id
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg mr-3">
                                    {allServices.find(s => s.id === service.type)?.icon || '📄'}
                                </span>
                                <span className="flex-1">{service.name}</span>
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            </button>
                        </li>
                    ))}

                    {/* + 서비스 추가 버튼 (연결된 서비스들 바로 아래) */}
                    <li className="relative">
                        <button
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className="w-full flex items-center justify-center py-3 px-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            <span className="text-lg mr-2">+</span>
                            서비스 추가
                        </button>

                        {showAddMenu && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {allServices.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => handleServiceAdd(service.id)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        <span className="text-lg mr-3">{service.icon}</span>
                                        <div className="flex-1">
                                            <span className="block">{service.label} 추가</span>
                                            <span className="text-xs text-gray-500">새 계정 연결</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </li>

                    {/* 연결된 서비스가 없을 때 안내 (종합 메뉴 아래, + 버튼 위) */}
                    {connectedServices.length === 0 && (
                        <li className="px-4 py-8 text-center">
                            <div className="text-gray-400">
                                <span className="text-2xl block mb-2">🚀</span>
                                <p className="text-sm">아래 버튼으로<br />서비스를 추가해보세요</p>
                            </div>
                        </li>
                    )}
                </ul>
            </nav>

            {/* 하단 사용자 정보 */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            U
                        </div>
                        <span className="ml-2 text-sm text-gray-700">사용자</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    )
} 