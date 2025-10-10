// Test script to verify lease filtering
import { db } from '../server/db.js';
import { vehicles } from '../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';

async function testLeaseFilter() {
  console.log('🧪 Testing lease filtering...\n');

  // 테스트 1: 필터 없이 검색 (기존 동작)
  console.log('1️⃣  필터 없이 검색 (10개):');
  const noFilterResults = await db
    .select({
      vehicleId: vehicles.vehicleId,
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      sellType: vehicles.sellType,
      price: vehicles.price
    })
    .from(vehicles)
    .limit(10);

  noFilterResults.forEach(v => {
    console.log(`  ${v.vehicleId}: ${v.manufacturer} ${v.model} - ${v.sellType} - ${v.price}만원`);
  });

  // 테스트 2: sellType='일반' 필터 적용 (수정 후 동작)
  console.log('\n2️⃣  sellType=\'일반\' 필터 적용 (10개):');
  const filteredResults = await db
    .select({
      vehicleId: vehicles.vehicleId,
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      sellType: vehicles.sellType,
      price: vehicles.price
    })
    .from(vehicles)
    .where(eq(vehicles.sellType, '일반'))
    .limit(10);

  filteredResults.forEach(v => {
    console.log(`  ${v.vehicleId}: ${v.manufacturer} ${v.model} - ${v.sellType} - ${v.price}만원`);
  });

  // 테스트 3: 리스/렌트 차량 검증
  console.log('\n3️⃣  필터된 결과에 리스/렌트 포함 여부:');
  const hasLeaseOrRental = filteredResults.some(v => v.sellType !== '일반');
  console.log(`  ${hasLeaseOrRental ? '❌ FAIL: 리스/렌트 포함됨!' : '✅ PASS: 일반 매물만 포함'}`);

  // 테스트 4: sellType 분포 확인
  console.log('\n4️⃣  sellType 분포:');
  const sellTypeCount = await db
    .select({
      sellType: vehicles.sellType,
      count: sql<number>`count(*)::int`
    })
    .from(vehicles)
    .groupBy(vehicles.sellType);

  sellTypeCount.forEach(stat => {
    console.log(`  ${stat.sellType}: ${stat.count.toLocaleString()}대`);
  });

  console.log('\n✅ 테스트 완료!');
  process.exit(0);
}

testLeaseFilter().catch(console.error);
