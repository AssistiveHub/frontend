'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import ServiceSetupModal from '@/components/ServiceSetupModal'

interface ConnectedService {
    id: string
    type: string
    name: string
}

export default function Dashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [selectedMenu, setSelectedMenu] = useState('overview')
    const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([])
    const [showServiceSetup, setShowServiceSetup] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        if (!loggedIn) {
            router.push('/')
        } else {
            setIsLoggedIn(true)
            // 연결된 서비스 정보를 localStorage에서 불러오기
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
    }, [router])

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

    const getServiceLabel = (serviceType: string) => {
        const labels: Record<string, string> = {
            slack: '슬랙',
            notion: '노션',
            git: '깃'
        }
        return labels[serviceType] || serviceType
    }

    if (!isLoggedIn) {
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