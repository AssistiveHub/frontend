'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import ServiceSetupModal from '@/components/ServiceSetupModal'
import { useAuthContext } from '@/contexts/AuthContext'

interface ConnectedService {
    id: string
    type: string
    name: string
}

export default function Dashboard() {
    const { user, isLoggedIn, isLoading, logout } = useAuthContext()
    const [selectedMenu, setSelectedMenu] = useState('overview')
    const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([])
    const [showServiceSetup, setShowServiceSetup] = useState<string | null>(null)
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

    const handleServiceAdd = (serviceType: string) => {
        setShowServiceSetup(serviceType)
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

    const getServiceLabel = (serviceType: string) => {
        const labels: Record<string, string> = {
            slack: '슬랙',
            notion: '노션',
            git: '깃'
        }
        return labels[serviceType] || serviceType
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
            <div className="flex h-screen bg-gray-50">
                <Sidebar
                    selectedMenu={selectedMenu}
                    onMenuSelect={setSelectedMenu}
                    connectedServices={connectedServices}
                    onServiceAdd={handleServiceAdd}
                    user={user}
                    onLogout={handleLogout}
                />
                <MainContent
                    selectedMenu={selectedMenu}
                    connectedServices={connectedServices}
                />
            </div>

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