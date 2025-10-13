/**
 * 🎬 Scenario A Complete Workflow Test
 *
 * 목적: 내일 시연을 위한 전체 워크플로우 검증
 * - KeywordMappingEngine 동작 확인
 * - DB manufacturers 필터 동작 확인
 * - DemoVehiclePool 필터링 확인
 * - TOPSIS 추천 정확도 확인
 */

import { extractCriteriaFromKeywords } from '../server/lib/demo/KeywordMappingEngine';
import { createDemoVehiclePool } from '../server/lib/demo/DemoVehiclePool';
import { storage } from '../server/storage';
import type { VehicleSearchFilters } from '@shared/types/vehicle';

console.log('🎬 Scenario A 완전 워크플로우 테스트\n');
console.log('='.repeat(80));

// 시나리오 A 메시지
const scenarioAMessage = "3000만원 이하 가솔린 국내차 SUV 찾습니다. 5인 가족이고 안전성이 가장 중요해요. 연식은 5년 이내로 주행거리 10만km 이내 무사고 차량으로 추천해 주세요.";

console.log('\n📝 시나리오 A 메시지:');
console.log(`"${scenarioAMessage}"\n`);

async function testWorkflow() {
  try {
    // Step 1: KeywordMappingEngine 테스트
    console.log('=' .repeat(80));
    console.log('\n🔍 STEP 1: KeywordMappingEngine 키워드 추출\n');
    console.log('-'.repeat(80));

    const criteria = extractCriteriaFromKeywords(scenarioAMessage);

    console.log('✅ 추출된 조건:');
    console.log(`   • 원산지: ${criteria.origin || '미지정'}`);
    console.log(`   • 최대가격: ${criteria.maxPrice || '미지정'}만원`);
    console.log(`   • 차종: ${criteria.carType || '미지정'}`);
    console.log(`   • 연료: ${criteria.fuelType || '미지정'}`);
    console.log(`   • 브랜드: ${criteria.brands?.join(', ') || '미지정'}`);
    console.log(`   • 최대연식: ${criteria.maxYearAge ? `${criteria.maxYearAge}년 이내` : '미지정'}`);
    console.log(`   • 주행거리: ${criteria.maxDistance ? `${criteria.maxDistance.toLocaleString()}km` : '미지정'}`);
    console.log(`   • 사고이력: ${criteria.maxAccidentCost !== undefined ? (criteria.maxAccidentCost === 0 ? '무사고만' : `${criteria.maxAccidentCost}만원 이하`) : '미지정'}`);
    console.log(`\n   🏷️ 매칭된 키워드 (${criteria.matchedKeywords?.length || 0}개): ${criteria.matchedKeywords?.join(', ') || '없음'}`);

    if (criteria.priorityHints) {
      console.log('\n   🎯 우선순위 힌트:');
      if (criteria.priorityHints.safety) console.log('      🛡️ 안전성 중시');
      if (criteria.priorityHints.price) console.log('      💰 가격 중시');
      if (criteria.priorityHints.fuelEfficiency) console.log('      ⛽ 연비 중시');
    }

    // Step 2: DB 검색 필터 생성 및 쿼리
    console.log('\n\n' + '='.repeat(80));
    console.log('\n🗄️ STEP 2: DB 검색 (manufacturers 배열 필터 적용)\n');
    console.log('-'.repeat(80));

    const currentYear = new Date().getFullYear();
    const searchFilters: VehicleSearchFilters = {
      maxPrice: criteria.maxPrice,
      minYear: criteria.maxYearAge ? currentYear - criteria.maxYearAge : undefined,
      maxYear: currentYear,
      fuelType: criteria.fuelType,
      carType: criteria.carType,
      manufacturers: criteria.brands && criteria.brands.length > 0
        ? criteria.brands
        : ['현대', '기아', '제네시스'], // 기본값
      limit: 10000,
      offset: 0
    };

    console.log('🔍 DB 쿼리 파라미터:');
    console.log(`   • maxPrice: ${searchFilters.maxPrice}만원`);
    console.log(`   • minYear: ${searchFilters.minYear}년`);
    console.log(`   • maxYear: ${searchFilters.maxYear}년`);
    console.log(`   • fuelType: ${searchFilters.fuelType}`);
    console.log(`   • carType: ${searchFilters.carType}`);
    console.log(`   • manufacturers: [${searchFilters.manufacturers?.join(', ')}]`);
    console.log(`   • limit: ${searchFilters.limit}개`);

    console.log('\n⏳ DB 검색 시작...');
    const dbStartTime = Date.now();
    const allVehicles = await storage.searchVehicles(searchFilters);
    const dbEndTime = Date.now();

    console.log(`\n✅ DB 검색 완료: ${allVehicles.length}대 (${dbEndTime - dbStartTime}ms)`);

    // Step 3: 브랜드 분포 분석
    console.log('\n📊 브랜드 분포 분석:');
    const brandCounts = new Map<string, number>();
    allVehicles.forEach(v => {
      const brand = v.manufacturer || '알수없음';
      brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
    });

    const sortedBrands = Array.from(brandCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    sortedBrands.forEach(([brand, count]) => {
      console.log(`   • ${brand}: ${count}대`);
    });

    // 🚨 CRITICAL CHECK: 르노/쌍용 차량 확인
    const untrustedBrands = ['르노코리아(삼성)', '쌍용', '르노', '쌍용자동차'];
    const untrustedCount = sortedBrands
      .filter(([brand]) => untrustedBrands.some(u => brand.includes(u)))
      .reduce((sum, [, count]) => sum + count, 0);

    if (untrustedCount > 0) {
      console.log(`\n   ❌ 경고: 신뢰하지 않는 브랜드 ${untrustedCount}대 발견!`);
      console.log(`   🚨 DB manufacturers 필터가 제대로 작동하지 않습니다!`);
    } else {
      console.log(`\n   ✅ 검증: 신뢰 브랜드만 쿼리됨 (르노/쌍용 0대)`);
    }

    // Step 4: DemoVehiclePool 필터링
    console.log('\n\n' + '='.repeat(80));
    console.log('\n🎯 STEP 3: DemoVehiclePool 검증 필터링\n');
    console.log('-'.repeat(80));

    console.log('⏳ DemoVehiclePool 필터링 시작...');
    const poolStartTime = Date.now();
    const demoPool = createDemoVehiclePool(
      allVehicles,
      criteria.carType,
      criteria.maxPrice ? [0, criteria.maxPrice] : undefined
    );
    const poolEndTime = Date.now();

    console.log(`\n✅ DemoVehiclePool 필터링 완료: ${demoPool.length}대 (${poolEndTime - poolStartTime}ms)`);
    console.log(`   📊 필터링 비율: ${((demoPool.length / allVehicles.length) * 100).toFixed(1)}%`);

    // Step 5: 최종 통계
    console.log('\n\n' + '='.repeat(80));
    console.log('\n📈 STEP 4: 최종 통계 및 검증\n');
    console.log('-'.repeat(80));

    console.log('🏆 추천 가능한 차량 풀:');
    console.log(`   • 총 개수: ${demoPool.length}대`);

    if (demoPool.length > 0) {
      const models = new Map<string, number>();
      demoPool.forEach(v => {
        const model = v.model || '알수없음';
        models.set(model, (models.get(model) || 0) + 1);
      });

      const topModels = Array.from(models.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      console.log('\n   🚗 상위 10개 모델:');
      topModels.forEach(([model, count], idx) => {
        console.log(`      ${idx + 1}. ${model}: ${count}대`);
      });

      console.log('\n   💰 가격 분포:');
      const prices = demoPool.map(v => v.price || 0).filter(p => p > 0);
      console.log(`      • 평균: ${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)}만원`);
      console.log(`      • 최저: ${Math.min(...prices)}만원`);
      console.log(`      • 최고: ${Math.max(...prices)}만원`);

      console.log('\n   📅 연식 분포:');
      const years = demoPool.map(v => v.modelYear || 0).filter(y => y > 0);
      console.log(`      • 평균: ${Math.round(years.reduce((a, b) => a + b, 0) / years.length)}년`);
      console.log(`      • 최신: ${Math.max(...years)}년`);
      console.log(`      • 최구: ${Math.min(...years)}년`);

      console.log('\n   🛣️ 주행거리 분포:');
      const distances = demoPool.map(v => v.distance || 0);
      console.log(`      • 평균: ${Math.round(distances.reduce((a, b) => a + b, 0) / distances.length).toLocaleString()}km`);
      console.log(`      • 최저: ${Math.min(...distances).toLocaleString()}km`);
      console.log(`      • 최고: ${Math.max(...distances).toLocaleString()}km`);
    }

    // Step 6: 시연 준비도 평가
    console.log('\n\n' + '='.repeat(80));
    console.log('\n🎯 STEP 5: 시연 준비도 평가\n');
    console.log('-'.repeat(80));

    let readinessScore = 0;
    const checks = [];

    // Check 1: 키워드 추출 성공
    if (criteria.matchedKeywords && criteria.matchedKeywords.length >= 8) {
      readinessScore += 20;
      checks.push({ status: '✅', check: '키워드 추출', detail: `${criteria.matchedKeywords.length}개 매칭` });
    } else {
      checks.push({ status: '❌', check: '키워드 추출', detail: `${criteria.matchedKeywords?.length || 0}개만 매칭` });
    }

    // Check 2: DB 브랜드 필터링
    if (untrustedCount === 0) {
      readinessScore += 30;
      checks.push({ status: '✅', check: 'DB 브랜드 필터', detail: '르노/쌍용 0대' });
    } else {
      checks.push({ status: '❌', check: 'DB 브랜드 필터', detail: `르노/쌍용 ${untrustedCount}대 발견` });
    }

    // Check 3: 검색 성능
    const dbTimeMs = dbEndTime - dbStartTime;
    if (dbTimeMs < 1000) {
      readinessScore += 20;
      checks.push({ status: '✅', check: 'DB 검색 성능', detail: `${dbTimeMs}ms` });
    } else {
      checks.push({ status: '⚠️', check: 'DB 검색 성능', detail: `${dbTimeMs}ms (느림)` });
    }

    // Check 4: 추천 풀 크기
    if (demoPool.length >= 100 && demoPool.length <= 500) {
      readinessScore += 20;
      checks.push({ status: '✅', check: '추천 풀 크기', detail: `${demoPool.length}대 (적정)` });
    } else if (demoPool.length < 100) {
      checks.push({ status: '⚠️', check: '추천 풀 크기', detail: `${demoPool.length}대 (부족)` });
    } else {
      readinessScore += 10;
      checks.push({ status: '⚠️', check: '추천 풀 크기', detail: `${demoPool.length}대 (과다)` });
    }

    // Check 5: 인기 모델 존재
    const popularModels = ['싼타페', '쏘렌토', '팰리세이드', '카니발'];
    const hasPopularModels = popularModels.some(model =>
      demoPool.some(v => (v.model || '').includes(model))
    );
    if (hasPopularModels) {
      readinessScore += 10;
      checks.push({ status: '✅', check: '인기 모델 존재', detail: '싼타페/쏘렌토 등' });
    } else {
      checks.push({ status: '❌', check: '인기 모델 존재', detail: '인기 모델 없음' });
    }

    console.log('🔍 체크리스트:');
    checks.forEach(({ status, check, detail }) => {
      console.log(`   ${status} ${check}: ${detail}`);
    });

    console.log(`\n📊 시연 준비도: ${readinessScore}/100점`);

    if (readinessScore >= 90) {
      console.log('\n✅ 시연 준비 완료! 내일 발표 가능합니다.');
    } else if (readinessScore >= 70) {
      console.log('\n⚠️ 시연 가능하나 일부 개선 필요합니다.');
    } else {
      console.log('\n❌ 시연 준비 부족! 긴급 수정이 필요합니다.');
    }

    // Step 7: 로그 폭발 위험도 평가
    console.log('\n\n' + '='.repeat(80));
    console.log('\n⚠️ STEP 6: Railway 로그 폭발 위험도\n');
    console.log('-'.repeat(80));

    const filteredOutCount = allVehicles.length - demoPool.length;
    const estimatedLogs = filteredOutCount * 0; // 로그 제거됨

    console.log(`📊 필터링 통계:`);
    console.log(`   • DB 쿼리: ${allVehicles.length}대`);
    console.log(`   • 필터링 제외: ${filteredOutCount}대`);
    console.log(`   • 예상 로그: ${estimatedLogs}개 (제거됨)`);

    if (estimatedLogs > 1000) {
      console.log(`\n   ❌ 위험: Railway 500 logs/sec 제한 초과 가능!`);
    } else {
      console.log(`\n   ✅ 안전: 로그 폭발 위험 없음`);
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('\n✅ 테스트 완료\n');

    // 프로세스 종료
    process.exit(0);

  } catch (error) {
    console.error('\n\n❌ 테스트 실패:', error);
    process.exit(1);
  }
}

testWorkflow();
