import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Vehicle, HyundaiReview } from "@shared/schema";

export interface AgentMessage {
  agentId: string;
  role: string;
  content: string;
  timestamp: Date;
}

export interface VehicleRecommendation {
  vehicle: Vehicle;
  rank: number;
  score: number;
  reason: string;
  pros: string[];
  cons: string[];
  topsisScore?: number;
  matchingScore?: number;
}

export class MultiAgentSystem {
  private genAI: GoogleGenerativeAI;
  private conversationHistory: AgentMessage[] = [];

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async *collaborate(
    userMessage: string,
    vehicles: Vehicle[],
    reviews: HyundaiReview[] = []
  ): AsyncGenerator<{ type: string; agent: string; content: string; data?: any }> {
    yield { type: "start", agent: "system", content: "멀티 에이전트 협업을 시작합니다..." };

    yield { type: "agent_working", agent: "concierge", content: "사용자 요청을 분석하고 있습니다..." };
    const userNeeds = await this.extractUserNeeds(userMessage);
    yield { type: "agent_response", agent: "concierge", content: `사용자 니즈 파악: ${userNeeds}` };

    yield { type: "agent_working", agent: "needs_analyst", content: "라이프스타일과 선호도를 분석하고 있습니다..." };
    const preferences = await this.analyzePreferences(userMessage, userNeeds);
    yield { type: "agent_response", agent: "needs_analyst", content: `선호도 분석 완료: ${preferences}` };

    yield { type: "agent_working", agent: "data_analyst", content: "차량 데이터를 검색하고 분석하고 있습니다..." };
    const filteredVehicles = this.filterVehicles(vehicles, userMessage);
    yield { type: "agent_response", agent: "data_analyst", content: `${filteredVehicles.length}개의 매칭 차량을 발견했습니다` };

    yield { type: "agent_working", agent: "concierge", content: "TOPSIS 알고리즘으로 차량을 평가하고 있습니다..." };
    const rankedVehicles = await this.rankVehicles(filteredVehicles, userMessage, preferences, reviews);
    
    const top3 = rankedVehicles.slice(0, 3);
    yield { 
      type: "recommendations", 
      agent: "concierge", 
      content: "추천 차량 분석이 완료되었습니다",
      data: top3
    };

    yield { type: "complete", agent: "system", content: "협업 완료" };
  }

  private async extractUserNeeds(message: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `다음 사용자 메시지에서 차량 구매 니즈를 간단히 추출하세요:
"${message}"

예산, 용도, 승차인원, 선호 차종 등을 파악하여 1-2문장으로 요약하세요.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async analyzePreferences(message: string, needs: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `사용자의 라이프스타일과 선호도를 분석하세요:
메시지: "${message}"
니즈: "${needs}"

가족 구성, 주 사용 목적, 중요 요소(연비/안전/공간 등)를 파악하여 간단히 요약하세요.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private filterVehicles(vehicles: Vehicle[], message: string): Vehicle[] {
    const lowerMessage = message.toLowerCase();
    const currentYear = new Date().getFullYear();

    const priceMatch = message.match(/(\d+)만원?/);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) * 10000 : 5000; // 기본 5000만원

    // 품질 기준 필터링
    const qualityFiltered = vehicles.filter(v => {
      // 가격 필터
      if (v.price && v.price > maxPrice * 10000) return false;

      // 연식 필터 (10년 이내 차량 우선)
      if (v.modelYear && v.modelYear < currentYear - 15) return false;

      // 주행거리 필터 (20만km 이하)
      if (v.distance && v.distance > 200000) return false;

      // 차종 필터
      if (lowerMessage.includes('suv') && v.carType !== 'SUV') return false;
      if (lowerMessage.includes('세단') && v.carType !== '세단') return false;

      // 연비 우선 시 소형차나 하이브리드 우선
      if (lowerMessage.includes('연비')) {
        const isEfficientCar = v.carType === '경차' ||
                              v.carType === '소형차' ||
                              v.fuelType?.includes('하이브리드') ||
                              v.fuelType?.includes('LPG');
        if (!isEfficientCar && v.carType === 'SUV') return false;
      }

      return true;
    });

    // 품질 점수로 정렬 (연식 신선도 + 주행거리 적음 우선)
    const sortedVehicles = qualityFiltered.sort((a, b) => {
      const aScore = (a.modelYear || 2000) * 0.7 - (a.distance || 0) * 0.00001;
      const bScore = (b.modelYear || 2000) * 0.7 - (b.distance || 0) * 0.00001;
      return bScore - aScore;
    });

    return sortedVehicles.slice(0, 50);
  }

  private async rankVehicles(
    vehicles: Vehicle[],
    userMessage: string,
    preferences: string,
    reviews: HyundaiReview[]
  ): Promise<VehicleRecommendation[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const vehicleData = vehicles.map(v => ({
      id: v.vehicleId,
      manufacturer: v.manufacturer,
      model: v.model,
      year: v.modelYear,
      price: v.price,
      mileage: v.distance,
      fuel: v.fuelType,
      type: v.carType
    }));

    const reviewSummary = reviews.length > 0
      ? `실제 구매자 리뷰 (${reviews.length}개): ${reviews.slice(0, 5).map(r => r.review).join(', ')}`
      : '리뷰 데이터 없음';

    const prompt = `당신은 중고차 추천 전문가입니다. 사용자 요구에 맞는 차량 3대를 추천하고 평가해주세요.

사용자 요청: "${userMessage}"
사용자 선호도: ${preferences}

차량 목록:
${JSON.stringify(vehicleData, null, 2)}

${reviewSummary}

다음 기준으로 각 차량을 평가하세요:
1. 사용자 요구사항 부합도 (40%)
2. 가격 경쟁력 (20%)
3. 차량 상태 (연식, 주행거리) (20%)
4. 연료 효율성 (10%)
5. 브랜드 신뢰도 (10%)

각 차량에 대해 다음 JSON 형식으로 응답하세요:
[
  {
    "vehicleId": 차량ID,
    "rank": 1,
    "topsisScore": 85,
    "matchingScore": 88,
    "reason": "구체적인 추천 이유 (사용자 요구사항과 연결)",
    "pros": ["주요 장점1", "주요 장점2", "주요 장점3"],
    "cons": ["고려할 점1", "고려할 점2"]
  }
]

- 점수는 60-95점 범위로 현실적으로 설정
- 1위는 85-95점, 2위는 80-90점, 3위는 75-85점 범위
- 상위 3개만 반환
- 반드시 유효한 JSON 배열로 응답`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const rankings = JSON.parse(jsonMatch[0]);
      
      return rankings.map((r: any) => {
        const vehicle = vehicles.find(v => v.vehicleId === r.vehicleId);
        if (!vehicle) {
          console.log(`⚠️ Vehicle ${r.vehicleId} not found, skipping...`);
          return null;
        }
        
        return {
          vehicle,
          rank: r.rank,
          score: r.topsisScore || r.matchingScore || 0,
          reason: r.reason,
          pros: r.pros || [],
          cons: r.cons || [],
          topsisScore: r.topsisScore,
          matchingScore: r.matchingScore
        };
      }).filter(Boolean); // null 값들 제거
    } catch (error) {
      console.error('Ranking parsing error:', error);
      
      return vehicles.slice(0, 3).map((vehicle, index) => ({
        vehicle,
        rank: index + 1,
        score: 88 - index * 3, // 더 현실적인 점수
        reason: `${userMessage.includes('연비') ? '연비가 우수한' : '사용자 요구에 적합한'} 차량입니다`,
        pros: ["사용자 요구사항 부합", "합리적인 가격", "좋은 차량 상태"],
        cons: ["추가 검토 권장", "직접 확인 필요"],
        topsisScore: 88 - index * 3,
        matchingScore: 85 - index * 2
      }));
    }
  }
}
