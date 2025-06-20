interface ConnectedService {
    id: string
    type: string
    name: string
}

interface OverviewContentProps {
    connectedServices: ConnectedService[]
}

export default function OverviewContent({ connectedServices }: OverviewContentProps) {
    const serviceStats = [
        {
            type: 'slack',
            title: '슬랙 메시지',
            icon: '💬',
            value: '28',
            change: '+5 new mentions',
            color: 'blue'
        },
        {
            type: 'git',
            title: '깃 커밋',
            icon: '🔧',
            value: '7',
            change: 'Today\'s commits',
            color: 'purple'
        },
        {
            type: 'notion',
            title: '노션 페이지',
            icon: '📝',
            value: '4',
            change: 'Updated today',
            color: 'orange'
        }
    ]

    // 연결된 서비스 타입별로 통계 표시
    const connectedServiceTypes = [...new Set(connectedServices.map(service => service.type))]
    const connectedStats = serviceStats.filter(stat => connectedServiceTypes.includes(stat.type))

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">종합 대시보드</h1>
                <p className="text-gray-600">연결된 서비스들의 업무 현황을 한눈에 확인하세요</p>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(4, connectedStats.length + 1)} gap-6 mb-8`}>
                {/* 완료된 작업 카드 (항상 표시) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">완료된 작업</h3>
                        <span className="text-green-600">✅</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">12</div>
                    <p className="text-sm text-green-600">+3 from yesterday</p>
                </div>

                {/* 연결된 서비스 통계 카드들 */}
                {connectedStats.map((stat) => (
                    <div key={stat.type} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                            <span className={`text-${stat.color}-600`}>{stat.icon}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <p className={`text-sm text-${stat.color}-600`}>{stat.change}</p>
                    </div>
                ))}
            </div>

            {/* 연결된 서비스 목록 */}
            {connectedServices.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">연결된 서비스</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {connectedServices.map((service) => (
                            <div key={service.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-lg mr-3">
                                    {service.type === 'slack' && '💬'}
                                    {service.type === 'notion' && '📝'}
                                    {service.type === 'git' && '🔧'}
                                </span>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                    <div className="text-xs text-gray-500 capitalize">{service.type}</div>
                                </div>
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {connectedServices.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <div className="text-center">
                        <span className="text-4xl mb-4 block">🚀</span>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">시작하기</h3>
                        <p className="text-blue-700 mb-4">좌측 사이드바 하단의 + 서비스 추가 버튼을 눌러 계정을 연결해보세요!</p>
                        <div className="flex justify-center space-x-4 text-sm text-blue-600">
                            <div className="flex items-center">
                                <span className="mr-1">💬</span>
                                <span>슬랙</span>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-1">📝</span>
                                <span>노션</span>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-1">🔧</span>
                                <span>깃</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 최근 활동 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
                    {connectedServices.length > 0 ? (
                        <div className="space-y-4">
                            {connectedServiceTypes.includes('slack') && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-sm">💬</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">슬랙에서 새로운 멘션 3개</p>
                                        <p className="text-xs text-gray-500">5분 전</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 text-sm">✅</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">작업 완료: API 개발</p>
                                    <p className="text-xs text-gray-500">1시간 전</p>
                                </div>
                            </div>
                            {connectedServiceTypes.includes('git') && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 text-sm">🔧</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">커밋: 버그 수정 완료</p>
                                        <p className="text-xs text-gray-500">2시간 전</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <span className="text-2xl block mb-2">📊</span>
                            <p>서비스를 연결하면 최근 활동이 여기에 표시됩니다</p>
                        </div>
                    )}
                </div>

                {/* 오늘의 할 일 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 할 일</h3>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                            <span className="text-sm text-gray-900">프론트엔드 컴포넌트 개발</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                            <span className="text-sm text-gray-500 line-through">API 문서 작성</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                            <span className="text-sm text-gray-900">코드 리뷰 완료</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                            <span className="text-sm text-gray-900">회의 준비</span>
                        </div>
                    </div>
                    <button className="mt-4 w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        + 새 할 일 추가
                    </button>
                </div>
            </div>
        </div>
    )
} 