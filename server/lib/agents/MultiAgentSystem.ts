import { GoogleGenerativeAI } from "@google/generative-ai";
import type { HyundaiReview } from "@shared/schema";
import type { Vehicle } from "@shared/types/vehicle";
import { EnhancedFinanceCalculator } from "../financial/EnhancedFinanceCalculator";
import { storage } from "../../storage";
import type { VehicleFinancialInfo } from "@shared/types/financial";
// 🆕 Phase 2: TOPSIS + TCO 통합
import { rankVehiclesWithTOPSIS, UserDrivingProfile } from "../topsis/VehicleTOPSISAdapter";
import { UserPreferenceProfile } from "../topsis/TOPSISEngine";
// 🆕 Phase 5: 챗봇 흐름 개선 - 메시지 구체성 판단
import { ProfileExtractor, ExtractedProfileUpdate } from "./ProfileExtractor";
import { SmartQuestionEngine } from "./SmartQuestionEngine";
// 🆕 Phase 1: MACRec Protocol Implementation
import { ManagerAgent, AgentTask, AgentResult } from "./ManagerAgent";
import { UserAnalystAgent } from "./UserAnalystAgent";
import { SearcherAgent } from "./SearcherAgent";
import { EvaluatorAgent } from "./EvaluatorAgent";
// 🆕 Phase 3-E: Financial Advisor Agent
import { FinancialAdvisorAgent } from "./FinancialAdvisorAgent";

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
  private profileExtractor: ProfileExtractor;
  private questionEngine: SmartQuestionEngine;

  // 🆕 Phase 1: MACRec Agents
  private manager: ManagerAgent;
  private userAnalyst: UserAnalystAgent;
  private searcher: SearcherAgent;
  private evaluator: EvaluatorAgent;
  // 🆕 Phase 3-E: Financial Advisor Agent
  private financialAdvisor: FinancialAdvisorAgent;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.profileExtractor = new ProfileExtractor(apiKey);
    this.questionEngine = new SmartQuestionEngine(apiKey);

    // MACRec Agents 초기화
    this.manager = new ManagerAgent(apiKey);
    this.userAnalyst = new UserAnalystAgent(apiKey);
    this.searcher = new SearcherAgent();
    this.evaluator = new EvaluatorAgent();
    // 🆕 Phase 3-E: Financial Advisor 초기화
    this.financialAdvisor = new FinancialAdvisorAgent();
  }

  async *collaborate(
    userMessage: string,
    vehicles: Vehicle[],
    reviews: HyundaiReview[] = [],
    rawProfile?: any  // 🐛 Fix: 누적 프로필 전달 (session.rawProfile)
  ): AsyncGenerator<{ type: string; agent: string; content: string; data?: any }> {
    console.log(`🚀 MACRec Protocol 시작: ${vehicles.length}대 차량, ${userMessage.length}자 메시지`);
    console.log(`📊 누적 프로필:`, JSON.stringify(rawProfile, null, 2));

    yield { type: "start", agent: "system", content: "MACRec 멀티에이전트 협업 시작..." };

    // ═══════════════════════════════════════════════════════════════
    // Phase 1: Task Decomposition (Manager Agent)
    // ═══════════════════════════════════════════════════════════════
    yield { type: "agent_working", agent: "manager", content: "🎯 Task Decomposition: 작업 분해 중..." };

    // 🐛 Fix: 누적 프로필 + 현재 메시지 분석 병합
    const currentMessageProfile = this.profileExtractor.quickExtract(userMessage);
    const extractedProfile = rawProfile
      ? { ...rawProfile, ...currentMessageProfile }  // 누적 프로필 우선, 현재 메시지로 오버라이드
      : currentMessageProfile;  // 첫 메시지는 현재 메시지만

    console.log(`✅ 병합된 프로필:`, JSON.stringify(extractedProfile, null, 2));
    const tasks = await this.manager.decompose(userMessage, extractedProfile);

    yield {
      type: "agent_response",
      agent: "manager",
      content: `🔍 ${vehicles.length.toLocaleString()}대의 차량 중에서 조건에 맞는 차를 찾아드릴게요`
    };

    // ═══════════════════════════════════════════════════════════════
    // Phase 2: Parallel Execution (Agents 병렬 실행)
    // ═══════════════════════════════════════════════════════════════
    const { parallel, sequential } = this.manager.identifyParallelTasks(tasks);

    const allResults: AgentResult[] = [];

    // Round 0: 병렬 실행 가능한 작업들
    if (parallel.length > 0 && parallel[0].length > 0) {
      yield {
        type: "agent_working",
        agent: "manager",
        content: `💡 조건에 맞는 차량을 찾고 있어요...`
      };

      const parallelResults = await Promise.all(
        parallel[0].map(async (task) => {
          console.log(`⚡ 병렬 실행: ${task.agent} - ${task.action}`);

          if (task.agent === 'user_analyst') {
            return await this.userAnalyst.execute(task);
          } else if (task.agent === 'searcher') {
            return await this.searcher.execute(task, vehicles);
          } else if (task.agent === 'evaluator') {
            // 🐛 Fix: Evaluator는 Searcher 결과 필요 (병렬 실행에서도 의존성 확인)
            const searcherResult = allResults.find(r => r.agent === 'searcher');
            if (!searcherResult) {
              console.warn('⚠️ Evaluator가 병렬 실행되었지만 Searcher 결과 없음, 전체 차량 사용');
            }
            const candidateVehicles = searcherResult?.output || vehicles;
            console.log(`🔍 Evaluator에 전달: ${candidateVehicles.length}대 차량`);
            return await this.evaluator.execute(task, candidateVehicles, userProfile);
          }

          throw new Error(`Unknown agent: ${task.agent}`);
        })
      );

      allResults.push(...parallelResults);

      // 🎨 UX 개선: 사용자 친화적 메시지로 변경
      const searcherResult = parallelResults.find(r => r.agent === 'searcher');
      const foundCount = searcherResult?.output?.length || 0;

      if (foundCount > 0) {
        yield {
          type: "agent_response",
          agent: "searcher",
          content: `✅ 조건에 맞는 차량 ${foundCount}대를 찾았어요`
        };
      }
    }

    // Round 1+: 순차 실행 필요한 작업들 (조용히 처리)
    for (const task of sequential) {
      let result: AgentResult;

      if (task.agent === 'user_analyst') {
        // 이전 결과를 input에 추가
        const prevResults = allResults.filter(r => task.dependencies.includes(r.taskId));
        task.input.previousNeeds = prevResults[0]?.output;
        result = await this.userAnalyst.execute(task);
      } else if (task.agent === 'searcher') {
        result = await this.searcher.execute(task, vehicles);
      } else if (task.agent === 'evaluator') {
        // Searcher 결과를 Evaluator에 전달
        const searcherResult = allResults.find(r => r.agent === 'searcher');
        const candidateVehicles = searcherResult?.output || vehicles;
        result = await this.evaluator.execute(task, candidateVehicles, userProfile);
      } else {
        throw new Error(`Unknown agent: ${task.agent}`);
      }

      allResults.push(result);

      // 순차 실행은 조용히 처리 (사용자에게 불필요한 정보)
    }

    // ═══════════════════════════════════════════════════════════════
    // Phase 3: Result Aggregation (Manager Agent)
    // ═══════════════════════════════════════════════════════════════
    yield { type: "agent_working", agent: "manager", content: "📊 가장 적합한 차량을 선별하고 있어요..." };

    const consensus = await this.manager.aggregate(allResults);

    yield {
      type: "agent_response",
      agent: "manager",
      content: `✅ 베스트 3 차량을 선정했어요`
    };

    const top3 = consensus.rankedVehicles.slice(0, 3);

    // ═══════════════════════════════════════════════════════════════
    // 🆕 Phase 3-E: Financial Advisor Agent Integration
    // ═══════════════════════════════════════════════════════════════
    yield { type: "agent_working", agent: "financial_advisor", content: "💰 일시불, 할부, 리스 중 어떤 방법이 유리한지 분석하고 있어요..." };

    // Top 3 차량에 대해 FinancialAdvisorAgent로 금융 옵션 분석
    const financialEnrichedRecommendations = await this.enrichWithFinancialOptions(top3, userProfile);

    yield {
      type: "agent_response",
      agent: "financial_advisor",
      content: `✅ 각 차량별 최적의 구매 방법을 찾았어요`
    };

    yield { type: "agent_working", agent: "concierge", content: "📝 추천 내용을 정리하고 있어요..." };
    const finalRecommendations = await this.generateComprehensiveRecommendation(
      financialEnrichedRecommendations,
      userMessage
    );

    yield {
      type: "recommendations",
      agent: "concierge",
      content: "MACRec 추천 완료",
      data: {
        vehicles: financialEnrichedRecommendations,  // 🆕 금융 옵션 포함된 추천
        comprehensiveAdvice: finalRecommendations,
        macrecMetadata: {
          totalTasks: tasks.length,
          parallelTasks: parallel[0]?.length || 0,
          sequentialTasks: sequential.length,
          totalExecutionTime: consensus.aggregationMetadata.avgExecutionTime
        }
      }
    };

    console.log(`✅ MACRec Protocol 완료: ${top3.length}개 추천, ${allResults.length}개 에이전트 결과`);

    yield { type: "complete", agent: "system", content: "MACRec 협업 완료" };
  }

  /**
   * 메시지 구체성 판단 - 바로 검색 가능한지 확인
   */
  private isConcreteRequest(extractedProfile: ExtractedProfileUpdate): boolean {
    const hasBudget = !!extractedProfile.budget;
    const hasCarType = !!extractedProfile.carType;
    const hasUsage = extractedProfile.usage && extractedProfile.usage.length > 0;

    // 예산 OR 차종 OR (용도 + 기타 조건) 중 하나라도 있으면 구체적
    return hasBudget || hasCarType || (hasUsage && Object.keys(extractedProfile).length >= 2);
  }

  private async extractUserNeeds(message: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `다음 사용자 메시지에서 차량 구매 니즈를 간단히 추출하세요:\n\"${message}\"\n\n예산, 용도, 승차인원, 선호 차종 등을 파악하여 1-2문장으로 요약하세요.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async analyzePreferences(message: string, needs: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `사용자의 라이프스타일과 선호도를 분석하세요:\n메시지: \"${message}\"\n니즈: \"${needs}\"\n\n가족 구성, 주 사용 목적, 중요 요소(연비/안전/공간 등)를 파악하여 간단히 요약하세요.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private filterVehicles(vehicles: Vehicle[], message: string): Vehicle[] {
    const lowerMessage = message.toLowerCase();
    const currentYear = new Date().getFullYear();

    // 예산 추출 (만원 단위) - "3000만원대" → 2500~3500만원 범위로 해석
    const priceMatch = message.match(/(\d+)만원?/);
    let minPrice = 0;
    let maxPrice = 5000; // 기본 5000만원 (DB는 만원 단위)

    if (priceMatch && priceMatch[1]) {
      const targetPrice = parseInt(priceMatch[1]); // 만원 단위 그대로
      minPrice = Math.floor(targetPrice * 0.8); // -20%
      maxPrice = Math.ceil(targetPrice * 1.2); // +20%
      console.log(`💰 예산 범위: ${minPrice}만원 ~ ${maxPrice}만원 (DB 만원 단위)`);
    }

    // 브랜드 필터링 (사용자가 특정 브랜드를 요청한 경우)
    const brandKeywords = {
      '현대': ['현대', 'hyundai'],
      '기아': ['기아', 'kia'],
      '제네시스': ['제네시스', 'genesis'],
      'BMW': ['bmw', '비엠'],
      '벤츠': ['벤츠', 'benz', '메르세데스', 'mercedes'],
      '아우디': ['아우디', 'audi'],
      '쉐보레': ['쉐보레', 'chevrolet', '쉐비'],
      '르노': ['르노', 'renault'],
      '쌍용': ['쌍용', 'ssangyong'],
      '한국GM': ['gm'],
      '토요타': ['토요타', 'toyota'],
      '렉서스': ['렉서스', 'lexus'],
      '닛산': ['닛산', 'nissan'],
      '혼다': ['혼다', 'honda'],
      '볼보': ['볼보', 'volvo'],
      '포드': ['포드', 'ford'],
      '지프': ['지프', 'jeep'],
      '랜드로버': ['랜드로버', 'landrover', 'range rover', '레인지로버'],
    };

    let requestedBrand: string | null = null;
    let excludeBrand: string | null = null;

    // "현대 말고", "기아 제외" 같은 제외 요청 감지
    for (const [brand, keywords] of Object.entries(brandKeywords)) {
      if (keywords.some(keyword => {
        const excludePatterns = [
          `${keyword} 말고`,
          `${keyword} 제외`,
          `${keyword}말고`,
          `${keyword}제외`,
          `${keyword} 빼고`,
          `${keyword}빼고`,
          `${keyword}는 싫`,
          `${keyword} 싫`,
        ];
        return excludePatterns.some(pattern => lowerMessage.includes(pattern));
      })) {
        excludeBrand = brand;
        console.log(`🚫 제외할 브랜드: ${excludeBrand}`);
        break;
      }
    }

    // 특정 브랜드 요청 (제외가 아닌 경우)
    if (!excludeBrand) {
      for (const [brand, keywords] of Object.entries(brandKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          requestedBrand = brand;
          console.log(`🏷️ 사용자가 요청한 브랜드: ${requestedBrand}`);
          break;
        }
      }
    }

    // 상용차 키워드 (제외 대상)
    const commercialVehicleKeywords = [
      'st1', '포터', '봉고', '다마스', '라보',
      '화물', '트럭', '냉동', '탑차', '밴'
    ];

    // 품질 기준 필터링
    const qualityFiltered = vehicles.filter(v => {
      // 브랜드 제외 필터
      if (excludeBrand && v.manufacturer === excludeBrand) return false;

      // 브랜드 필터 (사용자가 특정 브랜드 요청 시)
      if (requestedBrand && v.manufacturer !== requestedBrand) return false;

      // 🚫 상용차 제외 필터 (모델명 또는 차종에 상용차 키워드 포함 시)
      const modelLower = (v.model || '').toLowerCase();
      const carTypeLower = (v.carType || '').toLowerCase();
      const isCommercialVehicle = commercialVehicleKeywords.some(keyword =>
        modelLower.includes(keyword) || carTypeLower.includes(keyword)
      );
      if (isCommercialVehicle) {
        console.log(`🚫 상용차 제외: ${v.manufacturer} ${v.model} (${v.carType})`);
        return false;
      }

      // 가격 필터 (원 단위로 직접 비교)
      if (v.price && (v.price < minPrice || v.price > maxPrice)) return false;

      // 연식 필터 (15년 이내 차량 우선)
      if (v.modelYear && v.modelYear < currentYear - 15) return false;

      // 주행거리 필터 (20만km 이하)
      if (v.distance && v.distance > 200000) return false;

      // 차종 필터 (유연한 매칭: 포함 검사)
      if (lowerMessage.includes('suv') || lowerMessage.includes('에스유브이')) {
        const isSUV = carTypeLower.includes('suv') ||
                      carTypeLower.includes('rv') ||
                      carTypeLower.includes('스포츠');
        if (!isSUV) return false;
      }

      if (lowerMessage.includes('세단')) {
        const isSedan = carTypeLower.includes('세단') || carTypeLower.includes('sedan');
        if (!isSedan) return false;
      }

      // 연비 우선 시 소형차나 하이브리드 우선
      if (lowerMessage.includes('연비')) {
        const isEfficientCar = carTypeLower.includes('경차') ||
                              carTypeLower.includes('소형') ||
                              v.fuelType?.includes('하이브리드') ||
                              v.fuelType?.includes('LPG') ||
                              v.fuelType?.includes('전기');
        if (!isEfficientCar && carTypeLower.includes('suv')) return false;
      }

      return true;
    });

    // 품질 점수로 정렬 (연식 신선도 + 주행거리 적음 우선)
    const sortedVehicles = qualityFiltered.sort((a, b) => {
      const aScore = (a.modelYear || 2000) * 0.7 - (a.distance || 0) * 0.00001;
      const bScore = (b.modelYear || 2000) * 0.7 - (b.distance || 0) * 0.00001;
      return bScore - aScore;
    });

    // 브랜드 다양성 확보: 각 브랜드에서 상위 차량들을 골고루 선택
    const brandDiverseVehicles: Vehicle[] = [];
    const brandMap = new Map<string, Vehicle[]>();

    // 브랜드별로 그룹화
    for (const vehicle of sortedVehicles) {
      const brand = vehicle.manufacturer || '기타';
      if (!brandMap.has(brand)) {
        brandMap.set(brand, []);
      }
      brandMap.get(brand)!.push(vehicle);
    }

    // 각 브랜드에서 순차적으로 선택 (라운드 로빈 방식)
    const maxPerBrand = Math.ceil(50 / Math.max(brandMap.size, 1));
    let round = 0;

    while (brandDiverseVehicles.length < 50 && round < maxPerBrand) {
      for (const [brand, vehicles] of brandMap) {
        if (vehicles[round]) {
          brandDiverseVehicles.push(vehicles[round]);
          if (brandDiverseVehicles.length >= 50) break;
        }
      }
      round++;
    }

    console.log(`🎨 브랜드 다양성 확보: ${brandMap.size}개 브랜드에서 ${brandDiverseVehicles.length}개 차량 선택`);

    return brandDiverseVehicles.slice(0, 50);
  }

  // 🆕 Phase 2: TOPSIS + TCO 기반 차량 평가
  private async rankVehiclesWithTOPSIS(
    vehicles: Vehicle[],
    userMessage: string,
    preferences: string,
    reviews: HyundaiReview[],
    userProfile?: any
  ): Promise<VehicleRecommendation[]> {
    console.log(`🎯 TOPSIS + TCO 평가 시작: ${vehicles.length}개 차량`);
    console.log(`📊 사용자 프로필:`, JSON.stringify(userProfile, null, 2));

    // 1. 사용자 프로필을 TOPSIS 가중치로 변환
    // 프론트엔드에서 최상위 레벨로 전송되므로 직접 접근
    const topsisProfile: UserPreferenceProfile = {
      priceWeight: (userProfile?.priceWeight ?? 5) / 10,  // 1-10 스케일 → 0-1 스케일
      performanceWeight: (userProfile?.performanceWeight ?? 5) / 10,
      brandWeight: (userProfile?.brandWeight ?? 5) / 10,
      fuelEfficiencyWeight: (userProfile?.fuelEfficiencyWeight ?? 5) / 10,
      safetyWeight: (userProfile?.safetyWeight ?? 5) / 10,
      designWeight: (userProfile?.designWeight ?? 5) / 10
    };

    console.log(`⚖️ TOPSIS 가중치:`, topsisProfile);

    // 2. TCO 계산용 주행 프로필
    const drivingProfile: UserDrivingProfile = {
      annualKm: userProfile?.annualKm || 15000,
      ownershipYears: userProfile?.ownershipYears || 3
    };

    console.log(`🚗 TCO 계산 조건: 연간 ${drivingProfile.annualKm}km, ${drivingProfile.ownershipYears}년 보유`);

    // 3. TOPSIS + TCO 평가 (최대 50대)
    const topsisResult = await rankVehiclesWithTOPSIS(
      vehicles.slice(0, 50),
      topsisProfile,
      drivingProfile
    );

    // 4. TOPSIS 결과를 VehicleRecommendation 형식으로 변환
    const recommendations: VehicleRecommendation[] = topsisResult.ranking.map(r => {
      const tcoData = r.alternative.metadata?.tcoBreakdown;
      const tcoTotal = tcoData
        ? (tcoData.acquisitionTax + tcoData.vehicleTax + tcoData.maintenance + tcoData.depreciation + tcoData.fuelCost)
        : 0;

      return {
        vehicle: {
          ...r.alternative.metadata.vehicle,
          // 🆕 TCO 데이터 추가
          tco: tcoData ? {
            total: tcoTotal,
            breakdown: tcoData,
            confidence: r.alternative.metadata.tcoConfidence || 0.7,
            ownershipYears: drivingProfile.ownershipYears,
            // 🆕 Phase 6-1: TCO 타임라인
            timeline: r.alternative.metadata.tcoTimeline
          } : undefined
        },
        rank: r.rank,
        score: r.score * 100, // 0-1 범위를 0-100으로 변환
        reason: `TOPSIS 다기준 평가 ${(r.score * 100).toFixed(1)}점 (TCO 반영)`,
        pros: [
          `총 소유비용 ${(tcoTotal / 10000).toFixed(0)}만원 (${drivingProfile.ownershipYears}년)`,
          `TOPSIS 점수 ${(r.score * 100).toFixed(1)}점`,
          "다기준 분석 기반 추천"
        ],
        cons: tcoData && r.alternative.metadata.tcoWarnings?.length > 0
          ? r.alternative.metadata.tcoWarnings
          : ["추가 검토 권장"],
        topsisScore: r.score * 100,
        matchingScore: r.score * 100
      };
    });

    console.log(`✅ TOPSIS + TCO 평가 완료: Top 3 선정`);
    return recommendations;
  }

  // 🏦 향상된 금융 옵션 분석 (RDS 기반)
  private async analyzeFinancialOptions(
    vehicles: VehicleRecommendation[],
    userMessage: string,
    userProfile?: any
  ): Promise<any> {
    console.log('🤖 향상된 금융 분석 시작 (RDS 기반)...');

    const enhancedAnalysis = [];

    for (const vehicleRec of vehicles) {
      try {
        const vehicleDetails = await storage.getVehicleWithDetails(vehicleRec.vehicle.vehicleId);

        if (!vehicleDetails) {
          console.warn(`⚠️ 차량 ${vehicleRec.vehicle.vehicleId} 상세 정보 없음`);
          continue;
        }

        const preciseFinanceData = EnhancedFinanceCalculator.calculateEnhancedFinance(
          vehicleDetails.vehicle,
          vehicleDetails.inspect,
          vehicleDetails.insurance
        );

        enhancedAnalysis.push({
          rank: vehicleRec.rank,
          vehicleId: vehicleRec.vehicle.vehicleId,
          preciseFinance: preciseFinanceData,
          dataQuality: {
            hasOptions: !!vehicleDetails.vehicle.options && vehicleDetails.vehicle.options.length > 0,
            hasInspection: !!vehicleDetails.inspect,
            hasInsurance: !!vehicleDetails.insurance,
            precisionScore: 60 // 기본 점수
          }
        });

        console.log(`✅ 차량 ${vehicleRec.vehicle.vehicleId} 정밀 금융 분석 완료`);

      } catch (error) {
        console.error(`❌ 차량 ${vehicleRec.vehicle.vehicleId} 금융 분석 실패:`, error);

        enhancedAnalysis.push(await this.fallbackFinancialAnalysis(vehicleRec, userMessage, userProfile));
      }
    }

    return {
      vehicles: enhancedAnalysis,
      systemInfo: {
        analysisType: 'ENHANCED_RDS',
        timestamp: new Date(),
        totalVehiclesAnalyzed: enhancedAnalysis.length
      }
    };
  }

  // 폴백 금융 분석 (기존 방식)
  private async fallbackFinancialAnalysis(
    vehicleRec: VehicleRecommendation,
    userMessage: string,
    userProfile?: any
  ): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const vehicleData = {
      rank: vehicleRec.rank,
      manufacturer: vehicleRec.vehicle.manufacturer,
      model: vehicleRec.vehicle.model,
      year: vehicleRec.vehicle.modelYear,
      price: vehicleRec.vehicle.price,
      mileage: vehicleRec.vehicle.distance
    };

    const userBudgetInfo = this.extractBudgetInfo(userMessage, userProfile);

    const prompt = `당신은 자동차 금융 전문가입니다. 추천된 차량들에 대한 맞춤 금융 상품을 분석해주세요.\n\n사용자 요청: \"${userMessage}\"\n사용자 프로필: ${JSON.stringify(userProfile || {})}\n예산 정보: ${userBudgetInfo}\n\n추천 차량 목록:\n${JSON.stringify(vehicleData, null, 2)}\n\n각 차량에 대해 다음을 분석하세요:\n\n1. **할부 대출 옵션** (현대캐피탈, 신한캐피탈, KB캐피탈 기준)\n   - 적정 금리: 차량 연식과 가격 고려\n   - 월 납입금: 60개월 기준\n   - 초기 비용: 취득세 + 등록비 포함\n\n2. **리스 옵션** (3년 기준)\n   - 월 리스료\n   - 보증금\n   - 잔가 설정률\n\n3. **보험료** (종합보험 기준)\n   - 월 예상 보험료\n   - 차량 가격별 차등 적용\n\n4. **총 소유비용** (5년 기준)\n   - 차량비 + 이자 + 보험 + 유지비\n   - 연료비 (연간 15,000km 가정)\n   - 정비비 (제조사별 차등)\n\n5. **추천 금융 옵션**\n   - 사용자 상황에 최적인 옵션\n   - 절약 금액 및 이유\n\n다음 JSON 형식으로 응답하세요:\n{\n  \"vehicles\": [\n    {\n      \"rank\": 1,\n      \"vehicleId\": \"차량ID\",\n      \"financialOptions\": {\n        \"loan\": {\n          \"provider\": \"현대캐피탈\",\n          \"interestRate\": 4.5,\n          \"monthlyPayment\": 450000,\n          \"downPayment\": 5000000,\n          \"totalCost\": 32000000
        },\
        \"lease\": {\n          \"provider\": \"현대캐피탈 리스\",\n          \"monthlyPayment\": 380000,\n          \"deposit\": 3000000,\n          \"residualValue\": 12000000
        },\
        \"insurance\": {\n          \"monthlyPremium\": 85000,\n          \"provider\": \"삼성화재\"
        },\
        \"tco\": {\n          \"totalCost\": 45000000,\n          \"monthlyAverage\": 750000,\n          \"breakdown\": {\n            \"vehicle\": 30000000,\n            \"financing\": 2000000,\n            \"insurance\": 5100000,\n            \"fuel\": 4500000,\n            \"maintenance\": 3400000
          }
        },\
        \"recommendation\": {\n          \"type\": \"loan\",\n          \"reason\": \"월 소득 대비 안정적이며 장기적으로 경제적\",\n          \"savingsAmount\": 1500000
        }
      }
    }
  ],
  \"overallAdvice\": \"종합 금융 조언...\"
}

- 실제 시장 금리 반영 (4-7% 범위)\n- 차량 연식별 금리 차등 적용\n- 현실적인 월 납입금 산정`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Financial analysis parsing error:', error);

      const vehicles: VehicleRecommendation[] = [];
      return {
        vehicles: vehicles.map((v, index) => ({
          rank: v.rank,
          vehicleId: v.vehicle.vehicleId,
          financialOptions: {
            loan: {
              provider: "현대캐피탈",
              interestRate: 4.5 + index * 0.2,
              monthlyPayment: Math.round((v.vehicle.price || 3000) * 10000 * 0.018),
              downPayment: Math.round((v.vehicle.price || 3000) * 10000 * 0.2),
              totalCost: Math.round((v.vehicle.price || 3000) * 10000 * 1.15)
            },
            lease: {
              provider: "현대캐피탈 리스",
              monthlyPayment: Math.round((v.vehicle.price || 3000) * 10000 * 0.015),
              deposit: Math.round((v.vehicle.price || 3000) * 10000 * 0.1),
              residualValue: Math.round((v.vehicle.price || 3000) * 10000 * 0.4)
            },
            insurance: {
              monthlyPremium: 80000 + index * 5000,
              provider: "삼성화재"
            },
            recommendation: {
              type: "loan",
              reason: "장기적으로 경제적인 옵션",
              savingsAmount: 1000000 + index * 200000
            }
          }
        })),
        overallAdvice: "추천 차량 모두 합리적인 선택입니다. 개인의 현금 흐름과 선호도에 따라 할부 또는 리스를 선택하세요."
      };
    }
  }

  /**
   * 🆕 Phase 3-E: Top 3 차량에 금융 옵션 추가
   *
   * 🛡️ 에러 핸들링 강화:
   * - TCO 없어도 금융 옵션 계산 시도 (FinancialAdvisor fallback 활용)
   * - 개별 차량 실패해도 다른 차량 계속 처리
   * - 최소 1개 이상 성공 보장
   */
  private async enrichWithFinancialOptions(
    recommendations: VehicleRecommendation[],
    userProfile?: any
  ): Promise<VehicleRecommendation[]> {
    console.log(`💰 FinancialAdvisorAgent: ${recommendations.length}대 차량 금융 분석 시작`);

    const enrichedRecommendations: VehicleRecommendation[] = [];
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const rec of recommendations) {
      try {
        // TCO 데이터 추출 (없어도 FinancialAdvisor가 fallback 생성)
        const tcoBreakdown = rec.vehicle.tco?.breakdown || null;

        if (!tcoBreakdown) {
          console.warn(`⚠️ 차량 ${rec.vehicle.vehicleId} TCO 데이터 없음, fallback 사용`);
        }

        // UserDrivingProfile 구성 (기본값 제공으로 안전성 확보)
        const drivingProfile = {
          annualKm: userProfile?.annualKm || 15000,
          ownershipYears: userProfile?.ownershipYears || 5,
          age: userProfile?.age || 35,
          monthlyIncome: userProfile?.monthlyIncome || undefined,
          hasOtherLoans: userProfile?.hasOtherLoans || false
        };

        // FinancialAdvisorAgent로 금융 옵션 계산
        // FinancialAdvisor 내부에서 에러 핸들링하여 최소 1개 옵션 반환 보장
        const financingOptions = await this.financialAdvisor.recommendFinancing(
          rec.vehicle,
          tcoBreakdown as any,  // null도 허용 (내부 fallback)
          drivingProfile
        );

        // VehicleRecommendation에 financingOptions 추가
        enrichedRecommendations.push({
          ...rec,
          vehicle: {
            ...rec.vehicle,
            financingOptions  // 🆕 Phase 3-E: 금융 옵션 추가
          }
        });

        successCount++;
        console.log(`✅ 차량 ${rec.vehicle.vehicleId} 금융 옵션 추가 완료`);

      } catch (error) {
        console.error(`❌ 차량 ${rec.vehicle.vehicleId} 금융 분석 실패:`, error);

        // 금융 옵션 없이도 차량 추천은 표시
        enrichedRecommendations.push(rec);
        failCount++;
      }
    }

    console.log(`💰 FinancialAdvisorAgent: 금융 분석 완료`);
    console.log(`   - 성공: ${successCount}대`);
    console.log(`   - 스킵: ${skipCount}대`);
    console.log(`   - 실패: ${failCount}대`);
    console.log(`   - 총: ${enrichedRecommendations.length}대`);

    // 최소 1개 이상 추천 보장
    if (enrichedRecommendations.length === 0) {
      console.error('⚠️ 모든 차량 금융 분석 실패, 원본 추천 반환');
      return recommendations;
    }

    return enrichedRecommendations;
  }

  // 🎯 종합 추천 생성 (Updated for Phase 3-E)
  private async generateComprehensiveRecommendation(
    vehicles: VehicleRecommendation[],
    userMessage: string
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 금융 옵션 요약 생성
    const financialSummary = vehicles.map(v => {
      const financing = v.vehicle.financingOptions;
      if (!financing) return '금융 옵션 없음';

      const best = financing.bestRecommendation;
      const typeLabel = best.type === 'cash' ? '일시불' : best.type === 'loan' ? '할부' : '리스';

      return `${v.rank}위 (${v.vehicle.manufacturer} ${v.vehicle.model}): ${typeLabel} 추천 (${best.recommendation.reason})`;
    }).join('\n');

    const prompt = `종합 자동차 구매 및 금융 상담사로서 최종 조언을 제공하세요.\n\n사용자 요청: \"${userMessage}\"\n\n차량 추천 결과:\n${vehicles.map(v => `${v.rank}위: ${v.vehicle.manufacturer} ${v.vehicle.model} (${v.vehicle.modelYear}년) - ${v.reason}`).join('\n')}\n\n금융 옵션 추천:\n${financialSummary}\n\n다음 형식으로 종합 조언을 제공하세요:\n\n1. **최종 추천 차량**: 1위 차량과 그 이유\n2. **최적 금융 방법**: 일시불/할부/리스 중 추천 옵션\n3. **예산 계획**: 월 지출 예상액과 준비사항\n4. **주의사항**: 구매 전 확인할 점들\n5. **다음 단계**: 구체적인 액션 아이템\n\n전문적이면서도 친근한 톤으로 2-3문단 내외로 작성하세요.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // 예산 정보 추출 헬퍼
  private extractBudgetInfo(message: string, userProfile?: any): string {
    const priceMatch = message.match(/(\d+)만원?/);
    const maxPrice = priceMatch && priceMatch[1] ? parseInt(priceMatch[1]) : null;

    const budgetInfo = [];
    if (maxPrice) budgetInfo.push(`예산: ${maxPrice}만원`);
    if (userProfile?.budget) budgetInfo.push(`프로필 예산: ${userProfile.budget[0]}-${userProfile.budget[1]}만원`);
    if (userProfile?.importance?.price) budgetInfo.push(`가격 중요도: ${userProfile.importance.price}/10`);

    return budgetInfo.length > 0 ? budgetInfo.join(', ') : '예산 정보 없음';
  }
}
