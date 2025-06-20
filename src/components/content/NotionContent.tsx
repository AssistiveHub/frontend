interface NotionContentProps {
    serviceId: string
    serviceName: string
    config: Record<string, string>
}

export default function NotionContent({ serviceName, config }: NotionContentProps) {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">노션 연동 - {serviceName}</h1>
                <p className="text-gray-600">노션 페이지 관리 및 문서 작업</p>
                {config.database && (
                    <p className="text-sm text-gray-500">기본 데이터베이스: {config.database}</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 최근 업데이트된 페이지 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-orange-600 mr-2">📝</span>
                        최근 업데이트된 페이지
                    </h3>

                    <div className="space-y-3">
                        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">프로젝트 기획서</span>
                                <span className="text-xs text-gray-500">2시간 전</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">AssistiveHub 프로젝트의 전체 기획 및 요구사항 정의</p>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">기획</span>
                                <span className="text-xs text-gray-500">마지막 편집: 김기획</span>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">API 문서</span>
                                <span className="text-xs text-gray-500">1일 전</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">백엔드 API 엔드포인트 및 사용법 가이드</p>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">개발</span>
                                <span className="text-xs text-gray-500">마지막 편집: 박개발</span>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">회의록 - 2024.01.15</span>
                                <span className="text-xs text-gray-500">3일 전</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">주간 스프린트 리뷰 및 다음 주 계획</p>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">회의</span>
                                <span className="text-xs text-gray-500">마지막 편집: 이팀장</span>
                            </div>
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 px-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                        모든 페이지 보기
                    </button>
                </div>

                {/* 작업 진행 상황 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-blue-600 mr-2">📊</span>
                        작업 진행 상황
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-800">진행 중인 프로젝트</span>
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">3개</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-blue-700">AssistiveHub 개발</span>
                                    <span className="text-blue-600 font-medium">75%</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-800">완료된 문서</span>
                                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">12개</span>
                            </div>
                            <div className="space-y-1 text-xs text-green-700">
                                <div className="flex justify-between">
                                    <span>기술 스펙 문서</span>
                                    <span className="font-medium">✓</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>사용자 가이드</span>
                                    <span className="font-medium">✓</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>테스트 계획서</span>
                                    <span className="font-medium">✓</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-yellow-800">검토 대기</span>
                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">2개</span>
                            </div>
                            <div className="space-y-1 text-xs text-yellow-700">
                                <div className="flex justify-between">
                                    <span>배포 가이드</span>
                                    <span className="font-medium">대기</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>보안 정책 문서</span>
                                    <span className="font-medium">대기</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 문서 템플릿 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-indigo-600 mr-2">📄</span>
                        문서 템플릿
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                            <div className="text-2xl mb-2">📋</div>
                            <div className="text-sm font-medium text-gray-900">회의록</div>
                            <div className="text-xs text-gray-500">새 회의록 작성</div>
                        </button>

                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="text-sm font-medium text-gray-900">프로젝트 계획</div>
                            <div className="text-xs text-gray-500">프로젝트 기획서</div>
                        </button>

                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                            <div className="text-2xl mb-2">🔧</div>
                            <div className="text-sm font-medium text-gray-900">기술 스펙</div>
                            <div className="text-xs text-gray-500">기술 문서 작성</div>
                        </button>

                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                            <div className="text-2xl mb-2">📝</div>
                            <div className="text-sm font-medium text-gray-900">일반 문서</div>
                            <div className="text-xs text-gray-500">빈 문서 생성</div>
                        </button>
                    </div>
                </div>

                {/* 최근 활동 및 통계 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-green-600 mr-2">📈</span>
                        활동 통계
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-orange-600 text-sm">📝</span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">이번 주 작성</div>
                                    <div className="text-xs text-gray-500">문서 및 페이지</div>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">8</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-blue-600 text-sm">👁️</span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">페이지 조회</div>
                                    <div className="text-xs text-gray-500">이번 주 총 조회수</div>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">156</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-green-600 text-sm">✅</span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">완료된 작업</div>
                                    <div className="text-xs text-gray-500">체크리스트 항목</div>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900">24</div>
                        </div>

                        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <div className="text-sm font-medium text-indigo-800 mb-1">생산성 지수</div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-indigo-600">이번 주 평균</div>
                                <div className="text-lg font-bold text-indigo-700">92%</div>
                            </div>
                            <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 