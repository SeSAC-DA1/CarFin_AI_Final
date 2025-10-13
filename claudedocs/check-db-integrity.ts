
import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkDatabaseIntegrity() {
  try {
    console.log('데이터베이스 무결성 검사를 시작합니다...');

    console.log('\n--- 1. 차량 종류(carType) 분포 확인 ---');
    const carTypeDistribution = await db.execute(sql`
      SELECT
        "carType",
        COUNT(*) as count
      FROM vehicles
      GROUP BY "carType"
      ORDER BY count DESC;
    `);
    console.log('결과:', carTypeDistribution.rows);

    console.log('\n--- 2. "투싼" 모델 검색 확인 ---');
    const tucsonSample = await db.execute(sql`
      SELECT id, model, "carType" FROM vehicles
      WHERE model LIKE '%투싼%'
      LIMIT 5;
    `);
    if (tucsonSample.rows.length === 0) {
        console.log('결과: "투싼" 모델이 데이터베이스에 없습니다.');
    } else {
        console.log('결과:', tucsonSample.rows);
    }

    console.log('\n--- 3. "K5" 모델 샘플 확인 ---');
    const k5Sample = await db.execute(sql`
      SELECT id, model, "carType" FROM vehicles
      WHERE model LIKE '%K5%'
      LIMIT 5;
    `);
    console.log('결과:', k5Sample.rows);

    console.log('\n--- 4. 전체 데이터 샘플 확인 ---');
    const randomSample = await db.execute(sql`
      SELECT id, model, "carType" FROM vehicles
      LIMIT 10;
    `);
    console.log('결과:', randomSample.rows);

  } catch (error) {
    console.error('\n데이터베이스 확인 중 치명적 오류 발생:', error);
  } finally {
    await pool.end();
    console.log('\n데이터베이스 연결이 안전하게 종료되었습니다.');
  }
}

checkDatabaseIntegrity();
