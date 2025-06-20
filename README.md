# AssistiveHub Frontend

AssistiveHub의 프론트엔드 애플리케이션입니다. Next.js와 TypeScript를 사용하여 구축되었습니다.

## 기능

- JWT 기반 사용자 인증 (로그인/회원가입)
- 백엔드 API와의 연동
- 반응형 UI 디자인
- 서비스 연동 관리

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API 기본 URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# 개발 환경 설정
NODE_ENV=development
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 백엔드 연동

### API 엔드포인트

- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `GET /api/auth/test` - 인증 테스트

### 인증 시스템

- JWT 토큰 기반 인증
- 로컬 스토리지에 토큰 및 사용자 정보 저장
- 자동 토큰 만료 처리

## 프로젝트 구조

```
src/
├── app/           # Next.js App Router 페이지
├── components/    # React 컴포넌트
├── hooks/         # 커스텀 hooks
├── types/         # TypeScript 타입 정의
└── utils/         # 유틸리티 함수 (API 클라이언트 등)
```

## 주요 컴포넌트

### 인증 관련

- `LoginScreen.tsx` - 로그인 화면
- `SignupScreen.tsx` - 회원가입 화면
- `useAuth.ts` - 인증 상태 관리 hook

### 대시보드

- `Dashboard` - 메인 대시보드 페이지
- `Sidebar.tsx` - 사이드바 네비게이션
- `MainContent.tsx` - 메인 콘텐츠 영역

## 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 검사

## 기술 스택

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **API Client**: Fetch API
- **Authentication**: JWT

## 개발 시 주의사항

1. 백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.
2. CORS 설정이 백엔드에서 올바르게 구성되어야 합니다.
3. JWT 토큰의 만료 시간을 확인하세요.

## 문제 해결

### 로그인 실패

1. 백엔드 서버가 실행 중인지 확인
2. API URL이 올바른지 확인
3. 네트워크 탭에서 요청/응답 확인

### CORS 오류

백엔드의 CORS 설정을 확인하고, 프론트엔드 URL이 허용 목록에 있는지 확인하세요.

## 배포

프로덕션 배포 시 환경 변수를 적절히 설정하고, `NEXT_PUBLIC_API_URL`을 실제 백엔드 서버 URL로 변경하세요.
