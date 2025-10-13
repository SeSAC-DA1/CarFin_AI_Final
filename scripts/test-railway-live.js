import WebSocket from 'ws';

const RAILWAY_WS_URL = 'wss://carfinaifinal-production-15a8.up.railway.app/ws/chat';

console.log('🚀 Railway 프로덕션 환경 테스트 시작');
console.log('📡 연결 URL:', RAILWAY_WS_URL);

const ws = new WebSocket(RAILWAY_WS_URL);
let startTime = Date.now();
let receivedVehicles = false;
let errorOccurred = false;

ws.on('open', () => {
  console.log('✅ WebSocket 연결 성공');

  // 시연 시나리오 A 메시지 전송
  const testMessage = {
    type: 'user_message',
    content: '3000만원 이하 가족용 SUV 찾아요. 연간 15000km 주행하고 5년 보유 예정입니다.',
    userProfile: {
      name: '테스트',
      age: '35',
      budget: [0, 3000],
      usage: ['family', 'commute'],
      carType: 'SUV',
      importance: {
        price: 8,
        fuelEfficiency: 7,
        safety: 9,
        design: 6,
        brand: 7
      }
    }
  };

  console.log('📤 메시지 전송:', testMessage.content.substring(0, 50) + '...');
  ws.send(JSON.stringify(testMessage));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (message.type === 'progress') {
      console.log(`⏳ [${elapsed}s] ${message.step}: ${message.message}`);
    } else if (message.type === 'recommendations' || message.type === 'vehicles') {
      receivedVehicles = true;
      const vehicles = message.data?.vehicles || message.vehicles || [];
      console.log(`✅ [${elapsed}s] 추천 완료: ${vehicles.length}대`);
      vehicles.forEach((v, i) => {
        console.log(`  ${i+1}위: ${v.manufacturer} ${v.model} (${v.modelYear}) - ${v.price}만원`);
      });

      // 테스트 성공
      setTimeout(() => {
        console.log('\n🎯 테스트 결과: 성공');
        console.log(`⏱️  총 소요시간: ${elapsed}초`);
        ws.close();
        process.exit(0);
      }, 1000);
    } else if (message.type === 'error') {
      errorOccurred = true;
      console.error('❌ 에러 발생:', message.content);
      ws.close();
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ 메시지 파싱 실패:', err.message);
  }
});

ws.on('error', (error) => {
  errorOccurred = true;
  console.error('❌ WebSocket 에러:', error.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`🔌 연결 종료 (code: ${code})`);
  if (!receivedVehicles && !errorOccurred) {
    console.error('❌ 테스트 실패: 추천 결과 없이 연결 종료됨');
    process.exit(1);
  }
});

// 60초 타임아웃
setTimeout(() => {
  if (!receivedVehicles) {
    console.error('❌ 타임아웃: 60초 내에 결과 없음');
    ws.close();
    process.exit(1);
  }
}, 60000);
