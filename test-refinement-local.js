/**
 * Phase 2 재추천 시나리오 로컬 테스트
 */

import WebSocket from 'ws';

const LOCAL_WS_URL = 'ws://localhost:5000/ws/chat';

const userProfile = {
  name: '김테스트',
  age: '35',
  location: '서울',
  usage: ['commute', 'family'],
  budget: [0, 3000],
  importance: {
    price: 8,
    fuelEfficiency: 7,
    safety: 9,
    design: 5,
    brand: 6
  },
  annualKm: 15000,
  ownershipYears: 5
};

const scenarios = [
  {
    name: '초기 추천',
    message: '3000만원 이하 가족용 SUV 찾아요. 연간 15000km 주행하고 5년 보유 계획이에요.',
    expectedVehicles: 3,
    expectedCarType: 'SUV'
  },
  {
    name: '재추천 (셀토스)',
    message: '셀토스로 다시 찾아줘',
    expectedVehicles: 3,
    expectedModel: '셀토스',
    waitAfterPrevious: 3000
  }
];

let currentScenarioIndex = 0;
let receivedVehicles = [];
let testStartTime = Date.now();
let scenarioStartTime = Date.now();
let refinementDetected = false;

console.log(`\n🧪 ===== Phase 2 재추천 시나리오 로컬 테스트 =====`);
console.log(`🌐 Local URL: ${LOCAL_WS_URL}`);
console.log(`📅 시작 시간: ${new Date().toLocaleString()}\n`);

const ws = new WebSocket(LOCAL_WS_URL);

ws.on('open', () => {
  console.log(`✅ WebSocket 연결 성공\n`);

  ws.send(JSON.stringify({
    type: 'join',
    sessionId: `test-refinement-${Date.now()}`
  }));

  setTimeout(() => {
    runScenario(currentScenarioIndex);
  }, 1000);
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  const elapsed = ((Date.now() - scenarioStartTime) / 1000).toFixed(1);

  // 재추천 감지 로그
  if (message.type === 'agent_message' && message.content?.includes('새로운 조건으로 다시')) {
    console.log(`\n🔄 [${elapsed}s] 재추천 감지됨!`);
    console.log(`   메시지: "${message.content}"`);
    refinementDetected = true;
  }

  // Progress 메시지
  if (message.type === 'progress') {
    console.log(`📊 [${elapsed}s] ${message.message}`);
  }

  // 추천 결과 수신
  if (message.type === 'recommendations' || message.type === 'vehicles') {
    const vehicles = message.data?.vehicles || message.vehicles || [];
    receivedVehicles = vehicles;

    const scenario = scenarios[currentScenarioIndex];
    console.log(`\n✨ [${elapsed}s] 추천 결과 수신!`);
    console.log(`   시나리오: ${scenario.name}`);
    console.log(`   추천 차량: ${vehicles.length}대`);

    let validationPassed = true;

    if (vehicles.length === 0) {
      console.log(`   ❌ 차량 없음 (CRITICAL)`);
      validationPassed = false;
    } else if (vehicles.length !== scenario.expectedVehicles) {
      console.log(`   ⚠️ 차량 수 불일치: ${vehicles.length}대 (기대: ${scenario.expectedVehicles}대)`);
    } else {
      console.log(`   ✅ 차량 수 검증 통과: ${vehicles.length}대`);
    }

    // 차량 정보 출력
    vehicles.forEach((v, idx) => {
      const brand = v.brand || '?';
      const model = v.model || '?';
      const price = v.price || 0;
      console.log(`   ${idx + 1}. ${brand} ${model} (${price}만원)`);

      // 재추천 시 모델 검증
      if (scenario.expectedModel && v.model) {
        if (v.model.includes(scenario.expectedModel)) {
          console.log(`      ✅ 모델 일치: ${v.model}`);
        } else {
          console.log(`      ⚠️ 모델 불일치: ${v.model} (기대: ${scenario.expectedModel})`);
        }
      }

      // TCO 검증
      if (v.tco) {
        const totalTCO = Object.values(v.tco).reduce((sum, val) => sum + (val || 0), 0);
        console.log(`      💰 TCO: ${totalTCO.toLocaleString()}만원`);
      }
    });

    // 재추천 시나리오 검증
    if (currentScenarioIndex === 1 && !refinementDetected) {
      console.log(`\n   ⚠️ 재추천 감지 메시지 없음 (로그 확인 필요)`);
    }

    if (validationPassed) {
      console.log(`\n✅ [${scenario.name}] 검증 통과!`);
    } else {
      console.log(`\n❌ [${scenario.name}] 검증 실패!`);
    }

    // 다음 시나리오
    currentScenarioIndex++;
    if (currentScenarioIndex < scenarios.length) {
      const nextScenario = scenarios[currentScenarioIndex];
      const waitTime = nextScenario.waitAfterPrevious || 2000;

      console.log(`\n⏳ ${waitTime / 1000}초 후 다음 시나리오 실행...\n`);

      setTimeout(() => {
        refinementDetected = false;
        runScenario(currentScenarioIndex);
      }, waitTime);
    } else {
      const totalTime = ((Date.now() - testStartTime) / 1000).toFixed(1);
      console.log(`\n🎉 ===== 모든 테스트 완료 =====`);
      console.log(`⏱️ 총 소요 시간: ${totalTime}초`);
      console.log(`📅 종료 시간: ${new Date().toLocaleString()}\n`);

      ws.close();
      setTimeout(() => process.exit(0), 1000);
    }
  }
});

ws.on('error', (error) => {
  console.error(`\n🚨 WebSocket 오류:`, error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log(`\n🔌 WebSocket 연결 종료`);
});

function runScenario(index) {
  const scenario = scenarios[index];
  scenarioStartTime = Date.now();

  console.log(`\n🎬 [시나리오 ${index + 1}/${scenarios.length}] ${scenario.name}`);
  console.log(`📝 사용자 메시지: "${scenario.message}"`);
  console.log(`⏱️ 시작 시간: ${new Date().toLocaleString()}\n`);

  ws.send(JSON.stringify({
    type: 'user_message',
    content: scenario.message,
    userProfile: userProfile
  }));
}

setTimeout(() => {
  console.error(`\n⏰ 타임아웃: 5분 경과`);
  ws.close();
  process.exit(1);
}, 5 * 60 * 1000);
