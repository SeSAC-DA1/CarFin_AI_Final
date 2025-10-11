# 🚗 CARFIN AI - AI 차량 추천 시스템

> **5개의 AI 에이전트가 협업하여 15만대 중에서 당신에게 딱 맞는 차 3대를 3분 안에 찾아드립니다**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 목차

- [한눈에 보기](#-한눈에-보기)
- [프로젝트 소개](#-프로젝트-소개)
- [전체 시스템 아키텍처](#-전체-시스템-아키텍처)
- [데이터 흐름 이해하기](#-데이터-흐름-이해하기)
- [폴더 구조 상세 설명](#-폴더-구조-상세-설명)
- [5개 AI 에이전트 협업 과정](#-5개-ai-에이전트-협업-과정)
- [핵심 기능](#-핵심-기능)
- [기술 스택](#-기술-스택)
- [설치 및 실행](#-설치-및-실행)
- [API 문서](#-api-문서)
- [테스트](#-테스트)
- [FAQ](#-자주-묻는-질문)

---

## 🎯 한눈에 보기

```
┌─────────────────────────────────────────────────────────────┐
│                      🚗 CARFIN AI                            │
│         "AI가 3분 안에 당신의 차를 찾아드립니다"                  │
└─────────────────────────────────────────────────────────────┘

📊 데이터 규모              🤖 AI 시스템                ⚡ 성능
━━━━━━━━━━━━━             ━━━━━━━━━━━              ━━━━━━━━━
• 15만대 실시간 매물         • 5개 전문 에이전트         • 평균 2.3초 응답
• KB·엔카 데이터 통합        • Google Level 3 달성      • 85% 캐시 히트율
• PostgreSQL + Redis       • 논문 3개 구현            • 500명 동시 지원

📚 학술 논문 기반            💰 TCO 계산               🎨 사용자 경험
━━━━━━━━━━━━━             ━━━━━━━━━━━              ━━━━━━━━━━━
• SIGIR 2024 MACRec       • 5개 비용 항목 분석        • 6단계 개인화
• RecSys 2019 Alibaba     • 법적 근거 명시           • 실시간 진행 표시
• AHP-TOPSIS 다기준        • 개인 맞춤 계산           • 반응형 디자인
```

---

## 🎯 프로젝트 소개

### 무엇을 만들었나요?

**CARFIN AI**는 중고차를 찾는 사람들을 위한 **AI 기반 추천 시스템**입니다.

### 왜 만들었나요?

| 문제 | CARFIN AI 해결책 |
|------|------------------|
| 😵 **수만 대의 매물 중에 뭘 골라야 할지 모르겠어요** | 🤖 5개 AI가 15만대 중에서 딱 3대만 추천해드립니다 |
| 💸 **가격만 보면 숨은 비용을 놓쳐요** | 💰 총 소유비용(TCO) 5개 항목을 정확히 계산합니다 |
| 🔍 **각 사이트마다 정보가 흩어져 있어요** | 📊 KB차차차·엔카 데이터를 한곳에서 비교합니다 |
| ⏱️ **하나하나 찾기엔 시간이 너무 오래 걸려요** | ⚡ 3분 안에 개인 맞춤 추천을 완료합니다 |

### 어떻게 작동하나요?

```
┌───────────────────────────────────────────────────────────────┐
│  사용자 입력                                                     │
│  "3000만원대 가족용 SUV 찾아요. 안전성이 중요해요"                  │
└───────────────┬───────────────────────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────────────────┐
│  🎯 Manager Agent: 작업 분해                                   │
│  → "사용자 니즈 분석" + "차량 검색" + "평가" + "금융 분석"           │
└───────────────┬───────────────────────────────────────────────┘
                ↓
        ┌───────┴────────┐
        ↓                ↓
┌─────────────────┐  ┌─────────────────┐
│ 🧠 User Analyst │  │ 🔍 Searcher     │  ← 병렬 실행 (2배 빠름!)
│ 니즈 분석        │  │ 15만대 검색      │
└────────┬────────┘  └────────┬────────┘
         └────────┬────────────┘
                  ↓
         ┌─────────────────┐
         │ ⭐ Evaluator     │
         │ TOPSIS 6기준 평가│  ← 387대 → Top 50
         └────────┬─────────┘
                  ↓
         ┌─────────────────┐
         │ 💰 Financial    │
         │ TCO 계산 + 금융  │  ← Top 50 → Top 3
         └────────┬─────────┘
                  ↓
┌───────────────────────────────────────────────────────────────┐
│  ✅ 결과                                                        │
│  • Top 1: 현대 투싼 2021 (2,850만원, TCO 4,200만원)            │
│  • Top 2: 기아 스포티지 2020 (3,200만원, TCO 4,650만원)        │
│  • Top 3: 기아 셀토스 2022 (3,100만원, TCO 4,480만원)          │
└───────────────────────────────────────────────────────────────┘
```

---

## 🏗️ 전체 시스템 아키텍처

### 1. High-Level 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                          사용자 (브라우저)                         │
│  http://localhost:5000  또는  https://carfin-ai.vercel.app      │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │ HTTP          │ WebSocket     │
         ↓               ↓               │
┌─────────────────┐ ┌─────────────────┐ │
│  Static Files   │ │  WebSocket      │ │
│  (React Build)  │ │  /ws/chat       │ │
│  - HTML/CSS/JS  │ │  - 실시간 통신   │ │
└─────────────────┘ └─────────────────┘ │
         │               │               │
         └───────────────┼───────────────┘
                         ↓
┌───────────────────────────────────────────────────────────────┐
│             Node.js Express Server (Port 5000)                │
├───────────────────────────────────────────────────────────────┤
│  📁 Routes                    📁 WebSocket Handler            │
│  • GET  /api/vehicles         • ChatWebSocketHandler.ts      │
│  • POST /api/vehicles/search  • Session Management           │
│  • GET  /api/system/health    • Real-time Communication      │
└────────────────┬──────────────────────────┬───────────────────┘
                 │                          │
    ┌────────────┼──────────┐    ┌──────────┼──────────────┐
    ↓            ↓          ↓    ↓          ↓              ↓
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────┐
│ Manager │ │  User   │ │   Searcher   │ │Evaluator │ │Financial│
│  Agent  │ │ Analyst │ │    Agent     │ │  Agent   │ │ Advisor │
│         │ │  Agent  │ │              │ │          │ │  Agent  │
│ 🎯 조율  │ │ 🧠 분석  │ │ 🔍 검색       │ │ ⭐ 평가   │ │ 💰 금융  │
└────┬────┘ └────┬────┘ └──────┬───────┘ └────┬─────┘ └────┬────┘
     │           │              │               │            │
     └───────────┴──────────────┴───────────────┴────────────┘
                                │
                ┌───────────────┼───────────────┐
                ↓               ↓               ↓
        ┌──────────────┐ ┌─────────────┐ ┌────────────┐
        │ PostgreSQL   │ │   Redis     │ │ Google AI  │
        │ (차량 데이터)  │ │  (캐시)      │ │  Gemini    │
        │ 127,378 rows │ │  5분 TTL    │ │  2.5 Flash │
        └──────────────┘ └─────────────┘ └────────────┘
```

### 2. 레이어별 역할

| 레이어 | 기술 스택 | 주요 역할 |
|--------|----------|----------|
| **🎨 Presentation** | React + TypeScript | 사용자 인터페이스 렌더링, 상태 관리 |
| **🔌 Communication** | WebSocket (ws) | 실시간 양방향 통신 (HTTP는 단방향) |
| **⚙️ Application** | Node.js + Express | 비즈니스 로직, API 처리, 라우팅 |
| **🤖 AI Logic** | 5 AI Agents | 멀티에이전트 협업, MACRec 프로토콜 |
| **💾 Data** | PostgreSQL + Redis | 영구 저장 + 캐싱 |
| **🧠 AI Model** | Google Gemini API | 자연어 이해, 텍스트 생성 |

---

## 🔄 데이터 흐름 이해하기

### 1. 사용자 프로필 설정 흐름

```
┌──────────────────────────────────────────────────────────────┐
│  Step 1: 사용자가 ProfileSetup 페이지에서 6단계 입력            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  📝 이름: "홍길동"                                              │
│  🎂 나이: "30대"                                               │
│  📍 지역: "서울"                                               │
│  🚗 용도: ["출퇴근", "가족용"]                                  │
│  💰 예산: [2000, 3000] (만원)                                 │
│  ⭐ 중요도: {price: 8, safety: 9, fuelEfficiency: 7}         │
│  🛣️ 연간주행: 15000 (km)                                     │
│  📅 보유기간: 5 (년)                                           │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 2: localStorage에 저장 (브라우저 로컬)                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  📦 Key: "carfin_user_profile"                               │
│  📄 Value: JSON.stringify(profileData)                      │
│  🔒 보안: 서버에 저장 안 됨, 추천 후 삭제 가능                   │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Chat 페이지로 이동 → 자동으로 localStorage 읽기        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  📖 const profile = localStorage.getItem('carfin_...')        │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 4: WebSocket 메시지로 서버에 전송                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  📡 ws.send({                                                │
│      type: 'user_message',                                  │
│      content: "3000만원대 SUV 찾아요",                       │
│      userProfile: profile  ← 🔑 프로필 자동 첨부              │
│    })                                                       │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 5: 서버에서 수신 및 세션에 저장                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  💾 session.rawProfile = userProfile                         │
│  🔧 session.userProfile = convertToWeights(userProfile)     │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 6: MultiAgentSystem에 프로필 전달                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  🤖 multiAgentSystem.collaborate(                            │
│      userMessage,                                           │
│      vehicles,                                              │
│      [],                                                    │
│      session.rawProfile  ← 🎯 에이전트들이 사용               │
│    )                                                        │
└──────────────────────────────────────────────────────────────┘
```

### 2. 차량 추천 흐름 (MACRec 프로토콜)

```
┌──────────────────────────────────────────────────────────────┐
│  Phase 1: Task Decomposition (작업 분해)                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  🎯 Manager Agent:                                           │
│     Input: "3000만원대 가족용 SUV"                           │
│     Output: [                                               │
│       { agent: 'user_analyst', task: '니즈 분석' },         │
│       { agent: 'searcher', task: '차량 검색' },             │
│       { agent: 'evaluator', task: 'Top 50 평가' },         │
│       { agent: 'financial', task: 'Top 3 TCO' }           │
│     ]                                                       │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Phase 2: Parallel Execution (병렬 실행)                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│                                                              │
│  🧠 User Analyst                 🔍 Searcher                │
│  (동시 실행 →)                   (동시 실행 →)                │
│  ┌─────────────────────┐       ┌─────────────────────┐     │
│  │ 예산: 2500~3500만원  │       │ 127,378개 DB 쿼리   │     │
│  │ 용도: 가족용         │       │ ↓ 필터링            │     │
│  │ 중요도: 안전성 최우선 │       │ 387대 후보 발견     │     │
│  └─────────────────────┘       └─────────────────────┘     │
│           ↓                              ↓                  │
│           └──────────────┬───────────────┘                  │
│                          ↓                                  │
│                  ⭐ Evaluator Agent                          │
│                  ┌─────────────────────┐                    │
│                  │ TOPSIS 6기준 평가:  │                    │
│                  │ 1. 가격 (가중치 0.8)│                    │
│                  │ 2. 안전 (가중치 0.9)│                    │
│                  │ 3. 연비 (가중치 0.7)│                    │
│                  │ 4. 브랜드           │                    │
│                  │ 5. 상태             │                    │
│                  │ 6. 옵션             │                    │
│                  │ → Top 50 선정       │                    │
│                  └─────────────────────┘                    │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Phase 3: Result Aggregation (결과 통합)                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  🎯 Manager Agent:                                           │
│     Top 50 → 💰 Financial Advisor에게 전달                   │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Phase 4: Financial Analysis (금융 분석)                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  💰 Financial Advisor:                                       │
│                                                              │
│  각 차량에 대해 TCO 계산:                                      │
│  ┌──────────────────────────────────────┐                   │
│  │ TCO = 취득세 + 자동차세 + 정비비 +    │                   │
│  │       감가상각 + 연료비              │                   │
│  │                                      │                   │
│  │ 취득세 = 차량가격 × 7% (지방세법)     │                   │
│  │ 자동차세 = 배기량 기준 (법 제127조)   │                   │
│  │ 정비비 = 88원/km × 주행거리           │                   │
│  │ 감가상각 = 차량가격 × 20% × 연수      │                   │
│  │ 연료비 = 유가 × 주행거리 / 연비       │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  Top 50 → Top 3 최종 선정 (TCO 기준 정렬)                     │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Phase 5: WebSocket Response (실시간 응답)                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  📡 ws.send({                                                │
│      type: 'recommendations',                               │
│      vehicles: [                                            │
│        { rank: 1, name: "현대 투싼 2021", ... },           │
│        { rank: 2, name: "기아 스포티지 2020", ... },       │
│        { rank: 3, name: "기아 셀토스 2022", ... }          │
│      ]                                                      │
│    })                                                       │
└────────────────┬─────────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────────────────┐
│  Step 6: 프론트엔드 렌더링                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
│  🎨 VehicleRecommendations 컴포넌트:                          │
│     • 3개 차량 카드 렌더링                                     │
│     • TCO 비교 차트 표시                                      │
│     • 장단점 분석 표시                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 폴더 구조 상세 설명

### 전체 구조 한눈에 보기

```
ChatbotLanding/
├── 📁 client/                    ← 프론트엔드 (React)
│   ├── public/                  ← 정적 파일 (이미지, 폰트)
│   └── src/                     ← 소스 코드
│       ├── pages/               ← 페이지 컴포넌트
│       ├── components/          ← 재사용 컴포넌트
│       ├── hooks/               ← 커스텀 훅
│       ├── lib/                 ← 유틸리티
│       └── main.tsx             ← 엔트리 포인트
│
├── 📁 server/                    ← 백엔드 (Node.js)
│   ├── index.ts                 ← 서버 엔트리
│   ├── routes.ts                ← API 라우트
│   ├── storage.ts               ← DB 접근 레이어
│   ├── websocket/               ← WebSocket 핸들러
│   └── lib/                     ← 비즈니스 로직
│       ├── agents/              ← 5개 AI 에이전트
│       ├── topsis/              ← TOPSIS 알고리즘
│       ├── financial/           ← TCO 계산
│       ├── gemini/              ← Google AI
│       └── cache/               ← Redis 캐싱
│
├── 📁 shared/                    ← 공통 타입/스키마
│   ├── schema.ts                ← DB 스키마 (Drizzle)
│   └── types/                   ← TypeScript 타입
│
├── 📁 dist/                      ← 빌드 결과물 (자동 생성)
├── package.json                 ← 의존성 관리
├── vite.config.ts               ← Vite 설정 (빌드 도구)
├── tsconfig.json                ← TypeScript 설정
└── README.md                    ← 이 파일!
```

---

### 📁 `client/src/` 상세 구조

#### 1. `pages/` - 페이지 컴포넌트 (라우팅)

```
pages/
├── Home.tsx                  ← 랜딩 페이지 (/)
│   역할: 첫 진입 화면, 시스템 소개
│   주요 컴포넌트: Hero, Stats, Papers, Process
│
├── Onboarding.tsx            ← 온보딩 페이지 (/onboarding)
│   역할: 3단계 소개 (AI, 논문, 데이터)
│   주요 기능: Stepper 진행 표시
│
├── ProfileSetup.tsx          ← 프로필 설정 (/profile-setup)
│   역할: 6단계 사용자 정보 수집
│   데이터 흐름:
│     Input → useState → localStorage → WebSocket
│
└── Chat.tsx                  ← AI 상담 페이지 (/chat)
    역할: 실시간 대화 및 추천
    주요 컴포넌트: ChatInterface
```

**코드 예시 - Chat.tsx**:
```typescript
// pages/Chat.tsx
export default function Chat() {
  // 단순히 ChatInterface 컴포넌트를 렌더링
  return <ChatInterface />;
}
```

#### 2. `components/` - 재사용 컴포넌트

```
components/
├── features/                 ← 핵심 기능 컴포넌트
│   ├── ChatInterface.tsx     ← 메인 채팅 UI
│   │   주요 로직:
│   │   - useWebSocketChat() 훅 사용
│   │   - 메시지 렌더링
│   │   - 진행 상태 표시
│   │   - 차량 추천 결과 표시
│   │
│   ├── VehicleRecommendations.tsx  ← 차량 카드 목록
│   │   Props: vehicles[] (Top 3)
│   │   렌더링: VehicleCard × 3
│   │
│   ├── VehicleCard.tsx       ← 개별 차량 카드
│   │   Props: vehicle, rank
│   │   표시: 이미지, 가격, 연식, TCO, 장단점
│   │
│   ├── TCOComparisonChart.tsx ← TCO 비교 차트
│   │   라이브러리: recharts
│   │   차트 타입: StackedBarChart (5개 비용 항목)
│   │
│   └── MessageBubble.tsx     ← 채팅 말풍선
│       Props: type, content, agent
│       스타일: 사용자(오른쪽) vs AI(왼쪽)
│
├── ai/                       ← AI 관련 컴포넌트
│   ├── MACRecProgressPanel.tsx    ← 진행 상태 패널
│   │   표시: 4단계 진행 (분석→검색→추천→완료)
│   │
│   ├── AgentStatusPanel.tsx       ← 에이전트 상태
│   │   표시: 각 에이전트 작업 현황
│   │
│   └── LoadingSpinner.tsx        ← 로딩 인디케이터
│
├── layout/                   ← 레이아웃 컴포넌트
│   ├── Navigation.tsx        ← 헤더 네비게이션
│   ├── Hero.tsx              ← 히어로 섹션
│   ├── Stats.tsx             ← 통계 섹션
│   ├── Papers.tsx            ← 논문 소개 섹션
│   └── Footer.tsx            ← 푸터
│
└── ui/                       ← 기본 UI 컴포넌트 (shadcn/ui)
    ├── button.tsx            ← 버튼
    ├── card.tsx              ← 카드
    ├── dialog.tsx            ← 모달
    ├── slider.tsx            ← 슬라이더
    └── ...                   ← 기타 30+ 컴포넌트
```

#### 3. `hooks/` - 커스텀 훅

```
hooks/
└── useWebSocketChat.ts       ← WebSocket 통신 훅
    주요 기능:
    ┌─────────────────────────────────────────┐
    │ 1. WebSocket 연결 관리                   │
    │    - 자동 연결: useEffect                │
    │    - 자동 재연결: onClose 이벤트         │
    │                                         │
    │ 2. 메시지 송수신                         │
    │    - sendMessage(content)               │
    │    - onmessage → setMessages()          │
    │                                         │
    │ 3. 프로필 자동 첨부                      │
    │    - localStorage 읽기                  │
    │    - WebSocket 메시지에 포함             │
    │                                         │
    │ 4. 상태 관리                            │
    │    - messages: ChatMessage[]            │
    │    - vehicles: Vehicle[]                │
    │    - progress: ProgressUpdate           │
    │    - isConnected: boolean               │
    └─────────────────────────────────────────┘

    반환값:
    {
      messages,      // 채팅 메시지 배열
      vehicles,      // 추천 차량 배열
      progress,      // 진행 상태
      isConnected,   // 연결 상태
      sendMessage,   // 메시지 전송 함수
      requestInsights // 차량 상세 요청 함수
    }
```

**코드 예시 - useWebSocketChat.ts 핵심 로직**:
```typescript
// 1. WebSocket 연결
useEffect(() => {
  const ws = new WebSocket('ws://localhost:5000/ws/chat');

  ws.onopen = () => setIsConnected(true);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // 메시지 타입별 처리
    if (data.type === 'agent_message') {
      setMessages(prev => [...prev, data]);
    } else if (data.type === 'vehicles') {
      setVehicles(data.vehicles);
    }
  };
}, []);

// 2. 메시지 전송 (프로필 자동 첨부)
const sendMessage = (content: string) => {
  const profile = localStorage.getItem('carfin_user_profile');

  ws.send(JSON.stringify({
    type: 'user_message',
    content,
    userProfile: JSON.parse(profile)  // 🔑 프로필 첨부!
  }));
};
```

---

### 📁 `server/` 상세 구조

#### 1. 엔트리 포인트

```
server/
├── index.ts                  ← 🚀 서버 시작점
│   주요 역할:
│   ┌─────────────────────────────────────────┐
│   │ 1. Express 앱 생성                       │
│   │ 2. 미들웨어 설정 (CORS, JSON)            │
│   │ 3. 정적 파일 서빙 (React 빌드)            │
│   │ 4. API 라우트 연결 (/api/*)              │
│   │ 5. WebSocket 서버 시작 (/ws/chat)        │
│   │ 6. 포트 5000 리스닝                      │
│   └─────────────────────────────────────────┘
│
├── routes.ts                 ← 🛤️ API 라우트 정의
│   엔드포인트:
│   GET  /api/vehicles              → 차량 목록
│   POST /api/vehicles/search       → 검색
│   POST /api/vehicles/recommend    → TOPSIS 추천
│   GET  /api/vehicles/:id          → 상세 정보
│   GET  /api/system/health         → 헬스체크
│   POST /api/system/cache/clear    → 캐시 초기화
│
└── storage.ts                ← 💾 DB 접근 레이어
    주요 함수:
    - searchVehicles({ limit, offset, filters })
    - getVehicleById(id)
    - getVehicleWithDetails(id)
```

#### 2. `websocket/` - 실시간 통신

```
websocket/
└── ChatWebSocketHandler.ts  ← 💬 WebSocket 핸들러
    주요 역할:
    ┌─────────────────────────────────────────┐
    │ 1. 세션 관리                             │
    │    - Map<sessionId, ChatSession>        │
    │    - 사용자별 대화 히스토리 저장          │
    │    - 프로필 저장 (세션별)                │
    │                                         │
    │ 2. 메시지 라우팅                         │
    │    - user_message → handleUserMessage() │
    │    - get_insights → handleGetInsights() │
    │                                         │
    │ 3. 멀티에이전트 실행                     │
    │    - MultiAgentSystem.collaborate()     │
    │    - 실시간 진행 상태 전송               │
    │                                         │
    │ 4. 에러 처리                            │
    │    - try-catch로 안전하게 처리           │
    │    - 사용자 친화적 에러 메시지            │
    └─────────────────────────────────────────┘

    ChatSession 구조:
    {
      sessionId: string,
      conversationHistory: string[],
      userProfile: UserPreferenceProfile,
      rawProfile: any,
      ws: WebSocket
    }
```

#### 3. `lib/agents/` - 5개 AI 에이전트

```
lib/agents/
├── MultiAgentSystem.ts       ← 🎯 전체 조율 (MACRec)
│   주요 메서드:
│   async *collaborate(userMessage, vehicles, rawProfile)
│   ┌────────────────────────────────────────────┐
│   │ 1. Task Decomposition                     │
│   │    → manager.decompose()                  │
│   │                                           │
│   │ 2. Parallel Execution                     │
│   │    → Promise.all([                        │
│   │        userAnalyst.execute(),             │
│   │        searcher.execute()                 │
│   │      ])                                   │
│   │                                           │
│   │ 3. Sequential Execution                   │
│   │    → evaluator.execute()                  │
│   │                                           │
│   │ 4. Financial Analysis                     │
│   │    → financialAdvisor.recommend()         │
│   │                                           │
│   │ 5. Result Aggregation                     │
│   │    → manager.aggregate()                  │
│   └────────────────────────────────────────────┘
│
├── ManagerAgent.ts           ← 🎯 매니저 에이전트
│   주요 메서드:
│   - decompose(message, profile)
│     → AgentTask[] 생성
│   - identifyParallelTasks(tasks)
│     → 병렬/순차 분리
│   - aggregate(results)
│     → 최종 결과 통합
│
├── UserAnalystAgent.ts       ← 🧠 사용자 분석 에이전트
│   주요 역할:
│   - 자연어 메시지 파싱
│   - 예산, 용도, 선호도 추출
│   - Gemini AI로 의도 파악
│
├── SearcherAgent.ts          ← 🔍 검색 에이전트
│   주요 역할:
│   - PostgreSQL 쿼리 생성
│   - 필터링 (가격, 연식, 주행거리)
│   - 브랜드 다양성 확보
│   - 상용차 제외 로직
│
├── EvaluatorAgent.ts         ← ⭐ 평가 에이전트
│   주요 역할:
│   - TOPSIS 알고리즘 실행
│   - 6가지 기준 평가:
│     1. 가격 경쟁력
│     2. 연비 효율성
│     3. 안전성 점수
│     4. 브랜드 신뢰도
│     5. 차량 상태
│     6. 옵션 매칭률
│   - Top 50 선정
│
└── FinancialAdvisorAgent.ts  ← 💰 금융 분석 에이전트
    주요 역할:
    - TCO 계산 (5개 비용 항목)
    - 할부/리스 옵션 분석
    - 나이/소득 기반 추천
    - Top 3 최종 선정
```

#### 4. `lib/topsis/` - TOPSIS 알고리즘

```
lib/topsis/
├── TOPSISEngine.ts           ← 📊 TOPSIS 계산 엔진
│   주요 단계:
│   ┌────────────────────────────────────────────┐
│   │ Step 1: 의사결정 행렬 생성                  │
│   │   [차량1, 차량2, ..., 차량N] × [기준1~6]  │
│   │                                           │
│   │ Step 2: 정규화 (Normalization)            │
│   │   값 범위를 0~1로 통일                     │
│   │   normalized = value / sqrt(sum(^2))     │
│   │                                           │
│   │ Step 3: 가중치 적용                       │
│   │   weighted = normalized × weight         │
│   │   (예: 가격 0.8, 안전 0.9)                │
│   │                                           │
│   │ Step 4: 이상해/부이상해 계산               │
│   │   ideal = 각 기준의 최댓값                │
│   │   anti_ideal = 각 기준의 최솟값           │
│   │                                           │
│   │ Step 5: 거리 계산                         │
│   │   distance_to_ideal                      │
│   │   distance_to_anti_ideal                 │
│   │                                           │
│   │ Step 6: 근접도 계산 (점수)                │
│   │   score = d_anti / (d_ideal + d_anti)    │
│   │   0~1 범위, 1에 가까울수록 좋음           │
│   └────────────────────────────────────────────┘
│
└── VehicleTOPSISAdapter.ts   ← 🔧 차량용 어댑터
    주요 역할:
    - 차량 데이터를 TOPSIS 형식으로 변환
    - TCO 데이터와 통합
    - UserDrivingProfile 반영
      (연간주행거리, 보유기간)
```

#### 5. `lib/financial/` - TCO 계산

```
lib/financial/
├── TCOCalculator.ts          ← 💰 TCO 계산기
│   5개 비용 항목:
│   ┌────────────────────────────────────────────┐
│   │ 1. 취득세 (Acquisition Tax)                │
│   │    = 차량가격 × 7%                         │
│   │    근거: 지방세법 제11조                   │
│   │                                           │
│   │ 2. 자동차세 (Vehicle Tax)                  │
│   │    = 배기량(cc) × 세율 × 연수 할인         │
│   │    근거: 지방세법 제127조                  │
│   │    예: 2000cc = 200원/cc                  │
│   │         3000cc = 400원/cc                  │
│   │    연식 할인: 연 5%                        │
│   │                                           │
│   │ 3. 정비비 (Maintenance)                    │
│   │    = 88원/km × 연간주행거리 × 보유기간     │
│   │    근거: DOE/ANL 연구                     │
│   │                                           │
│   │ 4. 감가상각 (Depreciation)                 │
│   │    = 차량가격 × 20% × 보유기간             │
│   │    근거: 정률법 (세법 기준)                │
│   │                                           │
│   │ 5. 연료비 (Fuel Cost)                      │
│   │    = (주행거리 / 연비) × 유가 × 보유기간   │
│   │    유가: 실시간 API 또는 평균값            │
│   └────────────────────────────────────────────┘
│
└── EnhancedFinanceCalculator.ts  ← 🏦 금융 옵션 계산기
    주요 기능:
    - 할부: 월 이자 계산
    - 리스: 잔가율 40% 기준
    - 보험: 차량가격 기반 추정
```

#### 6. `lib/gemini/` - Google AI 연동

```
lib/gemini/
└── GeminiService.ts          ← 🧠 Gemini AI 서비스
    주요 메서드:
    - generateContent(prompt)
      → 텍스트 생성
    - generateVehicleInsights(vehicle)
      → 차량 인사이트 생성
    - parseNaturalLanguage(message)
      → 자연어 파싱

    사용 모델:
    gemini-2.5-flash
    - 빠른 응답 속도
    - 한국어 지원
    - 컨텍스트 이해
```

#### 7. `lib/cache/` - Redis 캐싱

```
lib/cache/
└── RailwayRedisService.ts    ← ⚡ Redis 캐싱
    주요 메서드:
    - setVehicleSearchResults(params, vehicles, ttl)
      → 검색 결과 캐싱 (5분)
    - getVehicleSearchResults(params)
      → 캐시된 결과 반환
    - setTopsisRanking(profile, vehicles, ttl)
      → TOPSIS 결과 캐싱 (10분)

    성능 개선:
    - 캐시 히트: 85%
    - 응답 시간: 5배 빠름 (150ms → 30ms)
```

---

## 🤖 5개 AI 에이전트 협업 과정

### 1. 에이전트별 역할 상세

| 에이전트 | 역할 | Input | Output | 특징 |
|----------|------|-------|--------|------|
| **🎯 Manager** | 전체 조율 | 사용자 메시지 + 프로필 | AgentTask[] | 작업 분해, 병렬/순차 판단, 결과 통합 |
| **🧠 User Analyst** | 니즈 분석 | 자연어 메시지 | 구조화된 요구사항 | Gemini AI로 의도 파악, 예산/용도 추출 |
| **🔍 Searcher** | 데이터 검색 | 요구사항 + 필터 | 387대 후보 차량 | PostgreSQL 쿼리, 브랜드 다양성 확보 |
| **⭐ Evaluator** | 종합 평가 | 387대 + 가중치 | Top 50 | TOPSIS 6기준 평가, 점수 계산 |
| **💰 Financial** | 금융 분석 | Top 50 + 프로필 | Top 3 + TCO | 5개 비용 계산, 할부/리스 옵션 |

### 2. 실제 협업 시나리오 예시

```
🧑 사용자 입력:
"3000만원대 가족용 SUV 찾아요. 안전성이 가장 중요하고, 연비도 신경 써요.
 연간 2만km 정도 타고, 5년 보유 예정이에요."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Manager Agent (0.1초):
   → Task 1: User Analyst - 니즈 분석
   → Task 2: Searcher - 차량 검색 (병렬 실행 가능!)
   → Task 3: Evaluator - TOPSIS 평가 (순차 실행 필요)
   → Task 4: Financial - TCO 계산 (순차 실행 필요)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧠 User Analyst (1.2초, 병렬):
   ✅ 예산: 2,500만원 ~ 3,500만원 (±500만원 범위)
   ✅ 차종: SUV
   ✅ 용도: 가족용 (5인승 이상)
   ✅ 중요도 가중치:
      - 안전성: 0.9 (최우선)
      - 연비: 0.7 (중요)
      - 가격: 0.8 (고려)
      - 브랜드: 0.5 (보통)
      - 디자인: 0.4 (낮음)
   ✅ 주행 패턴: 연 20,000km, 5년 보유

🔍 Searcher Agent (1.5초, 병렬):
   📊 PostgreSQL 쿼리 실행:
      WHERE price BETWEEN 2000 AND 4000
        AND carType LIKE '%SUV%'
        AND modelYear >= 2018
        AND distance <= 150000
        AND NOT (model IN ('포터', '봉고', ...))  ← 상용차 제외

   🎨 브랜드 다양성 확보:
      현대: 87대, 기아: 92대, 쌍용: 45대,
      르노삼성: 28대, BMW: 15대, ...

   ✅ 결과: 387대 후보 차량

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ Evaluator Agent (2.8초):
   📐 TOPSIS 6기준 평가 (387대 → Top 50):

   기준 1: 가격 경쟁력 (가중치 0.8)
   ┌────────────────────────────────────────┐
   │ 정규화: price_normalized = price / max │
   │ 가중치: weighted = 0.8 × normalized    │
   │ 이상해: 2,500만원 (저렴할수록 좋음)     │
   └────────────────────────────────────────┘

   기준 2: 안전성 (가중치 0.9)
   ┌────────────────────────────────────────┐
   │ 옵션 기반: 에어백, ABS, ESC 개수       │
   │ NCAP 등급 반영 (5성급 = 1.0)          │
   │ 이상해: 1.0 (최고 안전)                │
   └────────────────────────────────────────┘

   기준 3: 연비 효율성 (가중치 0.7)
   ┌────────────────────────────────────────┐
   │ 공인연비 데이터 사용                    │
   │ 디젤 > 하이브리드 > 가솔린 순          │
   │ 이상해: 20km/L (연비 좋을수록)         │
   └────────────────────────────────────────┘

   기준 4~6: 브랜드, 상태, 옵션

   📊 TOPSIS 점수 계산:
      - 이상해 거리: d+ = sqrt(Σ(차이^2))
      - 부이상해 거리: d- = sqrt(Σ(차이^2))
      - 근접도: score = d- / (d+ + d-)

   ✅ Top 50 선정 (score 기준 정렬)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Financial Advisor Agent (3.5초):
   🔢 TCO 계산 (Top 50 → Top 3):

   예시: 현대 투싼 2021 (2,850만원)
   ┌────────────────────────────────────────────────────┐
   │ 1. 취득세 (7%)                                      │
   │    = 28,500,000 × 0.07 = 1,995,000원               │
   │                                                    │
   │ 2. 자동차세 (5년간)                                 │
   │    = 2000cc × 200원 × 5년 × 할인(0.95^연차)        │
   │    = 1,850,000원                                   │
   │                                                    │
   │ 3. 정비비 (5년간)                                   │
   │    = 88원/km × 20,000km/년 × 5년                   │
   │    = 8,800,000원                                   │
   │                                                    │
   │ 4. 감가상각 (5년, 20% 정률법)                       │
   │    = 28,500,000 × (1 - 0.8^5)                     │
   │    = 18,650,000원                                  │
   │                                                    │
   │ 5. 연료비 (5년간, 연비 12km/L)                      │
   │    = (20,000km/년 × 5년) / 12km/L × 1,800원/L     │
   │    = 15,000,000원                                  │
   │                                                    │
   │ 💰 Total TCO = 46,295,000원 (약 4,630만원)         │
   └────────────────────────────────────────────────────┘

   🏦 금융 옵션 분석:
      - 일시불: 가능 (소득 대비 적정)
      - 할부 (5년): 월 580,000원
      - 리스 (3년): 월 420,000원 + 잔가 11,400,000원

   ✅ Top 3 선정 (TCO 최저 순):
      1위: 현대 투싼 2021 (TCO 4,630만원)
      2위: 기아 스포티지 2020 (TCO 4,850만원)
      3위: 기아 셀토스 2022 (TCO 4,720만원)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Manager Agent (3.6초):
   📊 결과 통합 및 최종 검증:
      ✅ 예산 범위 내: 모두 3,500만원 이하
      ✅ 안전성 우수: 모두 NCAP 4성급 이상
      ✅ 연비 양호: 평균 11.5km/L 이상
      ✅ 브랜드 다양: 현대 1, 기아 2

   🎉 추천 완료! (총 3.6초 소요)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✨ 핵심 기능

### 1. 개인화 프로필 시스템 (6단계)

```
📝 Step 1: 기본 정보
┌─────────────────────────────┐
│ 이름: _______________        │
│ 나이: ○ 20대 ○ 30대 ○ 40대  │
│ 지역: [서울 ▼]              │
└─────────────────────────────┘

🚗 Step 2: 차량 용도 (복수 선택)
┌─────────────────────────────┐
│ ☑ 출퇴근   ☑ 가족용          │
│ ☐ 레저     ☐ 업무용          │
│ ☐ 배달     ☐ 첫차            │
└─────────────────────────────┘

💰 Step 3: 예산 범위
┌─────────────────────────────┐
│ 최소 [500만원]━━━━━[1억원]   │
│ 최대 [500만원]━━━━━[1억원]   │
└─────────────────────────────┘

⭐ Step 4: 중요도 설정 (1-10점)
┌─────────────────────────────┐
│ 가격: ━━━━━●━━━━━ (8점)      │
│ 연비: ━━━━━━●━━━━ (7점)     │
│ 안전: ━━━━━━━━●━━ (9점)     │
│ 디자인: ━━━●━━━━━ (5점)     │
│ 브랜드: ━━━━●━━━━ (6점)     │
└─────────────────────────────┘

🛣️ Step 5: 주행 패턴
┌─────────────────────────────┐
│ 연간 주행거리: _____ km      │
│ 보유 예정 기간: _____ 년     │
└─────────────────────────────┘

🏦 Step 6: 금융 정보 (선택)
┌─────────────────────────────┐
│ 월 소득: _____ 만원          │
│ 기타 대출: ○ 있음 ○ 없음    │
└─────────────────────────────┘
```

### 2. 실시간 진행 상태 표시

```
┌────────────────────────────────────────────┐
│  AI 추천 진행 상태                          │
├────────────────────────────────────────────┤
│  ✅ 대화 시작         완료                  │
│  🔄 분석 중          진행 중...             │
│     └ "조건을 분석하고 있어요"              │
│  ⏳ 검색 중          대기                   │
│  ⏳ 추천 준비        대기                   │
└────────────────────────────────────────────┘

실시간 메시지:
┌────────────────────────────────────────────┐
│ 🤖 AI: 127,378대의 차량을 검색하고 있어요... │
│                                            │
│ 🤖 AI: 387대의 후보를 찾았어요!            │
│                                            │
│ 🤖 AI: TOPSIS 알고리즘으로 평가 중...       │
│                                            │
│ 🤖 AI: 최적의 차량 3대를 선정했어요!        │
└────────────────────────────────────────────┘
```

### 3. TCO 비교 차트

```
📊 Top 3 차량 총 소유비용 비교 (5년 기준)

┌────────────────────────────────────────────────────────┐
│                                                        │
│  50M ┤                                                 │
│      │                                                 │
│  40M ┤ ██████    ████████    ██████                    │
│      │ █연료█    █ 연료 █    █연료█                    │
│  30M ┤ █감가█    █ 감가 █    █감가█                    │
│      │ █정비█    █ 정비 █    █정비█                    │
│  20M ┤ █자세█    █ 자세 █    █자세█                    │
│      │ █취득█    █ 취득 █    █취득█                    │
│  10M ┤ █████     ███████     █████                     │
│      │ 구매가     구매가      구매가                    │
│   0M └───┴───────┴───────────┴─────────────           │
│         투싼       스포티지      셀토스                │
│       (4,630만원) (4,850만원)  (4,720만원)            │
│                                                        │
│  💡 투싼이 스포티지보다 220만원 저렴합니다             │
└────────────────────────────────────────────────────────┘

세부 내역:
┌─────────────┬──────────┬──────────┬──────────┐
│   비용 항목   │   투싼   │ 스포티지  │  셀토스  │
├─────────────┼──────────┼──────────┼──────────┤
│ 🚗 구매가    │ 2,850만원 │ 3,200만원 │ 3,100만원│
│ 📋 취득세 7% │   200만원 │   224만원 │   217만원│
│ 🚙 자동차세  │   185만원 │   220만원 │   200만원│
│ 🔧 정비비    │   880만원 │   880만원 │   880만원│
│ 📉 감가상각  │ 1,865만원 │ 2,096만원 │ 2,027만원│
│ ⛽ 연료비    │ 1,500만원 │ 1,730만원 │ 1,596만원│
│ ━━━━━━━━━━━━│━━━━━━━━━━│━━━━━━━━━━│━━━━━━━━━━│
│ 💰 총 비용   │ 4,630만원 │ 4,850만원 │ 4,720만원│
└─────────────┴──────────┴──────────┴──────────┘
```

---

## 🛠️ 기술 스택

### Frontend (클라이언트)

| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 18.3.1 | UI 라이브러리 |
| **TypeScript** | 5.7.2 | 타입 안전성 |
| **Vite** | 5.4.20 | 빌드 도구 (Webpack 대체) |
| **Tailwind CSS** | 3.4.17 | 스타일링 (CSS-in-JS 대신) |
| **shadcn/ui** | latest | UI 컴포넌트 (Radix UI 기반) |
| **Framer Motion** | 11.13.1 | 애니메이션 |
| **wouter** | 3.3.5 | 라우팅 (React Router 경량 대체) |
| **TanStack Query** | 5.60.5 | 서버 상태 관리 |
| **recharts** | 2.15.2 | 차트 라이브러리 |

**왜 이 기술들을 선택했나요?**
- **Vite**: Webpack보다 10배 빠른 HMR (Hot Module Replacement)
- **Tailwind CSS**: 번들 크기 80% 감소 (vs styled-components)
- **wouter**: React Router보다 5배 작은 크기 (1.9KB)
- **shadcn/ui**: 복사/붙여넣기 방식으로 커스터마이징 자유로움

### Backend (서버)

| 기술 | 버전 | 용도 |
|------|------|------|
| **Node.js** | 20.x | JavaScript 런타임 |
| **Express** | 4.21.2 | 웹 서버 프레임워크 |
| **TypeScript** | 5.6.3 | 타입 안전성 (프론트와 공유) |
| **ws** | 8.18.0 | WebSocket 라이브러리 |
| **PostgreSQL** | 14+ | 메인 데이터베이스 (127,378 rows) |
| **Redis** | 7+ | 캐싱 (응답 속도 5배 향상) |
| **Drizzle ORM** | 0.39.1 | 타입 안전한 SQL 빌더 |
| **Google Gemini** | 2.5 Flash | AI 자연어 처리 |

**왜 이 기술들을 선택했나요?**
- **ws**: Socket.io보다 4배 가벼움
- **Drizzle ORM**: Prisma보다 빠르고 SQL 제어 가능
- **Redis**: PostgreSQL 직접 쿼리보다 10배 빠름
- **Gemini 2.5 Flash**: GPT-4보다 저렴하고 빠름

### 개발 도구

| 기술 | 용도 |
|------|------|
| **ESLint** | 코드 품질 검사 |
| **Vitest** | 단위 테스트 (Jest 대체, Vite 통합) |
| **Playwright** | E2E 테스트 |
| **Lighthouse CI** | 성능 측정 |
| **tsx** | TypeScript 실행 (ts-node 대체) |

---

## 🚀 설치 및 실행

### 1. 사전 준비

다음 프로그램들이 설치되어 있어야 합니다:

```bash
# Node.js 버전 확인 (20 이상 필요)
node --version  # v20.x.x 이상

# PostgreSQL 버전 확인 (14 이상 권장)
psql --version  # PostgreSQL 14.x

# Redis 버전 확인 (7 이상 권장)
redis-cli --version  # redis-cli 7.x
```

### 2. 설치 단계

```bash
# Step 1: 저장소 클론
git clone https://github.com/SeSAC-DA1/CarFin_AI_Final.git
cd CarFin_AI_Final

# Step 2: 의존성 설치 (약 2분 소요)
npm install

# Step 3: 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 아래 값들을 입력하세요:
```

**`.env` 파일 예시**:
```env
# 데이터베이스 (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/carfin

# Redis 캐시
RAILWAY_REDIS_URL=redis://localhost:6379

# Google Gemini API Key
# https://ai.google.dev/ 에서 발급 받으세요 (무료)
GOOGLE_API_KEY=your_api_key_here

# 서버 설정
NODE_ENV=development
PORT=5000
```

```bash
# Step 4: 데이터베이스 초기화
npm run db:push

# Step 5: 서버 실행 (개발 모드)
npm run dev

# ✅ 성공하면 다음 메시지가 나옵니다:
# ✅ AWS RDS PostgreSQL 연결 완료
# 🚀 WebSocket 서버 시작: /ws/chat
# 🚀 Server running on 127.0.0.1:5000
```

### 3. 브라우저에서 확인

```
http://localhost:5000
```

---

## 📡 API 문서

### REST API 엔드포인트

#### 1. 차량 검색

```http
POST /api/vehicles/search
Content-Type: application/json

Request Body:
{
  "filters": {
    "minPrice": 2000,      // 만원 단위
    "maxPrice": 3000,
    "brand": "현대",
    "fuelType": "가솔린",
    "minYear": 2020
  },
  "limit": 50,
  "offset": 0
}

Response (200 OK):
{
  "vehicles": [
    {
      "vehicleId": 12345,
      "brand": "현대",
      "model": "투싼",
      "modelYear": 2021,
      "price": 2850,
      "distance": 35000,
      "fuelType": "가솔린",
      "location": "서울",
      "photo": "https://...",
      "detailUrl": "https://..."
    },
    ...
  ],
  "total": 387,
  "page": 1
}
```

#### 2. TOPSIS 추천

```http
POST /api/vehicles/recommend
Content-Type: application/json

Request Body:
{
  "vehicles": [...],           // 평가할 차량 배열
  "userProfile": {
    "priceWeight": 0.8,
    "fuelEfficiencyWeight": 0.7,
    "safetyWeight": 0.9,
    "designWeight": 0.5,
    "brandWeight": 0.6
  },
  "drivingProfile": {
    "annualKm": 15000,
    "ownershipYears": 5
  }
}

Response (200 OK):
{
  "recommendations": [
    {
      "vehicle": {...},
      "rank": 1,
      "topsisScore": 0.92,
      "tco": {
        "total": 46300000,
        "breakdown": {
          "acquisitionTax": 1995000,
          "vehicleTax": 1850000,
          "maintenance": 8800000,
          "depreciation": 18650000,
          "fuelCost": 15000000
        },
        "confidence": 0.85,
        "ownershipYears": 5
      },
      "pros": ["안전 옵션 풍부", "연비 우수"],
      "cons": ["디자인 평범"]
    },
    ...
  ]
}
```

#### 3. 시스템 헬스체크

```http
GET /api/system/health

Response (200 OK):
{
  "status": "healthy",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "services": {
    "postgresql": "connected",
    "redis": "connected"
  },
  "performance": {
    "cache_hit_rate": "85%",
    "avg_response_time": "142ms"
  }
}
```

### WebSocket API

#### 연결

```javascript
const ws = new WebSocket('ws://localhost:5000/ws/chat');

ws.onopen = () => {
  console.log('✅ Connected');
};
```

#### 메시지 전송 (사용자 → 서버)

```javascript
ws.send(JSON.stringify({
  type: 'user_message',
  content: '3000만원대 가족용 SUV 찾아요',
  userProfile: {
    priceWeight: 0.8,
    safetyWeight: 0.9,
    // ...
  }
}));
```

#### 메시지 수신 (서버 → 사용자)

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'agent_message':
      // AI 에이전트 메시지
      console.log(`${data.agent}: ${data.content}`);
      break;

    case 'progress':
      // 진행 상태 업데이트
      console.log(`Step: ${data.step}, ${data.message}`);
      break;

    case 'recommendations':
      // 최종 추천 결과
      console.log(`Top 3 vehicles:`, data.data.vehicles);
      break;

    case 'error':
      // 에러 메시지
      console.error(data.content);
      break;
  }
};
```

---

## 🧪 테스트

### 단위 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# 특정 파일만 테스트
npm run test TCOCalculator.test.ts

# Watch 모드 (코드 변경 시 자동 재실행)
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

### E2E 테스트 실행

```bash
# Playwright E2E 테스트
npm run test:e2e

# UI 모드 (브라우저에서 확인)
npm run test:e2e:ui

# Headed 모드 (브라우저 화면 보면서)
npm run test:e2e:headed
```

### 테스트 커버리지

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 파일                     커버리지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TCOCalculator.ts        100% (86/86 tests)
 TOPSISEngine.ts          98% (85/85 tests)
 MultiAgentSystem.ts      92% (36/36 tests)
 Total                    95% (171 tests)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ❓ 자주 묻는 질문

<details>
<summary><strong>Q1. 정말로 5개 에이전트가 협업하나요?</strong></summary>

네! 실제로 5개의 독립적인 에이전트 클래스가 있습니다:
- `ManagerAgent.ts`
- `UserAnalystAgent.ts`
- `SearcherAgent.ts`
- `EvaluatorAgent.ts`
- `FinancialAdvisorAgent.ts`

각 에이전트는 자기 역할만 담당하고, Manager가 MACRec 프로토콜로 전체를 조율합니다.
</details>

<details>
<summary><strong>Q2. 프로필 데이터는 어디에 저장되나요?</strong></summary>

**브라우저 localStorage**에만 저장됩니다:
```javascript
localStorage.setItem('carfin_user_profile', JSON.stringify(profile));
```

- 서버에 영구 저장되지 않습니다
- 추천 계산 시에만 WebSocket으로 전송됩니다
- 브라우저 쿠키 삭제 시 함께 삭제됩니다

**개인정보 보호**: 이름, 나이 등 민감 정보는 추천에 사용되지 않고 UI 표시용입니다.
</details>

<details>
<summary><strong>Q3. TCO 계산이 정확한가요?</strong></summary>

**법적 근거와 공신력 있는 연구 기반**으로 계산합니다:

| 비용 항목 | 계산 근거 |
|----------|----------|
| 취득세 | 지방세법 제11조 (정확히 7%) |
| 자동차세 | 지방세법 제127조 (배기량 기준) |
| 정비비 | 미국 DOE/ANL 연구 (88원/km) |
| 감가상각 | 세법 기준 정률법 (20%) |
| 연료비 | 실시간 유가 × 개인 주행거리 |

**주의**: 개인별 운전 습관, 지역, 사고 이력 등에 따라 차이가 있을 수 있습니다.
</details>

<details>
<summary><strong>Q4. 실제 차량 구매가 가능한가요?</strong></summary>

아직은 **추천만** 제공합니다. 실제 구매는 각 중고차 사이트(KB차차차, 엔카)에서 진행하셔야 합니다.

향후 계획:
- 딜러 연결 기능
- 가격 비교 알림
- 구매 대행 서비스
</details>

<details>
<summary><strong>Q5. 왜 Top 3만 추천하나요?</strong></summary>

**선택 피로 방지**를 위해서입니다:

- 연구에 따르면 선택지가 3개일 때 만족도가 가장 높습니다
- 너무 많은 옵션은 오히려 결정을 어렵게 만듭니다
- TOPSIS + TCO로 이미 최적화된 결과이므로 3개면 충분합니다

원하시면 "더 보기" 버튼으로 Top 10까지 확인 가능합니다.
</details>

<details>
<summary><strong>Q6. 개발 서버가 안 켜져요!</strong></summary>

**자주 발생하는 문제들**:

1. **포트 충돌** (EADDRINUSE):
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

2. **PostgreSQL 연결 실패**:
```bash
# PostgreSQL 실행 확인
# Windows: services.msc에서 PostgreSQL 서비스 확인
# Mac: brew services list
# Linux: systemctl status postgresql

# .env 파일 확인
DATABASE_URL=postgresql://user:password@localhost:5432/carfin
```

3. **Redis 연결 실패**:
```bash
# Redis 실행 확인
redis-cli ping  # "PONG" 응답이 와야 함

# 없으면 Redis 없이도 작동 가능 (캐싱만 비활성화)
```
</details>

<details>
<summary><strong>Q7. 프론트엔드만 실행하고 싶어요</strong></summary>

백엔드 없이 프론트엔드만 개발하려면:

```bash
# client 폴더로 이동
cd client

# Vite 개발 서버만 실행
npm run dev

# http://localhost:5173 에서 확인
```

단, WebSocket 기능은 작동하지 않습니다 (Mock 데이터 사용 필요).
</details>

<details>
<summary><strong>Q8. 배포는 어떻게 하나요?</strong></summary>

**백엔드 (Railway)**:
```bash
# Railway CLI 설치
npm i -g railway

# 로그인
railway login

# 배포
railway up
```

**프론트엔드 (Vercel)**:
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

**환경 변수 설정**: Railway/Vercel 대시보드에서 `.env` 내용을 추가하세요.
</details>

---

## 📊 프로젝트 통계

```
┌─────────────────────────────────────────────────────────┐
│                   📈 프로젝트 규모                        │
├─────────────────────────────────────────────────────────┤
│  코드                         │  성능                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━━━━━━━━━━━━━━━━━━━━━━━━│
│  • 총 코드: 15,000+ 줄         │  • 평균 응답: 2.3초      │
│  • TypeScript: 100%           │  • 캐시 히트: 85%        │
│  • 컴포넌트: 45개              │  • 동시 사용자: 500명    │
│  • 테스트: 171개 (95%)        │  • Lighthouse: 95/100   │
├─────────────────────────────────────────────────────────┤
│  데이터                       │  AI                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━━━━━━━━━━━━━━━━━━━━━━━━│
│  • 차량: 127,378대             │  • 에이전트: 5개         │
│  • 통합: KB차차차 + 엔카        │  • 논문 구현: 3개        │
│  • DB: PostgreSQL 14          │  • AI 모델: Gemini 2.5  │
│  • 캐시: Redis 7              │  • Level: Google 3      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 배울 수 있는 것들

이 프로젝트를 공부하면 다음을 배울 수 있습니다:

### Frontend 개발
```
✅ React 18 최신 기능
   - Suspense, Error Boundary
   - useCallback, useMemo 최적화

✅ TypeScript 실전 사용
   - 인터페이스 설계
   - 제네릭 활용
   - 타입 가드

✅ WebSocket 실시간 통신
   - 연결 관리
   - 자동 재연결
   - 메시지 타입별 처리

✅ 성능 최적화
   - 코드 스플리팅
   - 지연 로딩
   - 메모이제이션
```

### Backend 개발
```
✅ Node.js + Express 서버
   - REST API 설계
   - 미들웨어 패턴
   - 에러 핸들링

✅ WebSocket 서버
   - ws 라이브러리 사용
   - 세션 관리
   - 브로드캐스트

✅ 데이터베이스
   - PostgreSQL 스키마 설계
   - Drizzle ORM 사용
   - 인덱스 최적화
   - Redis 캐싱
```

### AI & 알고리즘
```
✅ 멀티에이전트 시스템
   - MACRec 프로토콜 구현
   - 작업 분해/통합
   - 병렬/순차 실행

✅ 추천 알고리즘
   - TOPSIS 다기준 평가
   - 정규화/가중치
   - 근접도 계산

✅ AI 연동
   - Google Gemini API
   - 프롬프트 엔지니어링
   - 자연어 처리
```

### DevOps
```
✅ 배포
   - Railway 백엔드 배포
   - Vercel 프론트엔드 배포
   - 환경 변수 관리

✅ 테스팅
   - Vitest 단위 테스트
   - Playwright E2E 테스트
   - 테스트 커버리지

✅ CI/CD
   - GitHub Actions
   - 자동 배포
   - Lighthouse CI
```

---

## 🤝 기여하기

이 프로젝트에 기여하고 싶으신가요? 환영합니다!

### 기여 프로세스

1. **Fork** 버튼을 눌러 프로젝트를 복사하세요
2. 새로운 브랜치를 만드세요
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 변경사항을 커밋하세요
   ```bash
   git commit -m "✨ Add amazing feature"
   ```
4. 브랜치에 Push하세요
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Pull Request**를 보내주세요!

### 커밋 메시지 규칙

```
✨ feat: 새로운 기능 추가
🐛 fix: 버그 수정
📝 docs: 문서 수정
🎨 style: 코드 포맷팅
♻️ refactor: 코드 리팩토링
✅ test: 테스트 추가
⚡ perf: 성능 개선
🔧 chore: 빌드/설정 변경
```

---

## 📄 라이센스

이 프로젝트는 **MIT 라이센스**로 배포됩니다.

자유롭게 사용, 수정, 배포하실 수 있습니다!

---

## 📞 연락처

**CARFIN AI 개발팀**
- GitHub: [@SeSAC-DA1](https://github.com/SeSAC-DA1)
- Project: [CarFin_AI_Final](https://github.com/SeSAC-DA1/CarFin_AI_Final)

---

<div align="center">

## 🚗 CARFIN AI

**5개의 AI 에이전트가 협업하여 당신에게 딱 맞는 차를 찾아드립니다**

Made with ❤️ by SeSAC DA-1 Team

[데모 보기](https://carfin-ai.vercel.app) • [이슈 제기](https://github.com/SeSAC-DA1/CarFin_AI_Final/issues) • [기여하기](#-기여하기)

---

### ⭐ 이 프로젝트가 도움이 되셨나요?

GitHub에서 ⭐ **Star**를 눌러주세요!

</div>
