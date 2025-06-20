'use client'

import { useState, useRef } from 'react'
import OpenAIKeyWarning from '@/components/OpenAIKeyWarning'

interface ConnectedService {
    id: string
    type: string
    name: string
}

interface OverviewContentProps {
    connectedServices: ConnectedService[]
    hasOpenAIKey?: boolean
}

export default function OverviewContent({ connectedServices, hasOpenAIKey }: OverviewContentProps) {
    // OpenAI key가 없으면 항상 경고 표시
    const shouldShowWarning = !hasOpenAIKey

    // 날짜 상태 관리
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showCalendar, setShowCalendar] = useState(false)
    const calendarRef = useRef<HTMLDivElement>(null)

    // 달력 외부 클릭 시 닫기 기능 비활성화
    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
    //             setShowCalendar(false)
    //         }
    //     }

    //     document.addEventListener('mousedown', handleClickOutside)
    //     return () => document.removeEventListener('mousedown', handleClickOutside)
    // }, [])

    // 주 단위 이동 함수
    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() - 7)
        setCurrentDate(newDate)
    }

    const goToNextWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentDate(newDate)
    }

    // 특정 날짜로 이동
    const goToDate = (date: Date) => {
        setCurrentDate(date)
        // 달력은 닫지 않고 계속 열어둠
    }

    // 현재 주의 시작일과 종료일 계산
    const getWeekRange = (date: Date) => {
        const start = new Date(date)
        const day = start.getDay()
        const diff = start.getDate() - day + (day === 0 ? -6 : 1) // 월요일을 주 시작으로
        start.setDate(diff)
        
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        
        return { start, end }
    }

    const { start: weekStart, end: weekEnd } = getWeekRange(currentDate)

    // 달력 생성 함수
    const generateCalendar = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const startDate = new Date(firstDay)
        const startDay = firstDay.getDay()
        
        // 월요일을 주 시작으로 조정
        startDate.setDate(startDate.getDate() - (startDay === 0 ? 6 : startDay - 1))
        
        const days = []
        const today = new Date()
        
        for (let i = 0; i < 42; i++) { // 6주 * 7일
            const currentDay = new Date(startDate)
            currentDay.setDate(startDate.getDate() + i)
            
            const isCurrentMonth = currentDay.getMonth() === month
            const isToday = currentDay.toDateString() === today.toDateString()
            const isSelected = currentDay.toDateString() === currentDate.toDateString()
            
            days.push({
                date: currentDay,
                day: currentDay.getDate(),
                isCurrentMonth,
                isToday,
                isSelected
            })
        }
        
        return days
    }

    const calendarDays = generateCalendar(currentDate)

    return (
        <div className="flex-1 overflow-auto">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">종합 대시보드</h1>
                    <p className="text-gray-600">연결된 서비스들의 업무 현황을 한눈에 확인하세요</p>
                </div>

                {/* 날짜 네비게이션 */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center justify-between">
                        {/* 좌측: 달력 버튼 */}
                        <div ref={calendarRef}>
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                                title="달력 보기"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">달력</span>
                            </button>
                        </div>

                        {/* 중앙: 주 단위 네비게이션 */}
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={goToPreviousWeek}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                title="이전 주"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                    {weekStart.getMonth() === weekEnd.getMonth() 
                                        ? `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월`
                                        : `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 - ${weekEnd.getMonth() + 1}월`
                                    }
                                </div>
                                <div className="text-sm text-gray-500">
                                    {weekStart.getDate()}일 - {weekEnd.getDate()}일
                                </div>
                            </div>
                            
                            <button
                                onClick={goToNextWeek}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                title="다음 주"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* 우측: 빈 공간 (균형을 위해) */}
                        <div className="w-20"></div>
                    </div>
                </div>

                {/* 달력 컴포넌트 */}
                {showCalendar && (
                    <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">달력</h3>
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="max-w-md mx-auto">
                            {/* 달력 헤더 */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => {
                                        const newDate = new Date(currentDate)
                                        newDate.setMonth(newDate.getMonth() - 1)
                                        setCurrentDate(newDate)
                                    }}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                
                                <h4 className="text-xl font-semibold text-gray-900">
                                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                                </h4>
                                
                                <button
                                    onClick={() => {
                                        const newDate = new Date(currentDate)
                                        newDate.setMonth(newDate.getMonth() + 1)
                                        setCurrentDate(newDate)
                                    }}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* 요일 헤더 */}
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* 달력 날짜 */}
                            <div className="grid grid-cols-7 gap-2 mb-6">
                                {calendarDays.map((day, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToDate(day.date)}
                                        className={`
                                            w-10 h-10 text-sm rounded-lg flex items-center justify-center transition-colors
                                            ${day.isCurrentMonth 
                                                ? 'text-gray-900 hover:bg-gray-100' 
                                                : 'text-gray-300 hover:bg-gray-50'
                                            }
                                            ${day.isToday 
                                                ? 'bg-indigo-100 text-indigo-700 font-semibold' 
                                                : ''
                                            }
                                            ${day.isSelected 
                                                ? 'bg-indigo-600 text-white font-semibold hover:bg-indigo-700' 
                                                : ''
                                            }
                                        `}
                                    >
                                        {day.day}
                                    </button>
                                ))}
                            </div>

                            {/* 오늘로 이동 버튼 */}
                            <div className="text-center">
                                <button
                                    onClick={() => setCurrentDate(new Date())}
                                    className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                >
                                    오늘로 이동
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* OpenAI Key 경고 */}
                {shouldShowWarning && (
                    <div className="mb-6">
                        <OpenAIKeyWarning />
                    </div>
                )}

                {/* 오늘 섹션 */}
                <div className="mb-8">
                    <div className="flex items-center mb-6">
                        <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                        <h2 className="text-xl font-bold text-gray-900">오늘</h2>
                        <span className="ml-2 text-sm text-gray-500">
                            {currentDate.toLocaleDateString('ko-KR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'long'
                            })}
                        </span>
                    </div>

                    {/* 오늘의 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">완료된 작업</h3>
                                <span className="text-green-600">✅</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">3</div>
                            <p className="text-xs text-green-600">목표: 5개</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">진행 중</h3>
                                <span className="text-blue-600">🔄</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">2</div>
                            <p className="text-xs text-blue-600">작업 중</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">새 알림</h3>
                                <span className="text-orange-600">🔔</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">7</div>
                            <p className="text-xs text-orange-600">확인 필요</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">집중 시간</h3>
                                <span className="text-purple-600">⏰</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">4.5h</div>
                            <p className="text-xs text-purple-600">목표: 6h</p>
                        </div>
                    </div>

                    {/* 오늘의 상세 내용 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 오늘의 할 일 */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 할 일</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                                    <span className="text-sm text-gray-500 line-through">API 문서 작성</span>
                                    <span className="text-xs text-gray-400 ml-auto">완료</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm text-gray-900">프론트엔드 컴포넌트 개발</span>
                                    <span className="text-xs text-blue-600 ml-auto">진행중</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm text-gray-900">코드 리뷰 완료</span>
                                    <span className="text-xs text-gray-400 ml-auto">대기</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm text-gray-900">회의 준비</span>
                                    <span className="text-xs text-red-500 ml-auto">긴급</span>
                                </div>
                            </div>
                            <button className="mt-4 w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                + 새 할 일 추가
                            </button>
                        </div>

                        {/* 오늘의 활동 */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 활동</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 text-sm">✅</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">작업 완료: API 개발</p>
                                        <p className="text-xs text-gray-500">1시간 전</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-sm">👥</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">팀 회의 참석</p>
                                        <p className="text-xs text-gray-500">2시간 전</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 text-sm">📄</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">문서 작성: 프로젝트 계획서</p>
                                        <p className="text-xs text-gray-500">3시간 전</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span className="text-orange-600 text-sm">🔔</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">새로운 알림 7개 확인</p>
                                        <p className="text-xs text-gray-500">4시간 전</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 이번주 섹션 */}
                <div className="mb-8">
                    <div className="flex items-center mb-6">
                        <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
                        <h2 className="text-xl font-bold text-gray-900">이번주</h2>
                        <span className="ml-2 text-sm text-gray-500">
                            {weekStart.getMonth() + 1}월 {weekStart.getDate()}일 - {weekEnd.getMonth() + 1}월 {weekEnd.getDate()}일
                        </span>
                    </div>

                    {/* 이번주 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">주간 완료</h3>
                                <span className="text-green-600">📈</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">18</div>
                            <p className="text-xs text-green-600">+25% 증가</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">회의 참석</h3>
                                <span className="text-blue-600">👥</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">8</div>
                            <p className="text-xs text-blue-600">평균 1.1회/일</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">문서 작성</h3>
                                <span className="text-purple-600">📄</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">15</div>
                            <p className="text-xs text-purple-600">총 24페이지</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-500">주간 집중시간</h3>
                                <span className="text-orange-600">⏱️</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">32.5h</div>
                            <p className="text-xs text-orange-600">목표: 35h</p>
                        </div>
                    </div>

                    {/* 이번주 상세 내용 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 주간 진행 상황 */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">주간 진행 상황</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">완료율</span>
                                        <span className="text-sm text-gray-500">72%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{width: '72%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">목표 달성</span>
                                        <span className="text-sm text-gray-500">18/25</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">집중 시간</span>
                                        <span className="text-sm text-gray-500">28.5h</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '95%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 업무 인사이트 */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">업무 인사이트</h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">💡</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">생산성 향상 팁</p>
                                        <p className="text-xs text-blue-700 mt-1">오후 2-4시가 가장 집중도가 높은 시간대입니다. 중요한 작업을 이 시간에 배치해보세요.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">📈</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-900">주간 성과</p>
                                        <p className="text-xs text-green-700 mt-1">이번 주 완료율이 지난 주 대비 25% 향상되었습니다. 잘하고 있어요!</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">🎯</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-purple-900">목표 달성</p>
                                        <p className="text-xs text-purple-700 mt-1">주간 목표의 72%를 달성했습니다. 남은 3일 동안 7개 작업을 더 완료하면 목표 달성!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 연결된 서비스 섹션 */}
                {connectedServices.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
                            <h2 className="text-xl font-bold text-gray-900">연결된 서비스</h2>
                            <span className="ml-2 text-sm text-gray-500">
                                {connectedServices.length}개 서비스 연결됨
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 서비스 목록 */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">활성 서비스</h3>
                                <div className="space-y-3">
                                    {connectedServices.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">
                                                    {service.type === 'slack' && '💬'}
                                                    {service.type === 'notion' && '📝'}
                                                    {service.type === 'git' && '🔧'}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{service.type}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                                                <div className="text-xs text-gray-500 mt-1">활성</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 서비스 통계 */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스별 활동</h3>
                                <div className="space-y-4">
                                    <div className="text-center text-gray-500 py-8">
                                        <span className="text-3xl block mb-2">📊</span>
                                        <p className="text-sm">각 서비스의 상세 통계는</p>
                                        <p className="text-sm">좌측 메뉴에서 개별적으로 확인하세요</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 