// Railway 프로덕션 환경 테스트 스크립트
import WebSocket from 'ws';

const PRODUCTION_URL = 'wss://carfinaifinal-production.up.railway.app/ws/chat';
const TEST_MESSAGE = '3000만원 이하 가족용 SUV 찾아요';

console.log('🔌 Railway 프로덕션 WebSocket 연결 시도...');
console.log(`URL: ${PRODUCTION_URL}\n`);

const ws = new WebSocket(PRODUCTION_URL);

let progressSteps = [];
let vehiclesReceived = false;
let startTime = Date.now();

ws.on('open', () => {
  console.log('✅ WebSocket 연결 성공\n');

  // 시연 시나리오 메시지 전송
  console.log(`📤 테스트 메시지 전송: "${TEST_MESSAGE}"\n`);

  const payload = {
    type: 'user_message',
    content: TEST_MESSAGE,
    userProfile: {
      priceWeight: 0.8,
      fuelEfficiencyWeight: 0.5,
      safetyWeight: 0.7,
      designWeight: 0.4,
      brandWeight: 0.5,
      budget: { min: 10000000, max: 30000000 },
      usage: ['commute', 'family'],
      annualKm: 15000,
      ownershipYears: 5
    }
  };

  ws.send(JSON.stringify(payload));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());

    if (message.type === 'progress') {
      const progressInfo = {
        step: message.step,
        progress: message.progress || 0,
        message: message.message,
        agent: message.agent,
        count: message.count
      };

      progressSteps.push(progressInfo);

      console.log(`📊 [PROGRESS ${progressInfo.progress}%] ${progressInfo.message}`);
      if (progressInfo.agent) {
        console.log(`   🤖 Agent: ${progressInfo.agent}`);
      }
      if (progressInfo.count) {
        console.log(`   🔍 발견: ${progressInfo.count}대`);
      }
      console.log('');
    } else if (message.type === 'vehicles' || message.type === 'recommendations') {
      vehiclesReceived = true;
      const vehicles = message.vehicles || message.data?.vehicles || [];
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`\n🎉 차량 추천 완료! (소요 시간: ${elapsedTime}초)\n`);
      console.log(`📋 추천 차량: ${vehicles.length}대\n`);

      vehicles.forEach((vehicle, index) => {
        console.log(`${index + 1}. ${vehicle.manufacturer || vehicle.brand} ${vehicle.model}`);
        console.log(`   💰 가격: ${vehicle.price?.toLocaleString() || 'N/A'}만원`);
        console.log(`   📊 TOPSIS: ${vehicle.topsisScore || 'N/A'}`);

        if (vehicle.tco) {
          console.log(`   💸 TCO: ${Math.round(vehicle.tco.total / 10000).toLocaleString()}만원 (${vehicle.tco.ownershipYears}년)`);
          console.log(`   📈 Timeline: ${vehicle.tco.timeline ? vehicle.tco.timeline.length + '개 연도' : 'N/A'}`);
        }
        console.log('');
      });

      // 테스트 결과 요약
      console.log('\n' + '='.repeat(60));
      console.log('📊 테스트 결과 요약');
      console.log('='.repeat(60));
      console.log(`✅ WebSocket 연결: 성공`);
      console.log(`✅ Progress 단계: ${progressSteps.length}회 업데이트`);
      console.log(`✅ 차량 추천: ${vehicles.length}대`);
      console.log(`✅ 소요 시간: ${elapsedTime}초`);

      // Progress Bar 검증
      console.log('\n📈 Progress Bar 검증:');
      progressSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step.progress}% - ${step.step} - ${step.agent || 'N/A'}`);
      });

      const progressValues = progressSteps.map(s => s.progress).filter(p => p > 0);
      const hasProgressBug = progressValues.length === 0 || progressValues.every(p => p === 0);

      if (hasProgressBug) {
        console.log(`\n❌ Progress Bar 버그: 모든 값이 0%`);
      } else {
        console.log(`\n✅ Progress Bar 정상: ${progressValues.join('% → ')}%`);
      }

      // Agent 검증
      const uniqueAgents = [...new Set(progressSteps.map(s => s.agent).filter(Boolean))];
      console.log(`\n🤖 작동한 Agent: ${uniqueAgents.length}개`);
      uniqueAgents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent}`);
      });

      if (uniqueAgents.length < 5) {
        console.log(`\n⚠️ Agent 5개 미만 표시됨 (실제: ${uniqueAgents.length}개)`);
      } else {
        console.log(`\n✅ Agent 5개 정상 작동`);
      }

      // TCO Timeline 검증
      const vehiclesWithTimeline = vehicles.filter(v => v.tco && v.tco.timeline);
      console.log(`\n📊 TCO Timeline: ${vehiclesWithTimeline.length}/${vehicles.length}대`);

      if (vehiclesWithTimeline.length === vehicles.length) {
        console.log(`✅ 모든 차량에 TCO timeline 데이터 포함 (Line Chart 렌더링 가능)`);
      } else {
        console.log(`⚠️ 일부 차량에 TCO timeline 데이터 없음`);
      }

      console.log('\n' + '='.repeat(60));

      ws.close();
    } else if (message.type === 'agent_message') {
      console.log(`💬 ${message.agent || 'Agent'}: ${message.content.substring(0, 80)}...`);
    } else if (message.type === 'error') {
      console.error(`\n❌ 에러: ${message.content}\n`);
    }
  } catch (error) {
    console.error('메시지 파싱 오류:', error);
  }
});

ws.on('error', (error) => {
  console.error('\n❌ WebSocket 에러:', error.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🔌 WebSocket 연결 종료 (${elapsedTime}초)`);
  console.log(`Code: ${code}, Reason: ${reason || 'N/A'}`);

  if (!vehiclesReceived) {
    console.log('\n⚠️ 차량 추천 받지 못함');
    process.exit(1);
  }

  process.exit(0);
});

// 타임아웃 (3분)
setTimeout(() => {
  console.error('\n❌ 타임아웃: 3분 경과');
  ws.close();
  process.exit(1);
}, 180000);
