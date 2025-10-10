// Temporary script to check lease data in database
import { db } from '../server/db.js';
import { vehicles } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

async function checkLeaseData() {
  console.log('🔍 Checking sellType distribution...\n');

  // sellType 별 차량 수 확인
  const sellTypeStats = await db
    .select({
      sellType: vehicles.sellType,
      count: sql<number>`count(*)::int`
    })
    .from(vehicles)
    .groupBy(vehicles.sellType)
    .orderBy(sql`count(*) DESC`);

  console.log('📊 sellType 분포:');
  sellTypeStats.forEach(stat => {
    console.log(`  - ${stat.sellType || '(null)'}: ${stat.count.toLocaleString()}대`);
  });

  // 리스 상품 샘플 확인
  console.log('\n🚗 리스 상품 샘플 (5개):');
  const leaseSamples = await db
    .select({
      vehicleId: vehicles.vehicleId,
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      modelYear: vehicles.modelYear,
      price: vehicles.price,
      sellType: vehicles.sellType
    })
    .from(vehicles)
    .where(sql`${vehicles.sellType} LIKE '%리스%'`)
    .limit(5);

  leaseSamples.forEach(v => {
    console.log(`  ${v.vehicleId}: ${v.manufacturer} ${v.model} (${v.modelYear}) - ${v.price}만원 - ${v.sellType}`);
  });

  // 일반 매물 샘플 확인
  console.log('\n🚗 일반 매물 샘플 (5개):');
  const regularSamples = await db
    .select({
      vehicleId: vehicles.vehicleId,
      manufacturer: vehicles.manufacturer,
      model: vehicles.model,
      modelYear: vehicles.modelYear,
      price: vehicles.price,
      sellType: vehicles.sellType
    })
    .from(vehicles)
    .where(sql`${vehicles.sellType} NOT LIKE '%리스%' OR ${vehicles.sellType} IS NULL`)
    .limit(5);

  regularSamples.forEach(v => {
    console.log(`  ${v.vehicleId}: ${v.manufacturer} ${v.model} (${v.modelYear}) - ${v.price}만원 - ${v.sellType || '(일반)'}`);
  });

  process.exit(0);
}

checkLeaseData().catch(console.error);
