import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const NEON_DATABASE_URL = process.env.DATABASE_URL!;
const AWS_RDS_URL = process.env.AWS_RDS_URL!;

if (!NEON_DATABASE_URL || !AWS_RDS_URL) {
  console.error('❌ DATABASE_URL과 AWS_RDS_URL 환경변수가 필요합니다.');
  process.exit(1);
}

async function exportToAwsRds() {
  console.log('🔄 Neon → AWS RDS 마이그레이션 시작...\n');

  const neonPool = new NeonPool({ connectionString: NEON_DATABASE_URL });
  
  const rdsSslConfig = process.env.DB_SSL === 'true' || AWS_RDS_URL.includes('rds.amazonaws.com')
    ? {
        rejectUnauthorized: true,
        ca: process.env.DB_CA_CERT ? fs.readFileSync(process.env.DB_CA_CERT, 'utf8') : undefined,
      }
    : undefined;
  
  const rdsPool = new PgPool({
    connectionString: AWS_RDS_URL,
    ssl: rdsSslConfig,
    max: 10,
  });
  
  console.log(`🔒 TLS 검증: ${rdsSslConfig ? 'ON' : 'OFF'}\n`);

  try {
    console.log('1️⃣  Neon에서 차량 데이터 추출 중...');
    const vehiclesResult = await neonPool.query('SELECT * FROM vehicles ORDER BY created_at');
    console.log(`   ✓ ${vehiclesResult.rows.length}개 차량 추출 완료\n`);

    console.log('2️⃣  AWS RDS에 스키마 확인 중...');
    await rdsPool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        price INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        fuel TEXT NOT NULL,
        transmission TEXT NOT NULL DEFAULT '자동',
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        fuel_efficiency REAL NOT NULL,
        reliability REAL NOT NULL,
        maintenance_cost REAL NOT NULL,
        safety REAL NOT NULL,
        comfort REAL NOT NULL,
        resale_value REAL NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('   ✓ 스키마 준비 완료\n');

    console.log('3️⃣  기존 데이터 확인 중...');
    const existingCount = await rdsPool.query('SELECT COUNT(*) as count FROM vehicles');
    const currentCount = parseInt(existingCount.rows[0].count);
    
    if (currentCount > 0) {
      console.log(`   ℹ️  ${currentCount}개 차량이 이미 존재합니다.`);
      console.log('   ⏭️  마이그레이션을 건너뜁니다.\n');
    } else {
      console.log('   ✓ 빈 테이블 확인\n');
    }

    console.log('4️⃣  마이그레이션 준비 완료\n');

    if (currentCount === 0) {
      console.log('5️⃣  AWS RDS에 데이터 삽입 중 (Parameterized Queries)...');
      let inserted = 0;
      
      const insertQuery = `
        INSERT INTO vehicles (id, name, brand, model, year, price, mileage, fuel, transmission, category, image_url, fuel_efficiency, reliability, maintenance_cost, safety, comfort, resale_value, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO NOTHING
      `;
      
      for (const vehicle of vehiclesResult.rows) {
        await rdsPool.query(insertQuery, [
          vehicle.id,
          vehicle.name,
          vehicle.brand,
          vehicle.model,
          vehicle.year,
          vehicle.price,
          vehicle.mileage,
          vehicle.fuel,
          vehicle.transmission,
          vehicle.category,
          vehicle.image_url,
          vehicle.fuel_efficiency,
          vehicle.reliability,
          vehicle.maintenance_cost,
          vehicle.safety,
          vehicle.comfort,
          vehicle.resale_value,
          vehicle.created_at,
        ]);
        inserted++;
        if (inserted % 100 === 0) {
          console.log(`   ✓ ${inserted}개 삽입 완료...`);
        }
      }
      
      console.log(`   ✓ ${inserted}개 차량 삽입 완료\n`);
    }

    const finalCount = await rdsPool.query('SELECT COUNT(*) as count FROM vehicles');
    console.log(`✅ 마이그레이션 완료!`);
    console.log(`   AWS RDS 차량 개수: ${finalCount.rows[0].count}개`);

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  } finally {
    await neonPool.end();
    await rdsPool.end();
  }
}

exportToAwsRds();
