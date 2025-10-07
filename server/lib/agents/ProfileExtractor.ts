import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 사용자 메시지에서 추출된 프로필 정보
 */
export interface ExtractedProfileUpdate {
  budget?: {
    min: number;  // 만원 단위
    max: number;  // 만원 단위
  };
  usage?: string[];  // 'commute', 'family', 'leisure', 'business', 'city', 'long'
  carType?: string;  // 'SUV', '세단', '경차', '소형차', 'MPV', '쿠페'
  fuelType?: string;  // '가솔린', '디젤', '하이브리드', '전기', 'LPG'
  transmission?: string;  // '자동', '수동'
  importance?: {
    price?: number;      // 1-10
    fuelEfficiency?: number;  // 1-10
    safety?: number;     // 1-10
    design?: number;     // 1-10
    brand?: number;      // 1-10
  };
  brands?: string[];  // 선호 브랜드
}

/**
 * AI를 활용하여 사용자 메시지에서 차량 선호 정보를 추출하는 클래스
 * Phase 2: 대화형 프로필 업데이트 핵심 컴포넌트
 */
export class ProfileExtractor {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * 사용자 메시지에서 프로필 정보를 추출
   * @param userMessage 사용자가 입력한 메시지
   * @returns 추출된 프로필 업데이트 정보
   */
  async extractProfileInfo(userMessage: string): Promise<ExtractedProfileUpdate> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `당신은 사용자 메시지에서 차량 선호 정보를 추출하는 전문가입니다.

사용자 메시지: "${userMessage}"

다음 정보를 JSON으로 추출하세요:
{
  "budget": { "min": 최소금액(만원), "max": 최대금액(만원) },
  "usage": ["commute", "family", "leisure", "business", "city", "long"],
  "carType": "SUV|세단|경차|소형차|MPV|쿠페",
  "fuelType": "가솔린|디젤|하이브리드|전기|LPG",
  "transmission": "자동|수동",
  "importance": {
    "price": 1-10,
    "fuelEfficiency": 1-10,
    "safety": 1-10,
    "design": 1-10,
    "brand": 1-10
  },
  "brands": ["현대", "기아", "BMW", "벤츠", etc.]
}

**추출 규칙**:
1. 예산: "3000만원 이하" → {"min": 500, "max": 3000}
2. 예산: "2000~3000만원" → {"min": 2000, "max": 3000}
3. 용도: "출퇴근", "가족용", "레저", "업무" 등 → usage 배열
4. 차종: "SUV", "세단" 등 명시된 경우만
5. 연비 언급 시 → importance.fuelEfficiency = 8-10
6. 안전 언급 시 → importance.safety = 8-10
7. 가격 강조 시 → importance.price = 8-10
8. 브랜드명 언급 시 → brands 배열에 추가

**중요**: 추출할 수 없는 정보는 JSON에서 생략하세요.
반드시 유효한 JSON만 반환하고, 설명 없이 JSON만 출력하세요.`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // JSON 추출 (마크다운 코드 블록 제거)
      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[1] || jsonMatch[0];
      }

      const extracted = JSON.parse(jsonText);
      console.log('🔍 프로필 정보 추출 성공:', extracted);
      return extracted;
    } catch (error) {
      console.error('❌ 프로필 정보 추출 실패:', error);
      return {};
    }
  }

  /**
   * 간단한 키워드 기반 빠른 추출 (AI 호출 전 사전 체크)
   * @param userMessage 사용자 메시지
   * @returns 추출된 간단한 정보
   */
  quickExtract(userMessage: string): ExtractedProfileUpdate {
    const lowerMessage = userMessage.toLowerCase();
    const update: ExtractedProfileUpdate = {};

    // 예산 추출 (정규식)
    const budgetMatch = userMessage.match(/(\d+)(?:만원|만)?(?:\s*이하|\s*미만)?/);
    if (budgetMatch) {
      const maxBudget = parseInt(budgetMatch[1]);
      update.budget = { min: 500, max: maxBudget };
    }

    // 차종 추출
    if (lowerMessage.includes('suv')) update.carType = 'SUV';
    else if (lowerMessage.includes('세단')) update.carType = '세단';
    else if (lowerMessage.includes('경차')) update.carType = '경차';

    // 용도 추출
    const usages: string[] = [];
    if (lowerMessage.includes('출퇴근')) usages.push('commute');
    if (lowerMessage.includes('가족')) usages.push('family');
    if (lowerMessage.includes('레저') || lowerMessage.includes('여행')) usages.push('leisure');
    if (lowerMessage.includes('업무')) usages.push('business');
    if (usages.length > 0) update.usage = usages;

    // 중요도 추론
    if (lowerMessage.includes('연비')) {
      update.importance = { fuelEfficiency: 9 };
    }
    if (lowerMessage.includes('안전')) {
      update.importance = { ...update.importance, safety: 9 };
    }

    return Object.keys(update).length > 0 ? update : {};
  }
}
