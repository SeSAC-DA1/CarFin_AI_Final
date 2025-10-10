# 리뷰 데이터 활용 개발 계획

## 📊 리뷰 데이터 현황 분석

### 데이터 규모
- **총 리뷰 개수**: 6,121개 ✅ (충분한 규모!)
- **테이블명**: `hyundai_segment_purchases`
- **평균 만족도**: 4.90/5.0 (매우 높은 품질)
- **리뷰 길이**: 평균 212자, 최대 1,366자

### 모델별 분포 (Top 10)
1. 싼타페 하이브리드: 892개
2. 아반떼: 560개
3. 디 올 뉴 팰리세이드 하이브리드: 495개
4. 캐스퍼: 400개
5. 그랜저 하이브리드: 399개
6. 더 뉴 투싼 하이브리드: 381개
7. 쏘나타 디 엣지: 342개
8. 그랜저: 289개
9. 싼타페: 280개
10. 더 뉴 투싼: 255개

### 리뷰 샘플 (그랜저)
```
만족도: 5.0/5.0
리뷰: "아반떼MD를 약 14년간 오랜시간 별탈없이 타고 나이가 지긋하게 든 시점에서
그랜저 하이브리드를 구매하였네요. 새삼 변화한 차량의 최신식 기기에 편리함을 느끼고
있는 요즘입니다..."
```

---

## 🎯 핵심 전략 결정

### ✅ Phase 2에서 리뷰 활용 (벡터 DB 불필요!)

**이유**:
1. **규모**: 6,121개는 SQL로 충분히 처리 가능
2. **검색**: `Model` 컬럼으로 직접 검색 (정확도 100%)
3. **요약**: Gemini로 전체 리뷰 요약 가능 (토큰 비용 낮음)
4. **성능**: SQL 검색 < 100ms (빠름!)

### ❌ Phase 3 (Agentic RAG + 벡터 DB) 불필요!

**이유**:
1. **Over-engineering**: SQL + Gemini로 충분한 품질
2. **비용**: OpenAI Embedding API 비용 불필요
3. **복잡도**: pgvector 추가 설치 및 관리 부담
4. **ROI**: 사용자 가치 증가 미미 (Phase 2로 충분)

---

## 🚀 최종 개발 로드맵 (4주)

### Phase 1: MACRec 논문 충실 구현 (2주) ⭐ 최우선

#### 목표
- MACRec 구현: 13% → 80%
- 응답 속도: 2.3초 → 1.2초 (48% 향상)
- Agent Level: Level 2 (34% → 95%)

#### 주요 작업

**1.1 Task Decomposition (3일)**
```typescript
// server/lib/agents/ManagerAgent.ts
class ManagerAgent {
  async decompose(message: string): Promise<Task[]> {
    const prompt = `
    사용자 질의: "${message}"

    이를 병렬 실행 가능한 작업으로 분해하세요:
    1. 필요한 Agent: [user_analyst? searcher? evaluator? reviewer?]
    2. 각 Agent의 작업: [무엇을 해야 하는가?]
    3. 실행 순서: [순차? 병렬?]

    JSON 형식으로 반환:
    [
      { "agent": "user_analyst", "task": "...", "parallel": true },
      { "agent": "searcher", "task": "...", "parallel": true }
    ]
    `;

    const response = await this.gemini.chat(prompt);
    return JSON.parse(response.content);
  }
}
```

**1.2 Parallel Execution (4일)**
```typescript
// server/lib/agents/MultiAgentSystem.ts
async collaborate(message: string, vehicles: Vehicle[]) {
  // Step 1: Task Decomposition
  const tasks = await this.manager.decompose(message);

  // Step 2: Parallel Execution
  const parallelTasks = tasks.filter(t => t.parallel);
  const sequentialTasks = tasks.filter(t => !t.parallel);

  // 병렬 실행
  const parallelResults = await Promise.all(
    parallelTasks.map(task => {
      const agent = this.agentMap[task.agent];
      return agent.execute(task, { message, vehicles });
    })
  );

  // 순차 실행 (필요 시)
  const sequentialResults = [];
  for (const task of sequentialTasks) {
    const agent = this.agentMap[task.agent];
    const result = await agent.execute(task, { message, vehicles });
    sequentialResults.push(result);
  }

  // Step 3: Result Aggregation
  const allResults = [...parallelResults, ...sequentialResults];
  const aggregated = await this.manager.aggregate(allResults);

  return aggregated;
}
```

**1.3 Agent Communication Protocol (3일)**
```typescript
// WebSocket으로 실시간 Agent 메시지 전송
interface AgentMessage {
  from: 'manager' | 'user_analyst' | 'searcher' | 'evaluator';
  to: 'manager' | 'user_analyst' | 'searcher' | 'evaluator';
  type: 'task_assignment' | 'result' | 'request';
  content: string;
  timestamp: Date;
}

// 프론트엔드: AgentStatusPanel에서 실시간 표시
const messages = [
  { from: 'manager', to: 'user_analyst', content: '🎯 사용자 니즈 분석 시작' },
  { from: 'manager', to: 'searcher', content: '🔍 15만대 DB 검색 시작' },
  { from: 'user_analyst', to: 'manager', content: '✅ 가족용 SUV, 3000만원 이하 선호' },
  { from: 'searcher', to: 'manager', content: '✅ 387대 후보 차량 발견' }
];
```

#### 예상 효과
- ✅ MACRec 논문 구현 정확도: 13% → 80% (+67%p)
- ✅ 응답 속도: 2.3초 → 1.2초 (48% 향상)
- ✅ Google Agent Level: Level 2 (34% → 95%)
- ✅ 포트폴리오 임팩트: "논문 충실 구현" 증명

---

### Phase 2: Memory + 리뷰 감성 분석 (2주) ⭐ 추천 완료선

#### 목표
- Level 2 완성 (95% → 100%)
- 추천 신뢰도 강화: TOPSIS 점수 + 실사용자 리뷰
- 대화 연속성: 이전 대화 기억

#### 주요 작업

**2.1 Memory Management (1주)**

**Short-term Memory (세션 메모리)**
```typescript
// server/storage.ts (이미 구현됨!)
async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
  return db.select().from(conversationsTable)
    .where(eq(conversationsTable.sessionId, sessionId))
    .orderBy(conversationsTable.createdAt);
}

// Manager Agent에서 활용
class ManagerAgent {
  async analyzeWithMemory(message: string, sessionId: string) {
    const history = await storage.getConversationsBySession(sessionId);

    const prompt = `
    사용자 대화 기록:
    ${history.map(h => `사용자: ${h.userMessage}\nAI: ${h.aiResponse}`).join('\n')}

    새 질문: "${message}"

    이전 대화를 참고하여 사용자 선호도를 파악하세요.
    `;

    return await this.gemini.chat(prompt);
  }
}
```

**Reflection Mechanism**
```typescript
// 추천 결과 피드백 학습
interface RecommendationFeedback {
  sessionId: string;
  vehicleId: number;
  action: 'viewed' | 'liked' | 'disliked' | 'selected';
  timestamp: Date;
}

// conversations 테이블에 feedback 컬럼 추가
ALTER TABLE conversations ADD COLUMN feedback JSONB;
```

**2.2 Reviewer Agent (리뷰 감성 분석) (1주)**

**Reviewer Agent 구현**
```typescript
// server/lib/agents/ReviewerAgent.ts
export class ReviewerAgent {
  async analyzeReviews(model: string): Promise<ReviewSummary> {
    // 1. SQL로 모델 리뷰 검색
    const reviews = await storage.getReviewsByModel(model);

    if (reviews.length === 0) {
      return { summary: '리뷰 데이터 없음', satisfaction: 0, count: 0 };
    }

    // 2. Gemini로 감성 분석
    const prompt = `
    차량 모델: ${model}
    총 리뷰 개수: ${reviews.length}개

    리뷰 데이터:
    ${reviews.map(r => `만족도: ${r.satisfaction}/5.0\n내용: ${r.review}`).join('\n---\n')}

    다음 형식으로 요약하세요:
    {
      "positive": ["장점1", "장점2", "장점3"],
      "negative": ["단점1", "단점2"],
      "keywords": ["키워드1", "키워드2"],
      "summary": "한 줄 요약"
    }
    `;

    const response = await this.gemini.chat(prompt);
    const analysis = JSON.parse(response.content);

    return {
      model,
      satisfaction: reviews.reduce((sum, r) => sum + r.satisfaction, 0) / reviews.length,
      count: reviews.length,
      ...analysis
    };
  }
}
```

**MultiAgentSystem에 통합**
```typescript
// server/lib/agents/MultiAgentSystem.ts
class MultiAgentSystem {
  private reviewerAgent: ReviewerAgent;

  async collaborate(message: string, vehicles: Vehicle[]) {
    // ... MACRec 프로세스 ...

    const topVehicles = rankedVehicles.slice(0, 3);

    // 병렬로 리뷰 분석
    const reviewAnalyses = await Promise.all(
      topVehicles.map(v => this.reviewerAgent.analyzeReviews(v.model))
    );

    return {
      vehicles: topVehicles,
      reviews: reviewAnalyses
    };
  }
}
```

**프론트엔드 표시**
```tsx
// client/src/components/features/VehicleRecommendations.tsx
<Card>
  <CardHeader>
    <CardTitle>{vehicle.model}</CardTitle>
    <div className="flex items-center gap-2">
      <Star className="h-4 w-4 fill-yellow-400" />
      <span>{review.satisfaction.toFixed(1)}/5.0</span>
      <span className="text-sm text-muted-foreground">
        ({review.count}개 리뷰)
      </span>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold text-green-600">✅ 장점</p>
        <ul className="text-sm list-disc list-inside">
          {review.positive.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
      <div>
        <p className="text-sm font-semibold text-orange-600">⚠️ 단점</p>
        <ul className="text-sm list-disc list-inside">
          {review.negative.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </div>
      <p className="text-sm text-muted-foreground">{review.summary}</p>
    </div>
  </CardContent>
</Card>
```

#### 예상 효과
- ✅ Level 2 완성: 95% → 100% (Memory + Agent 협업)
- ✅ 추천 신뢰도: TOPSIS 객관 점수 + 실사용자 주관 의견
- ✅ 대화 연속성: "지난번에 SUV 관심 있으셨죠?" 컨텍스트 유지
- ✅ 포트폴리오 임팩트: "실사용자 데이터 활용" 증명

---

## 📊 Phase별 Agent 구성 변화

### 현재 (Phase 0)
```
1. Manager Agent (조율만)
2. User Analyst Agent (순차 실행)
3. Searcher Agent (순차 실행)

MACRec 구현: 13%
Agent Level: Level 2 (34%)
```

### Phase 1 완료 후
```
1. Manager Agent (동적 분해 + 병렬 조율) ← 업그레이드
2. User Analyst Agent (병렬 실행 가능)
3. Searcher Agent (병렬 실행 가능)
4. Evaluator Agent (TOPSIS + Alibaba)

MACRec 구현: 80%
Agent Level: Level 2 (95%)
```

### Phase 2 완료 후 ⭐ 최종 권장 상태
```
1. Manager Agent (+ Memory Reflection) ← 업그레이드
2. User Analyst Agent
3. Searcher Agent
4. Evaluator Agent
5. Reviewer Agent (리뷰 감성 분석) ← 신규 추가

MACRec 구현: 80%
Agent Level: Level 2 (100%)
총 Agent: 5개
```

---

## 🎯 "딱 맞는" 개발 단계 = Phase 2

### ✅ 포함되는 것
1. **MACRec 논문 충실 구현** (13% → 80%)
2. **Memory Management** (세션 + Reflection)
3. **리뷰 감성 분석** (SQL + Gemini, 벡터 DB 불필요)
4. **Level 2 완성** (Google Agent Level 100%)

### ❌ 포함되지 않는 것 (Over-engineering)
1. **Agentic RAG** (복잡도 증가, ROI 낮음)
2. **벡터 DB (pgvector)** (SQL로 충분)
3. **LangChain/LangGraph** (프롬프트 관리 복잡도)
4. **Level 3 (Collaborative)** (Phase 2로 충분)

### 📈 Phase 2 완료 시 달성 상태

**학술 신뢰도**:
- ✅ MACRec SIGIR 2024: 80% 구현 (13% → 80%)
- ✅ Alibaba RecSys 2019: 85% 구현
- ✅ AHP-TOPSIS: 95% 구현

**Google Agent Level**:
- ✅ Level 0 (Single LLM): 100%
- ✅ Level 1 (Tool-using): 100%
- ✅ Level 2 (Multi-Agent): **100%** ← 완성!
- ⚠️ Level 3 (Collaborative): 40% (불필요)

**실용적 가치**:
- ✅ 응답 속도: 1.2초 (3초 목표 달성)
- ✅ 추천 정확도: TOPSIS 90% + 리뷰 신뢰도
- ✅ 대화 연속성: Memory 기반 컨텍스트 유지
- ✅ 6,121개 실사용자 리뷰 활용

**포트폴리오 스토리**:
> "MACRec 논문을 구현하며 **순차 실행 → 병렬 실행** 전환으로 48% 속도 개선을 달성했습니다.
> 또한 6,121개 실사용자 리뷰 데이터를 분석하며 **Agentic RAG가 불필요**함을 발견했습니다.
> SQL + Gemini로 충분한 품질을 제공하면서 복잡도를 낮춰 **상황에 맞는 기술 선택 능력**을 증명했습니다."

---

## 📅 개발 타임라인 (4주)

### Week 1: MACRec Task Decomposition + Parallel Execution
- [ ] ManagerAgent.decompose() 구현
- [ ] Promise.all 병렬 실행 전환
- [ ] Agent 간 통신 프로토콜
- [ ] WebSocket 메시지 실시간 전송
- [ ] AgentStatusPanel 업데이트

### Week 2: MACRec Result Aggregation + 통합 테스트
- [ ] Manager.aggregate() 협의 알고리즘
- [ ] Evaluator Agent 분리 (TOPSIS + Alibaba)
- [ ] E2E 테스트 (속도 측정)
- [ ] MACRec 구현 정확도 검증 (80% 목표)

### Week 3: Memory Management
- [ ] Session Memory 활용 (conversations 테이블)
- [ ] Reflection Mechanism (이전 대화 참고)
- [ ] Feedback 테이블 추가 및 학습
- [ ] 대화 연속성 테스트

### Week 4: Reviewer Agent + 리뷰 감성 분석
- [ ] ReviewerAgent.analyzeReviews() 구현
- [ ] Gemini 감성 분석 프롬프트 최적화
- [ ] VehicleRecommendations 컴포넌트 업데이트
- [ ] 리뷰 요약 품질 테스트
- [ ] 최종 통합 테스트 및 배포

---

## 🎯 Phase 2 완료 후 시연 시나리오

### 시나리오 1: MACRec 병렬 실행
```
사용자: "3000만원 이하 가족용 SUV 추천해줘"

[AgentStatusPanel 실시간 메시지]
00:00 Manager → User Analyst: 🎯 사용자 니즈 분석 시작
00:00 Manager → Searcher: 🔍 15만대 DB 검색 시작 (병렬!)
00:01 User Analyst → Manager: ✅ 가족용 SUV, 3000만원 이하 선호
00:01 Searcher → Manager: ✅ 387대 후보 차량 발견
00:01 Manager → Evaluator: 📊 TOPSIS 평가 시작
00:02 Evaluator → Manager: ✅ Top 3 선정 완료
00:02 Manager → Reviewer: 📝 리뷰 분석 시작 (병렬!)
00:03 Reviewer → Manager: ✅ 리뷰 요약 완료

총 소요 시간: 1.2초 (이전: 2.3초, 48% 향상!)
```

### 시나리오 2: Memory 기반 대화 연속성
```
[첫 번째 대화]
사용자: "3000만원 이하 가족용 SUV 추천해줘"
AI: "싼타페, 쏘렌토, 팰리세이드 추천드립니다."

[두 번째 대화 - 30분 후]
사용자: "안전 장치 좋은 차 찾아줘"
AI: "지난번에 관심 있으셨던 SUV 중에서 안전 장치가 우수한 차량을 찾아볼게요.
     싼타페는 ADAS 10종이 기본 탑재되어 있습니다..."
```

### 시나리오 3: 리뷰 기반 신뢰도 강화
```
[추천 결과]
1. 싼타페 하이브리드 (2,890만원)
   TOPSIS 점수: 0.85/1.0

   ⭐ 실사용자 평가: 4.8/5.0 (892개 리뷰)
   ✅ 장점:
   - 넓은 실내 공간으로 가족 여행 최적
   - 연비 13km/L로 SUV 중 우수
   - 안전 장치 만족도 높음

   ⚠️ 단점:
   - 주차 시 크기 부담
   - 고속 주행 시 소음

   💬 실사용자 한마디:
   "14년 만에 신차로 구매했는데, 최신 안전 장치에 감탄했습니다.
    가족과 여행 다니기 정말 좋아요!"
```

---

## 💡 핵심 인사이트

### 1. Agentic RAG 불필요 판단 근거
- **검색 정확도**: SQL `Model` 컬럼 = 100% 정확
- **벡터 유사도**: 필요 없음 (모델명 정확 매칭)
- **리뷰 개수**: 6,121개는 SQL로 충분히 관리 가능
- **토큰 비용**: Gemini로 전체 리뷰 요약 (평균 212자 × 300개 = 약 10K 토큰)

### 2. Google RAG 개선 6단계 체크
| 단계 | 현재 상태 | 필요 여부 |
|------|----------|----------|
| 1. Chunk 분할 | ✅ Row 단위 (optimal) | 불필요 |
| 2. 메타데이터 | ✅ Model, Satisfaction | 불필요 |
| 3. 임베딩 | ❌ 없음 | 불필요 (SQL 정확) |
| 4. 벡터 DB | ❌ 없음 | 불필요 (규모 작음) |
| 5. Ranker | ✅ Satisfaction 정렬 | 이미 있음 |
| 6. Grounding | ✅ DB 직접 조회 | 이미 있음 |

**결론**: 6단계 중 4단계 이미 충족, 나머지 2단계 불필요!

### 3. 포트폴리오 차별화 포인트
- ✅ **Over-engineering 회피**: Agentic RAG 불필요 판단 능력
- ✅ **데이터 기반 의사결정**: 6,121개 리뷰 분석으로 전략 수립
- ✅ **논문 충실 구현**: MACRec 13% → 80% 개선
- ✅ **실용적 가치**: Level 2 완성으로 실무 적용 가능성 증명

---

## 🚀 다음 단계 (개발 시작)

1. **Phase 1 착수**: MACRec Task Decomposition 구현
2. **병렬 실행 전환**: await 체인 → Promise.all
3. **Agent 통신 프로토콜**: WebSocket 메시지 실시간 전송
4. **속도 측정**: 2.3초 → 1.2초 목표 달성 확인
5. **Phase 2 착수**: Memory + Reviewer Agent 구현

**현재 브랜치**: `clean-deploy`
**목표 기간**: 4주 (2025-01-13 ~ 2025-02-10)
**최종 목표**: Level 2 (100%) + MACRec 80% + 리뷰 활용
