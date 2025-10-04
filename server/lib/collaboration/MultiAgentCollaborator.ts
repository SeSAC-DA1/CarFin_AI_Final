/**
 * MACRec 기반 멀티 에이전트 협업 시스템
 * SIGIR 2024 논문 기반 - Multi-Agent Collaborative Recommendation
 * 
 * 3개 에이전트 협업 구조:
 * - Needs Analyst (40%): 사용자 니즈 분석
 * - Data Analyst (35%): 데이터 기반 분석
 * - Concierge (25%): 종합 조율 및 최종 추천
 */

import { Vehicle } from "@shared/schema";

export interface AgentRole {
  id: string;
  name: string;
  nameKo: string;
  weight: number;
  description: string;
  specialty: string;
}

export const AGENT_ROLES: Record<string, AgentRole> = {
  needs_analyst: {
    id: 'needs_analyst',
    name: 'Needs Analyst',
    nameKo: '니즈 분석',
    weight: 0.40,
    description: '사용자의 요구사항과 라이프스타일을 분석하는 전문가',
    specialty: '개인 라이프스타일 및 용도 분석, 우선순위 파악'
  },
  data_analyst: {
    id: 'data_analyst',
    name: 'Data Analyst',
    nameKo: '데이터 분석',
    weight: 0.35,
    description: '차량 데이터와 시장 정보를 분석하는 전문가',
    specialty: '시장 데이터 및 TCO 분석, 가성비 평가'
  },
  concierge: {
    id: 'concierge',
    name: 'Concierge',
    nameKo: '컨시어지',
    weight: 0.25,
    description: '에이전트 의견을 종합하고 최종 추천을 제공하는 조율자',
    specialty: '에이전트 의견 통합 및 개인화된 추천'
  }
};

export interface AgentAnalysis {
  agentId: string;
  agentName: string;
  confidence: number;
  keyFindings: string[];
  recommendedVehicleIds: string[];
  concerns: string[];
  reasoning: string;
}

export interface CollaborationResult {
  finalRecommendations: {
    vehicleId: string;
    score: number;
    rank: number;
    reasons: string[];
  }[];
  agentAnalyses: AgentAnalysis[];
  consensusAreas: string[];
  timestamp: Date;
}

export interface UserQuery {
  message: string;
  budget?: {
    min: number;
    max: number;
  };
  preferences?: {
    fuel?: string;
    category?: string;
    brand?: string;
  };
}

/**
 * 멀티 에이전트 협업자
 * MACRec 논문의 가중치 기반 협업 방식 구현
 */
export class MultiAgentCollaborator {
  /**
   * 각 에이전트의 분석을 가중 평균하여 최종 추천 생성
   */
  async collaborate(
    userQuery: UserQuery,
    vehicles: Vehicle[],
    agentAnalyses: AgentAnalysis[]
  ): Promise<CollaborationResult> {
    console.log('🤝 Multi-Agent Collaboration 시작');
    console.log(`📊 ${agentAnalyses.length}개 에이전트 분석 통합 중...`);

    const vehicleScores = new Map<string, number>();
    const vehicleReasons = new Map<string, Set<string>>();

    for (const analysis of agentAnalyses) {
      const agent = AGENT_ROLES[analysis.agentId];
      if (!agent) continue;

      const weight = agent.weight * analysis.confidence;

      for (const vehicleId of analysis.recommendedVehicleIds) {
        const currentScore = vehicleScores.get(vehicleId) || 0;
        vehicleScores.set(vehicleId, currentScore + weight);

        if (!vehicleReasons.has(vehicleId)) {
          vehicleReasons.set(vehicleId, new Set());
        }
        vehicleReasons.get(vehicleId)!.add(`${agent.nameKo}: ${analysis.reasoning}`);
      }
    }

    const sortedVehicles = Array.from(vehicleScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([vehicleId, score], index) => ({
        vehicleId,
        score,
        rank: index + 1,
        reasons: Array.from(vehicleReasons.get(vehicleId) || [])
      }));

    const consensusAreas = this.findConsensusAreas(agentAnalyses);

    console.log('✅ Collaboration 완료:', {
      topVehicle: sortedVehicles[0]?.vehicleId,
      consensusCount: consensusAreas.length
    });

    return {
      finalRecommendations: sortedVehicles,
      agentAnalyses,
      consensusAreas,
      timestamp: new Date()
    };
  }

  /**
   * 에이전트 간 합의 영역 찾기
   * 2개 이상의 에이전트가 공통으로 언급한 사항 추출
   */
  private findConsensusAreas(analyses: AgentAnalysis[]): string[] {
    const findingCounts = new Map<string, number>();

    for (const analysis of analyses) {
      for (const finding of analysis.keyFindings) {
        const normalized = finding.toLowerCase().trim();
        findingCounts.set(normalized, (findingCounts.get(normalized) || 0) + 1);
      }
    }

    return Array.from(findingCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([finding, _]) => finding);
  }

  /**
   * 에이전트별 분석 요약
   */
  getAgentSummary(analysis: AgentAnalysis): string {
    const agent = AGENT_ROLES[analysis.agentId];
    return `
**${agent.nameKo}** (신뢰도: ${(analysis.confidence * 100).toFixed(0)}%)
- ${analysis.reasoning}
- 핵심 발견: ${analysis.keyFindings.join(', ')}
${analysis.concerns.length > 0 ? `- 우려사항: ${analysis.concerns.join(', ')}` : ''}
    `.trim();
  }
}

/**
 * 간단한 규칙 기반 에이전트 분석 생성
 * (Gemini API 연동 전 임시 구현)
 */
export class RuleBasedAgentAnalyzer {
  analyzeAsNeedsAnalyst(query: UserQuery, vehicles: Vehicle[]): AgentAnalysis {
    const keyFindings: string[] = [];
    const recommendedVehicleIds: string[] = [];
    const concerns: string[] = [];

    if (query.budget) {
      keyFindings.push(`예산 범위: ${query.budget.min}~${query.budget.max}만원`);
    }

    if (query.preferences?.fuel) {
      keyFindings.push(`선호 연료: ${query.preferences.fuel}`);
      const fuelMatches = vehicles.filter(v => v.fuel === query.preferences!.fuel);
      recommendedVehicleIds.push(...fuelMatches.slice(0, 5).map(v => v.id));
    }

    if (recommendedVehicleIds.length === 0) {
      recommendedVehicleIds.push(...vehicles.slice(0, 5).map(v => v.id));
    }

    return {
      agentId: 'needs_analyst',
      agentName: '니즈 분석',
      confidence: 0.85,
      keyFindings,
      recommendedVehicleIds,
      concerns,
      reasoning: '사용자의 예산과 선호도를 기반으로 적합한 차량을 선별했습니다.'
    };
  }

  analyzeAsDataAnalyst(query: UserQuery, vehicles: Vehicle[]): AgentAnalysis {
    const keyFindings: string[] = [];
    const recommendedVehicleIds: string[] = [];

    const sortedByValue = [...vehicles].sort((a, b) => {
      const aValue = (a.safety + (a.fuelEfficiency || 10) + a.reliability) / a.price;
      const bValue = (b.safety + (b.fuelEfficiency || 10) + b.reliability) / b.price;
      return bValue - aValue;
    });

    recommendedVehicleIds.push(...sortedByValue.slice(0, 5).map(v => v.id));

    keyFindings.push('가성비 우수 차량 중심 선별');
    keyFindings.push('안전성, 연비, 신뢰성 종합 평가');

    return {
      agentId: 'data_analyst',
      agentName: '데이터 분석',
      confidence: 0.90,
      keyFindings,
      recommendedVehicleIds,
      concerns: [],
      reasoning: '객관적인 데이터 분석을 통해 가성비가 우수한 차량을 추천합니다.'
    };
  }

  analyzeAsConcierge(
    query: UserQuery,
    vehicles: Vehicle[],
    needsAnalysis: AgentAnalysis,
    dataAnalysis: AgentAnalysis
  ): AgentAnalysis {
    const recommendedVehicleIds = [
      ...new Set([
        ...needsAnalysis.recommendedVehicleIds.slice(0, 3),
        ...dataAnalysis.recommendedVehicleIds.slice(0, 3)
      ])
    ];

    const keyFindings = [
      '니즈 분석과 데이터 분석 결과 종합',
      '사용자 만족도와 객관적 가치 균형'
    ];

    return {
      agentId: 'concierge',
      agentName: '컨시어지',
      confidence: 0.88,
      keyFindings,
      recommendedVehicleIds,
      concerns: [],
      reasoning: '두 전문가의 의견을 종합하여 최적의 선택지를 제시합니다.'
    };
  }
}
