/**
 * 🔄 재추천 키워드 매칭 시스템
 *
 * 목적: 사용자의 재추천 요청에서 추가 필터 조건을 추출
 * 전략: 단순하고 확실한 키워드 매칭 (Gemini 폴백 없이)
 */

export interface RefinementFilters {
  location?: string;      // "경기", "서울" 등
  model?: string;         // "셀토스", "쏘렌토" 등
  manufacturer?: string;  // "현대", "기아" 등
  maxPrice?: number;      // 2500 (2500만원)
  minPrice?: number;      // 1500 (1500만원)
}

/**
 * 🔍 재추천 요청 감지 (키워드 기반)
 */
export function isRefinementRequest(message: string): boolean {
  const refinementKeywords = [
    '다시',
    '재추천',
    '다른',
    '바꿔',
    '변경',
    '대신',
    '말고',
    '이번엔',
    '이제',
    '그럼',
    '아니면'
  ];

  const messageLower = message.toLowerCase();
  return refinementKeywords.some(keyword => messageLower.includes(keyword));
}

/**
 * 🎯 키워드 매칭: 지역
 */
function matchLocation(message: string): string | undefined {
  const locations = [
    '서울', '경기', '인천',
    '부산', '대구', '대전', '광주', '울산',
    '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];

  for (const loc of locations) {
    if (message.includes(loc)) {
      console.log(`📍 [키워드] 지역 감지: "${loc}"`);
      return loc;
    }
  }

  return undefined;
}

/**
 * 🚗 키워드 매칭: 모델명
 */
function matchModel(message: string): string | undefined {
  // 인기 모델 (DB 검증 완료)
  const popularModels = [
    { keywords: ['셀토스'], dbName: '셀토스' },
    { keywords: ['쏘렌토'], dbName: '쏘렌토' },
    { keywords: ['싼타페', '산타페'], dbName: '싼타페' },
    { keywords: ['팰리세이드', '펠리세이드'], dbName: '팰리세이드' },
    { keywords: ['카니발'], dbName: '카니발' },
    { keywords: ['스포티지'], dbName: '스포티지' },
    { keywords: ['투싼'], dbName: '투싼' },
    { keywords: ['코나'], dbName: '코나' },
    { keywords: ['그랜저'], dbName: '그랜저' },
    { keywords: ['아반떼'], dbName: '아반떼' },
    { keywords: ['소나타'], dbName: '소나타' },
    { keywords: ['K5'], dbName: 'K5' },
    { keywords: ['K8'], dbName: 'K8' }
  ];

  const messageLower = message.toLowerCase();

  for (const { keywords, dbName } of popularModels) {
    for (const keyword of keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        console.log(`🚗 [키워드] 모델 감지: "${keyword}" → DB: "${dbName}"`);
        return dbName;
      }
    }
  }

  return undefined;
}

/**
 * 🏭 키워드 매칭: 제조사
 */
function matchManufacturer(message: string): string | undefined {
  const manufacturers = [
    { keywords: ['현대'], name: '현대' },
    { keywords: ['기아'], name: '기아' },
    { keywords: ['제네시스'], name: '제네시스' },
    { keywords: ['쉐보레', '쉐비'], name: '쉐보레' },
    { keywords: ['벤츠', '메르세데스'], name: '벤츠' },
    { keywords: ['BMW', 'bmw', '비엠'], name: 'BMW' },
    { keywords: ['아우디'], name: '아우디' }
  ];

  const messageLower = message.toLowerCase();

  for (const { keywords, name } of manufacturers) {
    for (const keyword of keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        console.log(`🏭 [키워드] 제조사 감지: "${keyword}" → "${name}"`);
        return name;
      }
    }
  }

  return undefined;
}

/**
 * 💰 키워드 매칭: 가격
 */
function matchPrice(message: string): { min?: number; max?: number } | undefined {
  const pricePatterns = [
    // "2500만원 이하"
    { regex: /(\d{3,4})만원?\s*(이하|까지|밑|미만)/i, type: 'max' },
    // "1500만원 이상"
    { regex: /(\d{3,4})만원?\s*(이상|부터|넘)/i, type: 'min' },
    // "2000만원대"
    { regex: /(\d{3,4})만원?대/i, type: 'range' },
    // "낮춰줘" → 현재 예산의 80%
    { regex: /(낮춰|내려|줄여|싸|저렴)/i, type: 'lower' },
    // "올려줘" → 현재 예산의 120%
    { regex: /(올려|높여|비싸|고급)/i, type: 'higher' }
  ];

  for (const { regex, type } of pricePatterns) {
    const match = message.match(regex);
    if (match) {
      if (type === 'max') {
        const price = parseInt(match[1]);
        console.log(`💰 [키워드] 최대 가격: ${price}만원`);
        return { max: price };
      } else if (type === 'min') {
        const price = parseInt(match[1]);
        console.log(`💰 [키워드] 최소 가격: ${price}만원`);
        return { min: price };
      } else if (type === 'range') {
        const base = parseInt(match[1]);
        console.log(`💰 [키워드] 가격대: ${base}만원대 (${base-200}~${base+200}만원)`);
        return { min: base - 200, max: base + 200 };
      } else if (type === 'lower') {
        console.log(`💰 [키워드] 가격 하향 요청 (계산 필요)`);
        return { max: -1 }; // -1 = "현재보다 낮춰줘" 시그널
      } else if (type === 'higher') {
        console.log(`💰 [키워드] 가격 상향 요청 (계산 필요)`);
        return { min: -1 }; // -1 = "현재보다 올려줘" 시그널
      }
    }
  }

  return undefined;
}

/**
 * 🎯 메인 함수: 재추천 필터 추출
 */
export function extractRefinementFilters(
  message: string,
  previousFilters?: any
): RefinementFilters {
  console.log(`🔍 [재추천] 키워드 매칭 시작: "${message}"`);

  const filters: RefinementFilters = {};

  // 1. 지역
  const location = matchLocation(message);
  if (location) {
    filters.location = location;
  }

  // 2. 모델
  const model = matchModel(message);
  if (model) {
    filters.model = model;
  }

  // 3. 제조사
  const manufacturer = matchManufacturer(message);
  if (manufacturer) {
    filters.manufacturer = manufacturer;
  }

  // 4. 가격
  const priceMatch = matchPrice(message);
  if (priceMatch) {
    if (priceMatch.max === -1) {
      // "낮춰줘" → 이전 최대 가격의 80%
      if (previousFilters?.maxPrice) {
        filters.maxPrice = Math.floor(previousFilters.maxPrice * 0.8);
        console.log(`💰 [계산] 가격 하향: ${previousFilters.maxPrice} → ${filters.maxPrice}만원`);
      }
    } else if (priceMatch.min === -1) {
      // "올려줘" → 이전 최소 가격의 120%
      if (previousFilters?.minPrice) {
        filters.minPrice = Math.floor(previousFilters.minPrice * 1.2);
        console.log(`💰 [계산] 가격 상향: ${previousFilters.minPrice} → ${filters.minPrice}만원`);
      }
    } else {
      if (priceMatch.min) filters.minPrice = priceMatch.min;
      if (priceMatch.max) filters.maxPrice = priceMatch.max;
    }
  }

  console.log(`✅ [재추천] 추출 완료:`, JSON.stringify(filters, null, 2));

  return filters;
}

/**
 * 🔧 헬퍼: 필터 병합
 */
export function mergeFilters(baseFilters: any, additionalFilters: RefinementFilters): any {
  const merged = { ...baseFilters };

  if (additionalFilters.location) {
    merged.location = additionalFilters.location;
  }

  if (additionalFilters.model) {
    // 모델 지정 시 다른 필터는 유지하되 모델만 변경
    merged.model = additionalFilters.model;
  }

  if (additionalFilters.manufacturer) {
    merged.manufacturers = [additionalFilters.manufacturer];
  }

  if (additionalFilters.maxPrice !== undefined) {
    merged.maxPrice = additionalFilters.maxPrice;
  }

  if (additionalFilters.minPrice !== undefined) {
    merged.minPrice = additionalFilters.minPrice;
  }

  console.log(`🔧 [필터 병합] 기존 + 추가 → 최종:`, JSON.stringify(merged, null, 2));

  return merged;
}
