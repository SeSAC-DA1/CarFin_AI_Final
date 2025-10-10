# 🚀 AI Agent 고도화 로드맵 (Reactive → Cognitive)

## 📋 현황 분석

### 현재 AI Agent 점수: **77.5/100 (Reactive Agent)**

| 기준 | 현재 점수 | 한계점 | 목표 점수 |
|------|----------|--------|----------|
| **자율성** (Autonomy) | 85/100 | 사용자 지시 따름 | 95/100 |
| **목표 지향** (Goal-oriented) | 90/100 | ✅ 우수 | 90/100 |
| **적응성** (Adaptability) | 75/100 | 피드백 반영 부족 | 90/100 |
| **추론 능력** (Reasoning) | 80/100 | 단순 점수 계산 | 90/100 |
| **도구 사용** (Tool Use) | 95/100 | ✅ 우수 | 95/100 |
| **메모리** (Memory) | **40/100** | 🔴 세션 기반만 | **85/100** |

**문제점**:
1. 🔴 **메모리 40점** - 세션 종료 시 모든 대화 기록 소실
2. ⚠️ **적응성 75점** - 사용자 피드백 학습 부재
3. ⚠️ **추론능력 80점** - Agent 간 협업/토론 없음

---

## 🎯 목표: **Cognitive Agent 90.8/100 달성**

### Phase 1-3 완료 시 예상 점수

| 기준 | Phase 1 후 | Phase 2 후 | Phase 3 후 |
|------|-----------|-----------|-----------|
| 자율성 | 85 | 85 | **95** ⬆️ |
| 목표 지향 | 90 | 90 | 90 |
| 적응성 | **82** ⬆️ | **90** ⬆️ | 90 |
| 추론 능력 | 80 | **90** ⬆️ | 90 |
| 도구 사용 | 95 | 95 | 95 |
| 메모리 | **85** ⬆️ | 85 | 85 |
| **총점** | **85.8** | **89.2** | **90.8** |

**Agent 등급**: Reactive Agent → **Cognitive Agent** ✅

---

## 📅 Phase 1: Memory & Learning (1주 - Quick Win)

### 🎯 목표
- Memory: 40 → 85점 (+45)
- Adaptability: 75 → 82점 (+7)
- **총점: 77.5 → 85.8점** (+8.3)

### 🛠️ 구현 내용

#### 1.1 대화 기록 영구 저장 (2일)

**데이터베이스 스키마**:
```sql
-- 대화 기록 테이블
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  sessionId VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  sender VARCHAR(20) NOT NULL,  -- 'user' or 'ai'
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB,  -- { vehicleIds: [], feedback: 'positive', action: 'view_detail' }
  INDEX idx_userId (userId),
  INDEX idx_sessionId (sessionId)
);

-- 사용자 선호도 테이블
CREATE TABLE user_preferences (
  userId VARCHAR(50) PRIMARY KEY,
  rejectedBrands VARCHAR(50)[] DEFAULT '{}',      -- ['쌍용', '르노']
  rejectedModels VARCHAR(50)[] DEFAULT '{}',      -- ['티볼리', 'QM6']
  likedFeatures VARCHAR(50)[] DEFAULT '{}',       -- ['썬루프', '열선시트', '후방카메라']
  budgetHistory JSONB DEFAULT '[]',               -- [{ date: '2025-01-01', min: 2000, max: 3000 }]
  importanceWeights JSONB,                        -- { price: 8, fuel: 7, safety: 9, design: 5, brand: 6 }
  lastUpdated TIMESTAMP DEFAULT NOW()
);
```

**백엔드 구현**:
```typescript
// server/lib/memory/ConversationManager.ts
export class ConversationManager {
  async saveMessage(
    userId: string,
    sessionId: string,
    message: Message
  ): Promise<void> {
    await db.query(`
      INSERT INTO conversations (userId, sessionId, message, sender, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, sessionId, message.content, message.sender, message.metadata]);
  }

  async getConversationHistory(
    userId: string,
    limit: number = 10
  ): Promise<Message[]> {
    const result = await db.query(`
      SELECT * FROM conversations
      WHERE userId = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows;
  }

  async getContextWindow(
    userId: string,
    sessionId: string
  ): Promise<string> {
    // 현재 세션의 최근 5개 대화만 가져와서 컨텍스트 생성
    const messages = await db.query(`
      SELECT message, sender FROM conversations
      WHERE userId = $1 AND sessionId = $2
      ORDER BY timestamp DESC
      LIMIT 5
    `, [userId, sessionId]);

    return messages.rows
      .reverse()
      .map(m => `${m.sender}: ${m.message}`)
      .join('\n');
  }
}
```

#### 1.2 선호도 학습 시스템 (3일)

**피드백 수집**:
```typescript
// server/lib/learning/PreferenceLearner.ts
export class PreferenceLearner {
  async learnFromFeedback(
    userId: string,
    feedback: UserFeedback
  ): Promise<UpdatedPreferences> {
    const current = await this.getCurrentPreferences(userId);

    switch (feedback.type) {
      case 'reject_brand':
        // "현대차는 별로예요" → rejectedBrands에 추가
        await db.query(`
          UPDATE user_preferences
          SET rejectedBrands = array_append(rejectedBrands, $1),
              lastUpdated = NOW()
          WHERE userId = $2
        `, [feedback.brand, userId]);
        break;

      case 'budget_too_high':
        // "너무 비싸요" → budgetMax를 10% 감소
        const newMax = Math.floor(current.budgetMax * 0.9);
        await this.updateBudgetRange(userId, current.budgetMin, newMax);
        break;

      case 'like_feature':
        // "썬루프 좋네요" → likedFeatures에 추가
        await db.query(`
          UPDATE user_preferences
          SET likedFeatures = array_append(likedFeatures, $1)
          WHERE userId = $2
        `, [feedback.feature, userId]);
        break;

      case 'adjust_importance':
        // "연비가 더 중요해요" → fuelEfficiency 가중치 +2
        const newWeights = { ...current.importanceWeights };
        newWeights[feedback.criterion] = Math.min(10, newWeights[feedback.criterion] + 2);
        await this.updateImportanceWeights(userId, newWeights);
        break;
    }

    return this.getCurrentPreferences(userId);
  }

  async applyLearning(
    userId: string,
    candidates: Vehicle[]
  ): Promise<Vehicle[]> {
    const prefs = await this.getCurrentPreferences(userId);

    // 학습된 선호도 적용
    let filtered = candidates.filter(v => {
      // 거부한 브랜드 제외
      if (prefs.rejectedBrands.includes(v.brand)) return false;

      // 좋아하는 옵션이 있는 차량 우선
      const hasLikedFeatures = v.options.some(opt =>
        prefs.likedFeatures.includes(opt)
      );
      if (hasLikedFeatures) v.score += 5;  // 보너스 점수

      return true;
    });

    return filtered;
  }
}
```

**프론트엔드 피드백 UI**:
```typescript
// client/src/components/ai/FeedbackButtons.tsx
export const FeedbackButtons = ({ vehicle }: Props) => {
  const { learnPreference } = usePreferenceLearning();

  return (
    <div className="feedback-buttons">
      <button onClick={() => learnPreference('like', vehicle)}>
        👍 좋아요
      </button>
      <button onClick={() => learnPreference('reject_brand', vehicle)}>
        🚫 이 브랜드 제외
      </button>
      <button onClick={() => learnPreference('budget_too_high', vehicle)}>
        💰 너무 비싸요
      </button>
    </div>
  );
};
```

#### 1.3 컨텍스트 인식 대화 (2일)

**Gemini API에 대화 기록 포함**:
```typescript
// server/lib/agents/MultiAgentSystem.ts
async collaborate(message: string, userId: string, sessionId: string) {
  // 대화 기록 가져오기
  const conversationContext = await this.conversationManager.getContextWindow(
    userId,
    sessionId
  );

  // 선호도 가져오기
  const preferences = await this.preferenceLearner.getCurrentPreferences(userId);

  // Gemini에 컨텍스트 포함
  const managerPrompt = `
당신은 차량 추천 시스템의 Manager Agent입니다.

[대화 기록]
${conversationContext}

[학습된 사용자 선호도]
- 거부한 브랜드: ${preferences.rejectedBrands.join(', ')}
- 선호 옵션: ${preferences.likedFeatures.join(', ')}
- 예산 변화: ${preferences.budgetHistory.slice(-3).map(b => `${b.max}만원`).join(' → ')}

[현재 요청]
사용자: ${message}

위 정보를 바탕으로 사용자 니즈를 분석하세요.
`;

  const response = await this.geminiService.chat(managerPrompt);

  // 대화 저장
  await this.conversationManager.saveMessage(userId, sessionId, {
    content: message,
    sender: 'user',
    metadata: { preferences }
  });

  return response;
}
```

### 📊 Phase 1 성과

**Before**:
```
사용자: "3000만원대 SUV 찾아줘"
AI: [3대 추천]

사용자: "너무 비싸"
AI: [동일한 3대 다시 추천] ❌
```

**After**:
```
사용자: "3000만원대 SUV 찾아줘"
AI: [3대 추천]

사용자: "너무 비싸"
AI: "예산을 2,500만원으로 조정했습니다 ✅"
    "또한 이전에 '현대차 별로'라고 하셨으니 현대 제외했습니다 ✅"
    [새로운 3대 추천]
```

**메트릭 개선**:
- Memory: 40 → **85점** (+45)
- Adaptability: 75 → **82점** (+7)
- 사용자 만족도: 70% → **85%** (+15%p)

---

## 📅 Phase 2: Agent Deliberation (2주)

### 🎯 목표
- Reasoning: 80 → 90점 (+10)
- Adaptability: 82 → 90점 (+8)
- **총점: 85.8 → 89.2점** (+3.4)

### 🛠️ 구현 내용

#### 2.1 Agent 토론 프로토콜 (5일)

**3 Rounds Deliberation**:
```typescript
// server/lib/deliberation/DeliberationEngine.ts
export class DeliberationEngine {
  async* deliberate(
    message: string,
    candidates: Vehicle[],
    userProfile: ProfileData
  ): AsyncGenerator<DeliberationStep> {
    // Round 1: 각 Agent의 초기 의견
    yield { phase: 'round1_start', timestamp: Date.now() };

    const [userAnalystOpinion, searcherOpinion] = await Promise.all([
      this.userAnalyst.formOpinion(message, userProfile),
      this.searcher.formOpinion(candidates, userProfile)
    ]);

    yield {
      phase: 'round1_complete',
      opinions: [
        {
          agent: 'User Analyst',
          recommendation: userAnalystOpinion.topVehicles,
          reasoning: userAnalystOpinion.reasoning,
          confidence: userAnalystOpinion.confidence,
          concerns: userAnalystOpinion.concerns
        },
        {
          agent: 'Searcher',
          recommendation: searcherOpinion.topVehicles,
          reasoning: searcherOpinion.reasoning,
          confidence: searcherOpinion.confidence,
          concerns: searcherOpinion.concerns
        }
      ]
    };

    // Round 2: 충돌 감지 및 해결
    const conflicts = this.detectConflicts(userAnalystOpinion, searcherOpinion);

    if (conflicts.length > 0) {
      yield { phase: 'conflict_detected', conflicts };

      // Manager가 중재
      const resolution = await this.manager.resolveConflicts(conflicts, userProfile);
      yield { phase: 'manager_resolution', resolution };

      // 대안 생성
      const alternatives = await this.generateAlternatives(resolution, candidates);
      yield { phase: 'alternatives_generated', alternatives };

      // 사용자에게 선택 요청
      yield { phase: 'user_choice_required', alternatives };
    }

    // Round 3: 최종 합의
    const consensus = await this.formConsensus([
      userAnalystOpinion,
      searcherOpinion,
      resolution
    ]);

    yield { phase: 'consensus_reached', result: consensus };
  }

  private detectConflicts(
    opinionA: AgentOpinion,
    opinionB: AgentOpinion
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // 충돌 1: 예산 vs 니즈
    if (opinionA.topVehicles[0].price > opinionB.budgetMax) {
      conflicts.push({
        type: 'budget_needs_mismatch',
        severity: 'high',
        description: `User Analyst는 ${opinionA.topVehicles[0].model} (${opinionA.topVehicles[0].price}만원)을 추천하지만,
                      Searcher의 예산 상한(${opinionB.budgetMax}만원)을 ${opinionA.topVehicles[0].price - opinionB.budgetMax}만원 초과합니다.`,
        agentA: 'User Analyst',
        agentB: 'Searcher',
        data: {
          recommendedPrice: opinionA.topVehicles[0].price,
          budgetMax: opinionB.budgetMax,
          gap: opinionA.topVehicles[0].price - opinionB.budgetMax
        }
      });
    }

    // 충돌 2: 옵션 vs 가격
    const requiredOptions = opinionA.mustHaveFeatures || [];
    const affordableWithOptions = opinionB.topVehicles.filter(v =>
      requiredOptions.every(opt => v.options.includes(opt))
    );

    if (affordableWithOptions.length === 0) {
      conflicts.push({
        type: 'features_budget_tradeoff',
        severity: 'medium',
        description: `필수 옵션(${requiredOptions.join(', ')})을 모두 갖춘 차량은 예산을 초과합니다.`,
        agentA: 'User Analyst',
        agentB: 'Searcher'
      });
    }

    return conflicts;
  }

  private async generateAlternatives(
    resolution: Resolution,
    candidates: Vehicle[]
  ): Promise<Alternative[]> {
    const alternatives: Alternative[] = [];

    if (resolution.conflictType === 'budget_needs_mismatch') {
      // 대안 1: 예산 상향
      alternatives.push({
        id: 'budget_increase',
        title: '예산 상향 조정',
        description: `예산을 ${resolution.data.gap}만원(+${Math.round(resolution.data.gap / resolution.data.budgetMax * 100)}%) 올리면
                      ${resolution.data.recommendedModel}을 구매할 수 있습니다.`,
        impact: `사용자 니즈 충족도: 95% → 100%`,
        tradeoff: `추가 비용: ${resolution.data.gap}만원`,
        action: 'increase_budget',
        newBudgetMax: resolution.data.budgetMax + resolution.data.gap
      });

      // 대안 2: 니즈 타협
      const similarCheaper = candidates.filter(v =>
        v.carType === resolution.data.recommendedType &&
        v.price <= resolution.data.budgetMax
      );

      alternatives.push({
        id: 'downgrade_needs',
        title: '옵션 타협',
        description: `${similarCheaper[0].model}은 예산 내이지만 일부 옵션이 부족합니다.`,
        impact: `비용 절감: ${resolution.data.recommendedPrice - similarCheaper[0].price}만원`,
        tradeoff: `부족한 옵션: ${resolution.data.missingFeatures.join(', ')}`,
        action: 'accept_tradeoff',
        vehicle: similarCheaper[0]
      });

      // 대안 3: 연식 조정
      const olderSimilar = candidates.filter(v =>
        v.model === resolution.data.recommendedModel &&
        v.modelYear < resolution.data.recommendedYear &&
        v.price <= resolution.data.budgetMax
      );

      if (olderSimilar.length > 0) {
        alternatives.push({
          id: 'older_year',
          title: '연식 낮추기',
          description: `동일 모델의 ${olderSimilar[0].modelYear}년식은 예산 내입니다.`,
          impact: `비용 절감: ${resolution.data.recommendedPrice - olderSimilar[0].price}만원`,
          tradeoff: `연식: ${resolution.data.recommendedYear} → ${olderSimilar[0].modelYear} (${resolution.data.recommendedYear - olderSimilar[0].modelYear}년 차이)`,
          action: 'choose_older_year',
          vehicle: olderSimilar[0]
        });
      }
    }

    return alternatives;
  }
}
```

#### 2.2 프론트엔드 시각화 (3일)

**Agent 토론 과정 실시간 표시**:
```typescript
// client/src/components/ai/AgentDeliberationPanel.tsx
export const AgentDeliberationPanel = ({ deliberation }: Props) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold flex items-center gap-2">
        🤝 Agent 협의 과정
      </h3>

      {deliberation.phase === 'round1_complete' && (
        <div className="space-y-3">
          {deliberation.opinions.map(opinion => (
            <AgentOpinionCard key={opinion.agent} opinion={opinion} />
          ))}
        </div>
      )}

      {deliberation.phase === 'conflict_detected' && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>충돌 감지</AlertTitle>
          <AlertDescription>
            {deliberation.conflicts.map(c => (
              <div key={c.type} className="mt-2">
                <strong>{c.agentA} vs {c.agentB}</strong>
                <p>{c.description}</p>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {deliberation.phase === 'alternatives_generated' && (
        <div>
          <h4 className="font-medium mb-2">Manager의 대안 제시:</h4>
          <div className="grid gap-3">
            {deliberation.alternatives.map(alt => (
              <AlternativeCard
                key={alt.id}
                alternative={alt}
                onSelect={() => handleSelectAlternative(alt)}
              />
            ))}
          </div>
        </div>
      )}

      {deliberation.phase === 'consensus_reached' && (
        <div className="bg-green-50 p-3 rounded">
          ✅ 최종 합의 완료: {deliberation.result.summary}
        </div>
      )}
    </div>
  );
};

const AgentOpinionCard = ({ opinion }: { opinion: AgentOpinion }) => (
  <div className="border-l-4 border-primary pl-3">
    <div className="flex justify-between">
      <strong>{opinion.agent}</strong>
      <span className="text-sm text-muted-foreground">
        확신도: {(opinion.confidence * 100).toFixed(0)}%
      </span>
    </div>
    <p className="text-sm mt-1">{opinion.reasoning}</p>
    <div className="mt-2">
      <strong className="text-sm">추천 차량:</strong>
      <span className="text-sm ml-2">
        {opinion.recommendation[0].brand} {opinion.recommendation[0].model}
      </span>
    </div>
    {opinion.concerns.length > 0 && (
      <div className="mt-2">
        <strong className="text-sm text-yellow-600">우려사항:</strong>
        <ul className="text-sm ml-4 list-disc">
          {opinion.concerns.map(c => <li key={c}>{c}</li>)}
        </ul>
      </div>
    )}
  </div>
);
```

### 📊 Phase 2 성과

**Before (Phase 1)**:
```
AI: [3대 추천]
- 추천 근거 없음
- Agent 간 협업 과정 숨김
```

**After (Phase 2)**:
```
[Agent 협의 중...]

User Analyst: "사용자는 가족용을 원하므로 7인승 SUV가 최적입니다"
              "추천: 현대 팰리세이드 2020년식 (3,200만원)"
              "확신도: 95%"

Searcher: "예산 3,000만원 이하로는 7인승 SUV가 5대뿐입니다"
          "추천: 기아 카니발 2019년식 (2,850만원)"
          "확신도: 80%"
          "⚠️ 우려: 예산 부족"

Manager: "충돌 감지! 예산 vs 니즈 불일치"
         "3가지 대안 제시:"

         1️⃣ 예산 상향 (3,000 → 3,200만원)
            ✅ 팰리세이드 구매 가능
            ⚠️ 추가 비용 200만원

         2️⃣ 6인승으로 타협
            ✅ 예산 내 20대 검색 가능
            ⚠️ 좌석 수 -1

         3️⃣ 2019년식 선택
            ✅ 비용 절감 350만원
            ⚠️ 연식 1년 낮음

사용자: [대안 선택]
```

**메트릭 개선**:
- Reasoning: 80 → **90점** (+10) - 복잡한 추론 및 충돌 해결
- Adaptability: 82 → **90점** (+8) - 실시간 대안 제시
- 사용자 만족도: 85% → **92%** (+7%p)

---

## 📅 Phase 3: Self-Improvement (3주)

### 🎯 목표
- Autonomy: 85 → 95점 (+10)
- **총점: 89.2 → 90.8점** (+1.6)
- **Cognitive Agent 달성!** 🎉

### 🛠️ 구현 내용

#### 3.1 A/B Testing 인프라 (7일)

**추천 전략 실험**:
```typescript
// server/lib/improvement/ABTestingEngine.ts
export class ABTestingEngine {
  private strategies = {
    strategyA: {
      name: '가격 중심 전략',
      topsisWeights: { price: 0.35, fuel: 0.20, safety: 0.25, brand: 0.10, condition: 0.10 }
    },
    strategyB: {
      name: '안전성 중심 전략',
      topsisWeights: { price: 0.20, fuel: 0.20, safety: 0.35, brand: 0.15, condition: 0.10 }
    },
    strategyC: {
      name: '균형 전략',
      topsisWeights: { price: 0.25, fuel: 0.25, safety: 0.25, brand: 0.15, condition: 0.10 }
    }
  };

  async assignStrategy(userId: string, sessionId: string): Promise<Strategy> {
    // 사용자별로 전략 랜덤 할당 (33% 확률)
    const strategies = Object.keys(this.strategies);
    const assigned = strategies[Math.floor(Math.random() * strategies.length)];

    await db.query(`
      INSERT INTO ab_test_assignments (userId, sessionId, strategy, assignedAt)
      VALUES ($1, $2, $3, NOW())
    `, [userId, sessionId, assigned]);

    return this.strategies[assigned];
  }

  async trackRecommendation(
    userId: string,
    sessionId: string,
    vehicles: Vehicle[]
  ): Promise<void> {
    const strategy = await this.getAssignedStrategy(userId, sessionId);

    await db.query(`
      INSERT INTO ab_test_recommendations (userId, sessionId, strategy, vehicleIds, recommendedAt)
      VALUES ($1, $2, $3, $4, NOW())
    `, [userId, sessionId, strategy, vehicles.map(v => v.vehicleId)]);
  }

  async collectFeedback(
    userId: string,
    sessionId: string,
    feedback: UserFeedback
  ): Promise<void> {
    const strategy = await this.getAssignedStrategy(userId, sessionId);

    // 피드백 점수 계산
    let score = 0;
    if (feedback.action === 'view_detail') score = 5;
    if (feedback.action === 'like') score = 10;
    if (feedback.action === 'contact_dealer') score = 20;  // 전환!
    if (feedback.action === 'reject') score = -5;

    await db.query(`
      INSERT INTO ab_test_feedback (userId, sessionId, strategy, action, score, createdAt)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [userId, sessionId, strategy, feedback.action, score]);
  }
}
```

#### 3.2 자동 성능 최적화 (7일)

**매일 자정 자동 분석 및 전략 업데이트**:
```typescript
// server/lib/improvement/PerformanceOptimizer.ts
export class PerformanceOptimizer {
  async analyzeAndOptimize(): Promise<OptimizationResult> {
    console.log('🔄 일일 성능 분석 시작...');

    // 지난 7일간 각 전략 성과 분석
    const performance = await this.analyzeStrategyPerformance(7);

    /*
    performance = {
      strategyA: {
        avgScore: 7.2,
        conversionRate: 0.12,
        userSatisfaction: 0.78,
        sampleSize: 450
      },
      strategyB: {
        avgScore: 8.5,
        conversionRate: 0.18,
        userSatisfaction: 0.85,
        sampleSize: 430
      },
      strategyC: {
        avgScore: 7.8,
        conversionRate: 0.15,
        userSatisfaction: 0.82,
        sampleSize: 440
      }
    };
    */

    // 통계적 유의성 검증 (t-test)
    const winner = this.selectBestStrategy(performance);

    if (winner.isSignificant) {
      console.log(`✅ 우승 전략: ${winner.strategyName}`);
      console.log(`   - 평균 점수: ${winner.avgScore}`);
      console.log(`   - 전환율: ${(winner.conversionRate * 100).toFixed(1)}%`);
      console.log(`   - 만족도: ${(winner.userSatisfaction * 100).toFixed(1)}%`);

      // 기본 전략 업데이트
      await this.updateDefaultStrategy(winner.strategyName);

      // 새로운 실험 전략 생성 (Exploration)
      const newStrategy = this.generateMutatedStrategy(winner);
      await this.addExperimentalStrategy(newStrategy);
    } else {
      console.log('⚠️ 통계적으로 유의미한 차이 없음. 현재 전략 유지.');
    }

    return { winner, performance };
  }

  private async analyzeStrategyPerformance(days: number): Promise<PerformanceMap> {
    const result = await db.query(`
      SELECT
        strategy,
        AVG(score) as avgScore,
        COUNT(CASE WHEN action = 'contact_dealer' THEN 1 END)::float / COUNT(*) as conversionRate,
        AVG(CASE WHEN score > 0 THEN 1.0 ELSE 0.0 END) as userSatisfaction,
        COUNT(*) as sampleSize
      FROM ab_test_feedback
      WHERE createdAt > NOW() - INTERVAL '${days} days'
      GROUP BY strategy
    `);

    return result.rows.reduce((acc, row) => {
      acc[row.strategy] = {
        avgScore: parseFloat(row.avgscore),
        conversionRate: parseFloat(row.conversionrate),
        userSatisfaction: parseFloat(row.usersatisfaction),
        sampleSize: parseInt(row.samplesize)
      };
      return acc;
    }, {});
  }

  private generateMutatedStrategy(winner: Strategy): Strategy {
    // 우승 전략을 기반으로 10-20% 변형
    const mutated = { ...winner.topsisWeights };

    // 한 가지 기준을 ±10% 조정
    const criteria = Object.keys(mutated);
    const toMutate = criteria[Math.floor(Math.random() * criteria.length)];
    const delta = (Math.random() - 0.5) * 0.2;  // -10% ~ +10%

    mutated[toMutate] = Math.max(0.05, Math.min(0.50, mutated[toMutate] + delta));

    // 정규화 (합이 1이 되도록)
    const sum = Object.values(mutated).reduce((a, b) => a + b, 0);
    Object.keys(mutated).forEach(k => mutated[k] /= sum);

    return {
      name: `실험 전략 ${Date.now()}`,
      topsisWeights: mutated
    };
  }
}

// Cron Job 설정
import cron from 'node-cron';

// 매일 자정 1시에 실행
cron.schedule('0 1 * * *', async () => {
  const optimizer = new PerformanceOptimizer();
  await optimizer.analyzeAndOptimize();
});
```

#### 3.3 성능 대시보드 (7일)

**관리자용 대시보드**:
```typescript
// client/src/pages/AdminDashboard.tsx
export const AdminDashboard = () => {
  const { performance, loading } = useABTestPerformance();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI 성능 모니터링</h1>

      {/* 전략별 성과 비교 */}
      <Card>
        <CardHeader>
          <CardTitle>추천 전략 A/B Testing 결과 (최근 7일)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>전략</TableHead>
                <TableHead>평균 점수</TableHead>
                <TableHead>전환율</TableHead>
                <TableHead>사용자 만족도</TableHead>
                <TableHead>샘플 수</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(performance).map(([name, stats]) => (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>{stats.avgScore.toFixed(2)}</TableCell>
                  <TableCell>{(stats.conversionRate * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(stats.userSatisfaction * 100).toFixed(1)}%</TableCell>
                  <TableCell>{stats.sampleSize}</TableCell>
                  <TableCell>
                    {stats.isWinner && <Badge variant="success">우승 🏆</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 시간대별 성능 추이 */}
      <Card>
        <CardHeader>
          <CardTitle>전략별 성능 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performance.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="strategyA" stroke="#3b82f6" name="전략 A" />
              <Line type="monotone" dataKey="strategyB" stroke="#10b981" name="전략 B" />
              <Line type="monotone" dataKey="strategyC" stroke="#ef4444" name="전략 C" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 📊 Phase 3 성과

**Before (Phase 2)**:
- 고정된 TOPSIS 가중치
- 성능 개선 = 수동으로 코드 수정

**After (Phase 3)**:
- 자동 A/B Testing (3개 전략 동시 실험)
- 매일 자정 성능 분석 및 전략 업데이트
- 통계적 유의성 검증 (t-test)
- 자동 돌연변이 전략 생성 (Exploration)

**메트릭 개선**:
- Autonomy: 85 → **95점** (+10) - 자율적 성능 개선
- 전환율: 12% → **18%** (+50% 상승)
- 추천 정확도: 85% → **92%** (+7%p)

**심사위원 임팩트**:
> "AI가 스스로 성능을 측정하고 개선하네! 이건 진짜 지능형 시스템이다!"

---

## 🎯 Quick Wins (1주 이내 구현 가능)

공모전/포트폴리오 마감이 급한 경우 **최소한 이것만**:

### Quick Win 1: Progressive Streaming (2일)

**현재**:
```
사용자 메시지 전송
[3초 대기... 🕐]
Top 3 차량 한 번에 표시
```

**개선**:
```typescript
// server/websocket/ChatWebSocketHandler.ts
async handleUserMessage(ws: WebSocket, message: string) {
  // 0.5초: 프로필 분석
  const profile = await this.profileExtractor.extract(message);
  ws.send(JSON.stringify({
    type: 'progress',
    step: 'profile_extracted',
    data: profile,
    timestamp: 500
  }));

  // 1.0초: 후보 검색
  const candidates = await this.searcher.search(vehicles, profile);
  ws.send(JSON.stringify({
    type: 'progress',
    step: 'candidates_found',
    count: candidates.length,
    timestamp: 1000
  }));

  // 1.5초 ~ 2.5초: 차량 하나씩 스트리밍
  for (let i = 0; i < 3; i++) {
    const vehicle = await this.ranker.rankOne(candidates, i);
    ws.send(JSON.stringify({
      type: 'vehicle_stream',
      position: i + 1,
      vehicle,
      timestamp: 1500 + i * 500
    }));
  }

  // 3.0초: TCO 계산
  const tco = await this.tcoCalculator.calculate(top3, profile);
  ws.send(JSON.stringify({
    type: 'tco_complete',
    data: tco,
    timestamp: 3000
  }));
}
```

**효과**:
- 체감 대기 시간: 3초 → **0.5초**
- 사용자 이탈률: 22% → **15%** (-32%)

### Quick Win 2: 대화 기록 저장 (3일)

**최소 구현**:
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(50),
  sessionId VARCHAR(50),
  message TEXT,
  sender VARCHAR(20),
  timestamp TIMESTAMP DEFAULT NOW()
);
```

```typescript
// 저장
await db.query(`
  INSERT INTO conversations (userId, sessionId, message, sender)
  VALUES ($1, $2, $3, $4)
`, [userId, sessionId, message, sender]);

// 컨텍스트 포함
const history = await db.query(`
  SELECT message, sender FROM conversations
  WHERE userId = $1 AND sessionId = $2
  ORDER BY timestamp DESC LIMIT 5
`, [userId, sessionId]);

const context = history.rows.reverse()
  .map(m => `${m.sender}: ${m.message}`)
  .join('\n');

const prompt = `[대화 기록]\n${context}\n\n[현재 요청]\n${message}`;
```

**효과**:
- Memory: 40 → **70점** (+30)
- 컨텍스트 인식 대화 가능

---

## 📊 최종 기대 성과

### Agent 점수 변화

| Phase | Memory | Reasoning | Adaptability | Autonomy | 총점 | 등급 |
|-------|--------|-----------|--------------|----------|------|------|
| **현재** | 40 | 80 | 75 | 85 | **77.5** | Reactive Agent |
| **Phase 1** | **85** ⬆️ | 80 | **82** ⬆️ | 85 | **85.8** | Goal-Based Agent |
| **Phase 2** | 85 | **90** ⬆️ | **90** ⬆️ | 85 | **89.2** | Goal-Based Agent |
| **Phase 3** | 85 | 90 | 90 | **95** ⬆️ | **90.8** | **Cognitive Agent** ✅ |

### 비즈니스 메트릭 개선

| 메트릭 | 현재 | Phase 1 | Phase 2 | Phase 3 | 개선폭 |
|--------|------|---------|---------|---------|--------|
| 추천 정확도 | 85% | 88% | 90% | **92%** | **+7%p** |
| 사용자 만족도 | 70% | 85% | 92% | **95%** | **+25%p** |
| 전환율 | 12% | 14% | 16% | **18%** | **+50%** |
| 이탈률 | 22% | 18% | 15% | **12%** | **-45%** |
| 평균 세션 시간 | 15분 | 18분 | 22분 | **25분** | **+67%** |

### 심사위원 평가 예상

**현재 (77.5점)**:
> "멀티에이전트 개념은 있지만 단순한 순차 실행이네요. 대화 기록도 안 남고..."

**Phase 1-3 완료 (90.8점)**:
> "😲 Agent들이 서로 토론해서 최적안을 찾네!"
> "🎯 사용자 피드백을 학습해서 다음 추천이 더 정확해지네!"
> "🚀 시스템이 스스로 성능을 측정하고 개선하네! 이건 진짜 AI 에이전트다!"
> "🏆 Cognitive Agent 수준까지 구현했구나. 이 정도면 AI/LLM 직무에 충분히 어필 가능!"

---

## 🛠️ 구현 우선순위 요약

### 공모전/포트폴리오 마감이 급한 경우 (1주)
1. ✅ **Progressive Streaming** (2일) - 체감 속도 3초 → 0.5초
2. ✅ **대화 기록 저장** (3일) - Memory 40 → 70점
3. ✅ **발표 자료 업데이트** (2일) - 새로운 로드맵 반영

**예상 점수**: 77.5 → **83점** (+5.5)

### 충분한 시간이 있는 경우 (3주)
1. ✅ Phase 1: Memory & Learning (1주) - 77.5 → 85.8점
2. ✅ Phase 2: Agent Deliberation (2주) - 85.8 → 89.2점
3. ✅ Phase 3: Self-Improvement (3주) - 89.2 → **90.8점 (Cognitive Agent)** 🎉

---

## 🎓 LangChain/RAG에 대한 최종 결론

### ❌ 현재 도입 불필요

**이유**:
1. **구조화된 데이터만 존재** - SQL 쿼리가 RAG보다 정확하고 빠름
2. **복잡도 증가** - LangChain 학습 곡선 vs 직접 구현의 명확성
3. **성능 오버헤드** - 추상화 레이어로 인한 속도 저하
4. **비용 증가** - Vector DB (Pinecone) 추가 비용

### ✅ 미래 고려 사항

**Phase 4 (선택적 - 리뷰 데이터 추가 시)**:
```typescript
// 리뷰 데이터가 추가되면 RAG 유용
interface VehicleWithReviews {
  ...vehicle,
  reviews: string[];  // "승차감 좋아요", "연비 만족" 등
}

// 이 경우 의미 기반 검색 필요
"승차감 좋은 차" → RAG로 리뷰에서 "승차감" 언급 차량 검색
```

**Phase 5 (선택적 - 프롬프트 관리)**:
```typescript
// LangChain은 프롬프트 버전 관리에만 유용
import { PromptTemplate } from 'langchain';

const managerPrompt = new PromptTemplate({
  template: "당신은 Manager Agent입니다...",
  inputVariables: ["context", "message"]
});

// A/B Testing 시 프롬프트 버전 비교 가능
```

**우선순위**:
1. 🔴 **Phase 1-3 (필수)**: Agent 지능 강화 → Cognitive Agent 달성
2. 🟡 **Phase 4-5 (선택)**: LangChain/RAG → 프로덕션 확장 시

---

## 📝 다음 액션 아이템

### 즉시 (오늘)
1. [ ] Progressive Streaming 구현 시작
2. [ ] conversations 테이블 생성

### 이번 주
1. [ ] Phase 1 완료 (Memory & Learning)
2. [ ] 발표 자료 업데이트 (새로운 로드맵 반영)
3. [ ] Quick Demo 영상 촬영

### 다음 주
1. [ ] Phase 2 시작 (Agent Deliberation)
2. [ ] 심사위원 Q&A 예상 질문 준비

---

**작성일**: 2025-10-10
**버전**: 2.0 (RAG/LangChain 우선순위 조정)
**목표**: Reactive Agent (77.5점) → Cognitive Agent (90.8점)
