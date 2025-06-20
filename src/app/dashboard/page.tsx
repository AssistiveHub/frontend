'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import ServiceSetupModal from '@/components/ServiceSetupModal'
import { useAuthContext } from '@/contexts/AuthContext'
import Image from 'next/image'

interface ConnectedService {
    id: string
    type: string
    name: string
}

const allServices = [
    { id: 'slack', label: '슬랙', icon: '💬' },
    { id: 'notion', label: '노션', icon: '📝' },
    { id: 'git', label: '깃', icon: '🔧' },
]

export default function Dashboard() {
    const { user, isLoggedIn, isLoading, logout } = useAuthContext()
    const [selectedMenu, setSelectedMenu] = useState('overview')
    const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([])
    const [showServiceSetup, setShowServiceSetup] = useState<string | null>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [showMobileDropdown, setShowMobileDropdown] = useState(false)

    const router = useRouter()

    useEffect(() => {
        // 로딩이 완료되고 로그인되지 않은 경우 홈으로 리다이렉트
        if (!isLoading && !isLoggedIn) {
            router.push('/')
            return
        }

        // 로그인된 경우 연결된 서비스 정보 로드
        if (isLoggedIn) {
            const savedServices = localStorage.getItem('connectedServices')
            if (savedServices) {
                try {
                    setConnectedServices(JSON.parse(savedServices))
                } catch (error) {
                    console.error('Failed to parse connected services:', error)
                    localStorage.removeItem('connectedServices')
                }
            }
        }
    }, [isLoading, isLoggedIn, router])



    // 화면 크기 감지
    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640)
        }

        window.addEventListener('resize', handleResize)
        handleResize() // 초기 체크

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleServiceAdd = (serviceType: string) => {
        setShowServiceSetup(serviceType)
        setShowMobileDropdown(false)
    }

    const handleServiceConnect = (serviceType: string, config: Record<string, string>) => {
        // 고유한 ID 생성 (서비스타입-타임스탬프)
        const serviceId = `${serviceType}-${Date.now()}`
        const serviceName = config.name || `${getServiceLabel(serviceType)} ${connectedServices.filter(s => s.type === serviceType).length + 1}`

        const newService: ConnectedService = {
            id: serviceId,
            type: serviceType,
            name: serviceName
        }

        const newConnectedServices = [...connectedServices, newService]
        setConnectedServices(newConnectedServices)

        // localStorage에 저장
        localStorage.setItem('connectedServices', JSON.stringify(newConnectedServices))
        localStorage.setItem(`${serviceId}_config`, JSON.stringify(config))

        setShowServiceSetup(null)
        setSelectedMenu(serviceId) // 새로 추가된 서비스로 자동 이동
    }

    const handleServiceSetupClose = () => {
        setShowServiceSetup(null)
    }

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    const handleSidebarStateChange = (isCollapsed: boolean) => {
        setSidebarCollapsed(isCollapsed)
    }

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }

    const getServiceLabel = (serviceType: string) => {
        const labels: Record<string, string> = {
            slack: '슬랙',
            notion: '노션',
            git: '깃'
        }
        return labels[serviceType] || serviceType
    }

    const handleSettingsClick = () => {
        router.push('/settings')
        setShowMobileDropdown(false)
    }



    // 로딩 중이거나 로그인되지 않은 경우
    if (isLoading || !isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col h-screen bg-gray-50">
                {/* 모바일 상단 네비게이션 바 */}
                {isSmallScreen && (
                    <div className="bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 py-3 relative z-50">
                        {/* 로고 */}
                        <div 
                            className="flex items-center cursor-pointer" 
                            onClick={() => {
                                router.push('/dashboard')
                                setSelectedMenu('overview')
                            }}
                        >
                            <Image
                                src="/logo_small.png"
                                alt="AssistiveHub Logo"
                                width={24}
                                height={24}
                                className="mr-2"
                            />
                            <h1 className="text-lg font-bold text-gray-800">AssistiveHub</h1>
                        </div>

                        {/* 드롭다운 메뉴 */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMobileDropdown(!showMobileDropdown)}
                                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                                    <div className="w-full h-0.5 bg-gray-600"></div>
                                    <div className="w-full h-0.5 bg-gray-600"></div>
                                    <div className="w-full h-0.5 bg-gray-600"></div>
                                </div>
                            </button>

                            {showMobileDropdown && (
                                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-64 max-w-80 z-40">
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
                                                setSelectedMenu('overview')
                                                setShowMobileDropdown(false)
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
                                                    setSelectedMenu(service.id)
                                                    setShowMobileDropdown(false)
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
                                                    onClick={() => handleServiceAdd(service.id)}
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
                                            onClick={handleSettingsClick}
                                            className="w-full flex items-center py-2 px-3 rounded-lg transition-colors text-left text-gray-700 hover:bg-gray-50"
                                        >
                                            <span className="text-lg mr-3">⚙️</span>
                                            설정
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setShowMobileDropdown(false)
                                            }}
                                            className="w-full flex items-center py-2 px-3 rounded-lg transition-colors text-left text-red-600 hover:bg-red-50"
                                        >
                                            <span className="text-lg mr-3">🚪</span>
                                            로그아웃
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 메인 컨텐츠 영역 */}
                <div className="flex flex-1 overflow-hidden">
                    {/* 데스크톱에서만 사이드바 표시 */}
                    {!isSmallScreen && (
                        <Sidebar
                            selectedMenu={selectedMenu}
                            onMenuSelect={setSelectedMenu}
                            connectedServices={connectedServices}
                            onServiceAdd={handleServiceAdd}
                            user={user}
                            onLogout={handleLogout}
                            onSidebarStateChange={handleSidebarStateChange}
                            isCollapsed={sidebarCollapsed}
                            onToggleSidebar={handleToggleSidebar}
                        />
                    )}

                    <div className={`flex-1 transition-all duration-300 ${
                        !isSmallScreen && !sidebarCollapsed ? `pl-0` : 'pl-0'
                    }`}>
                        <MainContent
                            selectedMenu={selectedMenu}
                            connectedServices={connectedServices}
                            hasOpenAIKey={user?.hasOpenAIKey}
                        />
                    </div>
                </div>
            </div>



            {/* 모바일 드롭다운 배경 클릭 시 닫기 */}
            {isSmallScreen && showMobileDropdown && (
                <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowMobileDropdown(false)}
                />
            )}

            {showServiceSetup && (
                <ServiceSetupModal
                    serviceId={showServiceSetup}
                    onConnect={handleServiceConnect}
                    onClose={handleServiceSetupClose}
                />
            )}
        </>
    )
} 