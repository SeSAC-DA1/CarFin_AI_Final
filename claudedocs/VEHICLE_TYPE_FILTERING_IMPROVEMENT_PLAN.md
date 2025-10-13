# 🚨 차량 타입 필터링 개선 계획

## 📋 문제 분석

### 발견된 문제
**시나리오**: "3000만원 이하 가족용 SUV 찾습니다"
**기대 결과**: SUV 차량 (투싼, 스포티지, 싼타페 등)
**실제 결과**: 스타리아 (승합차/MPV) 추천됨

### 근본 원인
1. **데이터베이스 차량 분류 문제**
   - 스타리아의 `carType`: "승합차"
   - 현재 SUV 필터: `carType.includes('suv')` 또는 `carType.includes('rv')`
   - **"승합차"는 SUV가 아님에도 필터링되지 않음**

2. **필터링 로직 부재**
   ```typescript
   // 현재 코드 (SearcherAgent.ts:157-162)
   if (requestedType === 'suv') {
     const isSUV = carTypeLower.includes('suv') ||
                   carTypeLower.includes('rv') ||
                   (carTypeLower.includes('스포츠') && carTypeLower.includes('유틸리티'));
     if (!isSUV) return false;  // ❌ "승합차"는 false가 아님!
   }
   ```

3. **차량 타입 매핑 테이블 부재**
   - 데이터베이스의 `carType` 값과 사용자 요청 차종 간 매핑이 없음
   - 예: "승합차" → SUV가 아님 (미니밴/MPV)

---

## 🔍 데이터베이스 차량 타입 현황 조사

### 조사 필요 항목
1. 데이터베이스에 실제로 존재하는 모든 `carType` 값 목록
2. 각 `carType` 별 차량 수
3. 잘못 분류된 차량 타입 확인

### 예상되는 carType 값들
```yaml
SUV 계열:
  - "SUV"
  - "RV"
  - "스포츠 유틸리티"
  - "소형 SUV"
  - "중형 SUV"
  - "대형 SUV"

세단 계열:
  - "세단"
  - "소형"
  - "준중형"
  - "중형"
  - "대형"

기타:
  - "승합차" ← ❌ SUV가 아님 (미니밴)
  - "해치백"
  - "쿠페"
  - "왜건"
  - "경차"
  - "화물차"
  - "트럭"
```

---

## 🛠️ 해결 방안

### 방안 1: 차량 타입 매핑 테이블 생성 (권장)

**장점**:
- 명확한 분류 기준
- 유지보수 용이
- 확장 가능

**구현**:
```typescript
// server/lib/constants/vehicleTypeMapping.ts
export const VEHICLE_TYPE_MAPPING = {
  SUV: [
    'suv',
    'rv',
    '스포츠 유틸리티',
    '소형 suv',
    '준중형 suv',
    '중형 suv',
    '대형 suv',
    'suv(소형)',
    'suv(중형)',
    'suv(대형)',
  ],
  세단: [
    '세단',
    '소형',
    '준중형',
    '중형',
    '대형',
    '소형 세단',
    '준중형 세단',
    '중형 세단',
    '대형 세단',
    'sedan',
  ],
  해치백: [
    '해치백',
    'hatchback',
  ],
  쿠페: [
    '쿠페',
    'coupe',
  ],
  왜건: [
    '왜건',
    '스테이션 왜건',
    'wagon',
  ],
  승합차: [
    '승합차',
    '미니밴',
    'van',
    'mpv',
  ],
  경차: [
    '경차',
    '경형',
  ],
  // ❌ 제외 대상 (상용차)
  화물차: [
    '화물차',
    '트럭',
    '밴',
  ],
};

// SUV가 아닌 것들을 명시적으로 제외
export const NOT_SUV_TYPES = [
  '승합차',  // ❌ 스타리아
  '미니밴',
  'van',
  'mpv',
  '세단',
  '해치백',
  '쿠페',
  '왜건',
  '경차',
  '화물차',
  '트럭',
];

export function isMatchingVehicleType(
  vehicleCarType: string,
  requestedType: string
): boolean {
  const carTypeLower = (vehicleCarType || '').toLowerCase();
  const mappingKey = requestedType.toUpperCase();

  // 요청된 타입의 매핑 목록 가져오기
  const acceptedTypes = VEHICLE_TYPE_MAPPING[mappingKey] || [];

  // 매칭 확인
  const isMatch = acceptedTypes.some(type => carTypeLower.includes(type));

  // SUV의 경우 명시적으로 제외할 타입 체크
  if (mappingKey === 'SUV') {
    const isExcluded = NOT_SUV_TYPES.some(type => carTypeLower.includes(type));
    if (isExcluded) {
      console.log(`🚫 SUV 제외: ${vehicleCarType} (승합차/미니밴)`);
      return false;
    }
  }

  return isMatch;
}
```

### 방안 2: 데이터베이스 carType 필드 정규화

**장점**:
- 데이터 일관성 확보
- 필터링 로직 단순화

**단점**:
- 기존 데이터 마이그레이션 필요
- 시간 소요

**구현**:
```sql
-- carType 값 정규화
UPDATE vehicles
SET carType = 'SUV'
WHERE carType IN ('RV', '스포츠 유틸리티', '소형 SUV', '중형 SUV', '대형 SUV');

UPDATE vehicles
SET carType = '세단'
WHERE carType IN ('소형', '준중형', '중형', '대형', '소형 세단', '준중형 세단');

-- 승합차는 그대로 유지 (SUV가 아님을 명확히)
UPDATE vehicles
SET carType = '승합차'
WHERE carType IN ('미니밴', 'VAN', 'MPV');
```

### 방안 3: 모델명 기반 추가 검증

**장점**:
- carType이 애매할 때 보조 수단
- 정확도 향상

**구현**:
```typescript
// server/lib/constants/vehicleModels.ts
export const KNOWN_SUV_MODELS = [
  '투싼',
  '스포티지',
  '싼타페',
  '팰리세이드',
  'GV70',
  'GV80',
  '쏘렌토',
  '셀토스',
  '니로',
  '코나',
  'X5',
  'Q5',
  'RX',
  'NX',
];

export const KNOWN_NON_SUV_MODELS = [
  '스타리아',  // ❌ 승합차
  '카니발',    // ❌ 승합차
  '그랜드 스타렉스', // ❌ 승합차
  '쏘나타',    // 세단
  '아반떼',    // 세단
  'K5',        // 세단
  'K3',        // 세단
];

export function isSUVModel(modelName: string): boolean {
  const modelLower = (modelName || '').toLowerCase();

  // 명시적으로 SUV가 아닌 모델 체크
  const isNotSUV = KNOWN_NON_SUV_MODELS.some(model =>
    modelLower.includes(model.toLowerCase())
  );

  if (isNotSUV) return false;

  // SUV 모델 체크
  return KNOWN_SUV_MODELS.some(model =>
    modelLower.includes(model.toLowerCase())
  );
}
```

---

## 📝 구현 우선순위

### Phase 1: 긴급 핫픽스 (1시간)
**목표**: 스타리아 등 승합차가 SUV로 추천되지 않도록 즉시 차단

**구현**:
```typescript
// SearcherAgent.ts 157-162줄 수정
if (requestedType === 'suv') {
  // ❌ 명시적으로 승합차 제외
  if (carTypeLower.includes('승합') ||
      carTypeLower.includes('미니밴') ||
      carTypeLower.includes('van') ||
      carTypeLower.includes('mpv')) {
    console.log(`🚫 SUV 제외: ${v.model} (${v.carType})`);
    return false;
  }

  // ✅ SUV 매칭
  const isSUV = carTypeLower.includes('suv') ||
                carTypeLower.includes('rv') ||
                (carTypeLower.includes('스포츠') && carTypeLower.includes('유틸리티'));

  if (!isSUV) return false;
}
```

**테스트**:
- "3000만원 이하 가족용 SUV" → 스타리아 제외 확인
- "투싼, 스포티지, 싼타페" 등 실제 SUV만 추천되는지 확인

---

### Phase 2: 차량 타입 매핑 테이블 구현 (3시간)
**목표**: 모든 차량 타입에 대한 명확한 매핑 기준 수립

**구현 순서**:
1. 데이터베이스 `carType` 값 전수 조사
   ```sql
   SELECT DISTINCT carType, COUNT(*) as count
   FROM vehicles
   GROUP BY carType
   ORDER BY count DESC;
   ```

2. `vehicleTypeMapping.ts` 파일 생성
3. `SearcherAgent.ts`에서 `isMatchingVehicleType()` 함수 사용
4. 전체 차종 (SUV, 세단, 해치백, 쿠페, 왜건, 경차) 테스트

**테스트 케이스**:
- "SUV 찾아요" → SUV만 나옴 (승합차 제외)
- "세단 찾아요" → 세단만 나옴
- "해치백 찾아요" → 해치백만 나옴
- "가족용 차 찾아요" → SUV + 승합차 (명시하지 않았으므로 다양하게)

---

### Phase 3: 데이터베이스 정규화 (선택, 8시간)
**목표**: carType 필드 값 일관성 확보

**작업**:
1. 백업 생성
2. carType 값 정규화 SQL 실행
3. 애플리케이션 배포
4. 전수 테스트

---

## 🧪 테스트 시나리오

### 긴급 핫픽스 후 테스트
```yaml
Test 1: SUV 요청
  Input: "3000만원 이하 가족용 SUV 찾습니다"
  Expected: 투싼, 스포티지, 싼타페, 팰리세이드 등
  Not Expected: 스타리아, 카니발 (승합차)

Test 2: 승합차 명시적 요청
  Input: "가족용 승합차 추천해주세요"
  Expected: 스타리아, 카니발
  Not Expected: 투싼, 스포티지 (SUV)

Test 3: 세단 요청
  Input: "출퇴근용 세단 찾아요"
  Expected: 아반떼, 쏘나타, K3, K5
  Not Expected: SUV, 승합차

Test 4: 차종 미지정
  Input: "3000만원대 가족용 차 추천"
  Expected: SUV, 승합차, 세단 등 다양하게
```

---

## 📊 성공 기준

### 필터링 정확도
- **SUV 요청 시 SUV만 추천**: 100%
- **승합차 제외**: 100%
- **세단 요청 시 세단만 추천**: 100%

### 사용자 만족도
- "요청한 차종과 맞지 않아요" 피드백: 0건
- 추천 결과 만족도: 90% 이상

### 성능
- 필터링 로직 추가로 인한 응답 시간 증가: 50ms 이하

---

## 🚀 배포 계획

### 긴급 핫픽스 배포
1. `SearcherAgent.ts` 수정
2. Git 커밋: "🐛 Hotfix: SUV 필터링 시 승합차 명시적 제외"
3. Railway 배포 (5분)
4. 즉시 테스트

### Phase 2 배포
1. `vehicleTypeMapping.ts` 생성
2. `SearcherAgent.ts` 리팩토링
3. 단위 테스트 추가
4. Git 커밋: "✨ Feature: 차량 타입 매핑 테이블 구현"
5. Railway 배포
6. 전수 테스트 (시나리오 A, B 포함)

---

## 📞 롤백 계획

### 핫픽스 롤백
```bash
git revert HEAD
git push origin railway-production
```

### Phase 2 롤백
```bash
git reset --hard <이전_커밋_해시>
git push --force origin railway-production
```

---

## 🎯 예상 효과

### Before (현재)
- "SUV 찾아요" → 스타리아 (승합차) 추천 ❌
- 사용자 불만족
- 신뢰도 하락

### After (개선 후)
- "SUV 찾아요" → 투싼, 스포티지, 싼타페 추천 ✅
- 사용자 만족도 향상
- 시스템 신뢰도 증가
- 논문 기반 알고리즘의 가치 부각

---

**생성 일시**: 2025-10-13 11:30 (KST)
**우선순위**: 🔴 **긴급 (Critical)**
**담당**: Backend Team
**예상 소요 시간**:
- Phase 1 (핫픽스): 1시간
- Phase 2 (매핑 테이블): 3시간
- Phase 3 (DB 정규화): 8시간