export default function GitContent() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">깃 연동</h1>
                <p className="text-gray-600">커밋 기반 작업 분석 및 성과 관리</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 커밋 기반 작업 정리 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-purple-600 mr-2">🔧</span>
                        커밋 기반 작업 정리
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">오늘의 커밋</span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">7개</span>
                            </div>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    <span>feat: 슬랙 API 연동 기능 추가</span>
                                    <span className="ml-auto text-gray-400">2시간 전</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    <span>fix: 로그인 오류 수정</span>
                                    <span className="ml-auto text-gray-400">4시간 전</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                    <span>refactor: 컴포넌트 구조 개선</span>
                                    <span className="ml-auto text-gray-400">6시간 전</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">이번 주 커밋</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">23개</span>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>기능 개발</span>
                                    <span className="font-medium">12개</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>버그 수정</span>
                                    <span className="font-medium">8개</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>리팩토링</span>
                                    <span className="font-medium">3개</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 px-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                        상세 커밋 히스토리 보기
                    </button>
                </div>

                {/* 성과 정리 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-green-600 mr-2">📈</span>
                        성과 정리
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="text-sm font-medium text-green-800 mb-2">완료된 주요 기능</h4>
                            <ul className="space-y-1 text-xs text-green-700">
                                <li>• 사용자 인증 시스템 구축</li>
                                <li>• 슬랙 연동 API 개발</li>
                                <li>• 대시보드 UI 컴포넌트 완성</li>
                                <li>• 데이터베이스 스키마 최적화</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">기술적 개선사항</h4>
                            <ul className="space-y-1 text-xs text-blue-700">
                                <li>• TypeScript 전환으로 타입 안정성 향상</li>
                                <li>• 컴포넌트 재사용성 30% 개선</li>
                                <li>• API 응답 속도 25% 향상</li>
                                <li>• 코드 커버리지 85% 달성</li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-gray-900">23</div>
                                <div className="text-xs text-gray-600">이번 주 커밋</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-bold text-gray-900">5</div>
                                <div className="text-xs text-gray-600">PR 승인</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 향상 작업 정리 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-orange-600 mr-2">🚀</span>
                        향상 작업 정리
                    </h3>

                    <div className="space-y-3">
                        <div className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">성능 최적화</h4>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center justify-between">
                                    <span>번들 크기 최적화</span>
                                    <span className="text-green-600 font-medium">-15%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>렌더링 성능 개선</span>
                                    <span className="text-green-600 font-medium">+20%</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">코드 품질</h4>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center justify-between">
                                    <span>ESLint 오류 해결</span>
                                    <span className="text-green-600 font-medium">-12개</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>중복 코드 제거</span>
                                    <span className="text-green-600 font-medium">-200줄</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">보안 강화</h4>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center justify-between">
                                    <span>취약점 패치</span>
                                    <span className="text-green-600 font-medium">3건</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>인증 로직 개선</span>
                                    <span className="text-green-600 font-medium">완료</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 px-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                        향상 계획 수립하기
                    </button>
                </div>

                {/* 작업일지 작성 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="text-indigo-600 mr-2">📝</span>
                        개발 작업일지
                    </h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            날짜: {new Date().toLocaleDateString('ko-KR')}
                        </label>
                        <textarea
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            placeholder="오늘의 개발 작업을 커밋 기반으로 정리해주세요..."
                            defaultValue={`[주요 개발 내용]
- 슬랙 API 연동 기능 구현
  * Webhook 설정 및 메시지 수신 처리
  * 태그 기반 메시지 분류 로직 개발
  
[해결한 이슈]
- 로그인 시 토큰 갱신 오류 수정
- 컴포넌트 렌더링 성능 개선

[학습한 내용]
- Next.js App Router 라우팅 최적화
- TypeScript 고급 타입 활용

[내일 할 일]
- 노션 API 연동 개발
- 단위 테스트 작성`}
                        />
                    </div>

                    <div className="space-y-2">
                        <button className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            작업일지 저장
                        </button>
                        <button className="w-full py-2 px-4 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                            이전 일지 불러오기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 