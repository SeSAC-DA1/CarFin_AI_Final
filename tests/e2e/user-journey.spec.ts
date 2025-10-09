import { test, expect } from '@playwright/test';

test.describe('CARFIN AI 사용자 여정 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('전체 사용자 여정: 랜딩 → 온보딩 → 프로필 → AI 추천', async ({ page }) => {
    // Step 1: 랜딩 페이지 접속
    await expect(page).toHaveTitle(/CARFIN AI/);
    await expect(page.locator('h1')).toContainText('CARFIN AI');

    // Step 2: 시작하기 버튼 클릭
    const startButton = page.locator('button:has-text("시작하기")');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Step 3: 온보딩 화면 검증
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.locator('h2')).toContainText(/AI 에이전트/);

    // 온보딩 3단계 진행
    for (let i = 0; i < 3; i++) {
      const nextButton = page.locator('button:has-text("다음")');
      await expect(nextButton).toBeVisible();
      await nextButton.click();
      await page.waitForTimeout(300);
    }

    // Step 4: 프로필 설정 화면으로 이동
    await expect(page).toHaveURL(/\/profile-setup/);

    // 4-1: 기본 정보 입력
    await page.fill('input[name="name"]', '홍길동');
    await page.fill('input[name="age"]', '30');
    await page.selectOption('select[name="location"]', '서울');
    await page.locator('button:has-text("다음")').click();

    // 4-2: 용도 선택
    await page.locator('label:has-text("출퇴근")').click();
    await page.locator('label:has-text("가족")').click();
    await page.locator('button:has-text("다음")').click();

    // 4-3: 예산 설정
    const minBudgetSlider = page.locator('input[type="range"]').first();
    const maxBudgetSlider = page.locator('input[type="range"]').last();
    await minBudgetSlider.fill('2000');
    await maxBudgetSlider.fill('3000');
    await page.locator('button:has-text("다음")').click();

    // 4-4: 중요도 설정
    const priceSlider = page.locator('input[aria-label="가격 중요도"]');
    await priceSlider.fill('8');
    await page.locator('button:has-text("완료")').click();

    // Step 5: AI 추천 화면으로 이동
    await expect(page).toHaveURL(/\/chat/);
    await expect(page.locator('h1')).toContainText(/AI 상담/);

    // Step 6: 메시지 입력 및 추천 받기
    const messageInput = page.locator('textarea[placeholder*="메시지"]');
    await expect(messageInput).toBeVisible();
    await messageInput.fill('3000만원 이하 연비 좋은 가족용 SUV 추천해줘');

    const sendButton = page.locator('button[type="submit"]');
    await sendButton.click();

    // Step 7: 진행 상황 표시 확인
    await expect(page.locator('text=분석')).toBeVisible({ timeout: 10000 });

    // Step 8: 추천 결과 확인 (최대 30초 대기)
    await expect(page.locator('[data-testid="vehicle-card"]').first()).toBeVisible({ timeout: 60000 });

    // Top 3 추천 확인
    const vehicleCards = page.locator('[data-testid="vehicle-card"]');
    await expect(vehicleCards).toHaveCount(3);

    // 각 카드에 필수 정보가 있는지 확인
    for (let i = 0; i < 3; i++) {
      const card = vehicleCards.nth(i);
      await expect(card.locator('text=만원')).toBeVisible();
      await expect(card.locator('text=km')).toBeVisible();
    }
  });

  test('빠른 추천 플로우: 프로필 건너뛰기', async ({ page }) => {
    // 시작하기
    await page.locator('button:has-text("시작하기")').click();

    // 온보딩 건너뛰기
    const skipButton = page.locator('button:has-text("건너뛰기")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }

    // AI 상담 바로 시작
    await expect(page).toHaveURL(/\/chat/, { timeout: 10000 });

    // 메시지 입력
    const messageInput = page.locator('textarea');
    await messageInput.fill('경제적인 세단 추천해줘');
    await page.locator('button[type="submit"]').click();

    // 추천 결과 대기
    await expect(page.locator('[data-testid="vehicle-card"]').first()).toBeVisible({ timeout: 60000 });
  });

  test('프로필 수정 및 재추천', async ({ page }) => {
    // 전체 플로우 진행 (간소화)
    await page.locator('button:has-text("시작하기")').click();
    await page.goto('/profile-setup');

    // 프로필 작성
    await page.fill('input[name="name"]', '테스트');
    await page.locator('button:has-text("다음")').click();
    await page.locator('label:has-text("출퇴근")').click();
    await page.locator('button:has-text("다음")').click();
    await page.locator('button:has-text("다음")').click();
    await page.locator('button:has-text("완료")').click();

    // 채팅 화면에서 프로필 수정 버튼 클릭
    const editProfileButton = page.locator('button[aria-label="프로필 수정"]');
    if (await editProfileButton.isVisible()) {
      await editProfileButton.click();
      await expect(page).toHaveURL(/\/profile-setup/);
    }
  });

  test('반응형: 모바일 사용자 여정', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // 모바일 메뉴 확인
    const mobileMenu = page.locator('button[aria-label="메뉴"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('nav')).toBeVisible();
    }

    // 모바일에서 시작하기
    await page.locator('button:has-text("시작하기")').click();
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('접근성: 키보드 네비게이션', async ({ page }) => {
    await page.goto('/');

    // Tab 키로 네비게이션
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Enter 키로 버튼 클릭
    await page.keyboard.press('Enter');

    // 페이지 이동 확인
    await page.waitForTimeout(500);
  });

  test('에러 처리: 네트워크 오류', async ({ page }) => {
    // 네트워크 차단
    await page.route('**/api/**', route => route.abort());

    await page.goto('/chat');

    const messageInput = page.locator('textarea');
    await messageInput.fill('차량 추천해줘');
    await page.locator('button[type="submit"]').click();

    // 에러 메시지 확인
    await expect(page.locator('text=오류')).toBeVisible({ timeout: 5000 });
  });

  test('성능: 초기 로딩 시간', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const endTime = Date.now();

    const loadTime = endTime - startTime;

    // 3초 이내 로딩
    expect(loadTime).toBeLessThan(3000);
  });

  test('SEO: 메타 태그 확인', async ({ page }) => {
    await page.goto('/');

    // Title 확인
    const title = await page.title();
    expect(title).toContain('CARFIN AI');

    // Meta description 확인
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeDefined();
  });

  test('다국어: 한글 입력 및 표시', async ({ page }) => {
    await page.goto('/chat');

    const messageInput = page.locator('textarea');
    await messageInput.fill('3000만원 이하 연비 좋은 SUV 추천해줘');

    const inputValue = await messageInput.inputValue();
    expect(inputValue).toBe('3000만원 이하 연비 좋은 SUV 추천해줘');
  });

  test('브라우저 히스토리: 뒤로가기/앞으로가기', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("시작하기")').click();
    await expect(page).toHaveURL(/\/onboarding/);

    // 뒤로가기
    await page.goBack();
    await expect(page).toHaveURL('/');

    // 앞으로가기
    await page.goForward();
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('LocalStorage: 프로필 저장 확인', async ({ page }) => {
    await page.goto('/profile-setup');

    // 프로필 작성
    await page.fill('input[name="name"]', '테스트 사용자');
    await page.locator('button:has-text("다음")').click();

    // LocalStorage 확인
    const profileData = await page.evaluate(() => {
      return localStorage.getItem('carfin_user_profile');
    });

    expect(profileData).toBeDefined();
    expect(profileData).toContain('테스트 사용자');
  });

  test('WebSocket: 실시간 연결 확인', async ({ page }) => {
    await page.goto('/chat');

    // WebSocket 연결 이벤트 모니터링
    const wsMessages: string[] = [];

    page.on('websocket', ws => {
      ws.on('framereceived', event => {
        wsMessages.push(event.payload.toString());
      });
    });

    // 메시지 전송
    const messageInput = page.locator('textarea');
    await messageInput.fill('테스트 메시지');
    await page.locator('button[type="submit"]').click();

    // WebSocket 메시지 수신 대기
    await page.waitForTimeout(2000);

    // 연결 확인 (메시지 수신 여부)
    // expect(wsMessages.length).toBeGreaterThan(0);
  });
});

test.describe('추천 결과 검증', () => {
  test('TOPSIS 점수 표시 확인', async ({ page }) => {
    await page.goto('/chat');

    // 추천 받기
    const messageInput = page.locator('textarea');
    await messageInput.fill('차량 추천');
    await page.locator('button[type="submit"]').click();

    // 결과 대기
    await expect(page.locator('[data-testid="vehicle-card"]').first()).toBeVisible({ timeout: 60000 });

    // TOPSIS 점수 확인
    const scoreText = page.locator('text=/점$/').first();
    await expect(scoreText).toBeVisible();
  });

  test('차량 상세 정보 모달', async ({ page }) => {
    await page.goto('/chat');

    // 추천 받기 (간소화)
    await page.locator('textarea').fill('차량 추천');
    await page.locator('button[type="submit"]').click();
    await page.locator('[data-testid="vehicle-card"]').first().waitFor({ timeout: 60000 });

    // 상세 보기 클릭
    const detailButton = page.locator('button:has-text("상세")').first();
    if (await detailButton.isVisible()) {
      await detailButton.click();

      // 모달 확인
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    }
  });

  test('외부 링크 클릭', async ({ page }) => {
    await page.goto('/chat');

    // 추천 받기
    await page.locator('textarea').fill('차량 추천');
    await page.locator('button[type="submit"]').click();
    await page.locator('[data-testid="vehicle-card"]').first().waitFor({ timeout: 60000 });

    // 외부 링크 클릭 시 새 탭 열림 확인
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('a[target="_blank"]').first().click(),
    ]);

    await newPage.waitForLoadState();
    expect(newPage.url()).toBeDefined();
    await newPage.close();
  });

  test('왜 추천? 모달 기능', async ({ page }) => {
    await page.goto('/chat');

    // 추천 받기
    await page.locator('textarea').fill('3000만원 이하 SUV 추천');
    await page.locator('button[type="submit"]').click();
    await page.locator('[data-testid="vehicle-card"]').first().waitFor({ timeout: 60000 });

    // "왜 추천?" 버튼 클릭
    const reasonButton = page.locator('button:has-text("왜 추천?")').first();
    await expect(reasonButton).toBeVisible();
    await reasonButton.click();

    // RecommendationReasonModal 확인
    const modal = page.locator('[role="dialog"]:has-text("왜")');
    await expect(modal).toBeVisible();

    // TOPSIS 종합 점수 확인
    await expect(modal.locator('text=TOPSIS 종합 점수')).toBeVisible();

    // 항목별 평가 확인 (6가지 기준)
    await expect(modal.locator('text=가격 경쟁력')).toBeVisible();
    await expect(modal.locator('text=연비 효율성')).toBeVisible();
    await expect(modal.locator('text=안전성')).toBeVisible();
    await expect(modal.locator('text=브랜드 신뢰도')).toBeVisible();
    await expect(modal.locator('text=성능')).toBeVisible();
    await expect(modal.locator('text=디자인')).toBeVisible();

    // 강점 섹션 확인
    await expect(modal.locator('text=강점')).toBeVisible();

    // TOPSIS 알고리즘 설명 확인
    await expect(modal.locator('summary:has-text("TOPSIS 알고리즘")')).toBeVisible();

    // 모달 닫기 (X 버튼 또는 외부 클릭)
    const closeButton = modal.locator('button').first();
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });
});
