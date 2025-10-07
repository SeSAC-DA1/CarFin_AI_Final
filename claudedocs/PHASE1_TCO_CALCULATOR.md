# 📊 Phase 1: TCOCalculator 구현 계획

**작성일**: 2025-01-06
**전제 조건**: Phase 0 코드 품질 개선 완료 ✅
**목표**: 사용자가 요청한 정확한 TCO 계산 로직 구현

---

## 🎯 Phase 1 목표

### 핵심 목표
1. **TCOCalculator.ts 신규 생성**: 사용자가 요청한 5가지 비용 계산 로직 구현
2. **법률/연구 근거 기반 계산**: 모든 계산은 명확한 출처 기반
3. **데이터 제약 처리**: 누락된 데이터(배기량, 연비)에 대한 폴백 전략
4. **Unit Test 작성**: 각 계산 로직의 정확성 검증

### 비기능 요구사항
- **성능**: 차량 1대당 TCO 계산 < 50ms
- **정확도**: 법률/연구 데이터와 100% 일치
- **유지보수성**: 각 계산 로직 독립적으로 테스트 가능
- **확장성**: 향후 추가 비용 항목 쉽게 추가 가능

---

## 📋 구현 요구사항

### 1. 취득세 (Acquisition Tax)
**법적 근거**: 지방세법 제11조
**계산 공식**: `차량 가격 × 7%`

```typescript
interface AcquisitionTaxInput {
  vehiclePrice: number;  // 차량 가격 (만원)
}

interface AcquisitionTaxOutput {
  amount: number;        // 취득세 금액 (만원)
  rate: number;          // 세율 (0.07)
  legalBasis: string;    // "지방세법 제11조"
}

// 예시: 3000만원 차량 → 210만원 취득세
calculateAcquisitionTax({ vehiclePrice: 3000 })
// → { amount: 210, rate: 0.07, legalBasis: "지방세법 제11조" }
```

### 2. 자동차세 (Vehicle Tax)
**법적 근거**: 지방세법 제127조
**계산 공식**:
- **1600cc 이하**: `cc × 140원 × 1.3` (교육세 포함)
- **1600cc 초과**: `cc × 200원 × 1.3` (교육세 포함)
- **차령 감액**: 3년차부터 매년 5%씩 할인 (최대 50%)

```typescript
interface VehicleTaxInput {
  displacement: number | null;  // 배기량 (cc)
  modelYear: number;           // 연식
  currentYear: number;         // 현재 년도 (2025)
  ownershipYears: number;      // 보유 기간 (년)
}

interface VehicleTaxOutput {
  annualTax: number;           // 연간 자동차세 (원)
  totalTax: number;            // 보유 기간 총 자동차세 (원)
  baseRate: number;            // 기본 세율 (140 or 200)
  ageDiscount: number;         // 차령 감액율 (0 ~ 0.5)
  legalBasis: string;          // "지방세법 제127조"
  fallbackUsed: boolean;       // 배기량 추정 사용 여부
}

// 예시 1: 2000cc, 2020년식, 3년 보유
calculateVehicleTax({
  displacement: 2000,
  modelYear: 2020,
  currentYear: 2025,
  ownershipYears: 3
})
// → 2000 × 200 × 1.3 = 520,000원/년
//    3년차: 520,000 × 0.95 = 494,000원
//    4년차: 520,000 × 0.90 = 468,000원
//    5년차: 520,000 × 0.85 = 442,000원
//    총: 1,404,000원

// 예시 2: 배기량 null → 모델명 파싱 또는 브랜드 평균
calculateVehicleTax({
  displacement: null,  // 누락
  modelYear: 2020,
  currentYear: 2025,
  ownershipYears: 3
})
// → fallbackUsed: true, 추정 배기량 사용
```

### 3. 정비/소모품비 (Maintenance Cost)
**연구 근거**: 미국 에너지부(DOE) / 아르곤 연구소(ANL)
**계산 공식**: `연간 주행거리 × 88원/km × 보유 기간`

```typescript
interface MaintenanceCostInput {
  annualKm: number;        // 연간 주행거리 (km)
  ownershipYears: number;  // 보유 기간 (년)
}

interface MaintenanceCostOutput {
  totalCost: number;       // 총 정비비 (원)
  annualCost: number;      // 연간 정비비 (원)
  costPerKm: number;       // km당 비용 (88원)
  researchBasis: string;   // "DOE/ANL 연구 데이터"
}

// 예시: 연간 15,000km, 3년 보유
calculateMaintenanceCost({ annualKm: 15000, ownershipYears: 3 })
// → 15,000 × 88 × 3 = 3,960,000원
```

### 4. 감가상각 (Depreciation)
**방법론**: 동일 모델 과거 시장 데이터 회귀 분석
**데이터 소스**: DB 내 동일 모델의 연식별 가격 데이터

```typescript
interface DepreciationInput {
  vehiclePrice: number;    // 현재 차량 가격 (만원)
  model: string;           // 모델명 (예: "쏘나타")
  modelYear: number;       // 연식
  ownershipYears: number;  // 보유 기간 (년)
  database: VehicleDatabase; // DB 접근 객체
}

interface DepreciationOutput {
  totalDepreciation: number;  // 총 감가상각 (만원)
  annualDepreciation: number; // 연간 감가상각 (만원)
  depreciationRate: number;   // 연간 감가율 (0 ~ 1)
  estimatedResaleValue: number; // 예상 재판매 가격 (만원)
  dataPoints: number;         // 회귀 분석 데이터 개수
  rSquared: number;           // 회귀 분석 결정계수 (신뢰도)
  fallbackUsed: boolean;      // 일반 감가율 사용 여부
}

// 예시 1: 쏘나타 2020년식, 현재 3000만원, 3년 보유
calculateDepreciation({
  vehiclePrice: 3000,
  model: "쏘나타",
  modelYear: 2020,
  ownershipYears: 3,
  database: db
})
// → DB에서 쏘나타 2017~2023년식 가격 데이터 조회
//    회귀 분석: 연간 감가율 12%
//    3년 후 예상 가격: 3000 × 0.88^3 = 2044만원
//    감가상각: 956만원

// 예시 2: 데이터 부족 시 일반 감가율 적용
calculateDepreciation({
  vehiclePrice: 3000,
  model: "희귀모델",
  modelYear: 2020,
  ownershipYears: 3,
  database: db
})
// → dataPoints: 3 (부족)
//    fallbackUsed: true
//    일반 감가율 15% 적용
```

### 5. 연료비 (Fuel Cost)
**계산 근거**: 공인 연비 + 현재 유가
**공식**: `(연간 주행거리 ÷ 연비) × 유가 × 보유 기간`

```typescript
interface FuelCostInput {
  annualKm: number;        // 연간 주행거리 (km)
  fuelType: string;        // 연료 타입 ("가솔린", "디젤", "LPG", "하이브리드")
  fuelEfficiency: number | null;  // 공인 연비 (km/L)
  ownershipYears: number;  // 보유 기간 (년)
  currentFuelPrice?: number; // 현재 유가 (원/L), 없으면 평균값
}

interface FuelCostOutput {
  totalCost: number;       // 총 연료비 (원)
  annualCost: number;      // 연간 연료비 (원)
  fuelPrice: number;       // 적용된 유가 (원/L)
  annualLiters: number;    // 연간 연료 소비량 (L)
  fallbackUsed: boolean;   // 연비 추정 사용 여부
}

// 유가 기본값 (2025년 1월 기준)
const DEFAULT_FUEL_PRICES = {
  "가솔린": 1600,
  "디젤": 1400,
  "LPG": 900,
  "하이브리드": 1600
};

// 예시 1: 가솔린, 연비 12km/L, 연간 15,000km, 3년 보유
calculateFuelCost({
  annualKm: 15000,
  fuelType: "가솔린",
  fuelEfficiency: 12,
  ownershipYears: 3
})
// → (15,000 ÷ 12) × 1,600 × 3 = 6,000,000원

// 예시 2: 연비 null → 모델명 파싱 또는 연료타입 평균
calculateFuelCost({
  annualKm: 15000,
  fuelType: "디젤",
  fuelEfficiency: null,  // 누락
  ownershipYears: 3
})
// → fallbackUsed: true
//    디젤 평균 연비 14km/L 적용
```

---

## 🏗️ 파일 구조

### 신규 생성 파일
```
server/lib/financial/
├── TCOCalculator.ts           # 메인 계산기 클래스
├── TaxCalculator.ts           # 세금 계산 로직
├── DepreciationAnalyzer.ts    # 감가상각 회귀 분석
└── FallbackStrategies.ts      # 데이터 누락 시 폴백 전략

tests/unit/
├── TCOCalculator.test.ts      # TCO 통합 테스트
├── TaxCalculator.test.ts      # 세금 계산 테스트
└── DepreciationAnalyzer.test.ts # 감가상각 테스트
```

### 메인 인터페이스
```typescript
// server/lib/financial/TCOCalculator.ts

import type { Vehicle } from '@/shared/types/vehicle';

interface UserFinancialProfile {
  annualKm: number;          // 연간 주행거리 (기본: 15,000km)
  ownershipYears: number;    // 보유 기간 (기본: 3년)
  currentYear: number;       // 현재 년도 (기본: 2025)
}

interface TCOResult {
  vehicleId: number;
  totalCost: number;         // 총 소유 비용 (원)
  breakdown: {
    acquisitionTax: AcquisitionTaxOutput;
    vehicleTax: VehicleTaxOutput;
    maintenance: MaintenanceCostOutput;
    depreciation: DepreciationOutput;
    fuelCost: FuelCostOutput;
  };
  confidence: number;        // 신뢰도 (0 ~ 1)
  warnings: string[];        // 경고 메시지 (데이터 누락 등)
}

export class TCOCalculator {
  static async calculate(
    vehicle: Vehicle,
    userProfile: UserFinancialProfile,
    database?: VehicleDatabase
  ): Promise<TCOResult> {
    // 구현 내용
  }
}
```

---

## 🔄 데이터 폴백 전략

### 배기량 (Displacement) 누락 시
```typescript
// 전략 1: 모델명 파싱
"쏘나타 2.0" → 2000cc
"그랜저 3.3" → 3300cc
"아반떼 1.6" → 1600cc

// 전략 2: 브랜드별 평균 배기량
현대: 1800cc
기아: 1800cc
BMW: 2200cc
벤츠: 2500cc

// 전략 3: 가격대별 평균 배기량
2000만원 이하: 1600cc
2000~3000만원: 1800cc
3000~5000만원: 2200cc
5000만원 이상: 2500cc
```

### 연비 (Fuel Efficiency) 누락 시
```typescript
// 전략 1: 모델명 + 연료타입 매핑
"쏘나타 하이브리드" → 16km/L
"아반떼 가솔린" → 12km/L

// 전략 2: 연료타입별 평균 연비
가솔린: 11km/L
디젤: 14km/L
LPG: 9km/L
하이브리드: 16km/L
전기: 5km/kWh

// 전략 3: 배기량별 평균 연비
1600cc 이하 가솔린: 13km/L
1600cc 초과 가솔린: 10km/L
2000cc 초과 가솔린: 8km/L
```

### 감가상각 데이터 부족 시
```typescript
// 회귀 분석 최소 데이터: 5개 이상
if (dataPoints < 5) {
  // 일반 감가율 적용
  const generalRates = {
    "국산": 0.15,  // 연간 15% 감가
    "수입": 0.18,  // 연간 18% 감가
    "럭셔리": 0.20 // 연간 20% 감가
  };
}
```

---

## ✅ 구현 단계 (Phase 1)

### Step 1: 세금 계산기 구현 (1시간)
- [ ] TaxCalculator.ts 생성
- [ ] calculateAcquisitionTax() 메서드 구현
- [ ] calculateVehicleTax() 메서드 구현
- [ ] 배기량 폴백 전략 구현
- [ ] Unit Test 작성 (10가지 시나리오)

### Step 2: 정비/연료비 계산 (30분)
- [ ] calculateMaintenanceCost() 메서드 구현
- [ ] calculateFuelCost() 메서드 구현
- [ ] 연비 폴백 전략 구현
- [ ] Unit Test 작성 (8가지 시나리오)

### Step 3: 감가상각 분석기 (1.5시간)
- [ ] DepreciationAnalyzer.ts 생성
- [ ] DB 쿼리 로직 (동일 모델 데이터 조회)
- [ ] 회귀 분석 구현 (simple-statistics 라이브러리)
- [ ] 폴백 전략 구현
- [ ] Unit Test 작성 (5가지 시나리오)

### Step 4: TCO 통합 계산기 (1시간)
- [ ] TCOCalculator.ts 메인 클래스 구현
- [ ] 5가지 계산 결과 통합
- [ ] 신뢰도 점수 계산
- [ ] 경고 메시지 생성
- [ ] Integration Test 작성

### Step 5: 테스트 및 검증 (1시간)
- [ ] 전체 Unit Test 실행 (목표: 90% 커버리지)
- [ ] 실제 차량 데이터로 검증 (10대 샘플)
- [ ] 성능 테스트 (목표: < 50ms/대)
- [ ] 문서화 (JSDoc 주석)

---

## 🧪 테스트 시나리오

### 취득세 테스트
```typescript
describe('calculateAcquisitionTax', () => {
  it('3000만원 차량 → 210만원 취득세', () => {
    const result = calculateAcquisitionTax({ vehiclePrice: 3000 });
    expect(result.amount).toBe(210);
    expect(result.rate).toBe(0.07);
  });
});
```

### 자동차세 테스트
```typescript
describe('calculateVehicleTax', () => {
  it('2000cc, 2020년식, 3년 보유 → 차령 감액 적용', () => {
    const result = calculateVehicleTax({
      displacement: 2000,
      modelYear: 2020,
      currentYear: 2025,
      ownershipYears: 3
    });
    // 3년차: 5% 감액
    // 4년차: 10% 감액
    // 5년차: 15% 감액
    expect(result.totalTax).toBeCloseTo(1404000, -3);
  });

  it('배기량 null → 폴백 전략 사용', () => {
    const result = calculateVehicleTax({
      displacement: null,
      modelYear: 2020,
      currentYear: 2025,
      ownershipYears: 3
    });
    expect(result.fallbackUsed).toBe(true);
  });
});
```

### 통합 TCO 테스트
```typescript
describe('TCOCalculator.calculate', () => {
  it('완전한 데이터: 3000만원 쏘나타, 3년 보유', async () => {
    const vehicle: Vehicle = {
      vehicleId: 1,
      model: "쏘나타",
      price: 3000,
      modelYear: 2020,
      fuelType: "가솔린",
      displacement: 2000,
      // ...
    };

    const result = await TCOCalculator.calculate(vehicle, {
      annualKm: 15000,
      ownershipYears: 3,
      currentYear: 2025
    });

    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.breakdown.acquisitionTax.amount).toBe(210);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.warnings).toHaveLength(0);
  });

  it('누락 데이터: 배기량, 연비 없음 → 폴백 전략', async () => {
    const vehicle: Vehicle = {
      vehicleId: 2,
      model: "알 수 없음",
      price: 2500,
      modelYear: 2019,
      fuelType: "디젤",
      displacement: null,  // 누락
      // ...
    };

    const result = await TCOCalculator.calculate(vehicle, {
      annualKm: 12000,
      ownershipYears: 3,
      currentYear: 2025
    });

    expect(result.confidence).toBeLessThan(0.8);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.breakdown.vehicleTax.fallbackUsed).toBe(true);
  });
});
```

---

## 📊 예상 출력 예시

### 완전한 데이터 (신뢰도 95%)
```json
{
  "vehicleId": 123,
  "totalCost": 12560000,
  "breakdown": {
    "acquisitionTax": {
      "amount": 2100000,
      "rate": 0.07,
      "legalBasis": "지방세법 제11조"
    },
    "vehicleTax": {
      "annualTax": 520000,
      "totalTax": 1404000,
      "baseRate": 200,
      "ageDiscount": 0.15,
      "legalBasis": "지방세법 제127조",
      "fallbackUsed": false
    },
    "maintenance": {
      "totalCost": 3960000,
      "annualCost": 1320000,
      "costPerKm": 88,
      "researchBasis": "DOE/ANL 연구 데이터"
    },
    "depreciation": {
      "totalDepreciation": 9560000,
      "annualDepreciation": 3186667,
      "depreciationRate": 0.12,
      "estimatedResaleValue": 20440000,
      "dataPoints": 47,
      "rSquared": 0.89,
      "fallbackUsed": false
    },
    "fuelCost": {
      "totalCost": 6000000,
      "annualCost": 2000000,
      "fuelPrice": 1600,
      "annualLiters": 1250,
      "fallbackUsed": false
    }
  },
  "confidence": 0.95,
  "warnings": []
}
```

### 누락 데이터 (신뢰도 65%)
```json
{
  "vehicleId": 456,
  "totalCost": 14200000,
  "breakdown": {
    "acquisitionTax": { "amount": 1750000, "rate": 0.07, "legalBasis": "지방세법 제11조" },
    "vehicleTax": {
      "annualTax": 468000,
      "totalTax": 1263600,
      "baseRate": 200,
      "ageDiscount": 0.10,
      "legalBasis": "지방세법 제127조",
      "fallbackUsed": true  // ⚠️ 배기량 추정
    },
    "maintenance": { "totalCost": 3168000, "annualCost": 1056000, "costPerKm": 88, "researchBasis": "DOE/ANL" },
    "depreciation": {
      "totalDepreciation": 11812500,
      "annualDepreciation": 3937500,
      "depreciationRate": 0.15,
      "estimatedResaleValue": 13187500,
      "dataPoints": 2,      // ⚠️ 데이터 부족
      "rSquared": 0.0,
      "fallbackUsed": true  // ⚠️ 일반 감가율 사용
    },
    "fuelCost": {
      "totalCost": 5040000,
      "annualCost": 1680000,
      "fuelPrice": 1400,
      "annualLiters": 857,
      "fallbackUsed": true  // ⚠️ 연비 추정
    }
  },
  "confidence": 0.65,
  "warnings": [
    "배기량 정보 없음: 가격대 기준 추정값 1800cc 사용",
    "감가상각 데이터 부족: 일반 감가율 15% 적용",
    "연비 정보 없음: 디젤 평균 연비 14km/L 사용"
  ]
}
```

---

## 🎯 Phase 1 성공 기준

### 필수 요구사항
- ✅ 5가지 비용 계산 모두 구현 완료
- ✅ 법률/연구 근거 명시 (acquisitionTax, vehicleTax, maintenance)
- ✅ 데이터 누락 시 폴백 전략 동작
- ✅ Unit Test 커버리지 > 90%
- ✅ Integration Test 통과

### 품질 지표
- **정확도**: 법률/연구 데이터와 100% 일치
- **성능**: 차량 1대당 TCO 계산 < 50ms
- **신뢰도**: 완전한 데이터 시 confidence > 0.9
- **강건성**: 누락 데이터 시에도 정상 동작

### 다음 단계 준비
- [ ] MultiAgentSystem 통합 준비 (Phase 2)
- [ ] WebSocket 메시지 프로토콜 정의
- [ ] 프론트엔드 UI 설계 (Phase 3)

---

**현재 상태**: Phase 0 완료 → Phase 1 시작 준비
**예상 소요 시간**: 5시간
**작성자**: Claude (AI Assistant)
**검토 필요**: 사용자 승인 후 구현 시작
