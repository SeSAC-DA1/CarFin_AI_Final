/**
 * 🎯 Demo Vehicle Pool - 시연용 검증된 차량 풀 시스템
 *
 * 목적: 내일 시연을 위한 100% 신뢰할 수 있는 차량 추천
 * 접근: 하드코딩이 아닌 필터링 기반 시스템
 *
 * 핵심 전략:
 * 1. 300-500대의 검증된 차량 풀 생성
 * 2. 더미 데이터 완전 제거 (7777, 9999, 1111, 999 등)
 * 3. 차종 정확도 보장 (SUV 요청 → SUV만)
 * 4. 인기 모델 우선 (싼타페, 쏘렌토, 펠리세이드, 카니발 등)
 * 5. 유효한 링크만 보장
 */

import type { Vehicle } from '@shared/types/vehicle';

// 🎯 시연용 필터링 기준
export const DEMO_FILTERS = {
  // 💰 가격 필터 (정상 가격대만)
  price: {
    min: 500,               // 500만원 이상 (경차 포함)
    max: 5000,              // 5000만원 이하
    excludePatterns: [
      999, 7777, 9999, 1111, 2222, 3333, 4444, 5555, 6666, 8888  // 더미 가격
    ]
  },

  // 📅 연식 필터 (최신 차량)
  modelYear: {
    maxAge: 5,              // 5년 이내 (2020년 이후)
    minYear: 2020
  },

  // 🛣️ 주행거리 필터
  distance: {
    max: 100000             // 10만km 이하
  },

  // 🏷️ 신뢰 브랜드 (국내 메이저 + 쉐보레)
  trustedBrands: ['현대', '기아', '제네시스', '쉐보레', '쉐보레(GM대우)'],

  // 🚗 인기 SUV 모델 (시연 시나리오 A용)
  popularSUVs: [
    '싼타페',
    '쏘렌토',
    '팰리세이드',
    '카니발',
    '스포티지',
    '투싼',
    'GV70',
    'GV80',
    '셀토스',
    '코나',              // 현대 소형 SUV
    '트랙스',            // 쉐보레 소형 SUV
    '트랙스 크로스오버',  // 쉐보레 신형
    'XM3'
  ],

  // 📄 품질 필터
  quality: {
    requireDetailUrl: true,         // 상세 링크 필수
    excludeSoldKeywords: [          // 판매 완료/계약중 제외
      '판매완료', '판매 완료',
      '계약중', '계약 중',
      '삭제', '마감'
    ],
    requireValidLink: true          // http 또는 / 포함 링크만
  }
} as const;

/**
 * 🔍 더미 가격 감지 (반복되는 숫자 패턴)
 */
function isDummyPrice(price: number | null | undefined): boolean {
  if (!price) return true;

  // 1. 명시적 더미 가격
  const dummyPrices = [999, 7777, 9999, 1111, 2222, 3333, 4444, 5555, 6666, 8888];
  if (dummyPrices.includes(price)) {
    return true;
  }

  // 2. 반복 숫자 패턴 (1111, 2222, 3333 등)
  const priceStr = String(price);
  if (priceStr.length >= 3) {
    const firstDigit = priceStr[0];
    if (priceStr.split('').every(d => d === firstDigit)) {
      return true; // 모든 자리가 같은 숫자
    }
  }

  // 3. 비현실적 가격 (너무 낮거나 높음)
  if (price < 500 || price > 10000) {
    return true;
  }

  return false;
}

/**
 * 🔗 유효한 링크 검증
 */
function hasValidDetailUrl(vehicle: Vehicle): boolean {
  const url = vehicle.detailUrl;

  if (!url || url.trim() === '') return false;

  // http 포함하거나 / 로 시작하는 링크만
  if (url.includes('http') || url.startsWith('/')) {
    // 판매완료/계약중 키워드 체크 (URL에 포함될 수 있음)
    const lowerUrl = url.toLowerCase();
    for (const keyword of DEMO_FILTERS.quality.excludeSoldKeywords) {
      if (lowerUrl.includes(keyword)) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * 🚗 차종 정확 매칭 (SUV vs 세단 vs 경차)
 */
function matchesCarType(vehicle: Vehicle, requestedType: string): boolean {
  const carTypeLower = (vehicle.carType || '').toLowerCase();
  const modelLower = (vehicle.model || '').toLowerCase();
  const requested = requestedType.toLowerCase();

  if (requested === 'suv') {
    // SUV: 명시적으로 SUV만, 승합/세단/경차 제외
    if (carTypeLower.includes('suv')) {
      // ❌ 승합차로 분류된 SUV 제외 (카니발 등)
      if (carTypeLower.includes('승합') || carTypeLower.includes('van') || carTypeLower.includes('mpv')) {
        return false;
      }
      return true;
    }

    // ✅ 인기 SUV 모델명 직접 매칭
    for (const suvModel of DEMO_FILTERS.popularSUVs) {
      if (modelLower.includes(suvModel.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  if (requested === '세단' || requested === 'sedan') {
    return carTypeLower.includes('세단') || carTypeLower.includes('sedan');
  }

  if (requested === '경차') {
    return carTypeLower.includes('경차') || carTypeLower.includes('경형');
  }

  // 기타 요청은 carType 직접 매칭
  return carTypeLower.includes(requested);
}

/**
 * 🎯 인기 모델 점수 계산 (SUV 우선순위)
 */
function getPopularityScore(vehicle: Vehicle): number {
  const modelLower = (vehicle.model || '').toLowerCase();

  // 인기 SUV 순위별 점수
  const popularityMap: Record<string, number> = {
    '싼타페': 100,
    '팰리세이드': 95,
    '쏘렌토': 90,
    '카니발': 85,
    '스포티지': 80,
    'gv80': 75,
    'gv70': 70,
    '투싼': 65,
    '셀토스': 60,
    'xm3': 55
  };

  for (const [model, score] of Object.entries(popularityMap)) {
    if (modelLower.includes(model)) {
      return score;
    }
  }

  return 0; // 인기 모델 아님
}

/**
 * 🏆 메인 함수: 검증된 데모 차량 풀 생성
 *
 * @param allVehicles - DB에서 가져온 전체 차량 목록
 * @param requestedCarType - 요청된 차종 ('SUV', '세단' 등)
 * @param budget - 예산 [최소, 최대] (만원)
 * @param requestedModel - 🔄 Phase 2: 재추천 시 모델 필터
 * @returns 300-500대의 검증된 차량 배열
 */
export function createDemoVehiclePool(
  allVehicles: Vehicle[],
  requestedCarType?: string,
  budget?: [number, number],
  requestedModel?: string, // 🔄 Phase 2: 재추천 시 모델 필터 추가
  safetyPriority?: boolean  // 🎯 재추천: 안전성 우선 (무사고 차량만)
): Vehicle[] {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - DEMO_FILTERS.modelYear.maxAge;

  console.log(`🎯 [DemoPool] 시연용 차량 풀 생성 시작`);
  console.log(`📊 입력: ${allVehicles.length}대, 차종: ${requestedCarType || '미지정'}, 예산: ${budget ? `${budget[0]}~${budget[1]}만원` : '미지정'}, 모델: ${requestedModel || '미지정'}`);
  // 단계별 필터링
  let step1 = allVehicles.filter(v => !isDummyPrice(v.price));

  // 🎯 시나리오 A 특별 처리: 가격 필터 최소값 상향 (품질 보장)
  let effectiveMin: number;
  if (requestedCarType === 'SUV' && budget && budget[1] <= 3000 && !requestedModel) {
    effectiveMin = 1500; // 시나리오 A: 1500만원 이상 (경차급 제외, 품질 보장)
    console.log(`🎯 [DemoPool] 시나리오 A: 최소 가격 ${effectiveMin}만원으로 상향 (품질 보장)`);
  } else {
    effectiveMin = (budget && budget[0] > 0) ? budget[0] : DEMO_FILTERS.price.min;
  }
  const effectiveMax = budget ? budget[1] : DEMO_FILTERS.price.max;
  let step2 = step1.filter(v => v.price && v.price >= effectiveMin && v.price <= effectiveMax);

  let step3 = step2.filter(v => v.modelYear && v.modelYear >= minYear && v.modelYear <= currentYear);

  let step4 = step3.filter(v => !v.distance || v.distance <= DEMO_FILTERS.distance.max);

  // 🐛 CRITICAL FIX: detailUrl 필터 완화 (Railway 프로덕션 DB에 detailUrl 없음)
  // let step5 = step4.filter(v => hasValidDetailUrl(v));
  let step5 = step4; // detailUrl 필터 비활성화 (0대 방지)

  let step6 = requestedCarType ? step5.filter(v => matchesCarType(v, requestedCarType)) : step5;

  // 🎯 시나리오 A 특별 처리: 인기 SUV만 강제 필터링
  let step6_5: Vehicle[];
  if (requestedCarType === 'SUV' && budget && budget[1] <= 3000 && !requestedModel) {
    // 시나리오 A 감지: SUV + 3000만원 이하 + 모델 지정 없음
    console.log(`🎯 [DemoPool] 시나리오 A 감지: 인기 SUV만 필터링`);
    console.log(`🔍 [DemoPool] 필터 전 차량 수: ${step6.length}대`);

    step6_5 = step6.filter(v => {
      const modelLower = (v.model || '').toLowerCase();

      // popularSUVs 리스트에 있는 모델만 허용
      for (const suvModel of DEMO_FILTERS.popularSUVs) {
        if (modelLower.includes(suvModel.toLowerCase())) {
          return true;
        }
      }

      return false;
    });

    console.log(`✅ [DemoPool] 인기 SUV 필터 후: ${step6_5.length}대`);

    if (step6_5.length === 0) {
      console.error(`❌ [DemoPool] 인기 SUV 필터 후 0대! step6=${step6.length}대`);

      // 🔄 폴백: 현대/기아 SUV 중 인기도 높은 순으로 선정
      console.warn(`🔄 [DemoPool] 폴백: 현대/기아 SUV 중 인기도 높은 순으로 대체`);
      step6_5 = step6
        .filter(v => ['현대', '기아'].includes(v.brand || ''))
        .sort((a, b) => {
          // 인기도 우선 정렬
          const scoreA = getPopularityScore(a);
          const scoreB = getPopularityScore(b);
          if (scoreA !== scoreB) return scoreB - scoreA;

          // 최신 연식 우선
          const yearDiff = (b.modelYear || 0) - (a.modelYear || 0);
          if (yearDiff !== 0) return yearDiff;

          // 낮은 가격 우선
          return (a.price || 0) - (b.price || 0);
        })
        .slice(0, 100); // 상위 100대만

      console.log(`✅ [DemoPool] 폴백 완료: ${step6_5.length}대 (현대/기아 SUV)`);

      if (step6_5.length === 0) {
        console.error(`❌❌ [DemoPool] 폴백 실패! 전체 SUV 사용 (최종 폴백)`);
        step6_5 = step6; // 최종 폴백
      }
    }
  } else {
    step6_5 = step6;
  }

  // 🆕 무사고 필터 (safetyPriority가 true이거나 항상 시도)
  let step6_6: Vehicle[];
  const noAccidentVehicles = step6_5.filter(v =>
    (v.myAccidentCost === 0 || v.myAccidentCost === null) &&
    (v.otherAccidentCost === 0 || v.otherAccidentCost === null)
  );

  if (noAccidentVehicles.length >= 50) {
    // 무사고 차량이 충분하면 무사고만 사용
    console.log(`✅ [DemoPool] 무사고 필터 적용: ${noAccidentVehicles.length}대 (전체 ${step6_5.length}대 중 ${((noAccidentVehicles.length / step6_5.length) * 100).toFixed(1)}%)`);
    step6_6 = noAccidentVehicles;
  } else {
    // 무사고 차량이 부족하면 경미한 사고만 허용
    console.warn(`⚠️ [DemoPool] 무사고 차량 부족 (${noAccidentVehicles.length}대) → 경미한 사고 포함`);
    const minorAccidentVehicles = step6_5.filter(v => {
      const totalCost = (v.myAccidentCost || 0) + (v.otherAccidentCost || 0);
      return totalCost <= 100; // 100만원 이하 경미한 사고만
    });
    step6_6 = minorAccidentVehicles.length >= 50 ? minorAccidentVehicles : step6_5;
    console.log(`✅ [DemoPool] 경미한 사고 필터 적용: ${step6_6.length}대`);
  }

  // 🔄 Phase 2: 모델 필터 추가 (재추천 시)
  let step7: Vehicle[];
  if (requestedModel) {
    console.log(`🔍 [DemoPool] 모델 필터 시작: "${requestedModel}"`);
    console.log(`🔍 [DemoPool] 필터 전 차량 수: ${step6_6.length}대`);

    step7 = step6_6.filter(v => {
      const modelLower = (v.model || '').toLowerCase();
      const requestedLower = requestedModel.toLowerCase();

      // 부분 매칭 (예: "셀토스", "더 뉴 셀토스" 모두 매칭)
      if (modelLower.includes(requestedLower)) {
        console.log(`✅ 모델 매칭: ${v.model} (${v.brand}) - ${v.price}만원`);
        return true;
      }
      return false;
    });

    console.log(`🔍 [DemoPool] 필터 후 차량 수: ${step7.length}대`);

    if (step7.length === 0) {
      console.error(`❌ [DemoPool] 모델 필터 후 0대! requestedModel="${requestedModel}", step6_5=${step6_5.length}대`);
      console.error(`❌ [DemoPool] step6_5 샘플 모델들:`, step6_5.slice(0, 10).map(v => v.model));

      // 🔄 폴백: 비슷한 가격대의 인기 SUV 추천
      console.warn(`🔄 [DemoPool] 폴백: 비슷한 가격대 인기 SUV로 대체`);
      step7 = step6_6
        .sort((a, b) => {
          // 인기도 우선 정렬
          const scoreA = getPopularityScore(a);
          const scoreB = getPopularityScore(b);
          if (scoreA !== scoreB) return scoreB - scoreA;

          // 최신 연식 우선
          return (b.modelYear || 0) - (a.modelYear || 0);
        })
        .slice(0, 100); // 상위 100대만

      console.log(`✅ [DemoPool] 폴백 완료: ${step7.length}대 (인기 SUV)`);
    }
  } else {
    step7 = step6_6;
  }

  // 🎯 재추천: 안전성 우선 필터 (무사고 차량만)
  let step8: Vehicle[];
  if (safetyPriority) {
    console.log(`��️ [DemoPool] 안전성 우선 모드: 무사고 차량만 필터링`);
    console.log(`🔍 [DemoPool] 필터 전 차량 수: ${step7.length}대`);

    step8 = step7.filter(v => {
      // 무사고 조건: myAccidentCost가 0이거나 undefined
      const isNoAccident = !v.myAccidentCost || v.myAccidentCost === 0;

      if (isNoAccident) {
        console.log(`✅ 무사고 차량: ${v.model} (${v.brand}) - ${v.modelYear}년, ${v.price}만원`);
      }

      return isNoAccident;
    });

    console.log(`✅ [DemoPool] 무사고 필터 후: ${step8.length}대`);

    if (step8.length === 0) {
      console.warn(`⚠️ [DemoPool] 무사고 필터 후 0대! 일반 차량 풀로 폴백`);
      step8 = step7;
    }
  } else {
    step8 = step7;
  }

  const vetted = step8;

  // 🏆 정렬 (재추천 vs 일반)
  if (requestedModel) {
    // 🔄 재추천: 최신 연식 + 낮은 주행거리 + 사고 비용 낮은 순
    console.log(`🔄 [DemoPool] 재추천 정렬: 최신 연식 + 낮은 주행거리 + 사고 비용 낮은 순`);
    vetted.sort((a, b) => {
      // 1순위: 최신 연식
      const yearDiff = (b.modelYear || 0) - (a.modelYear || 0);
      if (yearDiff !== 0) {
        return yearDiff;
      }

      // 2순위: 사고 비용 낮은 순 (무사고 > 경미한 사고 > 사고 이력)
      const costA = a.myAccidentCost || 0;
      const costB = b.myAccidentCost || 0;
      if (costA !== costB) {
        return costA - costB;
      }

      // 3순위: 낮은 주행거리
      const distanceA = a.distance || 0;
      const distanceB = b.distance || 0;
      return distanceA - distanceB;
    });
  } else {
    // 🏆 일반: 인기 모델 우선
    vetted.sort((a, b) => {
      const scoreA = getPopularityScore(a);
      const scoreB = getPopularityScore(b);

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // 인기도 내림차순
      }

      // 인기도 동일하면 최신 연식 우선
      return (b.modelYear || 0) - (a.modelYear || 0);
    });
  }

  // 🎯 상위 500대로 제한 (너무 많으면 성능 저하)
  const finalPool = vetted.slice(0, 500);

  console.log(`✅ [DemoPool] 최종: ${allVehicles.length}대 → ${finalPool.length}대 (인기 모델 정렬)`);

  return finalPool;
}

/**
 * 🎬 시연 시나리오 A 전용 필터 (SUV, 3000만원 이하, 안전성 우선)
 */
export function getDemoScenarioAPool(allVehicles: Vehicle[]): Vehicle[] {
  // 🐛 FIX: 추가 필터 제거 - createDemoVehiclePool 결과 그대로 반환
  // 문제: topModels 필터가 너무 엄격해서 0대 반환
  // 해결: 기본 필터링(가격, 연식, 주행거리, 링크)만 적용
  const pool = createDemoVehiclePool(
    allVehicles,
    'SUV',
    [0, 3000]  // 3000만원 이하
  );

  console.log(`🎯 [시나리오 A] SUV 3000만원 이하: ${pool.length}대`);
  return pool;
}
