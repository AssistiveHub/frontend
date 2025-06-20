interface SlackContentProps {
    serviceId: string
    serviceName: string
    config: Record<string, string>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SlackContent({ serviceId, serviceName, config }: SlackContentProps) {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">슬랙 연동 - {serviceName}</h1>
                <p className="text-gray-600">슬랙 메시지 분석 및 작업 관리</p>
                {config.channel && (
                    <p className="text-sm text-gray-500">기본 채널: {config.channel}</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 태그 쓰레드 분석 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-blue-600 mr-2">🏷️</span>
                        태그 쓰레드 분석
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-red-700">@urgent</span>
                                <span className="text-xs text-red-600">3개</span>
                            </div>
                            <p className="text-xs text-red-600">긴급 처리 필요한 메시지</p>
                        </div>

                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-yellow-700">@review</span>
                                <span className="text-xs text-yellow-600">5개</span>
                            </div>
                            <p className="text-xs text-yellow-600">리뷰 요청 메시지</p>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-700">@question</span>
                                <span className="text-xs text-blue-600">2개</span>
                            </div>
                            <p className="text-xs text-blue-600">질문 관련 메시지</p>
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        전체 분석 보기
                    </button>
                </div>

                {/* 해야할 일과 체크사항 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-green-600 mr-2">✅</span>
                        체크사항 리스트
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">API 개발 완료</h4>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center">
                                    <input type="checkbox" className="w-3 h-3 mr-2" defaultChecked />
                                    <span className="line-through">기본 CRUD 구현</span>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" className="w-3 h-3 mr-2" />
                                    <span>에러 핸들링 추가</span>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" className="w-3 h-3 mr-2" />
                                    <span>테스트 코드 작성</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">코드 리뷰</h4>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center">
                                    <input type="checkbox" className="w-3 h-3 mr-2" />
                                    <span>PR #123 리뷰</span>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" className="w-3 h-3 mr-2" />
                                    <span>보안 검토</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 px-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                        + 새 체크리스트
                    </button>
                </div>

                {/* 당일 작업일지 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-purple-600 mr-2">📝</span>
                        당일 작업일지
                    </h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            오늘 날짜: {new Date().toLocaleDateString('ko-KR')}
                        </label>
                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="오늘 한 일을 자유롭게 작성해주세요..."
                            defaultValue="- 슬랙 API 연동 개발&#10;- 태그 분석 기능 구현&#10;- 팀 회의 참석 (프로젝트 진행상황 공유)&#10;- 코드 리뷰 2건 완료"
                        />
                    </div>

                    <div className="space-y-2">
                        <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            작업일지 저장
                        </button>
                        <button className="w-full py-2 px-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                            이전 일지 보기
                        </button>
                    </div>
                </div>
            </div>

            {/* 최근 슬랙 메시지 */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 멘션된 메시지</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">@김개발</span>
                            <span className="text-xs text-gray-500">#frontend-team</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                            @username API 문서 확인 부탁드립니다. 내일까지 리뷰 완료해주세요! 🙏
                        </p>
                        <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">urgent</span>
                            <span className="text-xs text-gray-500">2시간 전</span>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">@박디자이너</span>
                            <span className="text-xs text-gray-500">#design</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                            @username 새로운 컴포넌트 디자인 완료했어요. 확인해보시고 피드백 주세요!
                        </p>
                        <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">review</span>
                            <span className="text-xs text-gray-500">4시간 전</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 