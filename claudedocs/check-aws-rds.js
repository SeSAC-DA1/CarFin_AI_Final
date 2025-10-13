// AWS RDS 데이터베이스 목록 확인 및 데이터 검증 스크립트
import pg from 'pg';
const { Client } = pg;

const RDS_HOST = 'carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com';
const RDS_USER = 'carfin_admin';
const RDS_PASSWORD = 'carfin_secure_password_2025';
const RDS_PORT = 5432;

async function checkAllDatabases() {
  console.log('🔍 AWS RDS 데이터베이스 목록 및 데이터 검증 시작...\n');

  // 1. postgres 데이터베이스에 연결하여 전체 DB 목록 확인
  const postgresClient = new Client({
    host: RDS_HOST,
    user: RDS_USER,
    password: RDS_PASSWORD,
    database: 'postgres',
    port: RDS_PORT,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await postgresClient.connect();
    console.log('✅ AWS RDS 연결 성공 (postgres DB)\n');

    console.log('--- 1. 전체 데이터베이스 목록 ---');
    const dbListResult = await postgresClient.query(`
      SELECT datname, pg_size_pretty(pg_database_size(datname)) as size
      FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname;
    `);
    console.log('데이터베이스 목록:');
    dbListResult.rows.forEach(row => {
      console.log(`  - ${row.datname} (크기: ${row.size})`);
    });

    await postgresClient.end();

    // 2. 각 데이터베이스에 연결하여 vehicles 테이블 확인
    const databases = dbListResult.rows
      .map(row => row.datname)
      .filter(name => !['postgres', 'template0', 'template1', 'rdsadmin'].includes(name));

    console.log(`\n--- 2. 각 데이터베이스의 vehicles 테이블 확인 ---`);

    for (const dbName of databases) {
      console.log(`\n📂 데이터베이스: ${dbName}`);
      const dbClient = new Client({
        host: RDS_HOST,
        user: RDS_USER,
        password: RDS_PASSWORD,
        database: dbName,
        port: RDS_PORT,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await dbClient.connect();

        // vehicles 테이블 존재 여부 확인
        const tableCheck = await dbClient.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'vehicles'
          );
        `);

        if (!tableCheck.rows[0].exists) {
          console.log('  ❌ vehicles 테이블 없음');
          await dbClient.end();
          continue;
        }

        console.log('  ✅ vehicles 테이블 있음');

        // 총 차량 수
        const countResult = await dbClient.query('SELECT COUNT(*) as total FROM vehicles;');
        console.log(`  📊 총 차량 수: ${countResult.rows[0].total.toLocaleString()}대`);

        // carType 분포
        const carTypeResult = await dbClient.query(`
          SELECT car_type, COUNT(*) as count
          FROM vehicles
          GROUP BY car_type
          ORDER BY count DESC
          LIMIT 10;
        `);
        console.log('  📋 car_type 분포:');
        carTypeResult.rows.forEach(row => {
          console.log(`    - ${row.car_type || 'NULL'}: ${row.count}대`);
        });

        // SUV 샘플 확인
        const suvSample = await dbClient.query(`
          SELECT vehicle_id, model, car_type, manufacturer, price
          FROM vehicles
          WHERE car_type = 'SUV'
          LIMIT 3;
        `);
        console.log(`  🚙 SUV 샘플 (${suvSample.rows.length}대):`);
        suvSample.rows.forEach(v => {
          console.log(`    - ${v.manufacturer} ${v.model} (${v.price}만원)`);
        });

        // 투싼 검색
        const tucsonResult = await dbClient.query(`
          SELECT vehicle_id, model, car_type, manufacturer, price
          FROM vehicles
          WHERE model LIKE '%투싼%'
          LIMIT 3;
        `);
        console.log(`  🔍 "투싼" 검색 결과 (${tucsonResult.rows.length}대):`);
        if (tucsonResult.rows.length === 0) {
          console.log('    ❌ 투싼이 없습니다!');
        } else {
          tucsonResult.rows.forEach(v => {
            console.log(`    - ${v.manufacturer} ${v.model} (${v.car_type}, ${v.price}만원)`);
          });
        }

        // 이 DB가 정상인지 판단
        const isSUVExists = suvSample.rows.length > 0;
        const isTucsonExists = tucsonResult.rows.length > 0;
        const totalCount = parseInt(countResult.rows[0].total);

        if (isSUVExists && isTucsonExists && totalCount > 100000) {
          console.log(`\n  ✅✅✅ 이 데이터베이스가 정상입니다! ✅✅✅`);
          console.log(`  DATABASE_URL: postgresql://${RDS_USER}:***@${RDS_HOST}:${RDS_PORT}/${dbName}`);
        } else if (!isSUVExists || !isTucsonExists) {
          console.log(`\n  ⚠️ 이 데이터베이스는 데이터가 손상되었거나 불완전합니다.`);
        }

        await dbClient.end();

      } catch (error) {
        console.log(`  ❌ 연결 실패: ${error.message}`);
      }
    }

    console.log('\n\n=== 검증 완료 ===');
    console.log('위 결과에서 "✅✅✅ 이 데이터베이스가 정상입니다!" 메시지가 있는 DB를 Railway에 연결하세요.\n');

  } catch (error) {
    console.error('🚨 에러 발생:', error);
  }
}

checkAllDatabases();
