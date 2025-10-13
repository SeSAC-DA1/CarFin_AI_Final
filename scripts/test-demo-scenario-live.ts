/**
 * 🎬 시연 시나리오 실시간 테스트 및 성능 분석
 *
 * 목적: 전체 시연 플로우를 시뮬레이션하고 병목지점 분석
 */

import WebSocket from 'ws';

const BACKEND_URL = process.env.RAILWAY_URL || 'ws://localhost:5000';
const WS_URL = `${BACKEND_URL}/ws/chat`;

console.log('🎬 시연 시나리오 실시간 테스트 시작\n');
console.log('='.repeat(80));
console.log(`\n🔗 연결 대상: ${WS_URL}\n`);

// 성능 측정 타이머
const timers: Record<string, number> = {};
const startTimer = (label: string) => {
  timers[label] = Date.now();
};
const endTimer = (label: string): number => {
  const elapsed = Date.now() - timers[label];
  return elapsed;
};

// 시나리오 A 프로필 데이터
const profileData = {
  name: '김민준',
  age: '30대',
  location: '서울',
  usage: ['가족용', '주말 나들이'],
  budget: [0, 3000],
  preferredBrands: ['현대', '기아'],
  vehicleTypes: ['SUV'],
  fuelType: '가솔린',
  transmission: '오토',
  importance: {
    price: 7,
    fuelEfficiency: 6,
    safety: 10,
    design: 5,
    brand: 6
  },
  annualKm: 15000,
  ownershipYears: 5
};

// 시나리오 A 메시지
const scenarioMessage = "3000만원 이하 가솔린 국내차 SUV 찾습니다. 5인 가족이고 안전성이 가장 중요해요. 연식은 5년 이내로 주행거리 10만km 이내 무사고 차량으로 추천해 주세요.";

// 병목지점 분석
interface BottleneckAnalysis {
  phase: string;
  duration: number;
  percentage: number;
  status: 'fast' | 'normal' | 'slow' | 'critical';
  recommendation: string;
}

const bottlenecks: BottleneckAnalysis[] = [];

async function testDemoScenario() {
  return new Promise((resolve, reject) => {
    console.log('📡 WebSocket 연결 시작...\n');
    startTimer('total');
    startTimer('connection');

    const ws = new WebSocket(WS_URL);
    let messageCount = 0;
    let progressSteps: string[] = [];
    let vehicleCount = 0;
    let hasError = false;

    ws.on('open', () => {
      const connectionTime = endTimer('connection');
      console.log(`✅ WebSocket 연결 완료 (${connectionTime}ms)\n`);

      bottlenecks.push({
        phase: '1. WebSocket 연결',
        duration: connectionTime,
        percentage: 0,
        status: connectionTime < 100 ? 'fast' : connectionTime < 500 ? 'normal' : 'slow',
        recommendation: connectionTime > 500 ? 'Railway 네트워크 최적화 필요' : '정상'
      });

      console.log('=' .repeat(80));
      console.log('\n📤 시나리오 A 메시지 전송\n');
      console.log('-'.repeat(80));
      console.log(`메시지: "${scenarioMessage}"\n`);

      startTimer('recommendation');

      ws.send(JSON.stringify({
        type: 'user_message',
        content: scenarioMessage,
        userProfile: profileData
      }));
    });

    ws.on('message', (data: Buffer) => {
      messageCount++;
      const message = JSON.parse(data.toString());

      console.log(`\n📨 메시지 #${messageCount}: ${message.type}`);

      switch (message.type) {
        case 'connection_established':
          console.log('   ✅ 연결 확인');
          break;

        case 'progress':
          progressSteps.push(message.step);
          console.log(`   🔄 진행상태: ${message.message}`);
          console.log(`   📊 단계: ${message.step}`);

          // 단계별 타이머
          if (message.step === 'keyword_mapping') {
            startTimer('keyword_mapping');
          } else if (message.step === 'db_search') {
            if (timers['keyword_mapping']) {
              const keywordTime = endTimer('keyword_mapping');
              console.log(`   ⏱️ KeywordMapping 소요시간: ${keywordTime}ms`);
            }
            startTimer('db_search');
          } else if (message.step === 'macrec_analyzing') {
            if (timers['db_search']) {
              const dbTime = endTimer('db_search');
              console.log(`   ⏱️ DB 검색 소요시간: ${dbTime}ms`);
            }
            startTimer('macrec');
          } else if (message.step === 'topsis_ranking') {
            if (timers['macrec']) {
              const macrecTime = endTimer('macrec');
              console.log(`   ⏱️ MACRec 협업 소요시간: ${macrecTime}ms`);
            }
            startTimer('topsis');
          } else if (message.step === 'reranking') {
            if (timers['topsis']) {
              const topsisTime = endTimer('topsis');
              console.log(`   ⏱️ TOPSIS 평가 소요시간: ${topsisTime}ms`);
            }
            startTimer('reranking');
          }
          break;

        case 'agent_message':
          console.log(`   💬 Agent: ${message.content.substring(0, 100)}...`);
          break;

        case 'vehicles':
          if (timers['reranking']) {
            const rerankTime = endTimer('reranking');
            console.log(`   ⏱️ Re-ranking 소요시간: ${rerankTime}ms`);
          }

          const recommendationTime = endTimer('recommendation');
          vehicleCount = message.vehicles.length;

          console.log('\n' + '='.repeat(80));
          console.log('\n🎯 추천 완료!\n');
          console.log('-'.repeat(80));
          console.log(`   🚗 추천 차량: ${vehicleCount}대`);
          console.log(`   ⏱️ 총 추천 시간: ${recommendationTime}ms (${(recommendationTime / 1000).toFixed(2)}초)`);

          // 추천 차량 상세
          message.vehicles.forEach((v: any, idx: number) => {
            console.log(`\n   ${idx + 1}위: ${v.manufacturer} ${v.model}`);
            console.log(`      • 가격: ${v.price}만원`);
            console.log(`      • 연식: ${v.modelYear}년`);
            console.log(`      • 주행거리: ${v.distance?.toLocaleString()}km`);
            console.log(`      • TOPSIS: ${v.topsisScore?.toFixed(3)}`);
          });

          // 병목지점 분석
          const totalTime = endTimer('total');
          console.log('\n\n' + '='.repeat(80));
          console.log('\n📊 병목지점 분석\n');
          console.log('-'.repeat(80));

          // 단계별 시간 수집
          const phases = [
            { name: '2. KeywordMapping', timer: 'keyword_mapping' },
            { name: '3. DB 검색', timer: 'db_search' },
            { name: '4. MACRec 협업', timer: 'macrec' },
            { name: '5. TOPSIS 평가', timer: 'topsis' },
            { name: '6. Alibaba Re-ranking', timer: 'reranking' }
          ];

          phases.forEach(({ name, timer }) => {
            if (timers[timer] !== undefined) {
              const duration = Date.now() - timers[timer];
              const percentage = (duration / totalTime) * 100;
              let status: 'fast' | 'normal' | 'slow' | 'critical';
              let recommendation: string;

              if (timer === 'keyword_mapping') {
                status = duration < 100 ? 'fast' : duration < 500 ? 'normal' : 'slow';
                recommendation = duration > 500 ? 'KeywordMapping 캐싱 고려' : '정상';
              } else if (timer === 'db_search') {
                status = duration < 500 ? 'fast' : duration < 1000 ? 'normal' : duration < 2000 ? 'slow' : 'critical';
                recommendation = duration > 1000 ? 'DB 인덱스 추가 또는 쿼리 최적화' : '정상';
              } else if (timer === 'macrec') {
                status = duration < 2000 ? 'fast' : duration < 5000 ? 'normal' : duration < 10000 ? 'slow' : 'critical';
                recommendation = duration > 5000 ? 'Gemini API 응답 시간 병목 (외부 의존성)' : '정상';
              } else if (timer === 'topsis') {
                status = duration < 500 ? 'fast' : duration < 1000 ? 'normal' : 'slow';
                recommendation = duration > 1000 ? 'TOPSIS 계산 최적화 (WebAssembly 고려)' : '정상';
              } else {
                status = duration < 500 ? 'fast' : duration < 1000 ? 'normal' : 'slow';
                recommendation = duration > 1000 ? 'Re-ranking 알고리즘 최적화' : '정상';
              }

              bottlenecks.push({
                phase: name,
                duration,
                percentage,
                status,
                recommendation
              });
            }
          });

          // 병목지점 출력
          bottlenecks.forEach(b => {
            const icon = b.status === 'fast' ? '🟢' : b.status === 'normal' ? '🟡' : b.status === 'slow' ? '🟠' : '🔴';
            console.log(`\n${icon} ${b.phase}`);
            console.log(`   소요시간: ${b.duration}ms (${b.percentage.toFixed(1)}%)`);
            console.log(`   상태: ${b.status.toUpperCase()}`);
            console.log(`   권장사항: ${b.recommendation}`);
          });

          // 최종 평가
          console.log('\n\n' + '='.repeat(80));
          console.log('\n🎯 최종 평가\n');
          console.log('-'.repeat(80));

          const criticalBottlenecks = bottlenecks.filter(b => b.status === 'critical');
          const slowBottlenecks = bottlenecks.filter(b => b.status === 'slow');

          console.log(`   ⏱️ 총 소요시간: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}초)`);
          console.log(`   📊 총 메시지: ${messageCount}개`);
          console.log(`   🚗 추천 차량: ${vehicleCount}대`);
          console.log(`   📈 진행 단계: ${progressSteps.length}개`);

          if (criticalBottlenecks.length > 0) {
            console.log(`\n   🔴 심각한 병목: ${criticalBottlenecks.length}개`);
            criticalBottlenecks.forEach(b => {
              console.log(`      • ${b.phase}: ${b.duration}ms`);
            });
          } else if (slowBottlenecks.length > 0) {
            console.log(`\n   🟠 개선 필요: ${slowBottlenecks.length}개`);
            slowBottlenecks.forEach(b => {
              console.log(`      • ${b.phase}: ${b.duration}ms`);
            });
          } else {
            console.log(`\n   ✅ 모든 단계 정상`);
          }

          // 시연 적합성 평가
          console.log('\n\n' + '='.repeat(80));
          console.log('\n🎬 시연 적합성 평가\n');
          console.log('-'.repeat(80));

          const totalSeconds = totalTime / 1000;
          if (totalSeconds <= 60) {
            console.log(`   ✅ 우수: ${totalSeconds.toFixed(1)}초 (목표 1분 이내 달성)`);
          } else if (totalSeconds <= 120) {
            console.log(`   🟡 양호: ${totalSeconds.toFixed(1)}초 (목표 2분 이내 달성)`);
          } else if (totalSeconds <= 180) {
            console.log(`   🟠 보통: ${totalSeconds.toFixed(1)}초 (목표 3분 이내 달성)`);
          } else {
            console.log(`   🔴 개선 필요: ${totalSeconds.toFixed(1)}초 (목표 3분 초과)`);
          }

          console.log('\n' + '='.repeat(80));
          console.log('\n✅ 테스트 완료\n');

          ws.close();
          resolve({
            totalTime,
            vehicleCount,
            messageCount,
            progressSteps,
            bottlenecks
          });
          break;

        case 'error':
          console.error(`\n   ❌ 에러 발생: ${message.error}`);
          hasError = true;
          ws.close();
          reject(new Error(message.error));
          break;

        default:
          console.log(`   ℹ️ 기타 메시지: ${JSON.stringify(message).substring(0, 100)}...`);
      }
    });

    ws.on('error', (error) => {
      console.error('\n❌ WebSocket 에러:', error.message);
      reject(error);
    });

    ws.on('close', () => {
      if (!hasError && vehicleCount === 0) {
        console.log('\n⚠️ 추천 결과 없이 연결 종료됨');
        reject(new Error('No vehicles recommended'));
      }
    });

    // 타임아웃 (3분)
    setTimeout(() => {
      ws.close();
      reject(new Error('Timeout: 3분 초과'));
    }, 180000);
  });
}

testDemoScenario()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n\n❌ 테스트 실패:', error.message);
    process.exit(1);
  });
