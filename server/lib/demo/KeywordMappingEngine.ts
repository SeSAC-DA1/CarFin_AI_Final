/**
 * 🗺️ 키워드 매핑 엔진 - 실시간 시연 안정성 보장
 *
 * 목적: LLM 의존도 제거, 단어 → 필터 기준 직접 매핑
 * 전략: 확실한 키워드만 처리, 애매한 건 폴백(Fallback)
 *
 * 예:
 * "출퇴근용 준중형차" → {origin: "국산", price: 1500, carType: "준중형차"}
 * "가족용 SUV" → {origin: "국산", price: 3000, carType: "SUV"}
 * "가성비 경차" → {origin: "국산", price: 800, carType: "경차"}
 */

export interface MappedCriteria {
  // 🌍 원산지
  origin?: '국산' | '수입';

  // 💰 예산 (만원)
  maxPrice?: number;
  minPrice?: number;

  // 🚗 차종
  carType?: string;

  // ⛽ 연료
  fuelType?: '가솔린' | '디젤' | '하이브리드' | 'LPG' | '전기';

  // 🔧 변속기
  transmission?: '자동' | '수동';

  // 🛡️ 사고이력
  maxAccidentCost?: number;

  // 📅 연식
  maxYearAge?: number;

  // 🛣️ 주행거리
  maxDistance?: number;

  // 🏷️ 브랜드
  brands?: string[];

  // ✨ 중요도 힌트
  priorityHints?: {
    price?: boolean;      // 가성비 중시
    safety?: boolean;     // 안전성 중시
    fuelEfficiency?: boolean;  // 연비 중시
    design?: boolean;     // 디자인 중시
  };

  // 🎯 매칭된 키워드 (디버깅용)
  matchedKeywords?: string[];
}

// 🗺️ 키워드 → 기준 매핑 테이블
const KEYWORD_MAPPINGS = {
  // 🎯 용도별 프리셋
  useCase: {
    '출퇴근': {
      maxPrice: 1500,
      carType: '준중형차',
      origin: '국산',
      fuelType: '가솔린',
      transmission: '자동',
      maxAccidentCost: 0,
      priorityHints: { fuelEfficiency: true, price: true }
    },
    '출퇴근용': {
      maxPrice: 1500,
      carType: '준중형차',
      origin: '국산',
      fuelType: '가솔린',
      transmission: '자동',
      maxAccidentCost: 0,
      priorityHints: { fuelEfficiency: true, price: true }
    },
    '사회초년생': {
      maxPrice: 1200,
      carType: '경차',
      origin: '국산',
      fuelType: '가솔린',
      transmission: '자동',
      maxAccidentCost: 0,
      priorityHints: { price: true }
    },
    '첫차': {
      maxPrice: 1200,
      carType: '경차',
      origin: '국산',
      fuelType: '가솔린',
      transmission: '자동',
      maxAccidentCost: 0,
      priorityHints: { price: true, safety: true }
    },
    '가족': {
      maxPrice: 3000,
      carType: 'SUV',
      origin: '국산',
      fuelType: '가솔린',
      transmission: '자동',
      maxAccidentCost: 0,
      priorityHints: { safety: true }
    },
    '가족용': {
      maxPrice: 3000,
      carType: 'SUV',
      origin: '국산',
      fuelType: '가솔린',
      transmission: '자동',
      maxAccidentCost: 0,
      priorityHints: { safety: true }
    },
    '신혼부부': {
      maxPrice: 2800,
      carType: 'SUV',
      origin: '국산',
      fuelType: '가솔린',
      transmission: '자동',
      priorityHints: { design: true, safety: true }
    }
  },

  // 🚗 차종별 프리셋
  carType: {
    'SUV': {
      carType: 'SUV',
      maxPrice: 3000,
      origin: '국산',
      priorityHints: { safety: true }
    },
    '에스유브이': {
      carType: 'SUV',
      maxPrice: 3000,
      origin: '국산',
      priorityHints: { safety: true }
    },
    '세단': {
      carType: '세단',
      maxPrice: 2000,
      origin: '국산',
      priorityHints: { fuelEfficiency: true }
    },
    '준중형차': {
      carType: '준중형차',
      maxPrice: 1500,
      origin: '국산',
      fuelType: '가솔린'
    },
    '경차': {
      carType: '경차',
      maxPrice: 800,
      origin: '국산',
      priorityHints: { price: true }
    },
    '소형차': {
      carType: '경차',
      maxPrice: 1000,
      origin: '국산'
    }
  },

  // 💰 예산/가성비 프리셋
  budget: {
    '가성비': {
      maxPrice: 800,
      carType: '경차',
      origin: '국산',
      priorityHints: { price: true }
    },
    '저렴': {
      maxPrice: 1000,
      origin: '국산',
      priorityHints: { price: true }
    },
    '합리적': {
      maxPrice: 1500,
      origin: '국산',
      priorityHints: { price: true }
    }
  },

  // 🌍 원산지 프리셋
  origin: {
    '외제차': {
      origin: '수입',
      minPrice: 2000
    },
    '수입차': {
      origin: '수입',
      minPrice: 2000
    },
    '국산': {
      origin: '국산'
    },
    '국산차': {
      origin: '국산'
    },
    '국내': {
      origin: '국산'
    },
    '국내차': {
      origin: '국산'
    }
  },

  // ⛽ 연료 프리셋
  fuelType: {
    '가솔린': { fuelType: '가솔린' },
    '디젤': { fuelType: '디젤' },
    '하이브리드': { fuelType: '하이브리드', priorityHints: { fuelEfficiency: true } },
    '전기': { fuelType: '전기', priorityHints: { fuelEfficiency: true } },
    'LPG': { fuelType: 'LPG', priorityHints: { price: true } }
  },

  // 🛡️ 안전성 프리셋
  safety: {
    '무사고': {
      maxAccidentCost: 0,
      priorityHints: { safety: true }
    },
    '사고없는': {
      maxAccidentCost: 0,
      priorityHints: { safety: true }
    },
    '안전': {
      priorityHints: { safety: true }
    },
    '안전성': {
      priorityHints: { safety: true }
    }
  },

  // 🏷️ 브랜드 프리셋
  brand: {
    '현대': { brands: ['현대'], origin: '국산' },
    '기아': { brands: ['기아'], origin: '국산' },
    '제네시스': { brands: ['제네시스'], origin: '국산' },
    '쌍용': { brands: ['쌍용'], origin: '국산' },
    '르노': { brands: ['르노'], origin: '국산' }
  }
} as const;

/**
 * 🔍 메인 함수: 키워드 기반 필터 기준 추출
 */
export function extractCriteriaFromKeywords(userMessage: string): MappedCriteria {
  const lowerMsg = userMessage.toLowerCase();
  const result: MappedCriteria = {
    matchedKeywords: []
  };

  console.log(`🗺️ [KeywordMapping] 입력: "${userMessage}"`);

  // 1️⃣ 용도 매칭 (우선순위 높음)
  for (const [keyword, criteria] of Object.entries(KEYWORD_MAPPINGS.useCase)) {
    if (lowerMsg.includes(keyword.toLowerCase())) {
      Object.assign(result, criteria);
      result.matchedKeywords!.push(`용도:${keyword}`);
      console.log(`  ✅ 용도 매칭: ${keyword}`);
    }
  }

  // 2️⃣ 차종 매칭
  for (const [keyword, criteria] of Object.entries(KEYWORD_MAPPINGS.carType)) {
    if (lowerMsg.includes(keyword.toLowerCase())) {
      Object.assign(result, criteria);
      result.matchedKeywords!.push(`차종:${keyword}`);
      console.log(`  ✅ 차종 매칭: ${keyword}`);
    }
  }

  // 3️⃣ 예산/가성비 매칭
  for (const [keyword, criteria] of Object.entries(KEYWORD_MAPPINGS.budget)) {
    if (lowerMsg.includes(keyword.toLowerCase())) {
      Object.assign(result, criteria);
      result.matchedKeywords!.push(`예산:${keyword}`);
      console.log(`  ✅ 예산 매칭: ${keyword}`);
    }
  }

  // 4️⃣ 원산지 매칭
  for (const [keyword, criteria] of Object.entries(KEYWORD_MAPPINGS.origin)) {
    if (lowerMsg.includes(keyword.toLowerCase())) {
      Object.assign(result, criteria);
      result.matchedKeywords!.push(`원산지:${keyword}`);
      console.log(`  ✅ 원산지 매칭: ${keyword}`);
    }
  }

  // 5️⃣ 연료 매칭
  for (const [keyword, criteria] of Object.entries(KEYWORD_MAPPINGS.fuelType)) {
    if (lowerMsg.includes(keyword.toLowerCase())) {
      Object.assign(result, criteria);
      result.matchedKeywords!.push(`연료:${keyword}`);
      console.log(`  ✅ 연료 매칭: ${keyword}`);
    }
  }

  // 6️⃣ 안전성 매칭
  for (const [keyword, criteria] of Object.entries(KEYWORD_MAPPINGS.safety)) {
    if (lowerMsg.includes(keyword.toLowerCase())) {
      Object.assign(result, criteria);
      result.matchedKeywords!.push(`안전:${keyword}`);
      console.log(`  ✅ 안전 매칭: ${keyword}`);
    }
  }

  // 7️⃣ 브랜드 매칭
  for (const [keyword, criteria] of Object.entries(KEYWORD_MAPPINGS.brand)) {
    if (lowerMsg.includes(keyword.toLowerCase())) {
      Object.assign(result, criteria);
      result.matchedKeywords!.push(`브랜드:${keyword}`);
      console.log(`  ✅ 브랜드 매칭: ${keyword}`);
    }
  }

  // 8️⃣ 숫자 예산 추출 (예: "3000만원")
  const budgetMatch = userMessage.match(/(\d{3,4})\s*만원/);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1]);
    result.maxPrice = budget;
    result.matchedKeywords!.push(`예산:${budget}만원`);
    console.log(`  ✅ 예산 추출: ${budget}만원`);
  }

  // 9️⃣ 연식 추출 (예: "5년 이내")
  const yearMatch = userMessage.match(/(\d+)\s*년\s*이내/);
  if (yearMatch) {
    const years = parseInt(yearMatch[1]);
    result.maxYearAge = years;
    result.matchedKeywords!.push(`연식:${years}년`);
    console.log(`  ✅ 연식 추출: ${years}년 이내`);
  }

  // 🔟 주행거리 추출 (예: "10만km")
  const distanceMatch = userMessage.match(/(\d+)\s*만\s*km/);
  if (distanceMatch) {
    const distance = parseInt(distanceMatch[1]) * 10000;
    result.maxDistance = distance;
    result.matchedKeywords!.push(`주행:${distance}km`);
    console.log(`  ✅ 주행거리 추출: ${distance}km`);
  }

  console.log(`🗺️ [KeywordMapping] 매칭 결과:`, JSON.stringify(result, null, 2));

  return result;
}

/**
 * 🛡️ 폴백 메커니즘: 시나리오 A 기본값
 */
export function getScenarioAFallback(): MappedCriteria {
  return {
    maxPrice: 3000,
    carType: 'SUV',
    origin: '국산',
    fuelType: '가솔린',
    transmission: '자동',
    maxAccidentCost: 0,
    maxYearAge: 5,
    maxDistance: 100000,
    brands: ['현대', '기아'],
    priorityHints: { safety: true },
    matchedKeywords: ['폴백:시나리오A']
  };
}

/**
 * 🧪 테스트 케이스
 */
export function testKeywordMapping() {
  console.log('🧪 키워드 매핑 테스트 시작\n');
  console.log('='.repeat(80));

  const testCases = [
    "3000만원 이하 가솔린 국내차 SUV 찾습니다",
    "출퇴근용 준중형차 찾아요",
    "가족용 SUV 추천해주세요",
    "가성비 경차 찾습니다",
    "외제차 수입차 관심있어요",
    "사회초년생 첫차 추천",
    "신혼부부용 차량",
    "무사고 안전한 차량",
    "5년 이내 10만km 이하"
  ];

  testCases.forEach((testCase, idx) => {
    console.log(`\n\n📝 Test ${idx + 1}: "${testCase}"`);
    console.log('-'.repeat(80));
    const result = extractCriteriaFromKeywords(testCase);
    console.log(`\n📊 매핑 결과:`);
    console.log(`  차종: ${result.carType || '미지정'}`);
    console.log(`  예산: ${result.maxPrice ? `${result.maxPrice}만원 이하` : '미지정'}`);
    console.log(`  원산지: ${result.origin || '미지정'}`);
    console.log(`  연료: ${result.fuelType || '미지정'}`);
    console.log(`  매칭 키워드: ${result.matchedKeywords?.join(', ') || '없음'}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('🧪 테스트 완료\n');
}
