'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AuthResponse } from '@/types/auth'

interface ConnectedService {
    id: string
    type: string
    name: string
    repositoryName?: string // Git 서비스용
    repositoryUrl?: string
    workspaceName?: string // Notion/Slack용
}

interface SidebarProps {
    selectedMenu: string
    onMenuSelect: (menu: string) => void
    connectedServices: ConnectedService[]
    onServiceAdd: (serviceType: string) => void
    user: Partial<AuthResponse> | null
    onLogout: () => void
    onSidebarStateChange?: (isCollapsed: boolean, width: number) => void
    isCollapsed?: boolean
    onToggleSidebar?: () => void
}

const allServices = [
    { id: 'slack', label: '슬랙', icon: '💬' },
    { id: 'notion', label: '노션', icon: '📝' },
    { id: 'github', label: '깃허브', icon: '🔧' },
    { id: 'gitlab', label: '깃랩', icon: '🦊' },
]

export default function Sidebar({ 
    selectedMenu, 
    onMenuSelect, 
    connectedServices, 
    onServiceAdd, 
    user, 
    onLogout,
    onSidebarStateChange,
    isCollapsed: externalIsCollapsed,
    onToggleSidebar
}: SidebarProps) {
    const [showAddMenu, setShowAddMenu] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(256) // 기본 폭 256px
    const [internalIsCollapsed, setInternalIsCollapsed] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    
    // 외부에서 제어되는 경우 외부 상태 사용, 아니면 내부 상태 사용
    const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed
    const router = useRouter()

    const handleServiceAdd = (serviceType: string) => {
        onServiceAdd(serviceType)
        setShowAddMenu(false)
    }

    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu)
    }

    const handleSettingsClick = () => {
        router.push('/settings')
        setShowProfileMenu(false)
    }

    // 리사이징 핸들러
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return
        
        const newWidth = e.clientX
        if (newWidth < 180) {
            if (onToggleSidebar) {
                onToggleSidebar()
            } else {
                setInternalIsCollapsed(true)
            }
            onSidebarStateChange?.(true, sidebarWidth)
        } else if (newWidth > 400) {
            setSidebarWidth(400)
            if (onToggleSidebar && isCollapsed) {
                onToggleSidebar()
            } else if (!onToggleSidebar) {
                setInternalIsCollapsed(false)
            }
            onSidebarStateChange?.(false, 400)
        } else {
            setSidebarWidth(newWidth)
            if (onToggleSidebar && isCollapsed) {
                onToggleSidebar()
            } else if (!onToggleSidebar) {
                setInternalIsCollapsed(false)
            }
            onSidebarStateChange?.(false, newWidth)
        }
    }, [isResizing, sidebarWidth, onSidebarStateChange])

    const handleMouseUp = useCallback(() => {
        setIsResizing(false)
    }, [])

    // 반응형 처리
    useEffect(() => {
        const handleResize = () => {
            const isSmall = window.innerWidth < 640 // sm 브레이크포인트
            setIsSmallScreen(isSmall)
            
            if (window.innerWidth < 768) {
                if (onToggleSidebar && !isCollapsed) {
                    onToggleSidebar()
                } else if (!onToggleSidebar) {
                    setInternalIsCollapsed(true)
                }
                onSidebarStateChange?.(true, sidebarWidth)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize() // 초기 체크

        return () => window.removeEventListener('resize', handleResize)
    }, [sidebarWidth, onSidebarStateChange, onToggleSidebar, isCollapsed])

    // 리사이징 이벤트 리스너
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'ew-resize'
            document.body.style.userSelect = 'none'
        } else {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [isResizing, handleMouseMove, handleMouseUp])

    const toggleSidebar = () => {
        const newCollapsed = !isCollapsed
        if (onToggleSidebar) {
            onToggleSidebar()
        } else {
            setInternalIsCollapsed(newCollapsed)
        }
        onSidebarStateChange?.(newCollapsed, sidebarWidth)
    }

    // 사이드바 상태 변경 시 부모에게 알림
    useEffect(() => {
        onSidebarStateChange?.(isCollapsed, sidebarWidth)
    }, [isCollapsed, sidebarWidth, onSidebarStateChange])

    // 작은 화면에서는 드롭다운 메뉴로 표시
    if (isSmallScreen && isCollapsed) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                    <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                        <div className="w-full h-0.5 bg-gray-600"></div>
                        <div className="w-full h-0.5 bg-gray-600"></div>
                        <div className="w-full h-0.5 bg-gray-600"></div>
                    </div>
                </button>

                {showMobileMenu && (
                    <div className="fixed top-16 left-4 z-40 bg-white rounded-lg shadow-xl border border-gray-200 min-w-64 max-w-80">
                        {/* 프로필 섹션 */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{user?.name || '사용자'}</div>
                                    {user?.email && (
                                        <div className="text-xs text-gray-500 truncate" title={user.email}>
                                            {user.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 메뉴 아이템들 */}
                        <div className="p-2">
                            <button
                                onClick={() => {
                                    onMenuSelect('overview')
                                    setShowMobileMenu(false)
                                }}
                                className={`w-full flex items-center py-2 px-3 rounded-lg transition-colors text-left ${selectedMenu === 'overview'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg mr-3">📊</span>
                                종합
                            </button>

                            {connectedServices.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => {
                                        onMenuSelect(service.id)
                                        setShowMobileMenu(false)
                                    }}
                                    className={`w-full flex items-center py-2 px-3 rounded-lg transition-colors text-left ${selectedMenu === service.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-lg mr-3">
                                        {allServices.find(s => s.id === service.type)?.icon || '📄'}
                                    </span>
                                    <span className="flex-1">{service.name}</span>
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                </button>
                            ))}

                            {/* 서비스 추가 버튼 */}
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-500 px-3 py-1 font-medium">서비스 추가</div>
                                {allServices.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => {
                                            handleServiceAdd(service.id)
                                            setShowMobileMenu(false)
                                        }}
                                        className="w-full flex items-center py-2 px-3 rounded-lg transition-colors text-left text-gray-700 hover:bg-gray-50"
                                    >
                                        <span className="text-lg mr-3">{service.icon}</span>
                                        <div className="flex-1">
                                            <span className="block text-sm">{service.label} 추가</span>
                                            <span className="text-xs text-gray-500">새 계정 연결</span>
                                        </div>
                                        <span className="text-gray-400">+</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 하단 액션 */}
                        <div className="p-2 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    handleSettingsClick()
                                    setShowMobileMenu(false)
                                }}
                                className="w-full flex items-center py-2 px-3 rounded-lg transition-colors text-left text-gray-700 hover:bg-gray-50"
                            >
                                <span className="text-lg mr-3">⚙️</span>
                                설정
                            </button>
                            <button
                                onClick={() => {
                                    onLogout()
                                    setShowMobileMenu(false)
                                }}
                                className="w-full flex items-center py-2 px-3 rounded-lg transition-colors text-left text-red-600 hover:bg-red-50"
                            >
                                <span className="text-lg mr-3">🚪</span>
                                로그아웃
                            </button>
                        </div>
                    </div>
                )}

                {/* 배경 클릭 시 닫기 */}
                {showMobileMenu && (
                    <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setShowMobileMenu(false)}
                    />
                )}
            </div>
        )
    }

    // 큰 화면에서 접혔을 때는 좌측에 얇은 세로 네비게이션 바로 표시
    if (!isSmallScreen && isCollapsed) {
        return (
            <div className="w-16 h-full bg-white shadow-sm border-r border-gray-200 flex flex-col items-center py-4 relative z-40">
                {/* 상단: 로고 */}
                <div 
                    className="flex items-center justify-center cursor-pointer mb-6 w-10 h-10 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md" 
                    onClick={() => {
                        if (onToggleSidebar) {
                            onToggleSidebar()
                        } else {
                            setInternalIsCollapsed(false)
                        }
                    }}
                    title="사이드바 펼치기"
                >
                    <Image
                        src="/logo_small.png"
                        alt="AssistiveHub Logo"
                        width={24}
                        height={24}
                    />
                </div>

                {/* 가운데: 스크롤 가능한 메뉴 영역 */}
                <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
                    <div className="flex flex-col items-center space-y-2">
                        {/* 종합 메뉴 */}
                        <button
                            onClick={() => onMenuSelect('overview')}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${selectedMenu === 'overview'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            title="종합"
                        >
                            <span className="text-lg">📊</span>
                        </button>

                        {/* 연결된 서비스들 */}
                        {connectedServices.map((service) => (
                            <div key={service.id} className="relative">
                                <button
                                    onClick={() => onMenuSelect(service.id)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${selectedMenu === service.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    title={service.name}
                                >
                                    <span className="text-lg">
                                        {allServices.find(s => s.id === service.type)?.icon || '📄'}
                                    </span>
                                </button>
                                {/* 연결 상태 표시 */}
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            </div>
                        ))}

                        {/* 서비스 추가 버튼 */}
                        <div className="relative">
                            <button
                                onClick={() => setShowAddMenu(!showAddMenu)}
                                className="w-10 h-10 flex items-center justify-center border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="서비스 추가"
                            >
                                <span className="text-lg">+</span>
                            </button>

                            {showAddMenu && (
                                <div className="absolute top-0 left-full ml-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-48">
                                    {allServices.map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => handleServiceAdd(service.id)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center first:rounded-t-lg last:rounded-b-lg"
                                        >
                                            <span className="text-lg mr-3">{service.icon}</span>
                                            <div className="flex-1">
                                                <span className="block text-sm font-medium">{service.label} 추가</span>
                                                <span className="text-xs text-gray-500">새 계정 연결</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단: 프로필 */}
                <div className="flex flex-col items-center space-y-2 mt-4">
                    {/* 프로필 드롭다운 */}
                    <div className="relative">
                        <button
                            onClick={handleProfileClick}
                            className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
                            title={user?.name || '사용자'}
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="absolute bottom-0 left-full ml-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-48">
                                <div className="p-3 border-b border-gray-200">
                                    <div className="text-sm font-medium text-gray-900">{user?.name || '사용자'}</div>
                                    {user?.email && (
                                        <div className="text-xs text-gray-500 truncate" title={user.email}>
                                            {user.email}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleSettingsClick}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center"
                                >
                                    <span className="text-lg mr-3">⚙️</span>
                                    <span className="text-sm">설정</span>
                                </button>
                                <button
                                    onClick={() => {
                                        onLogout()
                                        setShowProfileMenu(false)
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center text-red-600 rounded-b-lg"
                                >
                                    <span className="text-lg mr-3">🚪</span>
                                    <span className="text-sm">로그아웃</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 배경 클릭 시 드롭다운 닫기 */}
                {(showAddMenu || showProfileMenu) && (
                    <div 
                        className="fixed inset-0 z-[50]" 
                        onClick={() => {
                            setShowAddMenu(false)
                            setShowProfileMenu(false)
                        }}
                    />
                )}
            </div>
        )
    }

    return (
        <>
            <div 
                className={`bg-white shadow-lg flex flex-col transition-all duration-300 relative ${
                    isCollapsed ? 'w-0 overflow-hidden' : ''
                }`}
                style={{ 
                    width: isCollapsed ? 0 : `${sidebarWidth}px`,
                    minWidth: isCollapsed ? 0 : '200px'
                }}
            >
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                        <div 
                            className="flex items-center cursor-pointer" 
                            onClick={() => {
                                router.push('/dashboard')
                                onMenuSelect('overview')
                            }}
                        >
                        <Image
                            src="/logo_small.png"
                            alt="AssistiveHub Logo"
                            width={24}
                            height={24}
                            className="mr-2"
                        />
                            <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">AssistiveHub</h1>
                </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all duration-200 group"
                            title="사이드바 닫기"
                        >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        </button>
                    </div>
            </div>

            {/* 메뉴 아이템 */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {/* 프로필 메뉴 */}
                    <li className="relative">
                        <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center py-3 px-4 rounded-lg transition-colors text-left text-gray-700 hover:bg-gray-50"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{user?.name || '사용자'}</div>
                                {user?.email && (
                                    <div className="text-xs text-gray-500 truncate" title={user.email}>
                                        {user.email}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm text-gray-400 flex-shrink-0">⚙️</span>
                        </button>

                        {showProfileMenu && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={handleSettingsClick}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center rounded-t-lg"
                                >
                                    <span className="text-lg mr-3">⚙️</span>
                                    설정
                                </button>
                                <button
                                    onClick={() => {
                                        onLogout()
                                        setShowProfileMenu(false)
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center rounded-b-lg text-red-600"
                                >
                                    <span className="text-lg mr-3">🚪</span>
                                    로그아웃
                                </button>
                            </div>
                        )}
                    </li>

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

                    {/* 연결된 서비스들을 리포지토리/워크스페이스별로 나열 */}
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
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {service.repositoryName || service.workspaceName || service.name}
                                    </div>
                                    {(service.repositoryName || service.workspaceName) && (
                                        <div className="text-xs text-gray-500 truncate">
                                            {allServices.find(s => s.id === service.type)?.label}
                                        </div>
                                    )}
                                </div>
                                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
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

            {/* 리사이징 핸들 */}
            {!isCollapsed && (
                <div
                    className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-transparent hover:bg-blue-300 transition-colors"
                    onMouseDown={handleMouseDown}
                />
            )}
        </div>
        </>
    )
} 