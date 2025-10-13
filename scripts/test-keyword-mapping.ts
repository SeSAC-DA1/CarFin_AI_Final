/**
 * 🧪 키워드 매핑 테스트 스크립트
 */

import { extractCriteriaFromKeywords, getScenarioAFallback } from '../server/lib/demo/KeywordMappingEngine';

console.log('🧪 키워드 매핑 시스템 테스트\n');
console.log('='.repeat(80));

const testCases = [
  // 시나리오 A (메인 시연)
  "3000만원 이하 가솔린 국내차 SUV 찾습니다. 5인 가족이고 안전성이 가장 중요해요. 연식은 5년 이내로 주행거리 10만km 이내 무사고 차량으로 추천해 주세요.",

  // 출퇴근용
  "출퇴근용 준중형차 찾아요",

  // 가성비
  "가성비 좋은 경차 추천해주세요",

  // 외제차
  "외제차나 수입차로 찾고 있어요",

  // 신혼부부
  "신혼부부용 차량 추천",

  // 사회초년생
  "사회초년생 첫차 추천해주세요",

  // 가족용
  "가족용 SUV 찾습니다"
];

testCases.forEach((testCase, idx) => {
  console.log(`\n\n📝 Test ${idx + 1}:`);
  console.log(`입력: "${testCase}"`);
  console.log('-'.repeat(80));

  const result = extractCriteriaFromKeywords(testCase);

  console.log(`\n📊 매핑 결과:`);
  console.log(`  차종: ${result.carType || '미지정'}`);
  console.log(`  예산: ${result.maxPrice ? `${result.maxPrice}만원 이하` : '미지정'} ${result.minPrice ? `(최소: ${result.minPrice}만원)` : ''}`);
  console.log(`  원산지: ${result.origin || '미지정'}`);
  console.log(`  연료: ${result.fuelType || '미지정'}`);
  console.log(`  변속기: ${result.transmission || '미지정'}`);
  console.log(`  사고: ${result.maxAccidentCost !== undefined ? (result.maxAccidentCost === 0 ? '무사고만' : `${result.maxAccidentCost}만원 이하`) : '미지정'}`);
  console.log(`  연식: ${result.maxYearAge ? `${result.maxYearAge}년 이내` : '미지정'}`);
  console.log(`  주행거리: ${result.maxDistance ? `${result.maxDistance.toLocaleString()}km 이하` : '미지정'}`);
  console.log(`  브랜드: ${result.brands?.join(', ') || '미지정'}`);

  if (result.priorityHints) {
    console.log(`\n  🎯 우선순위 힌트:`);
    if (result.priorityHints.price) console.log(`     💰 가격 중시`);
    if (result.priorityHints.safety) console.log(`     🛡️ 안전성 중시`);
    if (result.priorityHints.fuelEfficiency) console.log(`     ⛽ 연비 중시`);
    if (result.priorityHints.design) console.log(`     ✨ 디자인 중시`);
  }

  console.log(`\n  ✅ 매칭된 키워드: ${result.matchedKeywords?.join(', ') || '없음'}`);

  // 예외 검증
  if (result.matchedKeywords!.length === 0) {
    console.log(`\n  ⚠️ 경고: 매칭된 키워드 없음 → 폴백 필요`);
  }
});

// 폴백 테스트
console.log('\n\n' + '='.repeat(80));
console.log('\n🛡️ 폴백 메커니즘 테스트:\n');

const fallback = getScenarioAFallback();
console.log('시나리오 A 기본값:');
console.log(`  차종: ${fallback.carType}`);
console.log(`  예산: ${fallback.maxPrice}만원 이하`);
console.log(`  원산지: ${fallback.origin}`);
console.log(`  연료: ${fallback.fuelType}`);
console.log(`  변속기: ${fallback.transmission}`);
console.log(`  사고: ${fallback.maxAccidentCost === 0 ? '무사고만' : fallback.maxAccidentCost + '만원 이하'}`);
console.log(`  연식: ${fallback.maxYearAge}년 이내`);
console.log(`  주행거리: ${fallback.maxDistance?.toLocaleString()}km 이하`);
console.log(`  브랜드: ${fallback.brands?.join(', ')}`);

console.log('\n' + '='.repeat(80));
console.log('\n✅ 모든 테스트 완료\n');
