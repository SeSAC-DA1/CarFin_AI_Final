// 재추천 시나리오 DB 검증 스크립트
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { vehicles, vehiclesInsurance } from './shared/schema.ts';
import { and, eq, lte, gte, ilike, inArray, sql } from 'drizzle-orm';

const { Pool } = pg;

// Railway PostgreSQL 연결
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

console.log('🔍 시나리오 A 재추천 DB 검증 시작...\n');

// 시나리오 A 기본 조건
async function testBaseScenario() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 기본 조건 (시나리오 A)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('- 3000만원 이하');
  console.log('- 가솔린');
  console.log('- 국내차 (현대, 기아, 제네시스)');
  console.log('- SUV');
  console.log('- 5년 이내 (2019년 이후)');
  console.log('- 10만km 이내');
  console.log('- 무사고 (내차피해 0원)');

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
  .where(and(
    lte(vehicles.price, 3000),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%'),
    gte(vehicles.modelYear, minYear),
    lte(vehicles.distance, 100000),
    eq(vehiclesInsurance.myAccidentCost, 0)
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 충분함 (10대 이상)' : '❌ 부족함');

  return count;
}

// 재추천 1: 지역 추가 (경기)
async function testRefinement1() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 재추천 1: 경기 지역 추가');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('사용자 입력: "경기 지역으로 다시 찾아줘"');

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
  .where(and(
    lte(vehicles.price, 3000),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%'),
    gte(vehicles.modelYear, minYear),
    lte(vehicles.distance, 100000),
    eq(vehiclesInsurance.myAccidentCost, 0),
    ilike(vehicles.location, '%경기%')  // 추가 필터
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 충분함 (10대 이상)' : '❌ 부족함');

  // 샘플 차량 3대 확인
  if (count >= 3) {
    const samples = await db.select({
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      price: vehicles.price,
      location: vehicles.location
    })
    .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
    .where(and(
      lte(vehicles.price, 3000),
      eq(vehicles.fuelType, '가솔린'),
      inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
      ilike(vehicles.carType, '%SUV%'),
      gte(vehicles.modelYear, minYear),
      lte(vehicles.distance, 100000),
      eq(vehiclesInsurance.myAccidentCost, 0),
      ilike(vehicles.location, '%경기%')
    ))
    .limit(3);

    console.log('\n📌 샘플 차량 3대:');
    samples.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.manufacturer} ${v.model} - ${v.price}만원 (${v.location})`);
    });
  }

  return count;
}

// 재추천 2: 모델 지정 (쏘렌토)
async function testRefinement2() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 재추천 2: 쏘렌토 모델 지정');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('사용자 입력: "쏘렌토로 다시 추천해줘"');

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
  .where(and(
    lte(vehicles.price, 3000),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%'),
    gte(vehicles.modelYear, minYear),
    lte(vehicles.distance, 100000),
    eq(vehiclesInsurance.myAccidentCost, 0),
    ilike(vehicles.model, '%쏘렌토%')  // 추가 필터
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 충분함 (10대 이상)' : '❌ 부족함');

  if (count >= 3) {
    const samples = await db.select({
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      price: vehicles.price,
      modelYear: vehicles.modelYear
    })
    .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
    .where(and(
      lte(vehicles.price, 3000),
      eq(vehicles.fuelType, '가솔린'),
      inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
      ilike(vehicles.carType, '%SUV%'),
      gte(vehicles.modelYear, minYear),
      lte(vehicles.distance, 100000),
      eq(vehiclesInsurance.myAccidentCost, 0),
      ilike(vehicles.model, '%쏘렌토%')
    ))
    .limit(3);

    console.log('\n📌 샘플 차량 3대:');
    samples.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.manufacturer} ${v.model} ${v.modelYear}년 - ${v.price}만원`);
    });
  }

  return count;
}

// 재추천 3: 가격 하향 (2500만원)
async function testRefinement3() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 재추천 3: 가격 2500만원으로 하향');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('사용자 입력: "2500만원 이하로 낮춰줘"');

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
  .where(and(
    lte(vehicles.price, 2500),  // 하향 조정
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%'),
    gte(vehicles.modelYear, minYear),
    lte(vehicles.distance, 100000),
    eq(vehiclesInsurance.myAccidentCost, 0)
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 충분함 (10대 이상)' : '❌ 부족함');

  if (count >= 3) {
    const samples = await db.select({
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      price: vehicles.price
    })
    .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
    .where(and(
      lte(vehicles.price, 2500),
      eq(vehicles.fuelType, '가솔린'),
      inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
      ilike(vehicles.carType, '%SUV%'),
      gte(vehicles.modelYear, minYear),
      lte(vehicles.distance, 100000),
      eq(vehiclesInsurance.myAccidentCost, 0)
    ))
    .limit(3);

    console.log('\n📌 샘플 차량 3대:');
    samples.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.manufacturer} ${v.model} - ${v.price}만원`);
    });
  }

  return count;
}

// 재추천 4: 셀토스 모델 지정
async function testRefinement4() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 재추천 4: 셀토스 모델 지정');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('사용자 입력: "셀토스로 다시 찾아줘"');

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;

  const result = await db.select({
    count: sql`count(*)::int`
  })
  .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
  .where(and(
    lte(vehicles.price, 3000),
    eq(vehicles.fuelType, '가솔린'),
    inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
    ilike(vehicles.carType, '%SUV%'),
    gte(vehicles.modelYear, minYear),
    lte(vehicles.distance, 100000),
    eq(vehiclesInsurance.myAccidentCost, 0),
    ilike(vehicles.model, '%셀토스%')
  ));

  const count = result[0]?.count || 0;
  console.log(`\n✅ 결과: ${count}대`);
  console.log(count >= 10 ? '✓ 충분함 (10대 이상)' : '❌ 부족함');

  if (count >= 3) {
    const samples = await db.select({
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      price: vehicles.price,
      modelYear: vehicles.modelYear
    })
    .from(vehicles)
  .leftJoin(vehiclesInsurance, eq(vehicles.vehicleId, vehiclesInsurance.vehicleId))
    .where(and(
      lte(vehicles.price, 3000),
      eq(vehicles.fuelType, '가솔린'),
      inArray(vehicles.manufacturer, ['현대', '기아', '제네시스']),
      ilike(vehicles.carType, '%SUV%'),
      gte(vehicles.modelYear, minYear),
      lte(vehicles.distance, 100000),
      eq(vehiclesInsurance.myAccidentCost, 0),
      ilike(vehicles.model, '%셀토스%')
    ))
    .limit(3);

    console.log('\n📌 샘플 차량 3대:');
    samples.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.manufacturer} ${v.model} ${v.modelYear}년 - ${v.price}만원`);
    });
  }

  return count;
}

// 최종 요약
async function summarize(results) {
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 최종 요약 및 권장 스크립트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const scenarios = [
    { name: '기본 조건', count: results.base, safe: results.base >= 10 },
    { name: '재추천 1 (경기 지역)', count: results.ref1, safe: results.ref1 >= 10 },
    { name: '재추천 2 (쏘렌토)', count: results.ref2, safe: results.ref2 >= 10 },
    { name: '재추천 3 (2500만원)', count: results.ref3, safe: results.ref3 >= 10 },
    { name: '재추천 4 (셀토스)', count: results.ref4, safe: results.ref4 >= 10 }
  ];

  scenarios.forEach((s, i) => {
    const emoji = s.safe ? '✅' : '❌';
    console.log(`${emoji} ${s.name}: ${s.count}대 ${s.safe ? '(안전)' : '(위험)'}`);
  });

  console.log('\n🎯 권장 재추천 스크립트:');
  const safest = scenarios.filter(s => s.safe && s.name.includes('재추천'))
                          .sort((a, b) => b.count - a.count)[0];

  if (safest) {
    console.log(`   "${safest.name}" - ${safest.count}대 보장`);

    if (safest.name.includes('경기')) {
      console.log('   💬 사용자 입력: "경기 지역으로 다시 찾아줘"');
    } else if (safest.name.includes('쏘렌토')) {
      console.log('   💬 사용자 입력: "쏘렌토로 다시 추천해줘"');
    } else if (safest.name.includes('2500')) {
      console.log('   💬 사용자 입력: "2500만원 이하로 낮춰줘"');
    } else if (safest.name.includes('셀토스')) {
      console.log('   💬 사용자 입력: "셀토스로 다시 찾아줘"');
    }
  } else {
    console.log('   ⚠️  모든 재추천 시나리오가 10대 미만입니다.');
    console.log('   대안: 재추천 조건을 완화하거나 다른 스크립트 고려 필요');
  }
}

// 실행
(async () => {
  try {
    const results = {
      base: await testBaseScenario(),
      ref1: await testRefinement1(),
      ref2: await testRefinement2(),
      ref3: await testRefinement3(),
      ref4: await testRefinement4()
    };

    await summarize(results);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
    console.log('\n✅ 검증 완료\n');
  }
})();
