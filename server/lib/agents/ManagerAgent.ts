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
