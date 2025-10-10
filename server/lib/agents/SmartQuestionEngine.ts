import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ProfileField } from './ProfileCompletenessAnalyzer';

/**
 * Phase 2.5: AI 기반 스마트 질문 생성 엔진
 * 대화 맥락을 고려하여 자연스러운 질문을 생성합니다.
 */

export interface QuestionContext {
  missingField: ProfileField;
  conversationHistory: string[];
  userLastMessage: string;
  currentProfile: any;
}

export interface SmartQuestion {
  question: string;
  targetField: string;
  reasoning: string;  // 왜 이 질문을 하는지 (디버깅용)
}

export class SmartQuestionEngine {
  private genAI: GoogleGenerativeAI;

  // 미리 정의된 질문 템플릿 (빠른 응답용)
  private static QUESTION_TEMPLATES: Record<string, string[]> = {
    budget: [
      "예산은 어느 정도 생각하고 계세요? 💰",
      "가격대는 정하셨나요?",
      "차량 구매 예산 범위를 알려주시면 더 정확하게 추천드릴 수 있어요!",
    ],
    usage: [
      "주로 어떤 용도로 사용하실 건가요? (출퇴근, 가족용, 레저 등)",
      "차량을 어떻게 활용하실 계획이신가요?",
      "일상 출퇴근용인가요, 아니면 가족 나들이용인가요? 🚗",
    ],
    carType: [
      "어떤 차종을 선호하시나요? (SUV, 세단, 경차 등)",
      "SUV나 세단 중 관심 있으신 게 있으세요?",
      "어떤 스타일의 차량을 찾고 계신가요?",
    ],
    fuelType: [
      "연료 타입은 어떤 걸 선호하시나요? (가솔린, 디젤, 하이브리드 등)",
      "하이브리드나 전기차도 고려하고 계신가요?",
      "연료 종류는 정하셨나요? ⛽",
    ],
    'importance.fuelEfficiency': [
      "연비를 중요하게 생각하시나요?",
      "경제성(연비)이 우선순위인가요?",
      "연료비 절감이 중요하신가요?",
    ],
    'importance.safety': [
      "안전성을 얼마나 중요하게 생각하시나요?",
      "가족 탑승이 많으신가요? 안전 기능이 중요하실 것 같은데요!",
      "안전 옵션(에어백, ESC 등)을 우선적으로 고려하시나요?",
    ],
    brands: [
      "선호하는 브랜드가 있으신가요?",
      "특정 브랜드를 찾고 계신가요? (현대, 기아, 수입차 등)",
      "브랜드 선호도가 있으신가요? 🏷️",
    ],
    transmission: [
      "자동 변속기를 원하시나요, 수동도 괜찮으신가요?",
      "변속기 종류는 어떤 게 좋으세요?",
    ],
    'importance.design': [
      "디자인/외관을 중요하게 생각하시나요?",
      "차량 외관 스타일도 중요한 요소인가요?",
    ],
    'importance.brand': [
      "브랜드 네임밸류를 중요하게 생각하시나요?",
      "브랜드 인지도가 구매 결정에 중요한가요?",
    ],
  };

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * 빠른 질문 생성 (템플릿 기반 - 즉시 응답)
   */
  generateQuickQuestion(missingField: ProfileField): SmartQuestion {
    const templates = SmartQuestionEngine.QUESTION_TEMPLATES[missingField.name] || [];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    return {
      question: randomTemplate || `${missingField.name}에 대해 알려주시겠어요?`,
      targetField: missingField.name,
      reasoning: `Template-based question for ${missingField.name}`,
    };
  }

  /**
   * AI 기반 컨텍스트 인식 질문 생성 (자연스러운 대화)
   */
  async generateContextualQuestion(context: QuestionContext): Promise<SmartQuestion> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `당신은 친절한 차량 추천 AI 상담사입니다.

**사용자가 방금 말한 내용**:
"${context.userLastMessage}"

**현재 파악된 정보**:
${JSON.stringify(context.currentProfile, null, 2)}

**추가로 필요한 정보**:
${context.missingField.name}

**임무**:
사용자의 메시지를 바탕으로, 누락된 정보(${context.missingField.name})를 자연스럽게 묻는 질문을 생성하세요.

**예시**:
1. 사용자: "출퇴근용 연비 좋은 차 추천해주세요"
   → 누락: carType
   → 질문: "출퇴근용이시군요! 세단이나 SUV 중 어떤 차종을 선호하시나요? 🚗"

2. 사용자: "3000만원대 가족용 차 찾아요"
   → 누락: carType
   → 질문: "가족용이라면 7인승 SUV도 고려하고 계신가요? 아니면 5인승 세단도 괜찮으신가요?"

3. 사용자: "신혼부부용 차 추천해주세요"
   → 누락: budget
   → 질문: "신혼부부용이시군요! 😊 예산은 어느 정도 생각하고 계세요?"

**질문 생성 가이드**:
- budget: 예산 범위 물어보기 (예: "예산은 어느 정도로 생각하고 계세요?")
- usage: 용도 물어보기 (예: "주로 어떤 용도로 사용하실 건가요?")
- carType: 차종 물어보기 (예: "어떤 차종을 선호하시나요? (SUV, 세단, 경차 등)")
- fuelType: 연료 타입 물어보기 (예: "하이브리드나 전기차도 고려하고 계신가요?")
- brands: 선호 브랜드 물어보기 (예: "선호하는 브랜드가 있으신가요?")

**출력 형식** (JSON만 반환):
{
  "question": "사용자 메시지에 자연스럽게 이어지는 질문 (1-2문장, 이모지 가능)",
  "reasoning": "왜 이 질문을 하는지"
}

**중요**:
1. 사용자가 말한 내용을 반드시 반영하세요 (예: "출퇴근용이시군요!", "가족용이라면")
2. 짧고 명확하게 (1-2문장)
3. 친근한 톤 유지
4. Mock 시나리오처럼 고정된 질문 NO! 무조건 사용자 메시지 기반 동적 생성`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // JSON 추출
      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[1] || jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);

      return {
        question: parsed.question || this.generateQuickQuestion(context.missingField).question,
        targetField: context.missingField.name,
        reasoning: parsed.reasoning || 'AI-generated contextual question',
      };
    } catch (error) {
      console.error('❌ AI 질문 생성 실패, 템플릿으로 대체:', error);
      return this.generateQuickQuestion(context.missingField);
    }
  }

  /**
   * 다중 누락 필드에 대한 질문 생성 (한 번에 여러 정보 수집)
   */
  async generateMultiFieldQuestion(missingFields: ProfileField[]): Promise<SmartQuestion> {
    if (missingFields.length === 0) {
      return {
        question: '',
        targetField: '',
        reasoning: 'No missing fields',
      };
    }

    if (missingFields.length === 1) {
      return this.generateQuickQuestion(missingFields[0]);
    }

    // 2-3개 필드를 자연스럽게 묶어서 질문
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `다음 정보들이 누락되었습니다:
${missingFields.map(f => `- ${f.name} (우선순위: ${f.priority})`).join('\n')}

이 중 2-3개를 자연스럽게 묶어서 하나의 질문으로 만드세요.

**예시**:
- budget + usage → "어떤 용도로, 예산은 어느 정도로 생각하고 계세요?"
- carType + fuelType → "어떤 차종과 연료 타입을 선호하시나요? (예: SUV 하이브리드)"

JSON 형식으로 반환:
{
  "question": "질문 내용",
  "reasoning": "어떤 필드들을 묶었는지"
}`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          question: parsed.question,
          targetField: missingFields.map(f => f.name).join(','),
          reasoning: parsed.reasoning,
        };
      }
    } catch (error) {
      console.error('❌ 다중 필드 질문 생성 실패:', error);
    }

    // 실패 시 첫 번째 필드만 질문
    return this.generateQuickQuestion(missingFields[0]);
  }

  /**
   * 질문 스타일 선택 (빠른 vs AI)
   */
  async generateSmartQuestion(
    missingField: ProfileField,
    context?: QuestionContext
  ): Promise<SmartQuestion> {
    // ✅ 개선: 모든 필드에 대해 AI 컨텍스트 질문 사용 (동적 응답)
    // Essential 필드도 사용자 메시지에 따라 자연스럽게 질문
    if (context) {
      return await this.generateContextualQuestion(context);
    }

    // 컨텍스트 없으면 템플릿 사용 (폴백)
    return this.generateQuickQuestion(missingField);
  }
}
