import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// API 키 검증 (GOOGLE_API_KEY 우선, GEMINI_API_KEY 백업)
const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('❌ GOOGLE_API_KEY 또는 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface UserProfile {
  priceWeight: number;
  safetyWeight: number;
  brandWeight: number;
  performanceWeight: number;
  fuelEfficiencyWeight: number;
  designWeight: number;
}

export interface AgentMessage {
  agentId: string;
  agentName: string;
  content: string;
  confidence?: number;
  timestamp: Date;
}

export class GeminiAgentService {
  /**
   * Needs Analyst: 사용자 대화에서 니즈 추출
   */
  async analyzeUserNeeds(userMessage: string, conversationHistory: string[]): Promise<AgentMessage> {
    const systemPrompt = `당신은 CarFin AI의 Needs Analyst입니다.
사용자의 요구사항을 간결하게 분석합니다.
- 핵심 니즈만 1문장으로 요약
- 친근하고 자연스러운 톤으로 응답`;

    const conversationContext = conversationHistory.slice(-5).join('\n');
    const prompt = `[대화 기록]\n${conversationContext}\n\n[최신 메시지]\n${userMessage}\n\n사용자의 니즈를 분석하고 핵심 요구사항을 요약해주세요.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const response = await model.generateContent(prompt);

    return {
      agentId: 'needs_analyst',
      agentName: 'Needs Analyst',
      content: response.response.text() || "분석 중 오류가 발생했습니다.",
      confidence: 0.85,
      timestamp: new Date(),
    };
  }

  /**
   * Data Analyst: 차량 데이터 분석 및 TOPSIS 결과 해석
   */
  async analyzeVehicleData(
    userMessage: string, 
    topVehicles: any[], 
    totalCount: number
  ): Promise<AgentMessage> {
    const systemPrompt = `당신은 CarFin AI의 Data Analyst입니다.
TOPSIS 분석 결과를 간단히 설명합니다.
- 1문장으로 핵심 분석 결과만 전달
- 전문용어 없이 쉽게 설명`;

    const vehiclesSummary = topVehicles.slice(0, 3).map(v => 
      `${v.brand} ${v.model} (${v.year}년, ${v.price}만원, TOPSIS: ${v.safety?.toFixed(0)}점)`
    ).join(', ');

    const prompt = `총 ${totalCount}개 차량 중 상위 추천: ${vehiclesSummary}

데이터 분석 결과를 요약해주세요.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.6,
      },
    });

    const response = await model.generateContent(prompt);

    return {
      agentId: 'data_analyst',
      agentName: 'Data Analyst',
      content: response.response.text() || "데이터 분석 중 오류가 발생했습니다.",
      confidence: 0.90,
      timestamp: new Date(),
    };
  }

  /**
   * Concierge: 최종 추천 및 종합 조율
   */
  async generateFinalRecommendation(
    needsAnalysis: string,
    dataAnalysis: string,
    topVehicles: any[]
  ): Promise<AgentMessage> {
    const systemPrompt = `당신은 CarFin AI의 Concierge입니다.
최종 추천을 간결하고 친근하게 전달합니다.
- 1-2문장으로 핵심 추천 이유만 전달
- 친구처럼 자연스럽고 따뜻한 톤으로 응답`;

    const topVehicle = topVehicles[0];
    const prompt = `[Needs Analyst 분석]\n${needsAnalysis}\n\n[Data Analyst 분석]\n${dataAnalysis}\n\n최종 추천 차량: ${topVehicle.brand} ${topVehicle.model} (${topVehicle.year}년, ${topVehicle.price}만원)

종합적인 추천 이유를 설명해주세요.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.8,
      },
    });

    const response = await model.generateContent(prompt);

    return {
      agentId: 'concierge',
      agentName: 'Concierge',
      content: response.response.text() || "추천 생성 중 오류가 발생했습니다.",
      confidence: 0.92,
      timestamp: new Date(),
    };
  }

  /**
   * 대화에서 UserProfile 동적 추출 (Alibaba Re-ranking 논문)
   */
  async extractUserProfile(conversationHistory: string[]): Promise<UserProfile> {
    const systemPrompt = `당신은 사용자 대화에서 차량 선호도를 추출하는 전문가입니다.
다음 6가지 가중치를 0-1 사이로 추출하되 합이 1이 되도록 정규화:
- priceWeight: 가격 민감도
- safetyWeight: 안전 중요도
- brandWeight: 브랜드 선호도
- performanceWeight: 성능 중요도
- fuelEfficiencyWeight: 연비 중요도
- designWeight: 디자인 중요도

JSON 형식으로만 응답.`;

    const conversationContext = conversationHistory.join('\n');
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            priceWeight: { type: SchemaType.NUMBER },
            safetyWeight: { type: SchemaType.NUMBER },
            brandWeight: { type: SchemaType.NUMBER },
            performanceWeight: { type: SchemaType.NUMBER },
            fuelEfficiencyWeight: { type: SchemaType.NUMBER },
            designWeight: { type: SchemaType.NUMBER },
          },
          required: ["priceWeight", "safetyWeight", "brandWeight", "performanceWeight", "fuelEfficiencyWeight", "designWeight"],
        },
      },
    });

    const response = await model.generateContent(conversationContext || "안녕하세요");

    const rawJson = response.response.text();
    if (rawJson) {
      const profile: UserProfile = JSON.parse(rawJson);
      // 정규화 (합이 1이 되도록)
      const sum = Object.values(profile).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        Object.keys(profile).forEach(key => {
          profile[key as keyof UserProfile] /= sum;
        });
      }
      return profile;
    }

    // 균형잡힌 기본 프로필 (가격편중 방지)
    return {
      priceWeight: 0.20,        // 가격 20% (너무 높지 않게)
      safetyWeight: 0.25,       // 안전성 25% (중요)
      brandWeight: 0.15,        // 브랜드 15% (적당히)
      performanceWeight: 0.20,  // 성능 20% (중요)
      fuelEfficiencyWeight: 0.15, // 연비 15% (실용적)
      designWeight: 0.05,       // 디자인 5% (보조적)
    };
  }

  /**
   * 차량 인사이트 대시보드 생성
   */
  async generateVehicleInsights(vehicle: any): Promise<{
    summary: string;
    strengths: string[];
    weaknesses: string[];
    costAnalysis: string;
    recommendation: string;
  }> {
    const systemPrompt = `당신은 차량 분석 전문가입니다.
주어진 차량 데이터를 분석하여 종합 인사이트를 제공합니다.
- 객관적 데이터 기반 분석
- 장단점 명확히 구분
- 한국어로 전문적이고 명확하게`;

    const vehicleInfo = `
차량: ${vehicle.brand} ${vehicle.model} (${vehicle.year}년)
가격: ${vehicle.price}만원
주행거리: ${vehicle.mileage?.toLocaleString()}km
연료: ${vehicle.fuel}
안전도: ${vehicle.safety?.toFixed(1)}점
신뢰성: ${vehicle.reliability?.toFixed(1)}점
`;

    const prompt = `${vehicleInfo}\n\n다음 형식으로 분석해주세요:
{
  "summary": "한 문장 요약",
  "strengths": ["장점1", "장점2", "장점3"],
  "weaknesses": ["단점1", "단점2"],
  "costAnalysis": "비용 분석 (1-2문장)",
  "recommendation": "추천 의견 (2-3문장)"
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING },
            strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            costAnalysis: { type: SchemaType.STRING },
            recommendation: { type: SchemaType.STRING },
          },
          required: ["summary", "strengths", "weaknesses", "costAnalysis", "recommendation"],
        },
      },
    });

    const response = await model.generateContent(prompt);

    const rawJson = response.response.text();
    if (rawJson) {
      return JSON.parse(rawJson);
    }

    return {
      summary: "분석 중 오류 발생",
      strengths: [],
      weaknesses: [],
      costAnalysis: "",
      recommendation: "",
    };
  }
}

export const geminiService = new GeminiAgentService();
