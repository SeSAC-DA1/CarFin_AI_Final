import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import ws from 'ws';

// WebSocket polyfill for Node.js
if (!globalThis.WebSocket) {
  (globalThis as any).WebSocket = ws;
}

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

async function seedDatabase() {
  console.log('🌱 데이터베이스 시드 시작...');
  
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // 기존 데이터 확인
    const countResult = await pool.query('SELECT COUNT(*) as count FROM vehicles');
    const currentCount = parseInt(countResult.rows[0].count);
    
    console.log(`📊 현재 차량 개수: ${currentCount}개`);

    if (currentCount >= 500) {
      console.log('✅ 이미 500개 이상의 차량이 존재합니다. 시드를 건너뜁니다.');
      await pool.end();
      return;
    }

    // SQL 파일 읽기
    const sqlFilePath = path.join(process.cwd(), 'railway_seed.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // INSERT 문만 추출
    const insertLines = sqlContent
      .split('\n')
      .filter(line => line.trim().startsWith('INSERT INTO'));

    console.log(`📝 ${insertLines.length}개 차량 데이터 삽입 중...`);
    
    // 각 INSERT 실행
    for (let i = 0; i < insertLines.length; i++) {
      const insert = insertLines[i].trim();
      if (insert.endsWith(';')) {
        await pool.query(insert);
      } else {
        await pool.query(insert + ';');
      }
      
      if ((i + 1) % 100 === 0) {
        console.log(`  ✓ ${i + 1}개 삽입 완료...`);
      }
    }

    // 최종 확인
    const finalCount = await pool.query('SELECT COUNT(*) as count FROM vehicles');
    console.log(`✅ 데이터베이스 시드 완료! 총 ${finalCount.rows[0].count}개 차량`);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ 데이터베이스 시드 실패:', error);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
