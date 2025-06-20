'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Home() {
  const { isLoggedIn, isLoading } = useAuthContext()
  const router = useRouter()

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const handleLogin = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const handleDemo = () => {
    router.push('/demo')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
          <Image
            src="/logo_small.png"
            alt="AssistiveHub Logo"
            width={32}
            height={32}
            className="mr-3"
          />
          <span className="text-2xl font-bold text-gray-900">AssistiveHub</span>
        </div>
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
        >
          {isLoggedIn ? '대시보드' : '로그인'}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            개발자의 성장을
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              체계적으로 기록하세요
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            업무 일지 작성부터 성과 정리, 피드백 수집까지. 개발자의 커리어 성장을 위한
            <br />
            올인원 플랫폼으로 체계적인 자기 관리와 실력 향상을 경험해보세요.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-lg shadow-lg"
            >
              {isLoggedIn ? '대시보드로 이동' : '성장 기록 시작하기'}
            </button>
            <button 
              onClick={handleDemo}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
            >
              데모 보기
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              개발자 성장의 핵심 기능
            </h2>
            <p className="text-xl text-gray-600">
              체계적인 기록과 분석으로 꾸준한 성장을 만드는 필수 도구들
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                업무 일지 & 성과 정리
              </h3>
              <p className="text-gray-600 leading-relaxed">
                매일의 개발 작업, 해결한 문제, 학습한 내용을 체계적으로 기록하세요. 
                Github, Slack, Notion과 연동하여 자동으로 성과를 수집하고 정리합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                피드백 & 리뷰 관리
              </h3>
              <p className="text-gray-600 leading-relaxed">
                코드 리뷰, 동료 피드백, 1:1 미팅 내용을 한곳에 모아 관리하세요. 
                받은 피드백을 분석하고 개선 계획을 세워 지속적인 성장을 도모합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                스킬 성장 추적
              </h3>
              <p className="text-gray-600 leading-relaxed">
                기술 스택별 성장 과정을 시각화하고 분석합니다. 
                학습 목표 설정부터 달성도 측정까지, 데이터 기반으로 실력 향상을 확인하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              개발자 커리어 단계별 활용법
            </h2>
            <p className="text-xl text-gray-600">
              주니어부터 시니어까지, 각 단계에 맞는 성장 전략을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Junior Developer */}
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🌱</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">주니어 개발자</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  매일의 학습과 성장을 체계적으로 기록하세요. 멘토의 피드백을 정리하고 
                  기술 스택별 학습 진도를 추적하여 탄탄한 기초를 쌓아나가세요.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• 일일 학습 내용 및 TIL 기록</li>
                  <li>• 멘토링 피드백 정리 및 액션플랜</li>
                  <li>• 기술 스택별 학습 진도 관리</li>
                </ul>
              </div>
            </div>

            {/* Mid-level Developer */}
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🚀</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">미드레벨 개발자</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  프로젝트 기여도와 문제 해결 능력을 객관적으로 정리하세요. 
                  코드 리뷰 히스토리와 기술적 의사결정 과정을 문서화하여 전문성을 증명합니다.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• 프로젝트별 기여도 및 성과 정리</li>
                  <li>• 기술적 의사결정 과정 문서화</li>
                  <li>• 코드 리뷰 품질 향상 추적</li>
                </ul>
              </div>
            </div>

            {/* Senior Developer */}
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">👑</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">시니어 개발자</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  팀 리딩과 아키텍처 설계 경험을 체계화하세요. 
                  주니어 개발자 멘토링 히스토리와 기술 전파 활동을 기록하여 리더십을 어필합니다.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• 아키텍처 설계 및 기술 선택 이유</li>
                  <li>• 주니어 멘토링 및 성장 지원 기록</li>
                  <li>• 기술 전파 및 지식 공유 활동</li>
                </ul>
              </div>
            </div>

            {/* Tech Lead */}
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">테크리드</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  기술 전략과 팀 성과를 종합적으로 관리하세요. 
                  조직의 기술 부채 해결, 개발 프로세스 개선 등 리더십 활동을 체계적으로 정리합니다.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• 기술 전략 수립 및 실행 과정</li>
                  <li>• 팀 생산성 향상 이니셔티브</li>
                  <li>• 조직 차원의 기술적 의사결정</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              왜 체계적인 기록이 중요할까요?
            </h2>
            <p className="text-xl text-gray-600">
              성공하는 개발자들의 공통점은 바로 체계적인 자기 관리입니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">이직/승진 준비</h3>
              <p className="text-gray-600">
                체계적으로 정리된 성과 기록은 이력서와 면접에서 강력한 무기가 됩니다. 
                구체적인 수치와 사례로 본인의 역량을 증명하세요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">성과 평가 대비</h3>
              <p className="text-gray-600">
                연말 성과 평가 시즌에 당황하지 마세요. 
                1년간의 모든 성과와 성장 과정이 체계적으로 정리되어 있어 자신감 있게 어필할 수 있습니다.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">목표 달성</h3>
              <p className="text-gray-600">
                명확한 목표 설정과 진도 추적으로 더 빠른 성장을 경험하세요. 
                데이터 기반의 피드백으로 효율적인 학습 전략을 세울 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            오늘부터 성장을 기록해보세요
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            체계적인 기록과 분석으로 더 나은 개발자가 되는 여정을 시작하세요
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-lg shadow-lg"
            >
              {isLoggedIn ? '대시보드로 이동' : '무료로 시작하기'}
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            신용카드 불필요 • 개별 OPENAI API KEY 사용 • 요금청구 없음
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/logo_small.png"
                alt="AssistiveHub Logo"
                width={24}
                height={24}
                className="mr-3"
              />
              <span className="text-white font-semibold">AssistiveHub</span>
            </div>
            <div className="text-sm">
              © 2025 AssistiveHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
