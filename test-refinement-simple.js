// 재추천 시나리오 간소화 DB 검증 (무사고 조건 제외)
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { vehicles } from './shared/schema.ts';
import { and, eq, lte, gte, ilike, inArray, sql } from 'drizzle-orm';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

console.log('🔍 시나리오 A 재추천 DB 검증 (간소화)\n');

// 시나리오 A 기본 조건 (무사고 제외)
async function testBaseScenario() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 기본 조건');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('- 3000만원 이하');
  console.log('- 가솔린');
  console.log('- 국내차 (현대, 기아, 제네시스)');
  console.log('- SUV');

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .where(and(
    lte(vehicles.price, 3000),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%')
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 안전 (10대 이상)\n' : '❌ 위험 (10대 미만)\n');
  return count;
}

// 재추천 1: 경기 지역
async function testRef1() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 재추천 1: 경기 지역');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('입력: "경기 지역으로 다시 찾아줘"');

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .where(and(
    lte(vehicles.price, 3000),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%'),
    ilike(vehicles.location, '%경기%')
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 안전 (10대 이상)' : '❌ 위험 (10대 미만)');

  if (count >= 3) {
    const samples = await db.select({
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      price: vehicles.price,
      location: vehicles.location
    })
    .from(vehicles)
    .where(and(
      lte(vehicles.price, 3000),
      eq(vehicles.fuelType, '가솔린'),
      inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
      ilike(vehicles.carType, '%SUV%'),
      ilike(vehicles.location, '%경기%')
    ))
    .limit(3);

    console.log('\n📌 샘플 3대:');
    samples.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.manufacturer} ${v.model} - ${v.price}만원 (${v.location})`);
    });
  }
  console.log();
  return count;
}

// 재추천 2: 쏘렌토
async function testRef2() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 재추천 2: 쏘렌토');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('입력: "쏘렌토로 다시 찾아줘"');

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .where(and(
    lte(vehicles.price, 3000),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%'),
    ilike(vehicles.model, '%쏘렌토%')
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 안전 (10대 이상)' : '❌ 위험 (10대 미만)');

  if (count >= 3) {
    const samples = await db.select({
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      price: vehicles.price,
      modelYear: vehicles.modelYear
    })
    .from(vehicles)
    .where(and(
      lte(vehicles.price, 3000),
      eq(vehicles.fuelType, '가솔린'),
      inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
      ilike(vehicles.carType, '%SUV%'),
      ilike(vehicles.model, '%쏘렌토%')
    ))
    .limit(3);

    console.log('\n📌 샘플 3대:');
    samples.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.manufacturer} ${v.model} ${v.modelYear}년 - ${v.price}만원`);
    });
  }
  console.log();
  return count;
}

// 재추천 3: 셀토스
async function testRef3() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 재추천 3: 셀토스');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('입력: "셀토스로 다시 찾아줘"');

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .where(and(
    lte(vehicles.price, 3000),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%'),
    ilike(vehicles.model, '%셀토스%')
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 안전 (10대 이상)' : '❌ 위험 (10대 미만)');

  if (count >= 3) {
    const samples = await db.select({
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      price: vehicles.price,
      modelYear: vehicles.modelYear
    })
    .from(vehicles)
    .where(and(
      lte(vehicles.price, 3000),
      eq(vehicles.fuelType, '가솔린'),
      inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
      ilike(vehicles.carType, '%SUV%'),
      ilike(vehicles.model, '%셀토스%')
    ))
    .limit(3);

    console.log('\n📌 샘플 3대:');
    samples.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.manufacturer} ${v.model} ${v.modelYear}년 - ${v.price}만원`);
    });
  }
  console.log();
  return count;
}

// 재추천 4: 2500만원
async function testRef4() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 재추천 4: 2500만원 이하');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('입력: "2500만원 이하로 낮춰줘"');

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .where(and(
    lte(vehicles.price, 2500),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%')
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 안전 (10대 이상)' : '❌ 위험 (10대 미만)');

  if (count >= 3) {
    const samples = await db.select({
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      price: vehicles.price
    })
    .from(vehicles)
    .where(and(
      lte(vehicles.price, 2500),
      eq(vehicles.fuelType, '가솔린'),
      inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
      ilike(vehicles.carType, '%SUV%')
    ))
    .limit(3);

    console.log('\n📌 샘플 3대:');
    samples.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.manufacturer} ${v.model} - ${v.price}만원`);
    });
  }
  console.log();
  return count;
}

// 최종 요약
async function summarize(results) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 최종 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const scenarios = [
    { name: '기본 조건', input: '-', count: results.base },
    { name: '경기 지역', input: '"경기 지역으로 다시 찾아줘"', count: results.ref1 },
    { name: '쏘렌토', input: '"쏘렌토로 다시 찾아줘"', count: results.ref2 },
    { name: '셀토스', input: '"셀토스로 다시 찾아줘"', count: results.ref3 },
    { name: '2500만원', input: '"2500만원 이하로 낮춰줘"', count: results.ref4 }
  ];

  scenarios.forEach((s) => {
    const emoji = s.count >= 10 ? '✅' : '❌';
    const status = s.count >= 10 ? '안전' : '위험';
    console.log(`${emoji} ${s.name}: ${s.count}대 (${status})`);
  });

  console.log('\n🎯 권장 스크립트:');
  const safest = scenarios.slice(1).filter(s => s.count >= 10)
                          .sort((a, b) => b.count - a.count)[0];

  if (safest) {
    console.log(`\n   최적: ${safest.name} (${safest.count}대 보장)`);
    console.log(`   사용자 입력: ${safest.input}`);
    console.log(`\n   ✅ 이 스크립트는 안정적으로 10대 이상 추천 가능`);
  } else {
    console.log('\n   ⚠️  모든 재추천이 10대 미만');
    console.log('   대안: 조건 완화 또는 다른 스크립트 필요');
  }
}

// 실행
(async () => {
  try {
    const results = {
      base: await testBaseScenario(),
      ref1: await testRef1(),
      ref2: await testRef2(),
      ref3: await testRef3(),
      ref4: await testRef4()
    };

    await summarize(results);

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ 검증 완료\n');
  }
})();
