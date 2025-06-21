'use client'

import OverviewContent from '@/components/content/OverviewContent'
import SlackContent from '@/components/content/SlackContent'
import NotionContent from '@/components/content/NotionContent'
import GitContent from '@/components/content/GitContent'

interface ConnectedService {
    id: string
    type: string
    name: string
    repositoryName?: string // Git 서비스용
    repositoryUrl?: string
    workspaceName?: string // Notion/Slack용
}

interface MainContentProps {
    selectedMenu: string
    connectedServices: ConnectedService[]
    hasOpenAIKey?: boolean
}

export default function MainContent({ selectedMenu, connectedServices, hasOpenAIKey }: MainContentProps) {
    const renderContent = () => {
        if (selectedMenu === 'overview') {
            return <OverviewContent connectedServices={connectedServices} hasOpenAIKey={hasOpenAIKey} />
        }

        // 선택된 메뉴가 특정 서비스 계정인지 확인
        const selectedService = connectedServices.find(service => service.id === selectedMenu)

        if (selectedService) {
            const serviceConfig = localStorage.getItem(`${selectedService.id}_config`)
            const config = serviceConfig ? JSON.parse(serviceConfig) : {}

            switch (selectedService.type) {
                case 'slack':
                    return <SlackContent serviceId={selectedService.id} serviceName={selectedService.workspaceName || selectedService.name} config={config} />
                case 'notion':
                    return <NotionContent serviceId={selectedService.id} serviceName={selectedService.workspaceName || selectedService.name} config={config} />
                case 'git':
                    return <GitContent 
                        serviceId={selectedService.id} 
                        serviceName={selectedService.repositoryName || selectedService.name} 
                        config={config}
                        repositoryUrl={selectedService.repositoryUrl}
                    />
                default:
                    return <div className="p-6"><p className="text-gray-500">알 수 없는 서비스입니다.</p></div>
            }
        }

        // 기본값
        return <OverviewContent connectedServices={connectedServices} />
    }

    return (
        <div className="flex-1 h-full overflow-auto">
            {renderContent()}
        </div>
    )
} 