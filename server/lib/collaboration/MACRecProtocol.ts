/**
 * MACRec: Multi-Agent Collaboration Framework for Recommendation (SIGIR 2024)
 *
 * 논문: https://arxiv.org/abs/2402.15235
 * GitHub: https://github.com/wzf2000/MACRec
 *
 * CarFin 적용: 3개 에이전트 협업으로 차량 추천
 * - Manager Agent: 태스크 분해 및 조율
 * - User Analyst: 사용자 니즈 분석
 * - Searcher Agent: 차량 데이터 검색
 * - Reflector Agent: 만족도 검증 및 재추천
 */

export interface SubTask {
  id: string;
  type: 'user_analysis' | 'vehicle_search' | 'personalization' | 'validation';
  description: string;
  priority: number;
}

export interface AgentAssignment {
  agentType: 'manager' | 'user_analyst' | 'searcher' | 'reflector';
  task: SubTask;
  dependencies?: string[];
}

export interface AgentResult {
  taskId: string;
  agentType: string;
  result: any;
  confidence: number;
  executionTime: number;
}

export interface UserProfile {
  budget_range: [number, number];
  preferred_brands: string[];
  family_size: number;
  usage_pattern: 'daily' | 'weekend' | 'business';
  priorities: {
    price: number;
    fuel_efficiency: number;
    safety: number;
    performance: number;
    comfort: number;
    brand_reputation: number;
  };
  constraints: {
    max_mileage?: number;
    min_year?: number;
    required_features: string[];
  };
}

export interface MACRecRecommendation {
  vehicles: any[];
  userProfile: UserProfile;
  reasoning: string;
  confidence: number;
  alternativeOptions: any[];
}

export interface ValidationResult {
  isValid: boolean;
  satisfactionScore: number;
  needsImprovement: boolean;
  improvementSuggestions?: {
    adjustedProfile?: Partial<UserProfile>;
    newSearchCriteria?: any;
    reranking_needed?: boolean;
  };
}

/**
 * MACRec 프로토콜 구현
 *
 * 논문의 핵심:
 * 1. Task Decomposition (Manager)
 * 2. Agent Assignment (Manager)
 * 3. Parallel Execution (All Agents)
 * 4. Result Aggregation (Manager)
 * 5. Reflection & Feedback (Reflector)
 */
export class MACRecProtocol {

  /**
   * Step 1: Manager Agent - 사용자 요청을 서브태스크로 분해
   */
  decomposeTask(userRequest: string): SubTask[] {

    // MACRec 논문의 Task Decomposition 적용
    const tasks: SubTask[] = [
      {
        id: 'user_analysis',
        type: 'user_analysis',
        description: '사용자 니즈 및 선호도 분석',
        priority: 1
      },
      {
        id: 'vehicle_search',
        type: 'vehicle_search',
        description: '차량 데이터베이스 검색',
        priority: 2
      },
      {
        id: 'personalization',
        type: 'personalization',
        description: '개인화 추천 생성',
        priority: 3
      }
    ];

    return tasks;
  }

  /**
   * Step 2: Manager Agent - 에이전트별 태스크 할당
   */
  assignAgents(subtasks: SubTask[]): AgentAssignment[] {

    const assignments: AgentAssignment[] = [];

    for (const task of subtasks) {
      switch (task.type) {
        case 'user_analysis':
          assignments.push({
            agentType: 'user_analyst',
            task: task
          });
          break;

        case 'vehicle_search':
          assignments.push({
            agentType: 'searcher',
            task: task,
            dependencies: ['user_analysis'] // 사용자 분석 후 검색
          });
          break;

        case 'personalization':
          assignments.push({
            agentType: 'manager',
            task: task,
            dependencies: ['user_analysis', 'vehicle_search'] // 두 결과 통합
          });
          break;
      }
    }

    return assignments;
  }

  /**
   * Step 3: 병렬 실행 (의존성 고려)
   */
  async executeInParallel(
    assignments: AgentAssignment[],
    userMessage: string,
    needsAnalyst: any,
    dataAnalyst: any
  ): Promise<AgentResult[]> {

    const results: AgentResult[] = [];
    const completedTasks = new Set<string>();

    // 1단계: user_analysis (의존성 없음)
    const userAnalysisTask = assignments.find(a => a.task.type === 'user_analysis');
    if (userAnalysisTask) {
      const startTime = Date.now();

      const userProfile = await needsAnalyst.analyzeAsNeedsAnalyst(userMessage, []);

      results.push({
        taskId: userAnalysisTask.task.id,
        agentType: 'user_analyst',
        result: userProfile,
        confidence: 0.85,
        executionTime: Date.now() - startTime
      });

      completedTasks.add('user_analysis');
    }

    // 2단계: vehicle_search (user_analysis 완료 후)
    const searchTask = assignments.find(a => a.task.type === 'vehicle_search');
    if (searchTask && completedTasks.has('user_analysis')) {
      const startTime = Date.now();

      const userProfile = results.find(r => r.taskId === 'user_analysis')?.result;
      const vehicles = await dataAnalyst.analyzeAsDataAnalyst(userMessage, userProfile);

      results.push({
        taskId: searchTask.task.id,
        agentType: 'searcher',
        result: vehicles,
        confidence: 0.90,
        executionTime: Date.now() - startTime
      });

      completedTasks.add('vehicle_search');
    }

    return results;
  }

  /**
   * Step 4: Manager Agent - 결과 통합 및 최종 추천 생성
   */
  async aggregateResults(
    results: AgentResult[],
    concierge: any,
    userMessage: string
  ): Promise<MACRecRecommendation> {

    const userProfile = results.find(r => r.agentType === 'user_analyst')?.result;
    const vehicles = results.find(r => r.agentType === 'searcher')?.result;

    if (!userProfile || !vehicles) {
      throw new Error('MACRec 프로토콜 실행 중 필수 결과 누락');
    }

    // Concierge Agent가 최종 통합 (MACRec의 Manager 역할)
    const finalRecommendation = await concierge.analyzeAsConcierge(
      userMessage,
      vehicles,
      userProfile,
      vehicles // 추가 컨텍스트
    );

    // MACRec 형식으로 결과 구성
    return {
      vehicles: finalRecommendation.recommendations || [],
      userProfile: userProfile,
      reasoning: finalRecommendation.reasoning || '종합 분석 완료',
      confidence: 0.88,
      alternativeOptions: vehicles.slice(0, 10) // 상위 10개 대안
    };
  }

  /**
   * Step 5: Reflector Agent - 추천 결과 검증 및 재추천 판단
   */
  async validateRecommendation(
    recommendation: MACRecRecommendation,
    userFeedback?: string
  ): Promise<ValidationResult> {

    if (!userFeedback) {
      // 초기 추천 - 기본적으로 유효
      return {
        isValid: true,
        satisfactionScore: 0.8,
        needsImprovement: false
      };
    }

    // 사용자 피드백 분석 (Gemini API 활용)
    const feedbackAnalysis = await this.analyzeFeedback(userFeedback);

    if (feedbackAnalysis.sentiment === 'negative') {
      // 불만족 - 재추천 필요
      return {
        isValid: false,
        satisfactionScore: feedbackAnalysis.satisfactionScore,
        needsImprovement: true,
        improvementSuggestions: {
          adjustedProfile: feedbackAnalysis.profileAdjustments,
          reranking_needed: true
        }
      };
    }

    return {
      isValid: true,
      satisfactionScore: feedbackAnalysis.satisfactionScore,
      needsImprovement: false
    };
  }

  /**
   * 사용자 피드백 분석 (MACRec Reflector Agent)
   */
  private async analyzeFeedback(feedback: string): Promise<any> {

    // 간단한 키워드 기반 분석 (추후 Gemini API로 개선)
    const negativeKeywords = ['비싸', '싫어', '마음에 안', '다른', '다시'];
    const priceKeywords = ['비싸', '가격', '저렴', '예산'];
    const safetyKeywords = ['안전', '사고', '가족'];

    const isNegative = negativeKeywords.some(keyword =>
      feedback.includes(keyword)
    );

    const profileAdjustments: Partial<UserProfile> = {};

    if (priceKeywords.some(k => feedback.includes(k))) {
      profileAdjustments.priorities = {
        price: 0.4, // 가격 중요도 증가
        fuel_efficiency: 0.15,
        safety: 0.15,
        performance: 0.1,
        comfort: 0.1,
        brand_reputation: 0.1
      };
    }

    if (safetyKeywords.some(k => feedback.includes(k))) {
      profileAdjustments.priorities = {
        price: 0.2,
        fuel_efficiency: 0.1,
        safety: 0.4, // 안전 중요도 증가
        performance: 0.1,
        comfort: 0.1,
        brand_reputation: 0.1
      };
    }

    return {
      sentiment: isNegative ? 'negative' : 'positive',
      satisfactionScore: isNegative ? 0.3 : 0.8,
      profileAdjustments
    };
  }
}

/**
 * MACRec 프로토콜 실행 함수
 *
 * CarFin의 기존 에이전트들을 MACRec 프레임워크로 통합
 */
export async function executeMACRecProtocol(
  userMessage: string,
  needsAnalyst: any,
  dataAnalyst: any,
  concierge: any
): Promise<MACRecRecommendation> {

  const protocol = new MACRecProtocol();

  // Step 1: Manager가 태스크 분해
  const subtasks = protocol.decomposeTask(userMessage);
  console.log('🔄 MACRec Step 1: 태스크 분해 완료', subtasks.length);

  // Step 2: 에이전트 할당
  const assignments = protocol.assignAgents(subtasks);
  console.log('🔄 MACRec Step 2: 에이전트 할당 완료', assignments.length);

  // Step 3: 병렬 실행
  const results = await protocol.executeInParallel(
    assignments,
    userMessage,
    needsAnalyst,
    dataAnalyst
  );
  console.log('🔄 MACRec Step 3: 병렬 실행 완료', results.length);

  // Step 4: 결과 통합
  const recommendation = await protocol.aggregateResults(
    results,
    concierge,
    userMessage
  );
  console.log('🔄 MACRec Step 4: 결과 통합 완료');

  // Step 5: 기본 검증
  const validation = await protocol.validateRecommendation(recommendation);
  console.log('🔄 MACRec Step 5: 검증 완료', validation.satisfactionScore);

  return recommendation;
}

/**
 * 재추천 실행 함수 (MACRec Reflector 기반)
 */
export async function executeReRecommendation(
  originalRecommendation: MACRecRecommendation,
  userFeedback: string,
  needsAnalyst: any,
  dataAnalyst: any,
  concierge: any
): Promise<MACRecRecommendation> {

  const protocol = new MACRecProtocol();

  // Reflector가 피드백 분석
  const validation = await protocol.validateRecommendation(
    originalRecommendation,
    userFeedback
  );

  if (!validation.needsImprovement) {
    return originalRecommendation; // 재추천 불필요
  }

  // 프로필 업데이트 후 재실행
  const improvedUserMessage = `${userFeedback}을 고려하여 다시 추천해주세요`;

  return await executeMACRecProtocol(
    improvedUserMessage,
    needsAnalyst,
    dataAnalyst,
    concierge
  );
}