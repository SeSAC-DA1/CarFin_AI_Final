import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 5000,
});

async function checkDatabaseIntegrity() {
  try {
    console.log('🔍 데이터베이스 무결성 검사를 시작합니다...');
    const dbHost = process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Unknown';
    console.log('📌 DATABASE_URL:', dbHost);

    console.log('\n--- 1. 차량 종류(car_type) 분포 확인 ---');
    const carTypeResult = await pool.query(`
      SELECT
        car_type,
        COUNT(*) as count
      FROM vehicles
      GROUP BY car_type
      ORDER BY count DESC;
    `);
    console.log('결과:', carTypeResult.rows);

    console.log('\n--- 2. 전체 차량 수 확인 ---');
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM vehicles;');
    console.log('결과:', totalResult.rows);

    console.log('\n--- 3. "투싼" 모델 검색 확인 ---');
    const tucsonResult = await pool.query(`
      SELECT vehicle_id, model, car_type, manufacturer FROM vehicles
      WHERE model LIKE '%투싼%'
      LIMIT 5;
    `);
    if (tucsonResult.rows.length === 0) {
        console.log('❌ 결과: "투싼" 모델이 데이터베이스에 없습니다.');
    } else {
        console.log('✅ 결과:', tucsonResult.rows);
    }

    console.log('\n--- 4. "K5" 모델 샘플 확인 ---');
    const k5Result = await pool.query(`
      SELECT vehicle_id, model, car_type, manufacturer FROM vehicles
      WHERE model LIKE '%K5%'
      LIMIT 5;
    `);
    console.log('결과:', k5Result.rows);

    console.log('\n--- 5. SUV 차량 샘플 확인 ---');
    const suvResult = await pool.query(`
      SELECT vehicle_id, model, car_type, manufacturer FROM vehicles
      WHERE car_type = 'SUV'
      LIMIT 5;
    `);
    if (suvResult.rows.length === 0) {
        console.log('❌ 결과: SUV 차량이 데이터베이스에 없습니다.');
    } else {
        console.log('✅ 결과:', suvResult.rows);
    }

    console.log('\n--- 6. 제조사별 분포 확인 ---');
    const manufacturerResult = await pool.query(`
      SELECT
        manufacturer,
        COUNT(*) as count
      FROM vehicles
      GROUP BY manufacturer
      ORDER BY count DESC
      LIMIT 10;
    `);
    console.log('결과:', manufacturerResult.rows);

    console.log('\n--- 7. 전체 데이터 샘플 확인 (최신 10개) ---');
    const sampleResult = await pool.query(`
      SELECT vehicle_id, model, car_type, manufacturer, price, model_year FROM vehicles
      ORDER BY vehicle_id DESC
      LIMIT 10;
    `);
    console.log('결과:', sampleResult.rows);

    console.log('\n--- 8. 테이블 스키마 확인 ---');
    const schemaResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'vehicles'
      ORDER BY ordinal_position;
    `);
    console.log('결과:', schemaResult.rows.slice(0, 15));

  } catch (error) {
    console.error('\n🚨 데이터베이스 확인 중 치명적 오류 발생:', error);
  } finally {
    await pool.end();
    console.log('\n✅ 데이터베이스 연결이 안전하게 종료되었습니다.');
  }
}

checkDatabaseIntegrity();
