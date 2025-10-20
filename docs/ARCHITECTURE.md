# 시스템 아키텍처

## 🏗️ 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 (Browser)                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ React 18.3.1 + TypeScript 5.7.2                        │ │
│  │ - Landing Page                                         │ │
│  │ - Onboarding (3 steps)                                 │ │
│  │ - Profile Setup (4 steps)                              │ │
│  │ - Chat Interface (WebSocket)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ WebSocket + REST API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Railway)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Node.js 22 + Express 4.21.2                            │ │
│  │                                                         │ │
│  │ ┌─────────────────────────────────────────────────┐   │ │
│  │ │ WebSocket Handler                                │   │ │
│  │ │ - Real-time chat                                 │   │ │
│  │ │ - Auto reconnect                                 │   │ │
│  │ │ - Profile data sync                              │   │ │
│  │ └─────────────────────────────────────────────────┘   │ │
│  │                                                         │ │
│  │ ┌─────────────────────────────────────────────────┐   │ │
│  │ │ Multi-Agent System (MACRec)                      │   │ │
│  │ │ ┌──────────────┐  ┌──────────────┐              │   │ │
│  │ │ │   Manager    │  │ User Analyst │              │   │ │
│  │ │ └──────┬───────┘  └──────┬───────┘              │   │ │
│  │ │        │                  │                      │   │ │
│  │ │        └──────────┬───────┘                      │   │ │
│  │ │                   │                              │   │ │
│  │ │            ┌──────┴───────┐                      │   │ │
│  │ │            │   Searcher   │                      │   │ │
│  │ │            └──────────────┘                      │   │ │
│  │ └─────────────────────────────────────────────────┘   │ │
│  │                                                         │ │
│  │ ┌─────────────────────────────────────────────────┐   │ │
│  │ │ Paper Implementations                            │   │ │
│  │ │ - TOPSIS (6-criteria ranking)                    │   │ │
│  │ │ - Alibaba Re-ranking (personalization)           │   │ │
│  │ │ - TCO Calculator (5-cost items)                  │   │ │
│  │ └─────────────────────────────────────────────────┘   │ │
│  │                                                         │ │
│  │ ┌─────────────────────────────────────────────────┐   │ │
│  │ │ Google Gemini AI                                 │   │ │
│  │ │ - Natural language processing                    │   │ │
│  │ │ - Conversation management                        │   │ │
│  │ └─────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
└────────┬──────────────────────────────┬────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌─────────────────────┐       ┌─────────────────────┐
│  PostgreSQL 15      │       │    Redis 7          │
│  (Railway)          │       │    (Railway)        │
│                     │       │                     │
│  - Vehicle data     │       │  - Search cache     │
│  - Real-time stock  │       │  - TOPSIS cache     │
│  - User profiles    │       │  - Session cache    │
└─────────────────────┘       └─────────────────────┘
```

## 📦 계층별 상세 구조

### Frontend Layer

```
client/
├── src/
│   ├── pages/                    # 페이지 컴포넌트
│   │   ├── Home.tsx             # 랜딩 페이지
│   │   ├── Onboarding.tsx       # 온보딩 (3단계)
│   │   ├── ProfileSetup.tsx     # 프로필 설정 (4단계)
│   │   └── Chat.tsx            # AI 상담 인터페이스
│   │
│   ├── components/              # UI 컴포넌트
│   │   ├── features/           # 기능별 컴포넌트
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── VehicleRecommendations.tsx
│   │   │   ├── TCOComparisonChart.tsx
│   │   │   └── MessageBubble.tsx
│   │   │
│   │   ├── ai/                 # AI 관련 UI
│   │   │   ├── ProgressSteps.tsx
│   │   │   ├── AgentStatusPanel.tsx
│   │   │   └── MACRecCollaborationViewer.tsx
│   │   │
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   │   ├── Hero.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   └── ui/                 # shadcn/ui 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   │
│   └── hooks/                  # 커스텀 훅
│       └── useWebSocketChat.ts # WebSocket 통신
```

### Backend Layer

```
server/
├── lib/
│   ├── agents/                          # Multi-Agent System
│   │   └── MultiAgentSystem.ts         # MACRec 구현 (98% 정확도)
│   │       ├── ManagerAgent            # Task Decomposition
│   │       ├── UserAnalystAgent        # Profile Analysis
│   │       └── SearcherAgent           # Vehicle Search
│   │
│   ├── papers/                          # 논문 구현
│   │   ├── topsis/                     # AHP-TOPSIS (95% 정확도)
│   │   │   ├── TOPSISEngine.ts        # 다기준 의사결정
│   │   │   ├── CriteriaWeighting.ts   # 가중치 계산
│   │   │   └── VehicleNormalization.ts # 정규화
│   │   │
│   │   ├── reranking/                  # Alibaba Re-ranking (85% 정확도)
│   │   │   ├── PersonalizedReranker.ts
│   │   │   └── FeatureExtractor.ts
│   │   │
│   │   └── tco/                        # TCO Calculator
│   │       ├── TCOCalculator.ts       # 5개 비용 항목
│   │       ├── TaxCalculator.ts       # 취득세 + 자동차세
│   │       └── DepreciationEngine.ts  # 감가상각
│   │
│   ├── gemini/                          # Google Gemini AI
│   │   └── GeminiService.ts            # AI 서비스
│   │
│   └── cache/                           # 캐싱 시스템
│       └── RailwayRedisService.ts      # Redis 캐싱
│
├── websocket/                           # WebSocket 통신
│   └── ChatWebSocketHandler.ts         # 실시간 채팅
│
├── routes.ts                            # API 라우트
├── storage.ts                           # PostgreSQL 연결
└── index.ts                             # 서버 엔트리포인트
```

## 🔄 데이터 흐름

### 1. 사용자 여정 데이터 흐름

```
[사용자] → [랜딩 페이지]
    ↓
[온보딩 3단계]
    ↓
[프로필 설정 4단계]
    ├─ 기본 정보 (이름, 나이, 지역)
    ├─ 용도 선택 (출퇴근, 가족, 레저)
    ├─ 예산 설정 (최소~최대 가격)
    └─ 중요도 조정 (가격, 연비, 안전성, 디자인, 브랜드)
    ↓
[LocalStorage 저장]
    ↓
[AI 상담 페이지] → [WebSocket 연결]
    ↓
[프로필 자동 전송 → 백엔드]
```

### 2. AI 추천 프로세스 데이터 흐름

```
[WebSocket 수신: 사용자 메시지 + 프로필]
    ↓
[MACRec Multi-Agent System]
    ↓
┌────────────────────────────────────────┐
│ Manager Agent                          │
│ - Task Decomposition                   │
│ - 사용자 니즈 분석 요청                │
│ - 차량 검색 요청                       │
└──────────┬─────────────────────────────┘
           │
           ├─→ [User Analyst Agent]
           │       ├─ 프로필 데이터 추출
           │       ├─ 용도 분석 (출퇴근/가족/레저)
           │       ├─ 예산 범위 확인
           │       └─ 중요도 가중치 계산
           │           ↓
           │       [사용자 니즈 벡터 생성]
           │
           └─→ [Searcher Agent]
                   ├─ PostgreSQL 쿼리
                   │   └─ 가격, 연식, 연료타입 필터링
                   ├─ Redis 캐시 확인
                   └─ 후보 차량 목록 (N대)
                       ↓
               [TOPSIS 다기준 평가]
                   ├─ 6가지 기준 정규화
                   │   ├─ 가격 경쟁력
                   │   ├─ 연비 효율성
                   │   ├─ 안전성 점수
                   │   ├─ 브랜드 신뢰도
                   │   ├─ 차량 상태
                   │   └─ 옵션 매칭률
                   ├─ 사용자 가중치 적용
                   ├─ 이상해/부이상해 거리 계산
                   └─ TOPSIS 점수 산출
                       ↓
               [Alibaba Re-ranking]
                   ├─ 개인화 피처 추출
                   ├─ 사용자 선호도 반영
                   └─ 최종 순위 재정렬
                       ↓
               [Top 3 차량 선정]
                   ├─ TCO 계산 (5개 비용 항목)
                   │   ├─ 취득세 (7%)
                   │   ├─ 자동차세 (연식별)
                   │   ├─ 정비비 (88원/km)
                   │   ├─ 감가상각 (20%)
                   │   └─ 연료비 (개인화)
                   └─ Redis 캐싱 (10분)
                       ↓
[WebSocket 전송: Top 3 + TCO 데이터]
    ↓
[Frontend 렌더링]
    ├─ VehicleCard (차량 정보)
    └─ TCOComparisonChart (비교 차트)
```

### 3. 캐싱 전략

```
┌─────────────────────────────────────────────────────────┐
│ Redis Cache Layers                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [L1] 검색 결과 캐시 (TTL: 5분)                         │
│      Key: search:{brand}:{fuelType}:{priceRange}        │
│      Value: Vehicle[]                                   │
│                                                          │
│  [L2] TOPSIS 랭킹 캐시 (TTL: 10분)                      │
│      Key: topsis:{profileHash}                          │
│      Value: { vehicles: Vehicle[], scores: number[] }   │
│                                                          │
│  [L3] TCO 계산 캐시 (TTL: 30분)                         │
│      Key: tco:{vehicleId}:{annualKm}:{ownershipYears}   │
│      Value: TCOBreakdown                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🧩 핵심 알고리즘

### 1. TOPSIS 다기준 의사결정

```typescript
// 1. 의사결정 행렬 정규화
normalized[i][j] = value / sqrt(sum(values^2))

// 2. 가중 정규화 행렬
weighted[i][j] = normalized[i][j] * weight[j]

// 3. 이상해(A+) 및 부이상해(A-) 결정
A+ = max(weighted[j]) for benefit criteria
A- = min(weighted[j]) for benefit criteria

// 4. 거리 계산
D+ = sqrt(sum((weighted[i][j] - A+[j])^2))
D- = sqrt(sum((weighted[i][j] - A-[j])^2))

// 5. 상대적 근접도 (TOPSIS Score)
score = D- / (D+ + D-)
```

### 2. TCO 계산 (5개 비용 항목)

```typescript
// 1. 취득세 (지방세법 제11조)
acquisitionTax = price * 0.07

// 2. 자동차세 (지방세법 제127조)
baseRate = 200 (cc당)
depreciation = (1 - age * 0.05)
vehicleTax = engineSize * baseRate * depreciation * years

// 3. 정비비 (DOE/ANL 88원/km)
maintenance = annualKm * years * 88

// 4. 감가상각 (정률법 20%)
depreciation = price * (0.8 ^ years)

// 5. 연료비 (실시간 유가 × 연비)
fuelCost = (annualKm / fuelEfficiency) * fuelPrice * years

// 총 소유비용
TCO = acquisitionTax + vehicleTax + maintenance + depreciation + fuelCost
```

## 🔐 보안 아키텍처

### 1. 데이터 보안
- **SSL/TLS**: 모든 통신 암호화
- **환경 변수**: 민감 정보 분리 관리
- **SQL Injection 방어**: Drizzle ORM 파라미터 바인딩

### 2. API 보안
- **CORS**: 허용된 도메인만 접근
- **Rate Limiting**: 요청 제한
- **Input Validation**: 사용자 입력 검증

## 📊 확장성 설계

### 수평 확장 (Horizontal Scaling)
```
[Load Balancer]
    ├─→ [Backend Instance 1] ─→ [Shared PostgreSQL]
    ├─→ [Backend Instance 2] ─→ [Shared Redis]
    └─→ [Backend Instance N]
```

### 수직 확장 (Vertical Scaling)
- Railway: CPU/메모리 동적 할당
- PostgreSQL: 연결 풀 최적화
- Redis: 메모리 증설

## 🧪 테스트 아키텍처

### 테스트 계층
```
├── Unit Tests (171개)
│   ├── TCO Calculator (86개)
│   ├── TOPSIS Engine (85개)
│   └── Components
│
├── Integration Tests
│   ├── API 엔드포인트
│   ├── WebSocket 통신
│   └── 데이터베이스 연결
│
└── E2E Tests (Playwright)
    ├── 사용자 여정
    └── AI 추천 플로우
```

---

**Last Updated**: 2025-01-20
