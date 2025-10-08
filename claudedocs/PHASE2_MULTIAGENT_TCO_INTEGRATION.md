# 🤖 Phase 2: MultiAgentSystem TCO 통합 계획

**작성일**: 2025-01-06
**전제 조건**: Phase 1 완료 (TCOCalculator + TOPSIS 통합)
**목표**: 멀티에이전트 시스템에서 TCO 기반 추천 활성화

---

## 🎯 Phase 2 목표

### 핵심 목표
1. **MultiAgentSystem에 TCO 통합**: 기존 TOPSIS 호출 부분 수정
2. **WebSocket 메시지 확장**: TCO 데이터 실시간 전송
3. **에이전트 응답 강화**: TCO 정보 포함한 추천 메시지

### 구현 범위
- ✅ MultiAgentSystem.ts 수정
- ✅ ChatWebSocketHandler.ts 메시지 프로토콜 확장
- ✅ 실시간 TCO 계산 로그 전송

---

## 🔍 현재 시스템 분석

### MultiAgentSystem 현재 구조
```typescript
// server/lib/agents/MultiAgentSystem.ts 예상 코드

async *collaborate(userMessage: string, vehicles: Vehicle[]) {
  // Step 1: Manager Agent
  yield { type: "agent_working", agent: "concierge", content: "..." };

  // Step 2: User Analyst
  yield { type: "agent_working", agent: "needs_analyst", content: "..." };
  const userNeeds = await this.analyzeUserNeeds(userMessage);

  // Step 3: Searcher Agent
  yield { type: "agent_working", agent: "data_analyst", content: "..." };
  const filtered = await this.searchVehicles(userNeeds, vehicles);

  // Step 4: TOPSIS 평가 (현재: price 기준)
  const topsisResult = await rankVehiclesWithTOPSIS(filtered, userProfile);
  const top3 = topsisResult.ranking.slice(0, 3);

  // Step 5: 추천 결과 반환
  yield { type: "recommendation", vehicles: top3 };
}
```

### 변경 필요 사항
```typescript
// Phase 2: TCO 통합 후

async *collaborate(userMessage: string, vehicles: Vehicle[], userProfile: UserProfile) {
  // ... (Step 1-3 동일)

  // Step 4: TOPSIS 평가 (TCO 기반) ✨
  const userDrivingProfile = {
    annualKm: userProfile.annualKm || 15000,
    ownershipYears: 3
  };

  const topsisResult = await rankVehiclesWithTOPSIS(
    filtered,
    userProfile,
    userDrivingProfile  // 🆕 TCO 계산용 프로필
  );

  // Step 5: TCO 정보 포함한 추천 ✨
  const top3WithTCO = topsisResult.ranking.slice(0, 3).map(r => ({
    ...r.alternative.metadata.vehicle,
    tcoBreakdown: r.alternative.metadata.tcoBreakdown,  // 🆕
    tcoTotal: r.alternative.metadata.tcoBreakdown.total,
    tcoConfidence: r.alternative.metadata.tcoConfidence
  }));

  yield { type: "recommendation", vehicles: top3WithTCO };
}
```

---

## 📋 구현 계획

### Step 1: UserProfile 타입 확장 (15분)
**파일**: `shared/types/profile.ts` (신규 또는 기존 수정)

```typescript
export interface UserProfile {
  // 기본 정보
  name?: string;
  age?: string;
  location?: string;

  // 차량 용도 및 예산
  usage?: string[];
  budget?: [number, number];

  // TOPSIS 가중치
  priceWeight: number;
  performanceWeight: number;
  brandWeight: number;
  fuelEfficiencyWeight: number;
  safetyWeight: number;
  designWeight: number;

  // 🆕 TCO 계산용 주행 프로필
  annualKm?: number;        // 연간 주행거리 (기본: 15000)
  ownershipYears?: number;  // 보유 기간 (기본: 3)
}
```

### Step 2: MultiAgentSystem 수정 (30분)
**파일**: `server/lib/agents/MultiAgentSystem.ts`

```typescript
import { rankVehiclesWithTOPSIS, UserDrivingProfile } from '../topsis/VehicleTOPSISAdapter';
import { UserPreferenceProfile } from '../topsis/TOPSISEngine';

export class MultiAgentCollaborator {
  async *collaborate(
    userMessage: string,
    allVehicles: Vehicle[],
    userProfile?: UserProfile  // 🆕 프로필 파라미터 추가
  ) {
    console.log('🤝 멀티에이전트 협업 시작 (TCO 포함)');

    // Step 1: Manager Agent
    yield {
      type: 'agent_working',
      agent: 'concierge',
      content: '사용자 요청을 분석하고 협업 프로세스를 시작합니다...'
    };

    // Step 2: User Analyst
    yield {
      type: 'agent_working',
      agent: 'needs_analyst',
      content: '사용자의 차량 니즈와 우선순위를 분석하고 있습니다...'
    };

    const userNeeds = await this.analyzeUserNeeds(userMessage);
    yield {
      type: 'agent_response',
      agent: 'needs_analyst',
      content: `니즈 분석 완료: ${userNeeds.summary}`
    };

    // Step 3: Searcher Agent
    yield {
      type: 'agent_working',
      agent: 'data_analyst',
      content: '127,378개 차량 데이터베이스에서 매칭되는 차량을 검색하고 있습니다...'
    };

    const filteredVehicles = await this.searchVehicles(userNeeds, allVehicles);
    yield {
      type: 'agent_response',
      agent: 'data_analyst',
      content: `검색 완료: ${filteredVehicles.length}개 후보 차량 발견`
    };

    // Step 4: TOPSIS 평가 (TCO 기반) ✨
    yield {
      type: 'agent_working',
      agent: 'data_analyst',
      content: 'TOPSIS 다기준 평가 시작 (TCO 포함)...'
    };

    const topsisProfile: UserPreferenceProfile = {
      priceWeight: userProfile?.priceWeight || 0.20,
      performanceWeight: userProfile?.performanceWeight || 0.20,
      brandWeight: userProfile?.brandWeight || 0.15,
      fuelEfficiencyWeight: userProfile?.fuelEfficiencyWeight || 0.15,
      safetyWeight: userProfile?.safetyWeight || 0.25,
      designWeight: userProfile?.designWeight || 0.05
    };

    const drivingProfile: UserDrivingProfile = {
      annualKm: userProfile?.annualKm || 15000,
      ownershipYears: userProfile?.ownershipYears || 3
    };

    console.log(`🚗 TCO 계산 조건: 연간 ${drivingProfile.annualKm}km, ${drivingProfile.ownershipYears}년 보유`);

    const topsisResult = await rankVehiclesWithTOPSIS(
      filteredVehicles.slice(0, 50),  // 성능 최적화
      topsisProfile,
      drivingProfile  // 🆕 TCO 계산용
    );

    yield {
      type: 'agent_response',
      agent: 'data_analyst',
      content: `TOPSIS 평가 완료: TCO 기반 순위 결정 (${drivingProfile.ownershipYears}년 총 소유비용 반영)`
    };

    // Step 5: Top 3 선정 및 TCO 데이터 포함
    const top3 = topsisResult.ranking.slice(0, 3).map(r => {
      const vehicle = r.alternative.metadata.vehicle;
      const tcoBreakdown = r.alternative.metadata.tcoBreakdown;
      const tcoConfidence = r.alternative.metadata.tcoConfidence;

      return {
        ...vehicle,
        rank: r.rank,
        topsisScore: r.score,
        // 🆕 TCO 데이터 추가
        tco: {
          total: tcoBreakdown.acquisitionTax +
                 tcoBreakdown.vehicleTax +
                 tcoBreakdown.maintenance +
                 tcoBreakdown.depreciation +
                 tcoBreakdown.fuelCost,
          breakdown: tcoBreakdown,
          confidence: tcoConfidence,
          ownershipYears: drivingProfile.ownershipYears
        }
      };
    });

    yield {
      type: 'recommendation',
      vehicles: top3,
      metadata: {
        tcoEnabled: true,
        drivingProfile
      }
    };

    console.log('✅ 멀티에이전트 협업 완료 (TCO 포함)');
  }

  // ... 기존 메서드들
}
```

### Step 3: WebSocket 메시지 프로토콜 확장 (20분)
**파일**: `server/websocket/ChatWebSocketHandler.ts`

```typescript
// 기존 메시지 타입 확장
interface RecommendationMessage {
  type: 'recommendation';
  vehicles: Array<{
    // 기존 필드
    vehicleId: number;
    manufacturer: string;
    model: string;
    price: number;
    // ...

    // 🆕 TCO 필드 추가
    tco?: {
      total: number;              // 총 TCO (원)
      breakdown: {
        acquisitionTax: number;   // 취득세
        vehicleTax: number;       // 자동차세
        maintenance: number;      // 정비비
        depreciation: number;     // 감가상각
        fuelCost: number;         // 연료비
      };
      confidence: number;         // 신뢰도 (0.0 ~ 1.0)
      ownershipYears: number;     // 보유 기간
    };
  }>;
  metadata?: {
    tcoEnabled: boolean;
    drivingProfile: {
      annualKm: number;
      ownershipYears: number;
    };
  };
}
```

### Step 4: 프론트엔드 타입 정의 (15분)
**파일**: `client/src/types/vehicle.ts` (신규 또는 수정)

```typescript
export interface TCOBreakdown {
  acquisitionTax: number;   // 취득세
  vehicleTax: number;       // 자동차세
  maintenance: number;      // 정비비
  depreciation: number;     // 감가상각
  fuelCost: number;         // 연료비
}

export interface VehicleTCO {
  total: number;              // 총 TCO (원)
  breakdown: TCOBreakdown;
  confidence: number;         // 신뢰도 (0.0 ~ 1.0)
  ownershipYears: number;     // 보유 기간 (년)
}

export interface VehicleWithTCO extends Vehicle {
  tco?: VehicleTCO;
}
```

---

## ✅ Phase 2 완료 조건

### 필수 구현
- ✅ UserProfile에 annualKm, ownershipYears 추가
- ✅ MultiAgentSystem에서 rankVehiclesWithTOPSIS 호출 시 drivingProfile 전달
- ✅ WebSocket 메시지에 TCO 데이터 포함
- ✅ 프론트엔드 타입 정의

### 테스트
- ✅ 멀티에이전트 협업 시 TCO 계산 정상 동작
- ✅ WebSocket으로 TCO 데이터 정상 전송
- ✅ 로그에 TCO 계산 과정 출력

### 성공 기준
- ✅ 기존 기능 regression 없음
- ✅ TCO 데이터가 추천 결과에 포함
- ✅ TypeScript 컴파일 에러 없음

---

**현재 상태**: Phase 2 계획 수립 완료
**예상 소요 시간**: 1.5시간
**다음 작업**: Phase 3 프론트엔드 UI 설계
