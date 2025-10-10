import type { Vehicle } from "@shared/types/vehicle";
import type { HyundaiReview } from "@shared/schema";
import type { AgentTask, AgentResult } from "./ManagerAgent";
import { rankVehiclesWithTOPSIS, UserDrivingProfile } from "../topsis/VehicleTOPSISAdapter";
import { UserPreferenceProfile } from "../topsis/TOPSISEngine";

/**
 * Vehicle Recommendation (평가 결과)
 */
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

/**
 * Evaluator Agent - MACRec Protocol
 *
 * 역할:
 * 1. TOPSIS 다기준 평가
 * 2. TCO 계산
 * 3. 순위 결정
 */
export class EvaluatorAgent {
  private agentId = 'evaluator';

  /**
   * Execute Agent Task
   */
  async execute(
    task: AgentTask,
    vehicles: Vehicle[],
    userProfile?: any
  ): Promise<AgentResult> {
    const startTime = Date.now();

    console.log(`🔍 Evaluator Agent: ${task.action} 시작 (${vehicles.length}대 평가)`);

    try {
      let output: any;

      switch (task.action) {
        case 'rank_vehicles':
          output = await this.rankVehicles(vehicles, task.input.userProfile || userProfile);
          break;

        case 'evaluate_topsis':
          output = await this.evaluateTOPSIS(vehicles, task.input);
          break;

        default:
          throw new Error(`Unknown action: ${task.action}`);
      }

      const executionTime = Date.now() - startTime;

      console.log(`✅ Evaluator Agent: Top ${output.length}개 추천 (${executionTime}ms)`);

      return {
        taskId: task.taskId,
        agent: this.agentId,
        success: true,
        output,
        executionTime,
        timestamp: new Date()
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Evaluator Agent: ${task.action} 실패`, error);

      return {
        taskId: task.taskId,
        agent: this.agentId,
        success: false,
        output: { error: error instanceof Error ? error.message : 'Unknown error' },
        executionTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Rank Vehicles (차량 순위 결정)
   */
  private async rankVehicles(vehicles: Vehicle[], userProfile?: any): Promise<VehicleRecommendation[]> {
    console.log(`🎯 TOPSIS + TCO 평가 시작: ${vehicles.length}개 차량`);

    // 1. 사용자 프로필 → TOPSIS 가중치 변환
    const topsisProfile: UserPreferenceProfile = {
      priceWeight: (userProfile?.priceWeight ?? 5) / 10,
      performanceWeight: (userProfile?.performanceWeight ?? 5) / 10,
      brandWeight: (userProfile?.brandWeight ?? 5) / 10,
      fuelEfficiencyWeight: (userProfile?.fuelEfficiencyWeight ?? 5) / 10,
      safetyWeight: (userProfile?.safetyWeight ?? 5) / 10,
      designWeight: (userProfile?.designWeight ?? 5) / 10
    };

    // 2. TCO 계산용 주행 프로필
    const drivingProfile: UserDrivingProfile = {
      annualKm: userProfile?.annualKm || 15000,
      ownershipYears: userProfile?.ownershipYears || 3
    };

    console.log(`⚖️ TOPSIS 가중치:`, topsisProfile);
    console.log(`🚗 TCO 조건: ${drivingProfile.annualKm}km/년, ${drivingProfile.ownershipYears}년`);

    // 3. TOPSIS + TCO 평가
    const topsisResult = await rankVehiclesWithTOPSIS(
      vehicles.slice(0, 50),
      topsisProfile,
      drivingProfile
    );

    // 4. VehicleRecommendation 형식으로 변환
    const recommendations: VehicleRecommendation[] = topsisResult.ranking.map(r => {
      const tcoData = r.alternative.metadata?.tcoBreakdown;
      const tcoTotal = tcoData
        ? (tcoData.acquisitionTax + tcoData.vehicleTax + tcoData.maintenance + tcoData.depreciation + tcoData.fuelCost)
        : 0;

      return {
        vehicle: {
          ...r.alternative.metadata.vehicle,
          tco: tcoData ? {
            total: tcoTotal,
            breakdown: tcoData,
            confidence: r.alternative.metadata.tcoConfidence || 0.7,
            ownershipYears: drivingProfile.ownershipYears,
            timeline: r.alternative.metadata.tcoTimeline
          } : undefined
        },
        rank: r.rank,
        score: r.score * 100,
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

    console.log(`✅ TOPSIS + TCO 평가 완료: Top ${recommendations.length}개 선정`);

    return recommendations;
  }

  /**
   * Evaluate TOPSIS (TOPSIS 평가만)
   */
  private async evaluateTOPSIS(vehicles: Vehicle[], input: any): Promise<VehicleRecommendation[]> {
    return this.rankVehicles(vehicles, input.userProfile);
  }
}
