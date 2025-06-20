'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function Demo() {
  const { isLoggedIn } = useAuthContext()
  const router = useRouter()
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const features = [
    {
      title: "업무 일지 & 성과 정리",
      description: "매일의 개발 작업을 자동으로 수집하고 체계적으로 정리합니다.",
      icon: "📝",
      gradient: "from-blue-500 to-cyan-500",
      demo: {
        title: "오늘의 개발 성과",
        items: [
          "✅ 사용자 인증 API 개발 완료",
          "🐛 로그인 버그 수정 (JWT 토큰 만료 처리)",
          "📚 React Query 학습 및 적용",
          "👥 코드 리뷰 3건 완료"
        ]
      }
    },
    {
      title: "피드백 & 리뷰 관리",
      description: "받은 피드백을 분석하고 개선 계획을 세워 지속적인 성장을 도모합니다.",
      icon: "💬",
      gradient: "from-purple-500 to-pink-500",
      demo: {
        title: "이번 주 피드백 요약",
        items: [
          "🎯 \"코드 구조화 실력이 향상됨\" - 시니어 개발자",
          "💡 \"API 설계에서 RESTful 원칙 잘 적용\" - 테크리드",
          "🔧 \"에러 핸들링 부분 보완 필요\" - 코드 리뷰어",
          "📈 \"문제 해결 속도가 빨라짐\" - 팀 리더"
        ]
      }
    },
    {
      title: "스킬 성장 추적",
      description: "기술 스택별 성장 과정을 시각화하고 학습 목표를 체계적으로 관리합니다.",
      icon: "📊",
      gradient: "from-green-500 to-emerald-500",
      demo: {
        title: "기술 스택 성장도",
        items: [
          "🚀 React: 초급 → 중급 (85% 달성)",
          "⚡ TypeScript: 중급 → 고급 (60% 진행중)",
          "🛠️ Node.js: 초급 → 중급 (90% 달성)",
          "📱 Next.js: 신규 학습 (40% 진행중)"
        ]
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
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
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            홈으로
          </button>
          <button
            onClick={handleGetStarted}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
          >
            {isLoggedIn ? '대시보드' : '시작하기'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>
        
        <div className={`max-w-5xl mx-auto relative z-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-7xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              실시간 데모
            </span>
          </h1>
          <p className="text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
            AssistiveHub가 어떻게 개발자의 성장을 돕는지
            <br />
            <strong className="text-blue-600">실제 화면으로 확인해보세요</strong>
          </p>
          
          <div className="flex gap-6 justify-center mb-16">
            <button
              onClick={handleGetStarted}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-xl shadow-xl"
            >
              무료로 체험하기
            </button>
            <button
              onClick={() => document.getElementById('demo-features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-white hover:border-blue-400 hover:text-blue-600 hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold text-xl"
            >
              데모 둘러보기
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Demo Features */}
      <section id="demo-features" className="px-6 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                핵심 기능 데모
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              클릭해서 각 기능의 실제 화면을 확인해보세요
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-2 rounded-2xl">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{feature.icon}</span>
                  {feature.title}
                </button>
              ))}
            </div>
          </div>

          {/* Demo Display */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Feature Description */}
            <div className={`transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className={`w-16 h-16 bg-gradient-to-r ${features[activeFeature].gradient} rounded-2xl flex items-center justify-center mb-8 animate-bounce`}>
                <span className="text-3xl">{features[activeFeature].icon}</span>
              </div>
              
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                {features[activeFeature].title}
              </h3>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {features[activeFeature].description}
              </p>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">주요 기능:</h4>
                {activeFeature === 0 && (
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-4"></span>
                      GitHub 커밋 자동 수집
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-4"></span>
                      Slack 업무 메시지 정리
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-4"></span>
                      일일 성과 리포트 생성
                    </li>
                  </ul>
                )}
                {activeFeature === 1 && (
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-4"></span>
                      피드백 감정 분석
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-4"></span>
                      개선 액션 플랜 제안
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-4"></span>
                      성장 패턴 분석
                    </li>
                  </ul>
                )}
                {activeFeature === 2 && (
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-4"></span>
                      스킬 레벨 자동 측정
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-4"></span>
                      학습 로드맵 추천
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-4"></span>
                      진도율 시각화
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* Right: Demo Screen */}
            <div className={`transform transition-all duration-500 delay-200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-2xl border border-gray-200 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${features[activeFeature].gradient} rounded-t-3xl`}></div>
                  
                  <div className="flex items-center mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="ml-4 text-sm text-gray-500 font-mono">
                      assistivehub.app/dashboard
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      {features[activeFeature].demo.title}
                    </h4>
                    
                    {features[activeFeature].demo.items.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 bg-white rounded-xl shadow-sm border-l-4 border-gradient-to-b ${features[activeFeature].gradient} transform transition-all duration-300 hover:scale-105 animate-fadeInUp`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <p className="text-gray-700 font-medium">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>실시간 업데이트</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                        <span>온라인</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full animate-bounce opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500 rounded-full animate-pulse opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built This */}
      <section className="px-6 py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                왜 만들게 되었을까요?
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              현업 개발자의 실제 고민에서 시작된 AssistiveHub의 탄생 스토리
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Main Story */}
            <div className="bg-white p-12 rounded-3xl shadow-xl mb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                  👨‍💻
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">개발자의 솔직한 고백</h3>
                  <p className="text-lg text-gray-600">스타트업 개발자 • AssistiveHub 창립자</p>
                </div>
              </div>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p className="text-xl font-medium text-gray-900">
                  &ldquo;매일, 매주 쓰는 업무일지가 정리가 안되고 성과를 항상 놓쳤습니다.&rdquo;
                </p>
                
                <p>
                  스타트업에서 개발자로 일하면서 가장 힘들었던 것은 <strong className="text-blue-600">내가 무엇을 했는지 정리하는 것</strong>이었습니다. 
                  매일 코딩하고, 버그 수정하고, 새로운 기능을 만들어내지만...
                </p>

                <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-blue-500">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">😰</span>
                      <span>주간 회의 때 &ldquo;이번 주에 뭐 했지?&rdquo; 하며 당황</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">📝</span>
                      <span>업무일지는 쓰지만 나중에 찾기도 어렵고 정리도 안됨</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">💔</span>
                      <span>성과평가 시즌에 내가 한 일들을 증명하기 어려움</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 mt-1">🔄</span>
                      <span>같은 문제를 반복해서 겪는데 학습이 체계화되지 않음</span>
                    </li>
                  </ul>
                </div>

                <p>
                  그래서 생각했습니다. <strong className="text-purple-600">&ldquo;현업에서 정말 필요한 성과 정리 에이전트가 필요하다!&rdquo;</strong>
                </p>

                <p>
                  단순히 일정 관리나 할 일 체크가 아니라, 개발자의 실제 업무 패턴을 이해하고 
                  GitHub 커밋, Slack 메시지, 코드 리뷰 등을 자동으로 수집해서  
                   <strong className="text-green-600"> 의미 있는 성과로 정리해주는 도구</strong>가 필요했습니다.
                </p>
              </div>
            </div>

            {/* Problem & Solution */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">😵‍💫</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">기존의 문제점</h4>
                <ul className="space-y-3 text-gray-600">
                  <li>• 업무 기록이 여러 곳에 흩어져 있음</li>
                  <li>• 성과를 객관적으로 정리하기 어려움</li>
                  <li>• 피드백과 성장 과정이 체계화되지 않음</li>
                  <li>• 이직/승진 준비 시 증빙 자료 부족</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">✨</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">AssistiveHub의 해결책</h4>
                <ul className="space-y-3 text-gray-600">
                  <li>• 모든 업무 데이터를 한 곳에 자동 수집</li>
                  <li>• AI가 성과를 의미 있게 분석하고 정리</li>
                  <li>• 피드백 기반 성장 로드맵 제공</li>
                  <li>• 언제든 꺼내 쓸 수 있는 성과 포트폴리오</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full opacity-5 animate-float"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white rounded-full opacity-5 animate-float delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white rounded-full opacity-5 animate-float delay-2000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-6xl font-bold text-white mb-8">
            지금 바로 시작하세요!
          </h2>
          <p className="text-2xl text-white/90 mb-12 leading-relaxed">
            개발자의 성장을 가속화하는 AssistiveHub
            <br />
            <strong>완전 무료</strong>로 모든 기능을 체험해보세요
          </p>
          
          <div className="flex gap-6 justify-center mb-8">
            <button
              onClick={handleGetStarted}
              className="px-12 py-6 bg-white text-blue-600 rounded-2xl hover:bg-gray-50 hover:shadow-2xl transform hover:scale-110 transition-all duration-300 font-bold text-2xl shadow-xl"
            >
              무료로 시작하기 🚀
            </button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-white/80">
            <div className="flex items-center">
              <span className="text-2xl mr-2">✅</span>
              <span>신용카드 불필요</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">⚡</span>
              <span>즉시 사용 가능</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">🔒</span>
              <span>개인정보 보호</span>
            </div>
          </div>
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
              © 2025 AssistiveHub. 개발자의 성장을 위한 플랫폼
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
} 