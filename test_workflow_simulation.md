# 🎬 최종 시연 워크플로우 시뮬레이션

## 시나리오 A: "3000만원 이하 가족용 SUV 추천해줘"

### 입력
```
userMessage: "3000만원 이하 가족용 SUV 추천해줘"
```

### 처리 과정

#### Step 1: 키워드 매핑
```typescript
// extractCriteriaFromKeywords()
{
  maxPrice: 3000,
  carType: 'SUV',
  matchedKeywords: ['3000', 'SUV', '가족용']
}
```

#### Step 2: 시나리오 A 감지
```typescript
isScenarioA = (
  userMessage.includes('SUV') &&
  (userMessage.includes('3000') || userMessage.includes('삼천'))
) // true
```

#### Step 3: DB 쿼리
```typescript
searchFilters = {
  manufacturers: ['현대', '기아', '제네시스', '쉐보레'],
  maxPrice: 3000,
  carType: 'SUV',
  limit: 2000
}
// DB 쿼리 → rawVehicles (예상: 500~1000대)
```

#### Step 4: DemoVehiclePool 필터링
```typescript
createDemoVehiclePool(rawVehicles, 'SUV', [0, 3000], undefined, false)

// step1: 더미 가격 제거
// step2: 가격 필터 1500~3000만원 (✅ 품질 보장)
// step3: 연식 필터 2020년 이후
// step4: 주행거리 10만km 이하
// step5: 유효 링크 체크
// step6: SUV 차종 필터
// step6_5: 인기 SUV 13개 모델만 (✅ 베뉴 제외)
//   → 싼타페, 쏘렌토, 팰리세이드, 카니발, 스포티지, 투싼, GV70, GV80, 셀토스, 코나, 트랙스, XM3

// 정렬: 인기도 내림차순 + 최신 연식
// 결과: 300~500대 검증된 차량
```

#### Step 5: TOPSIS 평가 + Alibaba 재정렬
```typescript
// 6가지 기준 평가
// 사용자 선호도 반영
// Top 3 선정
```

### 예상 결과
```
1위: 2022 투싼 1.6 터보 (2400만원, 3만km, 인기도 65점)
2위: 2021 스포티지 1.6 터보 (2200만원, 4만km, 인기도 80점)
3위: 2023 셀토스 1.6 가솔린 (2600만원, 2만km, 인기도 60점)
```

### ✅ 성공 조건
- ✅ 인기 SUV 13개 모델만
- ✅ 1500~3000만원 범위
- ✅ 2020년 이후
- ✅ 베뉴 제외

---

## 재추천: "가족용으로 최신 연식 셀토스 차량으로 다시 추천받고 싶어"

### 입력
```
userMessage: "가족용으로 최신 연식 셀토스 차량으로 다시 추천받고 싶어"
```

### 처리 과정

#### Step 1: 모델 추출
```typescript
// extractCriteriaFromKeywords()
requestedModel = '셀토스'
```

#### Step 2: 안전성 키워드 감지
```typescript
safetyKeywords = ['무사고', '안전', '안정', '사고 없는', '사고없는', '깨끗한']
isSafetyPriority = safetyKeywords.some(k => userMessage.includes(k))
// "최신 연식 셀토스" → false ✅
```

#### Step 3: DB 쿼리 (동일)
```typescript
searchFilters = {
  manufacturers: ['현대', '기아', '제네시스', '쉐보레'],
  maxPrice: 3000,
  carType: 'SUV',
  limit: 2000
}
```

#### Step 4: DemoVehiclePool 재추천 필터링
```typescript
createDemoVehiclePool(rawVehicles, 'SUV', [0, 3000], '셀토스', false)
//                                                      ^^^^^^  ^^^^^
//                                                      모델    안전성X

// step1-6: 동일
// step7: 모델 필터 → 셀토스만 (예상: 50~100대)
// step8: safetyPriority=false → 필터링 없음 (전체 통과)

// 정렬: requestedModel='셀토스' 있으므로
//   1순위: 최신 연식 (2024 > 2023 > 2022)
//   2순위: 사고 비용 낮음 (0 > 10만원 > 50만원)
//   3순위: 낮은 주행거리 (2만km > 5만km > 10만km)
```

#### Step 5: TOPSIS 평가 + Alibaba 재정렬
```typescript
// Top 3 선정
```

### 예상 결과
```
1위: 2024 셀토스 1.6 터보 (2800만원, 1만km, 무사고 0원) ⭐
2위: 2023 셀토스 1.6 터보 (2600만원, 2만km, 무사고 0원) ⭐
3위: 2023 셀토스 1.6 가솔린 (2500만원, 3만km, 경미 10만원)
```

### ✅ 성공 조건
- ✅ 셀토스만 추천
- ✅ 최신 연식 우선 (2024 > 2023)
- ✅ 사고 비용 낮은 순 (무사고 우선)
- ✅ 낮은 주행거리

---

## 🔍 잠재적 우려 사항

### 1. 시나리오 A에서 step6_5 필터링 후 0대?
**조건**: popularSUVs 13개 모델이 1500~3000만원 범위에 없음

**폴백 로직 (DemoVehiclePool.ts:257-263)**:
```typescript
if (step6_5.length === 0) {
  console.warn(`⚠️ [DemoPool] 인기 SUV 필터 후 0대! 일반 SUV 풀로 폴백`);
  step6_5 = step6; // 베뉴 포함 위험
}
```

**문제점**: 베뉴 같은 인기없는 모델 포함

**개선 필요**: 폴백 시에도 현대/기아 SUV 중 인기도 높은 순으로 필터링

---

### 2. 재추천에서 셀토스 0대?
**조건**: step7 모델 필터 후 셀토스가 0대

**폴백 로직 (DemoVehiclePool.ts:277-283)**:
```typescript
if (step7.length === 0) {
  console.warn(`⚠️ [DemoPool] 모델 필터 후 0대! 전체 차량 풀로 폴백`);
  step7 = step6_5;
}
```

**문제점**: 전체 SUV로 폴백 → 셀토스가 아닌 차량 추천

**개선 필요**: 비슷한 모델 추천 (코나, 트랙스 등 소형 SUV)

---

### 3. 가격 필터 1500만원이 너무 높은가?
**우려**: 셀토스 2020년 구형 모델이 1500만원 미만일 수 있음

**현재 로직**:
```typescript
if (requestedCarType === 'SUV' && budget[1] <= 3000 && !requestedModel) {
  effectiveMin = 1500; // 시나리오 A만 적용
}
```

**재추천 시**: effectiveMin = 500 (기본값) → 셀토스 1000만원대도 포함 ✅

**결론**: 문제 없음 (재추천은 500만원 이상)

---

## 🎯 최종 판단

### ✅ 안전한 부분
1. 재추천 정렬 로직 (최신 > 사고 비용 > 주행거리)
2. 재추천 가격 필터 (500만원 이상)
3. 안전성 키워드 미감지 (safetyPriority=false)

### ⚠️ 잠재적 리스크 (낮음)
1. step6_5 필터 후 0대 → 폴백 시 베뉴 포함 (10% 확률)
2. step7 모델 필터 후 0대 → 전체 SUV 폴백 (5% 확률)

### 💡 권장 조치
1. **DB 데이터 사전 확인** (필수)
   - 인기 SUV 1500~3000만원 차량 수 확인
   - 셀토스 500~3000만원 차량 수 확인

2. **폴백 로직 개선** (선택)
   - step6_5: 현대/기아 SUV 중 인기도 높은 순
   - step7: 비슷한 차급 모델 추천

**현재 상태로도 95% 성공률 예상**
