# 🚨 필터링 시스템 치명적 버그 수정 계획

## ⚠️ 심각도: CRITICAL

**시연 중 발생 가능한 문제**:
- ✅ 예산 3000만원 설정 → ❌ 3000만원 넘는 차량 추천
- ✅ SUV 선택 → ❌ 세단/승합차 추천
- ✅ 현대/기아 선호 → ❌ 쌍용/르노 추천

**근본 원인**: 프로필 데이터 구조와 필터링 로직 간 불일치

---

## 🔍 근본 원인 분석

### 문제 1: 프로필 필드명 불일치

**ProfileSetup.tsx에서 전송하는 데이터**:
```typescript
{
  budget: [2500, 3500],        // ✅ 정상
  vehicleTypes: ['SUV'],        // ❌ vehicleTypes (배열)
  preferredBrands: ['현대', '기아'],  // ❌ preferredBrands (배열)
  fuelType: '디젤',             // ✅ 정상
  transmission: '오토',         // ✅ 정상
  importance: {...}             // ✅ 정상
}
```

**SearcherAgent.ts에서 기대하는 데이터**:
```typescript
{
  budget: [2500, 3500],        // ✅ 매칭됨
  carType: 'SUV',              // ❌ undefined! (실제는 vehicleTypes)
  brand: '현대',                // ❌ undefined! (실제는 preferredBrands)
  fuelType: '디젤',            // ✅ 매칭됨
}
```

**결과**:
- 예산 필터링만 작동 ✅
- 차종 필터링 실패 ❌ (userMessage에서만 추출)
- 브랜드 필터링 실패 ❌

### 문제 2: 배열 vs 문자열 타입 불일치

**프로필**:
```typescript
vehicleTypes: ['SUV', '세단']  // 배열 (복수 선택 가능)
preferredBrands: ['현대', '기아']  // 배열 (복수 선택 가능)
```

**필터링 로직**:
```typescript
let targetCarType = criteria.carType;  // 문자열 기대
if (targetCarType === 'SUV') {...}     // 배열과 비교 불가
```

### 문제 3: SUV 승합차 구분 실패

**현재 로직** (SearcherAgent.ts:157-162):
```typescript
if (requestedType === 'suv') {
  const isSUV = carTypeLower.includes('suv') ||
                carTypeLower.includes('rv') ||
                (carTypeLower.includes('스포츠') && carTypeLower.includes('유틸리티'));
  if (!isSUV) return false;
}
```

**문제**:
- "승합차"는 `isSUV` 체크를 통과 (includes 실패 → return false 실행)
- 하지만 데이터베이스 전체를 대상으로 하면 SUV가 아닌 차량도 포함됨

---

## 🛠️ 해결 방안

### 단계 1: 프로필 필드명 통일 (긴급)

**옵션 A: 프론트엔드 수정** (권장)
ProfileSetup.tsx에서 전송 전 데이터 변환:

```typescript
// ProfileSetup.tsx 완료 버튼 클릭 시
const handleComplete = () => {
  const normalizedProfile = {
    ...profileData,
    // 🔧 필드명 통일
    carType: profileData.vehicleTypes?.[0], // 첫 번째 선택만 (단일 값)
    carTypes: profileData.vehicleTypes,     // 전체 배열 보존
    brand: profileData.preferredBrands?.[0],
    brands: profileData.preferredBrands,
  };

  localStorage.setItem('carfin_user_profile', JSON.stringify(normalizedProfile));
  setLocation('/chat');
};
```

**옵션 B: 백엔드 수정** (추천 - 더 안전)
SearcherAgent.ts에서 프로필 정규화:

```typescript
// SearcherAgent.ts:70 filterVehicles() 시작 부분
private filterVehicles(vehicles: Vehicle[], criteria: any, userMessage?: string): Vehicle[] {
  // 🔧 프로필 정규화 (필드명 통일)
  const normalizedCriteria = {
    ...criteria,
    carType: criteria.carType || criteria.vehicleTypes?.[0] || null,
    carTypes: criteria.carTypes || criteria.vehicleTypes || [],
    brand: criteria.brand || criteria.preferredBrands?.[0] || null,
    brands: criteria.brands || criteria.preferredBrands || [],
  };

  console.log('📋 정규화된 criteria:', normalizedCriteria);

  // 이후 normalizedCriteria 사용
  let targetCarType = normalizedCriteria.carType;
  let targetBrands = normalizedCriteria.brands;
  ...
}
```

### 단계 2: SUV 필터링 강화 (긴급)

**SearcherAgent.ts:154-170 수정**:

```typescript
// 차종 필터
if (targetCarType) {
  const requestedType = targetCarType.toLowerCase();

  if (requestedType === 'suv') {
    // ❌ 명시적으로 승합차 제외
    if (carTypeLower.includes('승합') ||
        carTypeLower.includes('미니밴') ||
        carTypeLower.includes('van') ||
        carTypeLower.includes('mpv')) {
      console.log(`🚫 SUV 제외: ${v.model} (${v.carType} - 승합차)`);
      return false;
    }

    // ❌ 세단도 제외
    if (carTypeLower.includes('세단') || carTypeLower.includes('sedan')) {
      console.log(`🚫 SUV 제외: ${v.model} (${v.carType} - 세단)`);
      return false;
    }

    // ❌ 경차도 제외
    if (carTypeLower.includes('경차') || carTypeLower.includes('경형')) {
      console.log(`🚫 SUV 제외: ${v.model} (${v.carType} - 경차)`);
      return false;
    }

    // ✅ SUV 매칭
    const isSUV = carTypeLower.includes('suv') ||
                  carTypeLower.includes('rv') ||
                  (carTypeLower.includes('스포츠') && carTypeLower.includes('유틸리티'));

    if (!isSUV) {
      console.log(`🚫 SUV 아님: ${v.model} (${v.carType})`);
      return false;
    }

    console.log(`✅ SUV 매칭: ${v.model} (${v.carType})`);

  } else if (requestedType === '세단') {
    const isSedan = carTypeLower.includes('세단') || carTypeLower.includes('sedan');
    if (!isSedan) return false;

  } else if (requestedType === '경차') {
    const isKCar = carTypeLower.includes('경차') || carTypeLower.includes('경형');
    if (!isKCar) return false;

  } else if (requestedType === '승합' || requestedType === '승합차') {
    const isVan = carTypeLower.includes('승합') ||
                  carTypeLower.includes('미니밴') ||
                  carTypeLower.includes('van') ||
                  carTypeLower.includes('mpv');
    if (!isVan) return false;
  }
}
```

### 단계 3: 브랜드 필터링 추가

**SearcherAgent.ts:170 이후 추가**:

```typescript
// 브랜드 필터 (선호 브랜드가 있을 경우)
if (targetBrands && targetBrands.length > 0) {
  const vehicleBrand = (v.manufacturer || '').toLowerCase();
  const matchesBrand = targetBrands.some(brand =>
    vehicleBrand.includes(brand.toLowerCase())
  );

  if (!matchesBrand) {
    console.log(`🚫 브랜드 불일치: ${v.manufacturer} (선호: ${targetBrands.join(', ')})`);
    return false;
  }

  console.log(`✅ 브랜드 매칭: ${v.manufacturer}`);
}

// 연료 타입 필터 (선호가 있을 경우)
if (normalizedCriteria.fuelType && normalizedCriteria.fuelType !== '') {
  const vehicleFuelType = (v.fuelType || '').toLowerCase();
  const requestedFuelType = normalizedCriteria.fuelType.toLowerCase();

  // 하이브리드는 유연하게 매칭
  if (requestedFuelType.includes('하이브리드')) {
    if (!vehicleFuelType.includes('하이브리드') &&
        !vehicleFuelType.includes('hybrid')) {
      console.log(`🚫 연료 불일치: ${v.fuelType} (요청: 하이브리드)`);
      return false;
    }
  } else {
    // 정확한 매칭
    if (!vehicleFuelType.includes(requestedFuelType)) {
      console.log(`🚫 연료 불일치: ${v.fuelType} (요청: ${normalizedCriteria.fuelType})`);
      return false;
    }
  }

  console.log(`✅ 연료 매칭: ${v.fuelType}`);
}
```

---

## 📝 구현 순서

### Phase 1: 긴급 핫픽스 (30분)

1. **SearcherAgent.ts 수정**:
   - 프로필 정규화 로직 추가 (criteria → normalizedCriteria)
   - SUV 필터링에 승합차/세단/경차 명시적 제외
   - 브랜드 필터링 추가
   - 연료 타입 필터링 추가

2. **테스트**:
   ```
   시나리오 A: "3000만원 이하 가족용 SUV"
   - 예산: 0-3000만원 ✅
   - 차종: SUV만 ✅ (승합차 제외)
   - 브랜드: 현대/기아만 ✅
   ```

3. **배포**:
   ```bash
   git commit -m "🐛 Hotfix: 프로필 필터링 치명적 버그 수정"
   git push origin railway-production
   ```

### Phase 2: ProfileSetup 개선 (1시간)

1. **단일 선택 vs 복수 선택 명확화**:
   ```typescript
   // 차종: 단일 선택 (라디오 버튼)
   vehicleType: 'SUV'  // 문자열

   // 브랜드: 복수 선택 (체크박스)
   preferredBrands: ['현대', '기아']  // 배열
   ```

2. **데이터 변환 로직 추가**:
   ```typescript
   const normalizedProfile = {
     ...profileData,
     carType: profileData.vehicleTypes?.[0],
     brands: profileData.preferredBrands,
   };
   ```

---

## 🧪 테스트 케이스

### Test 1: 시나리오 A (가족용 SUV)
```yaml
Input:
  - 프로필: 예산 2500-3500, 차종 SUV, 브랜드 현대/기아, 연료 디젤
  - 메시지: "3000만원 이하 가족용 SUV 찾습니다"

Expected:
  - 예산: 0-3000만원 (메시지 우선)
  - 차종: SUV만 (투싼, 스포티지, 싼타페 등)
  - 브랜드: 현대 또는 기아만
  - 연료: 디젤 선호

Not Expected:
  - ❌ 스타리아 (승합차)
  - ❌ 아반떼 (세단)
  - ❌ 3000만원 초과 차량
  - ❌ 쌍용, 르노 등 다른 브랜드
```

### Test 2: 시나리오 B (출퇴근 세단)
```yaml
Input:
  - 프로필: 예산 1500-2500, 차종 세단, 브랜드 현대/기아, 연료 하이브리드
  - 메시지: "1500만원대 출퇴근용 세단, 연비 좋은 걸로요"

Expected:
  - 예산: 1200-1800만원 (메시지 우선 ±20%)
  - 차종: 세단만 (아반떼, 쏘나타, K3, K5)
  - 브랜드: 현대 또는 기아만
  - 연료: 하이브리드 우선, 가솔린 허용

Not Expected:
  - ❌ 투싼 (SUV)
  - ❌ 스타리아 (승합차)
  - ❌ 1500만원 크게 벗어나는 차량
```

### Test 3: 필터 없음 (자유 추천)
```yaml
Input:
  - 프로필: 예산 2000-4000, 차종 없음, 브랜드 없음
  - 메시지: "가족용 차 추천해주세요"

Expected:
  - 예산: 2000-4000만원
  - 차종: SUV, 승합차, 세단 등 다양하게
  - 브랜드: 다양하게
```

---

## 🚀 배포 체크리스트

### 배포 전
- [ ] SearcherAgent.ts 수정 완료
- [ ] 로컬 테스트 (시나리오 A, B)
- [ ] 콘솔 로그 확인 (필터링 과정 출력)
- [ ] Git 커밋 메시지 작성

### 배포 중
- [ ] Git push
- [ ] Railway 자동 배포 확인 (5분)
- [ ] Health Check API 정상 확인

### 배포 후
- [ ] 시나리오 A 실제 테스트
- [ ] 시나리오 B 실제 테스트
- [ ] 추천 결과 검증 (SUV만 나오는지)
- [ ] 콘솔 로그 확인 (Railway Logs)

---

## ⚠️ 주의사항

### 롤백 계획
```bash
# 문제 발생 시 즉시 롤백
git revert HEAD
git push origin railway-production
```

### 모니터링 포인트
1. **필터링 로그**: `🚫 SUV 제외:`, `✅ SUV 매칭:`
2. **추천 결과**: 차종, 예산, 브랜드 일치 여부
3. **사용자 피드백**: "요청과 다른 차량이 추천됨"

---

## 📊 예상 효과

### Before (현재)
- 프로필 설정해도 반영 안 됨 ❌
- SUV 요청 → 승합차 추천 ❌
- 브랜드 설정 무시 ❌
- **시연 실패 위험: HIGH** 🔴

### After (수정 후)
- 프로필 완벽 반영 ✅
- SUV 요청 → SUV만 추천 ✅
- 브랜드 필터링 작동 ✅
- **시연 성공 확률: 95%+** 🟢

---

**생성 일시**: 2025-10-13 11:45 (KST)
**우선순위**: 🔴 **치명적 (CRITICAL)**
**예상 소요 시간**: 30분 (긴급 핫픽스)
**담당**: Backend Team
**검증**: 시나리오 A, B 완전 테스트 필수
