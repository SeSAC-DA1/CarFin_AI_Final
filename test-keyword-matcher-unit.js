/**
 * KeywordMatcher 단위 테스트
 */

import {
  isRefinementRequest,
  extractRefinementFilters,
  mergeFilters
} from './server/lib/refinement/KeywordMatcher.ts';

console.log(`\n🧪 ===== KeywordMatcher 단위 테스트 =====\n`);

// 테스트 1: 재추천 감지
console.log(`📋 테스트 1: 재추천 감지`);
const refinementKeywords = [
  '셀토스로 다시 찾아줘',
  '경기 지역으로 바꿔줘',
  '좀 더 싼 걸로 재추천',
  '다른 차량 보여줘',
  '쏘렌토로 변경해줘'
];

refinementKeywords.forEach((msg, idx) => {
  const detected = isRefinementRequest(msg);
  console.log(`   ${idx + 1}. "${msg}" → ${detected ? '✅' : '❌'} ${detected ? '재추천 감지' : '일반 메시지'}`);
});

// 테스트 2: 모델 매칭
console.log(`\n📋 테스트 2: 모델 매칭`);
const modelMessages = [
  '셀토스로 다시 찾아줘',
  '쏘렌토로 바꿔줘',
  '싼타페로 변경',
  '그랜저 보여줘',
  '아반떼로 다시'
];

modelMessages.forEach((msg, idx) => {
  const filters = extractRefinementFilters(msg);
  console.log(`   ${idx + 1}. "${msg}"`);
  console.log(`      → 모델: ${filters.model || '없음'}`);
});

// 테스트 3: 지역 매칭
console.log(`\n📋 테스트 3: 지역 매칭`);
const locationMessages = [
  '경기 지역으로 바꿔줘',
  '서울에서 다시 찾아줘',
  '인천 매물로 변경',
  '부산 지역으로'
];

locationMessages.forEach((msg, idx) => {
  const filters = extractRefinementFilters(msg);
  console.log(`   ${idx + 1}. "${msg}"`);
  console.log(`      → 지역: ${filters.location || '없음'}`);
});

// 테스트 4: 가격 매칭
console.log(`\n📋 테스트 4: 가격 매칭`);
const priceMessages = [
  '좀 더 싼 걸로',
  '2500만원 이하로',
  '가격 낮춰줘',
  '1000만원에서 2000만원 사이',
  '3000만원 이상'
];

priceMessages.forEach((msg, idx) => {
  const filters = extractRefinementFilters(msg);
  console.log(`   ${idx + 1}. "${msg}"`);
  console.log(`      → 최대: ${filters.maxPrice || '없음'}, 최소: ${filters.minPrice || '없음'}`);
});

// 테스트 5: 필터 병합
console.log(`\n📋 테스트 5: 필터 병합`);
const baseFilters = {
  carType: 'SUV',
  minPrice: 0,
  maxPrice: 3000,
  manufacturers: ['현대', '기아', '제네시스']
};

const additionalFilters1 = {
  model: '셀토스',
  location: '경기'
};

const merged1 = mergeFilters(baseFilters, additionalFilters1);
console.log(`   기존 필터:`, JSON.stringify(baseFilters, null, 2));
console.log(`   추가 필터:`, JSON.stringify(additionalFilters1, null, 2));
console.log(`   병합 결과:`, JSON.stringify(merged1, null, 2));

if (merged1.carType === 'SUV' && merged1.model === '셀토스' && merged1.location === '경기') {
  console.log(`   ✅ 병합 성공: 기존 조건 유지 + 새 조건 추가`);
} else {
  console.log(`   ❌ 병합 실패`);
}

// 테스트 6: 복합 시나리오
console.log(`\n📋 테스트 6: 복합 시나리오 (모델 + 지역 + 가격)`);
const complexMessage = '경기에서 셀토스 2500만원 이하로 다시 찾아줘';
const complexFilters = extractRefinementFilters(complexMessage);
console.log(`   메시지: "${complexMessage}"`);
console.log(`   추출 결과:`, JSON.stringify(complexFilters, null, 2));

if (complexFilters.location === '경기' && complexFilters.model === '셀토스' && complexFilters.maxPrice === 2500) {
  console.log(`   ✅ 복합 추출 성공`);
} else {
  console.log(`   ❌ 복합 추출 실패`);
}

console.log(`\n✅ ===== 단위 테스트 완료 =====\n`);
