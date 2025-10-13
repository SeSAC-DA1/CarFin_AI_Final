/**
 * 🔍 인기 SUV 재고 확인 스크립트
 *
 * 목적: 시나리오 A에서 추천할 인기 SUV가 DB에 실제로 얼마나 있는지 확인
 *
 * 확인 사항:
 * 1. 싼타페, 쏘렌토, 팰리세이드, 카니발 각각 몇 대?
 * 2. 3000만원 이하 조건 충족하는 차량 수?
 * 3. 5년 이내 (2020년+) 조건 충족?
 * 4. 10만km 이하 조건 충족?
 * 5. 유효한 detailUrl 있는지?
 */

import { pool } from '../server/db';

interface VehicleStats {
  model: string;
  total: number;
  under3000: number;
  recent5years: number;
  under100k: number;
  hasLink: number;
  allConditions: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

async function checkPopularSUVInventory() {
  console.log('🔍 인기 SUV 재고 확인 시작\n');
  console.log('=' .repeat(80));

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5; // 2020년

  // 인기 SUV 모델 목록
  const popularModels = [
    '싼타페',
    '쏘렌토',
    '팰리세이드',
    '카니발',
    '스포티지',
    '투싼'
  ];

  const results: VehicleStats[] = [];

  for (const modelName of popularModels) {
    console.log(`\n📊 ${modelName} 분석 중...`);

    // 전체 수
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count FROM vehicles WHERE model ILIKE $1`,
      [`%${modelName}%`]
    );
    const total = parseInt(totalResult.rows[0].count);

    // 3000만원 이하
    const under3000Result = await pool.query(
      `SELECT COUNT(*) as count FROM vehicles
       WHERE model ILIKE $1 AND price <= 3000 AND price >= 500`,
      [`%${modelName}%`]
    );
    const under3000 = parseInt(under3000Result.rows[0].count);

    // 5년 이내
    const recent5yearsResult = await pool.query(
      `SELECT COUNT(*) as count FROM vehicles
       WHERE model ILIKE $1 AND model_year >= $2`,
      [`%${modelName}%`, minYear]
    );
    const recent5years = parseInt(recent5yearsResult.rows[0].count);

    // 10만km 이하
    const under100kResult = await pool.query(
      `SELECT COUNT(*) as count FROM vehicles
       WHERE model ILIKE $1 AND distance <= 100000`,
      [`%${modelName}%`]
    );
    const under100k = parseInt(under100kResult.rows[0].count);

    // 유효한 링크
    const hasLinkResult = await pool.query(
      `SELECT COUNT(*) as count FROM vehicles
       WHERE model ILIKE $1 AND detail_url IS NOT NULL AND detail_url != ''`,
      [`%${modelName}%`]
    );
    const hasLink = parseInt(hasLinkResult.rows[0].count);

    // 모든 조건 충족
    const allConditionsResult = await pool.query(
      `SELECT COUNT(*) as count,
              AVG(price) as avg_price,
              MIN(price) as min_price,
              MAX(price) as max_price
       FROM vehicles
       WHERE model ILIKE $1
         AND price <= 3000
         AND price >= 500
         AND model_year >= $2
         AND distance <= 100000
         AND detail_url IS NOT NULL
         AND detail_url != ''
         AND (manufacturer = '현대' OR manufacturer = '기아')`,
      [`%${modelName}%`, minYear]
    );
    const allConditions = parseInt(allConditionsResult.rows[0].count);
    const avgPrice = parseInt(allConditionsResult.rows[0].avg_price || 0);
    const minPrice = parseInt(allConditionsResult.rows[0].min_price || 0);
    const maxPrice = parseInt(allConditionsResult.rows[0].max_price || 0);

    results.push({
      model: modelName,
      total,
      under3000,
      recent5years,
      under100k,
      hasLink,
      allConditions,
      avgPrice,
      minPrice,
      maxPrice
    });

    console.log(`  전체: ${total}대`);
    console.log(`  3000만원 이하: ${under3000}대`);
    console.log(`  5년 이내: ${recent5years}대`);
    console.log(`  10만km 이하: ${under100k}대`);
    console.log(`  링크 있음: ${hasLink}대`);
    console.log(`  ✅ 모든 조건 충족: ${allConditions}대`);
    if (allConditions > 0) {
      console.log(`  💰 평균가: ${avgPrice.toLocaleString()}만원 (${minPrice.toLocaleString()} ~ ${maxPrice.toLocaleString()})`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📈 요약 통계\n');

  // 테이블 형식으로 출력
  console.log('모델명      | 전체   | ≤3000만 | ≥2020년 | ≤10만km | 링크  | ✅충족  | 평균가');
  console.log('-'.repeat(80));

  results.forEach(r => {
    console.log(
      `${r.model.padEnd(10)} | ${String(r.total).padStart(5)} | ${String(r.under3000).padStart(7)} | ${String(r.recent5years).padStart(7)} | ${String(r.under100k).padStart(7)} | ${String(r.hasLink).padStart(5)} | ${String(r.allConditions).padStart(6)} | ${r.avgPrice.toLocaleString()}만원`
    );
  });

  const totalQualified = results.reduce((sum, r) => sum + r.allConditions, 0);
  console.log('\n🎯 시나리오 A 추천 가능 총 대수: ' + totalQualified + '대');

  // 경고 메시지
  console.log('\n⚠️ 문제 감지:\n');

  results.forEach(r => {
    if (r.allConditions === 0) {
      console.log(`❌ ${r.model}: 조건 충족 차량 없음!`);
    } else if (r.allConditions < 10) {
      console.log(`⚠️ ${r.model}: 조건 충족 차량 ${r.allConditions}대 (너무 적음)`);
    } else {
      console.log(`✅ ${r.model}: 조건 충족 차량 ${r.allConditions}대 (충분)`);
    }
  });

  // 실제 샘플 차량 3대 출력
  console.log('\n🚗 실제 추천 가능 차량 샘플 (Top 3):\n');

  const sampleResult = await pool.query(
    `SELECT manufacturer, model, model_year, price, distance, detail_url
     FROM vehicles
     WHERE (model ILIKE '%싼타페%' OR model ILIKE '%쏘렌토%' OR model ILIKE '%팰리세이드%' OR model ILIKE '%카니발%')
       AND price <= 3000
       AND price >= 500
       AND model_year >= $1
       AND distance <= 100000
       AND detail_url IS NOT NULL
       AND detail_url != ''
       AND (manufacturer = '현대' OR manufacturer = '기아')
     ORDER BY model_year DESC, distance ASC
     LIMIT 10`,
    [minYear]
  );

  if (sampleResult.rows.length === 0) {
    console.log('❌ 조건 충족하는 차량이 하나도 없습니다!');
    console.log('🚨 긴급 조치 필요: 필터 조건 완화 또는 DB 데이터 확인');
  } else {
    sampleResult.rows.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.manufacturer} ${v.model} (${v.model_year}년)`);
      console.log(`   💰 ${v.price.toLocaleString()}만원 | 🛣️ ${v.distance.toLocaleString()}km`);
      console.log(`   🔗 ${v.detail_url.substring(0, 60)}...`);
      console.log('');
    });
  }

  await pool.end();
}

checkPopularSUVInventory().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
