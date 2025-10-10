import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Task Definition for MACRec Protocol
 */
export interface AgentTask {
  taskId: string;
  agent: 'user_analyst' | 'searcher' | 'evaluator';
  action: string;
  priority: number;
  dependencies: string[];
  input: any;
}

/**
 * Agent Execution Result
 */
export interface AgentResult {
  taskId: string;
  agent: string;
  success: boolean;
  output: any;
  executionTime: number;
  timestamp: Date;
}

/**
 * Manager Agent - MACRec Task Decomposition
 *
 * Implements SIGIR 2024 MACRec Protocol:
 * 1. Task Decomposition (동적 작업 분해)
 * 2. Coordination (에이전트 조율)
 * 3. Result Aggregation (결과 합의)
 */
export class ManagerAgent {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Phase 1: Task Decomposition (동적 작업 분해)
   *
   * MACRec Protocol:
   * - 사용자 요청을 분석하여 필요한 작업 식별
   * - 각 작업을 담당 에이전트에 할당
   * - 의존성 파악 (병렬 vs 순차)
   */
  async decompose(userMessage: string, extractedProfile: any): Promise<AgentTask[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `당신은 MACRec Multi-Agent 시스템의 Manager Agent입니다.
사용자 요청을 분석하여 작업을 분해하고 각 에이전트에 할당하세요.

사용자 메시지: "${userMessage}"
추출된 프로필: ${JSON.stringify(extractedProfile)}

**사용 가능한 에이전트**:
1. **user_analyst**: 사용자 프로필 분석, 니즈 파악, 선호도 추출
2. **searcher**: 차량 데이터베이스 검색, 필터링, 브랜드 다양성 확보
3. **evaluator**: TOPSIS 다기준 평가, TCO 계산, 순위 결정

**작업 분해 원칙**:
- 병렬 실행 가능한 작업은 dependencies를 빈 배열로 설정
- 순차 실행 필요한 작업은 dependencies에 선행 taskId 명시
- priority는 1(높음) ~ 5(낮음)

다음 JSON 형식으로 응답하세요:
{
  "tasks": [
    {
      "taskId": "task_1",
      "agent": "user_analyst",
      "action": "analyze_user_needs",
      "priority": 1,
      "dependencies": [],
      "input": { "userMessage": "...", "profile": {...} }
    },
    {
      "taskId": "task_2",
      "agent": "searcher",
      "action": "filter_vehicles",
      "priority": 1,
      "dependencies": [],
      "input": { "criteria": {...} }
    },
    {
      "taskId": "task_3",
      "agent": "evaluator",
      "action": "rank_vehicles",
      "priority": 2,
      "dependencies": ["task_1", "task_2"],
      "input": {}
    }
  ]
}

**중요**: JSON만 반환하세요. 다른 설명은 포함하지 마세요.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      // JSON 추출
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ Manager Agent: JSON 파싱 실패, fallback 사용');
        return this.fallbackDecompose(userMessage, extractedProfile);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const tasks: AgentTask[] = parsed.tasks || [];

      console.log(`🎯 Manager Agent: ${tasks.length}개 작업 분해 완료`);
      console.log(`📋 작업 목록:`, tasks.map(t => `${t.taskId}(${t.agent})`).join(', '));

      return tasks;

    } catch (error) {
      console.error('❌ Manager Agent decompose 에러:', error);
      return this.fallbackDecompose(userMessage, extractedProfile);
    }
  }

  /**
   * Fallback Task Decomposition (LLM 실패 시)
   */
  private fallbackDecompose(userMessage: string, extractedProfile: any): AgentTask[] {
    console.log('🔄 Fallback decompose 사용');

    const hasBudget = !!extractedProfile.budget;
    const hasCarType = !!extractedProfile.carType;

    // 구체적 요청 → 병렬 실행
    if (hasBudget || hasCarType) {
      return [
        {
          taskId: 'task_1',
          agent: 'user_analyst',
          action: 'quick_profile_analysis',
          priority: 1,
          dependencies: [],
          input: { userMessage, profile: extractedProfile }
        },
        {
          taskId: 'task_2',
          agent: 'searcher',
          action: 'filter_vehicles',
          priority: 1,
          dependencies: [],
          input: { criteria: extractedProfile }
        },
        {
          taskId: 'task_3',
          agent: 'evaluator',
          action: 'rank_vehicles',
          priority: 2,
          dependencies: ['task_1', 'task_2'],
          input: {}
        }
      ];
    }

    // 모호한 요청 → 순차 실행
    return [
      {
        taskId: 'task_1',
        agent: 'user_analyst',
        action: 'extract_user_needs',
        priority: 1,
        dependencies: [],
        input: { userMessage }
      },
      {
        taskId: 'task_2',
        agent: 'user_analyst',
        action: 'analyze_preferences',
        priority: 2,
        dependencies: ['task_1'],
        input: { userMessage }
      },
      {
        taskId: 'task_3',
        agent: 'searcher',
        action: 'filter_vehicles',
        priority: 3,
        dependencies: ['task_2'],
        input: {}
      },
      {
        taskId: 'task_4',
        agent: 'evaluator',
        action: 'rank_vehicles',
        priority: 4,
        dependencies: ['task_3'],
        input: {}
      }
    ];
  }

  /**
   * Phase 3: Result Aggregation (결과 합의)
   *
   * MACRec Protocol:
   * - 각 에이전트의 결과를 종합
   * - 충돌 해결 (Conflict Resolution)
   * - 최종 추천 생성
   */
  async aggregate(results: AgentResult[]): Promise<any> {
    console.log(`🧩 Manager Agent: ${results.length}개 결과 합의 중...`);

    // 성공한 결과만 필터링
    const successResults = results.filter(r => r.success);

    if (successResults.length === 0) {
      console.error('❌ Manager Agent: 성공한 결과 없음');
      throw new Error('All agent tasks failed');
    }

    // 각 에이전트별로 결과 그룹화
    const userAnalystResults = successResults.filter(r => r.agent === 'user_analyst');
    const searcherResults = successResults.filter(r => r.agent === 'searcher');
    const evaluatorResults = successResults.filter(r => r.agent === 'evaluator');

    console.log(`📊 User Analyst: ${userAnalystResults.length}개 결과`);
    console.log(`📊 Searcher: ${searcherResults.length}개 결과`);
    console.log(`📊 Evaluator: ${evaluatorResults.length}개 결과`);

    // 합의된 결과 구성
    const consensus = {
      userProfile: userAnalystResults[userAnalystResults.length - 1]?.output || {},
      vehiclesCandidates: searcherResults[searcherResults.length - 1]?.output || [],
      rankedVehicles: evaluatorResults[evaluatorResults.length - 1]?.output || [],
      aggregationMetadata: {
        totalResults: results.length,
        successResults: successResults.length,
        avgExecutionTime: successResults.reduce((sum, r) => sum + r.executionTime, 0) / successResults.length,
        timestamp: new Date()
      }
    };

    console.log(`✅ Manager Agent: 합의 완료 (Top ${consensus.rankedVehicles.length}개 차량)`);

    return consensus;
  }

  /**
   * 🆕 Phase 3-E: Voting-Based Result Aggregation (투표 기반 합의)
   *
   * MACRec Consensus Protocol:
   * - 각 에이전트의 추천 결과를 투표로 집계
   * - 에이전트별 가중치 적용 (User Analyst: 0.3, Searcher: 0.3, Evaluator: 0.4)
   * - 충돌 해결 및 합의 수준 평가
   *
   * @param agentRecommendations - 각 에이전트의 추천 결과 배열
   * @returns ConsensusResult - 투표 기반 최종 합의 결과
   */
  async voteBasedAggregation(agentRecommendations: {
    agent: string;
    recommendations: Array<{ vehicleId: number; rank: number; score: number; reason?: string }>;
  }[]): Promise<any> {
    console.log(`🗳️ Manager Agent: 투표 기반 합의 시작 (${agentRecommendations.length}개 에이전트)`);

    const startTime = Date.now();

    // 에이전트 가중치 (MACRec 논문 기반)
    const agentWeights: Record<string, number> = {
      'user_analyst': 0.30,  // 사용자 니즈 분석 (30%)
      'searcher': 0.30,      // 브랜드 다양성 확보 (30%)
      'evaluator': 0.40      // TOPSIS 객관적 평가 (40%)
    };

    // 1. 모든 추천 차량 수집
    const allVehicleIds = new Set<number>();
    agentRecommendations.forEach(ar => {
      ar.recommendations.forEach(rec => allVehicleIds.add(rec.vehicleId));
    });

    console.log(`📋 총 후보 차량: ${allVehicleIds.size}대`);

    // 2. 각 차량별로 투표 집계
    const votingResults: any[] = [];

    for (const vehicleId of allVehicleIds) {
      const votes: any[] = [];
      let weightedScore = 0;

      // 각 에이전트의 투표 수집
      agentRecommendations.forEach(ar => {
        const rec = ar.recommendations.find(r => r.vehicleId === vehicleId);

        if (rec) {
          const agentWeight = agentWeights[ar.agent] || 0.33;
          const voteScore = rec.score * agentWeight;

          votes.push({
            agent: ar.agent,
            rank: rec.rank,
            score: rec.score,
            agentWeight,
            reason: rec.reason || ''
          });

          weightedScore += voteScore;
        }
      });

      // 합의 수준 판단
      let agreement: 'unanimous' | 'majority' | 'conflict';
      if (votes.length === agentRecommendations.length) {
        // 모든 에이전트가 추천 → unanimous
        const rankVariance = this.calculateVariance(votes.map(v => v.rank));
        agreement = rankVariance < 1.0 ? 'unanimous' : 'majority';
      } else if (votes.length >= Math.ceil(agentRecommendations.length / 2)) {
        // 절반 이상 추천 → majority
        agreement = 'majority';
      } else {
        // 절반 미만 → conflict
        agreement = 'conflict';
      }

      votingResults.push({
        vehicleId,
        votes,
        weightedScore,
        agreement
      });
    }

    // 3. 가중 점수로 정렬 (내림차순)
    votingResults.sort((a, b) => b.weightedScore - a.weightedScore);

    console.log(`🔝 Top 5 차량 (가중 점수):`);
    votingResults.slice(0, 5).forEach((vr, idx) => {
      console.log(`  ${idx + 1}. 차량 #${vr.vehicleId} - Score: ${vr.weightedScore.toFixed(2)} (${vr.agreement})`);
    });

    // 4. 합의 메타데이터 계산
    const unanimousCount = votingResults.filter(vr => vr.agreement === 'unanimous').length;
    const majorityCount = votingResults.filter(vr => vr.agreement === 'majority').length;
    const conflictCount = votingResults.filter(vr => vr.agreement === 'conflict').length;

    // 평균 합의 점수 (0-1 스케일)
    const avgAgreementScore = votingResults.reduce((sum, vr) => {
      const voteRatio = vr.votes.length / agentRecommendations.length;
      return sum + voteRatio;
    }, 0) / votingResults.length;

    const executionTime = Date.now() - startTime;

    // 5. ConsensusResult 구성
    const consensusResult = {
      votingResults,  // 전체 투표 결과
      votingMetadata: {
        totalVotes: votingResults.length,
        unanimousCount,
        majorityCount,
        conflictCount,
        avgAgreementScore,
        executionTime
      }
    };

    console.log(`✅ Manager Agent: 투표 합의 완료 (${executionTime}ms)`);
    console.log(`   - Unanimous: ${unanimousCount}대`);
    console.log(`   - Majority: ${majorityCount}대`);
    console.log(`   - Conflict: ${conflictCount}대`);
    console.log(`   - Avg Agreement: ${(avgAgreementScore * 100).toFixed(1)}%`);

    return consensusResult;
  }

  /**
   * 분산 계산 (합의 수준 판단용)
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    return variance;
  }

  /**
   * Task Priority Sorting (우선순위 정렬)
   */
  sortTasksByPriority(tasks: AgentTask[]): AgentTask[] {
    return tasks.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Identify Parallel Tasks (병렬 실행 가능 작업 식별)
   */
  identifyParallelTasks(tasks: AgentTask[]): { parallel: AgentTask[][], sequential: AgentTask[] } {
    const parallel: AgentTask[][] = [];
    const sequential: AgentTask[] = [];

    // Round 0: 의존성 없는 작업들 (병렬 실행 가능)
    const round0 = tasks.filter(t => t.dependencies.length === 0);
    if (round0.length > 0) {
      parallel.push(round0);
    }

    // Round 1+: 의존성 있는 작업들 (순차 실행)
    const dependent = tasks.filter(t => t.dependencies.length > 0);
    sequential.push(...dependent);

    console.log(`🔀 병렬 실행 가능: ${round0.length}개 작업`);
    console.log(`➡️ 순차 실행 필요: ${dependent.length}개 작업`);

    return { parallel, sequential };
  }
}
