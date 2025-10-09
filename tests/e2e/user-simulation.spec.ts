import { test, expect, Page } from '@playwright/test';

/**
 * 실제 서비스 사용자 여정 시뮬레이션
 *
 * 시나리오: 30대 가족을 위한 차량 구매
 * - 이름: 김철수
 * - 나이: 35세
 * - 지역: 서울
 * - 용도: 출퇴근 + 가족 나들이
 * - 예산: 2000-3500만원
 * - 중요도: 안전성(9) > 연비(8) > 가격(7) > 브랜드(6) > 디자인(5)
 */

test.describe('실제 사용자 여정 시뮬레이션', () => {
  test('시나리오 1: 30대 가족용 차량 구매', async ({ page }) => {
    const startTime = Date.now();
    const log: string[] = [];

    // 로그 함수
    const logStep = (step: string) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const message = `[${elapsed}s] ${step}`;
      log.push(message);
      console.log(message);
    };

    try {
      // ==================== STEP 1: 랜딩 페이지 접속 ====================
      logStep('🌐 랜딩 페이지 접속 시작');
      await page.goto('http://localhost:5000', { waitUntil: 'domcontentloaded' });
      logStep('✅ 랜딩 페이지 로드 완료');

      // 페이지 타이틀 확인
      const title = await page.title();
      logStep(`📄 페이지 타이틀: ${title}`);

      // 시작하기 버튼 찾기
      const startButton = page.locator('button:has-text("시작"), a:has-text("시작")').first();
      const startButtonExists = await startButton.count() > 0;

      if (startButtonExists) {
        logStep('🔘 "시작하기" 버튼 발견');
        await startButton.click();
        await page.waitForTimeout(1000);
        logStep('✅ 시작하기 버튼 클릭 완료');
      } else {
        logStep('⚠️ 시작 버튼 없음, 직접 온보딩으로 이동');
        await page.goto('http://localhost:5000/onboarding');
      }

      // ==================== STEP 2: 온보딩 3단계 진행 ====================
      logStep('📚 온보딩 프로세스 시작');

      // 현재 URL 확인
      const currentUrl = page.url();
      logStep(`🔗 현재 URL: ${currentUrl}`);

      // 온보딩 단계별 진행
      if (currentUrl.includes('onboarding') || currentUrl.includes('profile')) {
        for (let i = 1; i <= 3; i++) {
          const nextButton = page.locator('button:has-text("다음")').first();
          const nextButtonExists = await nextButton.count() > 0;

          if (nextButtonExists) {
            logStep(`📖 온보딩 ${i}/3 단계 - "다음" 버튼 클릭`);
            await nextButton.click();
            await page.waitForTimeout(500);
          } else {
            logStep(`⚠️ 온보딩 ${i}/3 단계 - "다음" 버튼 없음, 건너뜀`);
            break;
          }
        }
        logStep('✅ 온보딩 완료');
      } else {
        logStep('⚠️ 온보딩 화면 없음, 직접 프로필 설정으로 이동');
        await page.goto('http://localhost:5000/profile-setup');
      }

      // ==================== STEP 3: 프로필 설정 4단계 ====================
      logStep('👤 프로필 설정 시작');

      // 3-1: 기본 정보 입력
      const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first();
      const nameExists = await nameInput.count() > 0;

      if (nameExists) {
        logStep('📝 Step 1/4: 기본 정보 입력');
        await nameInput.fill('김철수');

        const ageInput = page.locator('input[name="age"], input[placeholder*="나이"]').first();
        if (await ageInput.count() > 0) {
          await ageInput.fill('35');
        }

        const locationSelect = page.locator('select[name="location"], select').first();
        if (await locationSelect.count() > 0) {
          await locationSelect.selectOption('서울');
        }

        logStep('✅ 기본 정보 입력 완료 (김철수, 35세, 서울)');

        const nextBtn1 = page.locator('button:has-text("다음")').first();
        if (await nextBtn1.count() > 0) {
          await nextBtn1.click();
          await page.waitForTimeout(500);
        }
      } else {
        logStep('⚠️ 프로필 입력 필드 없음, 직접 채팅으로 이동');
        await page.goto('http://localhost:5000/chat');
      }

      // 3-2: 용도 선택
      const commuteCheckbox = page.locator('label:has-text("출퇴근"), input[value*="commute"]').first();
      if (await commuteCheckbox.count() > 0) {
        logStep('📝 Step 2/4: 용도 선택');
        await commuteCheckbox.click();

        const familyCheckbox = page.locator('label:has-text("가족"), input[value*="family"]').first();
        if (await familyCheckbox.count() > 0) {
          await familyCheckbox.click();
        }

        logStep('✅ 용도 선택 완료 (출퇴근 + 가족)');

        const nextBtn2 = page.locator('button:has-text("다음")').first();
        if (await nextBtn2.count() > 0) {
          await nextBtn2.click();
          await page.waitForTimeout(500);
        }
      }

      // 3-3: 예산 설정
      const budgetSliders = page.locator('input[type="range"]');
      const sliderCount = await budgetSliders.count();

      if (sliderCount >= 2) {
        logStep('📝 Step 3/4: 예산 설정');
        await budgetSliders.nth(0).fill('2000'); // 최소 2000만원
        await budgetSliders.nth(1).fill('3500'); // 최대 3500만원
        logStep('✅ 예산 설정 완료 (2000-3500만원)');

        const nextBtn3 = page.locator('button:has-text("다음")').first();
        if (await nextBtn3.count() > 0) {
          await nextBtn3.click();
          await page.waitForTimeout(500);
        }
      }

      // 3-4: 중요도 설정
      logStep('📝 Step 4/4: 중요도 설정');
      const importanceSliders = page.locator('input[type="range"]');
      const importanceCount = await importanceSliders.count();

      if (importanceCount >= 5) {
        await importanceSliders.nth(0).fill('7'); // 가격: 7
        await importanceSliders.nth(1).fill('8'); // 연비: 8
        await importanceSliders.nth(2).fill('9'); // 안전성: 9
        await importanceSliders.nth(3).fill('5'); // 디자인: 5
        await importanceSliders.nth(4).fill('6'); // 브랜드: 6
        logStep('✅ 중요도 설정 완료 (안전성 9 > 연비 8 > 가격 7)');
      }

      const completeBtn = page.locator('button:has-text("완료"), button:has-text("시작")').first();
      if (await completeBtn.count() > 0) {
        await completeBtn.click();
        await page.waitForTimeout(1000);
        logStep('✅ 프로필 설정 완료');
      }

      // ==================== STEP 4: AI 상담 화면 진입 ====================
      logStep('💬 AI 상담 화면 진입');

      // 채팅 화면으로 이동되었는지 확인
      const finalUrl = page.url();
      if (!finalUrl.includes('chat')) {
        logStep('⚠️ 채팅 화면 아님, 직접 이동');
        await page.goto('http://localhost:5000/chat');
        await page.waitForTimeout(1000);
      }
      logStep('✅ AI 상담 화면 로드 완료');

      // ==================== STEP 5: 차량 추천 요청 ====================
      logStep('🚗 차량 추천 요청 시작');

      const messageInput = page.locator('textarea, input[type="text"]').first();
      const messageExists = await messageInput.count() > 0;

      if (messageExists) {
        const testMessage = '3000만원 이하 연비 좋고 안전한 가족용 SUV 찾아요. 출퇴근도 하고 주말에 가족이랑 나들이도 갈 예정이에요.';
        logStep(`📤 메시지 전송: "${testMessage}"`);
        await messageInput.fill(testMessage);
        await page.waitForTimeout(500);

        // 전송 버튼 찾기
        const sendButton = page.locator('button[type="submit"], button:has-text("전송")').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          logStep('✅ 메시지 전송 완료');
        } else {
          // Enter 키로 전송 시도
          await messageInput.press('Enter');
          logStep('✅ 메시지 전송 완료 (Enter)');
        }
      } else {
        logStep('❌ 메시지 입력란을 찾을 수 없습니다');
      }

      // ==================== STEP 6: 진행 상황 모니터링 ====================
      logStep('⏳ AI 분석 진행 상황 모니터링 시작');

      // 진행 상황 표시 확인 (최대 5초)
      try {
        await page.locator('text=/분석|검색|추천/').first().waitFor({ timeout: 5000 });
        logStep('✅ 진행 상황 표시 확인됨');
      } catch {
        logStep('⚠️ 진행 상황 표시 없음 (빠른 응답 또는 오류)');
      }

      // ==================== STEP 7: 추천 결과 대기 및 검증 ====================
      logStep('🎯 추천 결과 대기 중 (최대 45초)...');

      try {
        // 차량 카드 대기
        const vehicleCard = page.locator('[data-testid="vehicle-card"]').first();
        await vehicleCard.waitFor({ timeout: 60000 });

        const vehicleCount = await page.locator('[data-testid="vehicle-card"]').count();
        logStep(`✅ 추천 결과 수신 완료! (총 ${vehicleCount}대)`);

        // ==================== STEP 8: 추천 결과 상세 분석 ====================
        logStep('🔍 추천 결과 상세 분석 시작');

        for (let i = 0; i < Math.min(vehicleCount, 3); i++) {
          const card = page.locator('[data-testid="vehicle-card"]').nth(i);

          // 브랜드 및 모델
          const brandModel = await card.locator('[data-testid="vehicle-brand-model"]').textContent().catch(() => '알 수 없음');

          // 가격
          const price = await card.locator('text=/만원/').textContent().catch(() => '가격 정보 없음');

          // 주행거리
          const distance = await card.locator('text=/km/').textContent().catch(() => '주행거리 정보 없음');

          // TOPSIS 점수
          const score = await card.locator('text=/점|TOPSIS/').textContent().catch(() => '점수 없음');

          logStep(`  ${i + 1}위: ${brandModel} | ${price} | ${distance} | ${score}`);
        }

        // ==================== STEP 9: TCO 차트 확인 ====================
        const tcoChart = page.locator('text=/TCO|총 소유 비용/').first();
        const tcoExists = await tcoChart.count() > 0;

        if (tcoExists) {
          logStep('✅ TCO 비교 차트 표시 확인');
        } else {
          logStep('⚠️ TCO 차트 미표시');
        }

        // ==================== STEP 10: Agent 통신 로그 확인 ====================
        const agentLog = page.locator('text=/Manager|User Analyst|Searcher/').first();
        const agentLogExists = await agentLog.count() > 0;

        if (agentLogExists) {
          logStep('✅ MACRec Agent 통신 로그 표시 확인');
        } else {
          logStep('⚠️ Agent 통신 로그 미표시');
        }

        // ==================== 최종 결과 ====================
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        logStep(`\n🎉 전체 사용자 여정 완료! (총 소요 시간: ${totalTime}초)`);
        logStep(`📊 추천된 차량 수: ${vehicleCount}대`);

        // 결과를 파일로 저장
        const reportContent = log.join('\n');
        await page.evaluate((content) => {
          localStorage.setItem('simulation_log', content);
        }, reportContent);

        // 스크린샷 저장
        await page.screenshot({ path: 'test-results/user-simulation-success.png', fullPage: true });
        logStep('📸 스크린샷 저장 완료: test-results/user-simulation-success.png');

        // 검증
        expect(vehicleCount).toBeGreaterThanOrEqual(1);
        expect(vehicleCount).toBeLessThanOrEqual(3);

      } catch (error) {
        logStep(`❌ 추천 결과 수신 실패: ${error}`);

        // 실패 시 스크린샷
        await page.screenshot({ path: 'test-results/user-simulation-failure.png', fullPage: true });
        logStep('📸 실패 스크린샷 저장: test-results/user-simulation-failure.png');

        // 서버 로그 확인을 위한 정보
        const pageContent = await page.content();
        logStep(`\n📄 페이지 HTML 길이: ${pageContent.length}자`);

        throw error;
      }

    } catch (error) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      logStep(`\n❌ 시뮬레이션 실패 (${totalTime}초 경과)`);
      logStep(`오류: ${error}`);
      throw error;
    }
  });

  test('시나리오 2: 빠른 추천 (프로필 건너뛰기)', async ({ page }) => {
    console.log('🚀 빠른 추천 시나리오 시작');

    await page.goto('http://localhost:5000/chat');

    const messageInput = page.locator('textarea, input[type="text"]').first();
    await messageInput.fill('1500만원대 경제적인 경차 추천해줘');

    const sendButton = page.locator('button[type="submit"]').first();
    if (await sendButton.count() > 0) {
      await sendButton.click();
    } else {
      await messageInput.press('Enter');
    }

    console.log('⏳ 추천 결과 대기 중...');

    try {
      await page.locator('[data-testid="vehicle-card"]').first().waitFor({ timeout: 60000 });
      const count = await page.locator('[data-testid="vehicle-card"]').count();
      console.log(`✅ 추천 완료: ${count}대`);

      expect(count).toBeGreaterThanOrEqual(1);
    } catch (error) {
      console.log('❌ 추천 실패');
      await page.screenshot({ path: 'test-results/quick-recommendation-failure.png' });
      throw error;
    }
  });

  test('시나리오 3: 고가 차량 추천', async ({ page }) => {
    console.log('💰 고가 차량 추천 시나리오');

    await page.goto('http://localhost:5000/chat');

    const messageInput = page.locator('textarea, input[type="text"]').first();
    await messageInput.fill('5000만원대 수입 세단, 브랜드와 디자인 중요해');

    const sendButton = page.locator('button[type="submit"]').first();
    if (await sendButton.count() > 0) {
      await sendButton.click();
    } else {
      await messageInput.press('Enter');
    }

    try {
      await page.locator('[data-testid="vehicle-card"]').first().waitFor({ timeout: 60000 });
      const count = await page.locator('[data-testid="vehicle-card"]').count();
      console.log(`✅ 고가 차량 추천 완료: ${count}대`);

      expect(count).toBeGreaterThanOrEqual(1);
    } catch (error) {
      console.log('❌ 고가 차량 추천 실패');
      await page.screenshot({ path: 'test-results/premium-recommendation-failure.png' });
      throw error;
    }
  });
});

test.describe('추천 품질 검증', () => {
  test('추천 결과 필수 정보 확인', async ({ page }) => {
    await page.goto('http://localhost:5000/chat');

    const messageInput = page.locator('textarea, input[type="text"]').first();
    await messageInput.fill('차량 추천해줘');

    const sendButton = page.locator('button[type="submit"]').first();
    if (await sendButton.count() > 0) {
      await sendButton.click();
    }

    await page.locator('[data-testid="vehicle-card"]').first().waitFor({ timeout: 60000 });

    const firstCard = page.locator('[data-testid="vehicle-card"]').first();

    // 필수 정보 확인
    await expect(firstCard.locator('text=/만원/')).toBeVisible();
    await expect(firstCard.locator('text=/km/')).toBeVisible();

    console.log('✅ 추천 결과 필수 정보 검증 완료');
  });
});
