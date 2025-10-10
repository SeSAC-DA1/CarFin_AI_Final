# CARFIN AI - 매물 타입별 금융 추천 전략

## 📊 데이터 현황 (127,378개 차량)

| 매물 타입 | 개수 | 비율 | 특징 |
|-----------|------|------|------|
| **일반** | 121,086 | 95.1% | 개인/딜러 일반 판매 (현금/할부/리스 선택 가능) |
| **리스** | 4,301 | 3.4% | 리스 전용 매물 (리스 조건 포함) |
| **렌트** | 1,991 | 1.6% | 렌트 전용 매물 (단기 렌트 조건) |

---

## 🎯 사용자 시나리오별 추천 전략

### **시나리오 1: 일반 매물 선호 (95%)**
**사용자**: "현금이 있지만, 할부/리스도 고려 중"

**추천 방식**:
1. 일반 매물 121,086개 중 검색
2. Top 3 차량 선정 (TOPSIS)
3. 각 차량별 3가지 금융 방식 계산:
   - 일시불 (현금 구매)
   - 할부 (24/36/48/60개월)
   - 리스 (24/36개월)
4. 총 9가지 옵션 비교 대시보드 제공

**핀테크 강점**: "같은 차량, 다른 금융 방식 비교" → 최적 의사결정

---

### **시나리오 2: 할부 전용 매물 원함**
**사용자**: "딜러에서 제공하는 할부 조건이 궁금해요"

**문제**: 현재 데이터에 할부 전용 매물이 명시적으로 없음
**해결책**: 일반 매물 + 할부 계산으로 동일하게 처리

**추천 방식**:
1. 일반 매물 중 할부 적합 차량 검색
2. 딜러 할부 금리 4.5-6.5% 적용
3. 월 납부액 기준 정렬

---

### **시나리오 3: 리스 전용 매물 (3.4%, 4,301개)**
**사용자**: "차량 소유보다 월 부담 줄이고 싶어요"

**추천 방식**:
1. 리스 매물 4,301개 중 검색
2. Top 3 선정 (TOPSIS)
3. 리스 조건 포함:
   - 월 리스료
   - 보증금
   - 잔가 (30% 가정)
   - 주행거리 제한

**핀테크 강점**: "리스 vs 일반 매물 리스 전환 비교"

---

### **시나리오 4: 모두 비교 (Ultimate 추천)**
**사용자**: "어떤 방식이 가장 나한테 유리한지 모르겠어요"

**추천 방식**:
1. 일반 매물 Top 3 (현금/할부/리스 계산)
2. 리스 전용 매물 Top 1 (딜러 조건)
3. 총 4개 차량 × 금융 방식 비교
4. **AI가 사용자 프로필 기반 최적 추천**:
   - 월 소득 < 300만원 → 리스 추천
   - 월 소득 300-500만원 → 할부 추천
   - 월 소득 > 500만원 → 일시불 추천

---

## 🔧 구현 상세 설계

### **1. Schema 수정 (선택 사항)**

현재 `sellType` 컬럼만 있음. 리스 조건은 별도 테이블 필요 (추후 확장):

```sql
-- 리스 전용 매물 정보 (Phase 4 확장 시)
CREATE TABLE vehicles_lease (
  vehicle_id INTEGER PRIMARY KEY REFERENCES vehicles(vehicle_id),
  monthly_payment INTEGER,      -- 월 리스료
  deposit INTEGER,               -- 보증금
  residual_value INTEGER,        -- 잔가
  lease_term INTEGER,            -- 계약 기간 (개월)
  mileage_limit INTEGER          -- 연간 주행거리 제한
);
```

**현재 Phase 3**: 리스 매물도 일반 금융 계산으로 처리 (데이터 부족 시)

---

### **2. VehicleSearchFilters 수정**

```typescript
// shared/types/vehicle.ts

export interface VehicleSearchFilters {
  // 기존 필터
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  carType?: string;
  manufacturer?: string;
  model?: string;
  location?: string;
  limit?: number;
  offset?: number;

  // 🆕 매물 타입 필터
  sellType?: '일반' | '리스' | '렌트' | 'all';  // 'all' = 모두 보기
}
```

---

### **3. Storage 수정**

```typescript
// server/storage.ts

async searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]> {
  const conditions = [];

  // 기존 필터들...
  if (filters.minPrice) conditions.push(gte(vehiclesTable.price, filters.minPrice));
  // ...

  // 🆕 매물 타입 필터 (기존 Line 235 수정)
  if (filters.sellType && filters.sellType !== 'all') {
    conditions.push(eq(vehiclesTable.sellType, filters.sellType));
  } else if (!filters.sellType) {
    // 기본값: 일반 매물만 (기존 동작 유지)
    conditions.push(eq(vehiclesTable.sellType, '일반'));
  }
  // sellType === 'all' → 조건 추가 안 함 (모든 타입 검색)

  // 나머지 로직 동일...
}
```

---

### **4. ProfileExtractor 수정**

```typescript
// server/lib/agents/ProfileExtractor.ts

export interface ExtractedProfile {
  // 기존 필드들...
  budget?: number[];
  carType?: string;
  usage?: string[];

  // 🆕 결제 방식 선호도
  preferredPaymentMethod?: 'cash' | 'loan' | 'lease' | 'compare_all';

  // 🆕 매물 타입 선호도
  preferredSellType?: '일반' | '리스' | '렌트' | 'all';
}

quickExtract(userMessage: string): Partial<ExtractedProfile> {
  const profile: Partial<ExtractedProfile> = {};
  const msg = userMessage.toLowerCase();

  // 기존 추출 로직...

  // 🆕 결제 방식 키워드 추출
  if (msg.includes('일시불') || msg.includes('현금')) {
    profile.preferredPaymentMethod = 'cash';
    profile.preferredSellType = '일반';
  }

  if (msg.includes('할부') || msg.includes('분할')) {
    profile.preferredPaymentMethod = 'loan';
    profile.preferredSellType = '일반';
  }

  if (msg.includes('리스') || msg.includes('lease')) {
    profile.preferredPaymentMethod = 'lease';
    profile.preferredSellType = '리스'; // 리스 전용 매물 우선
  }

  if (msg.includes('비교') || msg.includes('모두') || msg.includes('추천')) {
    profile.preferredPaymentMethod = 'compare_all';
    profile.preferredSellType = 'all'; // 모든 타입 검색
  }

  return profile;
}
```

---

### **5. SearcherAgent 수정**

```typescript
// server/lib/agents/SearcherAgent.ts

private filterVehicles(
  vehicles: Vehicle[],
  criteria: any,
  userMessage?: string
): Vehicle[] {
  // 기존 필터링 로직...

  // 🆕 매물 타입 필터링
  let filtered = vehicles;

  if (criteria.preferredSellType && criteria.preferredSellType !== 'all') {
    filtered = filtered.filter(v => v.sellType === criteria.preferredSellType);
  }

  // 예산 필터링...
  if (criteria.budget) {
    filtered = filtered.filter(v =>
      v.price >= minPrice && v.price <= maxPrice
    );
  }

  // 품질 필터링...

  return this.ensureBrandDiversity(filtered, 50);
}
```

---

### **6. FinancialAdvisorAgent 매물 타입별 로직**

```typescript
// server/lib/agents/FinancialAdvisorAgent.ts

export class FinancialAdvisorAgent {
  async recommendFinancing(
    vehicle: Vehicle,
    tco: TCOBreakdown,
    userProfile: any
  ): Promise<FinancingRecommendation> {

    // 🆕 매물 타입별 분기
    if (vehicle.sellType === '리스') {
      // 리스 전용 매물 → 리스 조건만 제공
      return this.recommendLeaseOnly(vehicle, tco, userProfile);
    }

    if (vehicle.sellType === '렌트') {
      // 렌트 매물 → 렌트 조건 제공 (단기)
      return this.recommendRentalOnly(vehicle, userProfile);
    }

    // 일반 매물 → 3가지 방식 모두 계산
    return this.recommendAllOptions(vehicle, tco, userProfile);
  }

  private async recommendLeaseOnly(
    vehicle: Vehicle,
    tco: TCOBreakdown,
    userProfile: any
  ): Promise<FinancingRecommendation> {
    // 리스 전용 매물의 경우:
    // 1. 딜러가 제공하는 리스 조건 우선 (DB에 있다면)
    // 2. 없으면 표준 리스 계산 (잔가 30%, 금리 5.5%)

    const leaseOptions = [24, 36].map(term =>
      this.calculateLeaseOption(vehicle, tco, term, userProfile)
    );

    return {
      vehicleSellType: '리스',
      availableOptions: leaseOptions,
      bestRecommendation: leaseOptions[1], // 36개월 기본 추천
      comparison: {
        note: '리스 전용 매물입니다. 차량 소유권은 딜러에게 있습니다.'
      }
    };
  }

  private async recommendAllOptions(
    vehicle: Vehicle,
    tco: TCOBreakdown,
    userProfile: any
  ): Promise<FinancingRecommendation> {
    // 일반 매물 → 3가지 방식 모두 계산 (기존 로직)
    const cashOption = this.calculateCashOption(vehicle, tco, userProfile);
    const loanOptions = [24, 36, 48, 60].map(term =>
      this.calculateLoanOption(vehicle, tco, term, userProfile)
    );
    const leaseOptions = [24, 36].map(term =>
      this.calculateLeaseOption(vehicle, tco, term, userProfile)
    );

    const allOptions = [cashOption, ...loanOptions, ...leaseOptions];
    const bestRecommendation = this.selectBestOption(allOptions, userProfile);

    return {
      vehicleSellType: '일반',
      cashOption,
      loanOptions,
      leaseOptions,
      bestRecommendation,
      comparison: this.compareAllOptions(allOptions)
    };
  }
}
```

---

### **7. Frontend - ProfileSetup 5단계 추가**

```typescript
// client/src/pages/ProfileSetup.tsx

const STEPS = [
  { id: 'basic', title: '기본 정보', icon: User },
  { id: 'usage', title: '차량 용도', icon: Car },
  { id: 'budget', title: '예산 설정', icon: DollarSign },
  { id: 'importance', title: '중요도 조정', icon: BarChart3 },
  { id: 'payment', title: '결제 방식', icon: CreditCard }, // 🆕 5단계
];

// Step 5: 결제 방식 선호도
function PaymentMethodStep() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const methods = [
    {
      id: 'cash',
      title: '일시불 (현금 구매)',
      icon: '💵',
      description: '이자 부담 없음, 총 비용 최소',
      pros: ['이자 없음', '차량 소유권 즉시'],
      cons: ['초기 목돈 필요'],
      sellType: '일반'
    },
    {
      id: 'loan',
      title: '할부 (분할 납부)',
      icon: '📅',
      description: '월 부담 분산, 초기 비용 적음',
      pros: ['초기 부담 적음', '차량 소유권 확보'],
      cons: ['이자 발생'],
      sellType: '일반'
    },
    {
      id: 'lease',
      title: '리스 (임대)',
      icon: '🔄',
      description: '월 납부액 가장 적음, 신차 교체 용이',
      pros: ['월 부담 최소', '신차 교체 쉬움'],
      cons: ['차량 소유권 없음', '주행거리 제한'],
      sellType: '리스'
    },
    {
      id: 'compare_all',
      title: '모두 비교해주세요',
      icon: '📊',
      description: 'AI가 최적 방식 추천',
      pros: ['모든 옵션 비교', 'AI 추천'],
      cons: [],
      sellType: 'all'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">어떤 방식으로 차량을 구매하시나요?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map(method => (
          <Card
            key={method.id}
            className={cn(
              "p-6 cursor-pointer transition-all",
              selectedMethod === method.id && "border-2 border-blue-500 bg-blue-50"
            )}
            onClick={() => {
              setSelectedMethod(method.id);
              updateProfile({
                preferredPaymentMethod: method.id,
                preferredSellType: method.sellType
              });
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{method.icon}</span>
              <h3 className="text-lg font-semibold">{method.title}</h3>
            </div>

            <p className="text-sm text-gray-600 mb-3">{method.description}</p>

            <div className="space-y-2">
              {method.pros.map(pro => (
                <div key={pro} className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pro}</span>
                </div>
              ))}
              {method.cons.map(con => (
                <div key={con} className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{con}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 예상 효과

### **1. 포트폴리오 점수 향상**

| 항목 | 기존 | 매물 타입 추가 | 향상 |
|------|------|---------------|------|
| **핀테크 혁신** | 75 | **95** | +20 |
| **사용자 경험** | 95 | **98** | +3 |
| **실용성** | 85 | **95** | +10 |
| **전체 평균** | 89 | **96** | **+7** |

---

### **2. 핀테크 공모전 차별점**

```
기존 중고차 플랫폼:
"차량 가격만 표시"

CARFIN AI v1:
"차량 + TCO 계산"

CARFIN AI v2 (매물 타입 통합):
"일반/리스 매물 구분 + 타입별 최적 금융 솔루션"
→ 실제 사용자 의사결정에 필요한 모든 정보 제공
```

---

### **3. 실제 사용 시나리오**

**시나리오 A**: "3000만원 SUV 찾아요"
- 기존: 일반 매물만 검색 → 할부/리스 계산
- 개선: 일반 매물 + 리스 매물 모두 검색 → 비교 제공

**시나리오 B**: "월 50만원 이하로 SUV 타고 싶어요"
- AI가 자동으로 리스 매물 우선 추천
- 리스 전용 4,301개 차량 활용

**시나리오 C**: "어떤 방식이 가장 저렴한지 모르겠어요"
- 일반 Top 3 (현금/할부/리스 각각 계산)
- 리스 전용 Top 1
- 총 4개 차량 × 금융 방식 비교 대시보드

---

## ✅ 구현 우선순위

### **Phase 3-E 수정안**

| 우선순위 | 기능 | 소요 | 임팩트 |
|---------|------|------|--------|
| **1** | VehicleSearchFilters sellType 추가 | 0.5h | 필수 |
| **2** | SearcherAgent 매물 타입 필터링 | 1h | 필수 |
| **3** | ProfileSetup 5단계 (결제 방식) | 2h | 핵심 |
| **4** | FinancialAdvisorAgent 매물 타입별 로직 | 3h | 핵심 |
| **5** | 금융 비교 UI (타입별 구분) | 2h | 차별화 |

**총 8.5시간 (1.5일)** → **포트폴리오 96점 달성 가능**

---

## 🎯 최종 추천

**채택**: ✅ 매물 타입별 추천 시스템 구현
- 실제 데이터 활용 (리스 4,301개)
- 사용자 선택권 확대
- 핀테크 차별점 강화
- 포트폴리오 점수 +7점 (89 → 96)

**다음 단계**: Phase 3-E 구현 시작?
