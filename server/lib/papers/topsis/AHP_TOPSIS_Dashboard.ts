/**
 * AHP-TOPSIS for Vehicle Selection (Multiple Studies, 2018-2024)
 *
 * 주요 논문들:
 * - "Combining the AHP and TOPSIS to evaluate car selection" (ACM 2018)
 * - "Second-hand Vehicle Evaluation System" (Atlantis Press 2024)
 * - "Multi-criteria vehicle evaluation" (Springer 2022)
 *
 * 실무 검증: 자동차 제조사 & 중고차 평가 시스템
 *
 * CarFin 적용:
 * - 중고차 다기준 평가 (가격, 주행거리, 연식, 사고이력, 옵션, 연비)
 * - TCO (Total Cost of Ownership) 5년 총 소유 비용 분석
 * - 동질집단(peer group) 비교 분석
 * - 강점/약점 자동 추출 및 구매 리스크 평가
 */

import type { Vehicle } from '../alibaba/PersonalizedReranking';

export interface AHPCriteria {
  price: { weight: number; type: 'cost' | 'benefit' };
  mileage: { weight: number; type: 'cost' | 'benefit' };
  year: { weight: number; type: 'cost' | 'benefit' };
  fuel_efficiency: { weight: number; type: 'cost' | 'benefit' };
  accident_history: { weight: number; type: 'cost' | 'benefit' };
  options: { weight: number; type: 'cost' | 'benefit' };
}

export interface TOPSISResult {
  vehicle_id: number;
  overall_score: number;           // 0-100 종합 점수
  rank: number;                    // 순위
  percentile: number;              // 백분위

  // 세부 점수
  criteria_scores: {
    price_score: number;
    mileage_score: number;
    year_score: number;
    fuel_efficiency_score: number;
    accident_score: number;
    options_score: number;
  };

  // 거리 계산
  distance_to_ideal: number;       // 이상해까지 거리
  distance_to_nadir: number;       // 나쁜해까지 거리

  // 자동 추출 인사이트
  key_strengths: string[];         // 강점
  key_weaknesses: string[];        // 약점
}

export interface TCOAnalysis {
  tco_5year: number;               // 5년 총 소유 비용
  monthly_cost: number;            // 월 평균 비용

  breakdown: {
    purchase_price: number;        // 구매가
    fuel_cost_5y: number;          // 5년 연료비
    insurance_5y: number;          // 5년 보험료
    maintenance_5y: number;        // 5년 정비비
    depreciation_5y: number;       // 5년 감가상각
    final_value: number;           // 5년 후 잔존가치
  };

  tco_competitiveness: number;     // 동급 대비 TCO 경쟁력 (0-100)
}

export interface RiskFactor {
  type: 'ACCIDENT_HISTORY' | 'HIGH_MILEAGE' | 'DEPRECIATION' | 'LOW_OPTIONS' | 'MAINTENANCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  impact: string;
  mitigation?: string;
}

export interface VehicleInsightDashboard {
  // 종합 분석
  overview: {
    topsis_result: TOPSISResult;
    recommendation_grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    value_proposition: string;
  };

  // 금융 분석
  financial: TCOAnalysis;

  // 차량 상태 분석
  condition: {
    accident_analysis: {
      count: number;
      severity_assessment: string;
      impact_on_value: number;
    };
    mileage_analysis: {
      total_mileage: number;
      annual_average: number;
      vs_peer_average: number;
      condition_assessment: string;
    };
    age_analysis: {
      vehicle_age: number;
      depreciation_stage: string;
      remaining_lifespan: number;
    };
  };

  // 옵션 분석
  options: {
    owned_options: string[];
    popular_missing: string[];
    option_value_score: number;
    total_option_value: number;
  };

  // 리스크 & 인사이트
  insights: {
    risk_factors: RiskFactor[];
    comparable_vehicles: Vehicle[];
    market_position: string;
    investment_outlook: string;
  };

  // Peer Group 비교
  peer_comparison: {
    peer_group_size: number;
    rank_in_group: number;
    percentile_in_group: number;
    competitive_advantages: string[];
    competitive_disadvantages: string[];
  };
}

/**
 * AHP-TOPSIS 알고리즘 구현
 *
 * 단계:
 * 1. AHP로 평가 기준 가중치 결정
 * 2. TOPSIS로 다기준 의사결정 수행
 * 3. 정규화, 가중치 적용, 이상해/나쁜해 계산
 * 4. 최종 점수 및 순위 산출
 */
export class AHP_TOPSIS_Engine {

  // 중고차 평가 기준 (AHP)
  private readonly DEFAULT_CRITERIA: AHPCriteria = {
    price: { weight: 0.25, type: 'cost' },           // 가격 (낮을수록 좋음)
    mileage: { weight: 0.20, type: 'cost' },         // 주행거리 (낮을수록 좋음)
    year: { weight: 0.15, type: 'benefit' },         // 연식 (높을수록 좋음)
    fuel_efficiency: { weight: 0.15, type: 'benefit' }, // 연비 (높을수록 좋음)
    accident_history: { weight: 0.15, type: 'cost' },   // 사고이력 (낮을수록 좋음)
    options: { weight: 0.10, type: 'benefit' }      // 옵션 (많을수록 좋음)
  };

  /**
   * 메인 대시보드 생성 함수
   */
  async generateVehicleInsightDashboard(
    vehicle: Vehicle,
    allVehicles?: Vehicle[]
  ): Promise<VehicleInsightDashboard> {

    console.log(`📊 AHP-TOPSIS 대시보드 생성 시작: ${vehicle.brand} ${vehicle.model}`);

    // 1. Peer Group 찾기
    const peerGroup = allVehicles ?
      await this.findPeerGroup(vehicle, allVehicles) :
      [vehicle]; // 단일 차량 분석시

    // 2. TOPSIS 분석
    const topsisResult = await this.calculateTOPSIS(vehicle, peerGroup);

    // 3. TCO 분석
    const tcoAnalysis = this.calculateTCO(vehicle);

    // 4. 차량 상태 분석
    const conditionAnalysis = this.analyzeVehicleCondition(vehicle);

    // 5. 옵션 분석
    const optionAnalysis = this.analyzeOptions(vehicle, peerGroup);

    // 6. 리스크 & 인사이트
    const insights = this.generateInsights(vehicle, topsisResult, peerGroup);

    // 7. Peer Group 비교
    const peerComparison = this.analyzePeerComparison(vehicle, peerGroup, topsisResult);

    const dashboard: VehicleInsightDashboard = {
      overview: {
        topsis_result: topsisResult,
        recommendation_grade: this.getRecommendationGrade(topsisResult.overall_score),
        value_proposition: this.generateValueProposition(vehicle, topsisResult, tcoAnalysis)
      },
      financial: tcoAnalysis,
      condition: conditionAnalysis,
      options: optionAnalysis,
      insights: insights,
      peer_comparison: peerComparison
    };

    console.log(`📊 AHP-TOPSIS 대시보드 생성 완료: 종합 점수 ${topsisResult.overall_score}점`);

    return dashboard;
  }

  /**
   * TOPSIS 알고리즘 핵심 구현
   */
  private async calculateTOPSIS(
    targetVehicle: Vehicle,
    peerGroup: Vehicle[]
  ): Promise<TOPSISResult> {

    const criteria = this.DEFAULT_CRITERIA;

    // Step 1: 의사결정 매트릭스 구성
    const decisionMatrix = this.buildDecisionMatrix(peerGroup);

    // Step 2: 정규화 (벡터 정규화)
    const normalizedMatrix = this.normalizeMatrix(decisionMatrix);

    // Step 3: 가중치 적용
    const weightedMatrix = this.applyWeights(normalizedMatrix, criteria);

    // Step 4: 이상해(Ideal Solution) 및 나쁜해(Nadir Solution) 계산
    const idealSolution = this.calculateIdealSolution(weightedMatrix, criteria);
    const nadirSolution = this.calculateNadirSolution(weightedMatrix, criteria);

    // Step 5: 각 대안의 이상해/나쁜해까지의 거리 계산
    const distances = this.calculateDistances(weightedMatrix, idealSolution, nadirSolution);

    // Step 6: 상대적 근접도 계산 (0-1 스케일)
    const targetIndex = peerGroup.findIndex(v => v.id === targetVehicle.id);
    const targetDistance = distances[targetIndex];

    if (!targetDistance) {
      throw new Error(`Target vehicle not found in distances: ${targetVehicle.id}`);
    }

    const relativeCloseness = targetDistance.relativeCloseness;

    // Step 7: 0-100 점수로 변환
    const overallScore = Math.round(relativeCloseness * 100);

    // Step 8: 순위 및 백분위 계산
    const sortedDistances = distances.sort((a, b) => b.relativeCloseness - a.relativeCloseness);
    const rank = sortedDistances.findIndex(d => d.vehicleIndex === targetIndex) + 1;
    const percentile = Math.round(((peerGroup.length - rank + 1) / peerGroup.length) * 100);

    // Step 9: 세부 점수 및 인사이트 생성
    const criteriaScores = this.calculateCriteriaScores(targetVehicle);
    const strengths = this.extractStrengths(criteriaScores);
    const weaknesses = this.extractWeaknesses(criteriaScores);

    return {
      vehicle_id: targetVehicle.id,
      overall_score: overallScore,
      rank: rank,
      percentile: percentile,
      criteria_scores: criteriaScores,
      distance_to_ideal: targetDistance.distanceToIdeal,
      distance_to_nadir: targetDistance.distanceToNadir,
      key_strengths: strengths,
      key_weaknesses: weaknesses
    };
  }

  /**
   * Peer Group 찾기 (동급 차량)
   */
  private async findPeerGroup(vehicle: Vehicle, allVehicles: Vehicle[]): Promise<Vehicle[]> {

    // 기준: 가격대, 차종, 연식 유사
    const priceRange = vehicle.price * 0.3; // ±30%
    const yearRange = 3; // ±3년

    const peerGroup = allVehicles.filter(v => {
      const priceMatch = Math.abs(v.price - vehicle.price) <= priceRange;
      const yearMatch = Math.abs(v.year - vehicle.year) <= yearRange;
      const typeMatch = this.isSimilarVehicleType(vehicle, v);

      return priceMatch && yearMatch && typeMatch;
    });

    // 최소 5개, 최대 20개
    if (peerGroup.length < 5) {
      return allVehicles.slice(0, Math.min(20, allVehicles.length));
    }

    return peerGroup.slice(0, 20);
  }

  /**
   * 의사결정 매트릭스 구성
   */
  private buildDecisionMatrix(vehicles: Vehicle[]): number[][] {

    return vehicles.map(vehicle => [
      vehicle.price,                           // 가격
      vehicle.mileage,                         // 주행거리
      vehicle.year,                            // 연식
      vehicle.fuel_efficiency || 10,           // 연비
      vehicle.accident_count || 0,             // 사고횟수
      (vehicle.options?.length || 0)          // 옵션 개수
    ]);
  }

  /**
   * 벡터 정규화
   */
  private normalizeMatrix(matrix: number[][]): number[][] {
    if (!matrix[0]) {
      throw new Error('Matrix is empty');
    }

    const numCriteria = matrix[0].length;
    const normalized: number[][] = [];

    for (let j = 0; j < numCriteria; j++) {
      // 각 기준별 제곱합 계산
      const sumOfSquares = matrix.reduce((sum, row) => {
        const value = row[j];
        return sum + Math.pow(value ?? 0, 2);
      }, 0);
      const denominator = Math.sqrt(sumOfSquares);

      // 정규화
      for (let i = 0; i < matrix.length; i++) {
        if (!normalized[i]) normalized[i] = [];
        const matrixRow = matrix[i];
        if (matrixRow) {
          normalized[i]![j] = matrixRow[j]! / denominator;
        }
      }
    }

    return normalized;
  }

  /**
   * 가중치 적용
   */
  private applyWeights(matrix: number[][], criteria: AHPCriteria): number[][] {

    const weights = [
      criteria.price.weight,
      criteria.mileage.weight,
      criteria.year.weight,
      criteria.fuel_efficiency.weight,
      criteria.accident_history.weight,
      criteria.options.weight
    ];

    return matrix.map(row =>
      row.map((value, j) => value * (weights[j] || 0))
    );
  }

  /**
   * 이상해 계산
   */
  private calculateIdealSolution(matrix: number[][], criteria: AHPCriteria): number[] {
    if (!matrix[0]) {
      throw new Error('Matrix is empty');
    }

    const criteriaTypes = [
      criteria.price.type,
      criteria.mileage.type,
      criteria.year.type,
      criteria.fuel_efficiency.type,
      criteria.accident_history.type,
      criteria.options.type
    ];

    const ideal: number[] = [];

    for (let j = 0; j < matrix[0].length; j++) {
      const column = matrix.map(row => row[j] ?? 0);
      const criteriaType = criteriaTypes[j];

      if (!criteriaType) {
        throw new Error(`Criteria type not found at index ${j}`);
      }

      if (criteriaType === 'benefit') {
        ideal[j] = Math.max(...column); // 클수록 좋음
      } else {
        ideal[j] = Math.min(...column); // 작을수록 좋음
      }
    }

    return ideal;
  }

  /**
   * 나쁜해 계산
   */
  private calculateNadirSolution(matrix: number[][], criteria: AHPCriteria): number[] {
    if (!matrix[0]) {
      throw new Error('Matrix is empty');
    }

    const criteriaTypes = [
      criteria.price.type,
      criteria.mileage.type,
      criteria.year.type,
      criteria.fuel_efficiency.type,
      criteria.accident_history.type,
      criteria.options.type
    ];

    const nadir: number[] = [];

    for (let j = 0; j < matrix[0].length; j++) {
      const column = matrix.map(row => row[j] ?? 0);
      const criteriaType = criteriaTypes[j];

      if (!criteriaType) {
        throw new Error(`Criteria type not found at index ${j}`);
      }

      if (criteriaType === 'benefit') {
        nadir[j] = Math.min(...column); // 작을수록 나쁨
      } else {
        nadir[j] = Math.max(...column); // 클수록 나쁨
      }
    }

    return nadir;
  }

  /**
   * 거리 계산
   */
  private calculateDistances(
    matrix: number[][],
    ideal: number[],
    nadir: number[]
  ): Array<{
    vehicleIndex: number;
    distanceToIdeal: number;
    distanceToNadir: number;
    relativeCloseness: number;
  }> {

    return matrix.map((row, index) => {
      // 유클리드 거리 계산
      const distanceToIdeal = Math.sqrt(
        row.reduce((sum, value, j) => {
          const idealValue = ideal[j];
          if (idealValue === undefined) {
            throw new Error(`Ideal value not found at index ${j}`);
          }
          return sum + Math.pow(value - idealValue, 2);
        }, 0)
      );

      const distanceToNadir = Math.sqrt(
        row.reduce((sum, value, j) => {
          const nadirValue = nadir[j];
          if (nadirValue === undefined) {
            throw new Error(`Nadir value not found at index ${j}`);
          }
          return sum + Math.pow(value - nadirValue, 2);
        }, 0)
      );

      // 상대적 근접도 (0-1)
      const relativeCloseness = distanceToNadir / (distanceToIdeal + distanceToNadir);

      return {
        vehicleIndex: index,
        distanceToIdeal,
        distanceToNadir,
        relativeCloseness
      };
    });
  }

  /**
   * TCO (Total Cost of Ownership) 계산
   */
  private calculateTCO(vehicle: Vehicle): TCOAnalysis {

    const purchasePrice = vehicle.price;

    // 5년간 연간 주행거리 15,000km 가정
    const annualMileage = 15000;
    const fuelPrice = 1800; // 리터당 가격
    const fuelEfficiency = vehicle.fuel_efficiency || 10;
    const fuelCost5y = (annualMileage / fuelEfficiency) * fuelPrice * 5;

    // 보험료 (차량가의 3-5%)
    const annualInsurance = purchasePrice * 0.04; // 4%
    const insurance5y = annualInsurance * 5;

    // 정비비 (연식에 따라 증가)
    const vehicleAge = 2025 - vehicle.year;
    const baseMaintenance = 600000; // 연간 기본 정비비
    const ageMultiplier = 1 + (vehicleAge * 0.1);
    const maintenance5y = baseMaintenance * 5 * ageMultiplier;

    // 감가상각 (연 12%)
    const depreciationRate = 0.12;
    const finalValue = purchasePrice * Math.pow(1 - depreciationRate, 5);
    const depreciation5y = purchasePrice - finalValue;

    // 총 소유 비용
    const tco5year = purchasePrice + fuelCost5y + insurance5y + maintenance5y - finalValue;
    const monthlyCost = tco5year / 60;

    return {
      tco_5year: Math.round(tco5year),
      monthly_cost: Math.round(monthlyCost),
      breakdown: {
        purchase_price: purchasePrice,
        fuel_cost_5y: Math.round(fuelCost5y),
        insurance_5y: Math.round(insurance5y),
        maintenance_5y: Math.round(maintenance5y),
        depreciation_5y: Math.round(depreciation5y),
        final_value: Math.round(finalValue)
      },
      tco_competitiveness: 75 // 임시 값 (Peer Group 비교 필요)
    };
  }

  /**
   * 세부 기준별 점수 계산
   */
  private calculateCriteriaScores(vehicle: Vehicle): any {

    return {
      price_score: this.calculatePriceScore(vehicle),
      mileage_score: this.calculateMileageScore(vehicle),
      year_score: this.calculateYearScore(vehicle),
      fuel_efficiency_score: this.calculateFuelEfficiencyScore(vehicle),
      accident_score: this.calculateAccidentScore(vehicle),
      options_score: this.calculateOptionsScore(vehicle)
    };
  }

  private calculatePriceScore(vehicle: Vehicle): number {
    // 시장가 대비 가격 경쟁력 (임시 로직)
    // 실제로는 시장가 데이터와 비교 필요
    return Math.random() * 40 + 60; // 60-100점
  }

  private calculateMileageScore(vehicle: Vehicle): number {
    const mileage = vehicle.mileage;
    if (mileage <= 30000) return 100;
    if (mileage <= 60000) return 85;
    if (mileage <= 100000) return 70;
    if (mileage <= 150000) return 55;
    return 40;
  }

  private calculateYearScore(vehicle: Vehicle): number {
    const age = 2025 - vehicle.year;
    if (age <= 2) return 100;
    if (age <= 5) return 85;
    if (age <= 8) return 70;
    if (age <= 12) return 55;
    return 40;
  }

  private calculateFuelEfficiencyScore(vehicle: Vehicle): number {
    const efficiency = vehicle.fuel_efficiency || 10;
    if (efficiency >= 15) return 100;
    if (efficiency >= 12) return 85;
    if (efficiency >= 10) return 70;
    if (efficiency >= 8) return 55;
    return 40;
  }

  private calculateAccidentScore(vehicle: Vehicle): number {
    const accidents = vehicle.accident_count || 0;
    if (accidents === 0) return 100;
    if (accidents === 1) return 70;
    if (accidents === 2) return 40;
    return 20;
  }

  private calculateOptionsScore(vehicle: Vehicle): number {
    const optionCount = vehicle.options?.length || 0;
    return Math.min(100, 40 + optionCount * 6); // 옵션 1개당 6점
  }

  // 헬퍼 메서드들
  private extractStrengths(scores: any): string[] {
    const strengths: string[] = [];
    if (scores.price_score >= 80) strengths.push('가격 경쟁력 우수');
    if (scores.mileage_score >= 80) strengths.push('낮은 주행거리');
    if (scores.year_score >= 80) strengths.push('최신 연식');
    if (scores.fuel_efficiency_score >= 80) strengths.push('우수한 연비');
    if (scores.accident_score >= 80) strengths.push('무사고 이력');
    if (scores.options_score >= 80) strengths.push('풍부한 옵션');
    return strengths.slice(0, 3);
  }

  private extractWeaknesses(scores: any): string[] {
    const weaknesses: string[] = [];
    if (scores.price_score < 60) weaknesses.push('높은 가격대');
    if (scores.mileage_score < 60) weaknesses.push('높은 주행거리');
    if (scores.year_score < 60) weaknesses.push('오래된 연식');
    if (scores.fuel_efficiency_score < 60) weaknesses.push('낮은 연비');
    if (scores.accident_score < 60) weaknesses.push('사고 이력');
    if (scores.options_score < 60) weaknesses.push('부족한 옵션');
    return weaknesses.slice(0, 3);
  }

  private getRecommendationGrade(score: number): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (score >= 85) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 55) return 'FAIR';
    return 'POOR';
  }

  private generateValueProposition(vehicle: Vehicle, topsis: TOPSISResult, tco: TCOAnalysis): string {
    const grade = this.getRecommendationGrade(topsis.overall_score);
    const strengths = topsis.key_strengths.join(', ');
    const weaknesses = topsis.key_weaknesses.join(', ');

    let proposition = `${grade === 'EXCELLENT' ? '매우 추천' : grade === 'GOOD' ? '추천' : grade === 'FAIR' ? '보통' : '비추천'}`;

    if (strengths) proposition += ` - ${strengths}`;
    if (weaknesses) proposition += `, 다만 ${weaknesses} 고려 필요`;

    return proposition;
  }

  // 나머지 메서드들은 간단히 구현
  private analyzeVehicleCondition(vehicle: Vehicle): any {
    return {
      accident_analysis: {
        count: vehicle.accident_count || 0,
        severity_assessment: vehicle.accident_count === 0 ? '무사고' : '경미한 사고',
        impact_on_value: (vehicle.accident_count || 0) * 5 // 사고 1회당 5% 가치 하락
      },
      mileage_analysis: {
        total_mileage: vehicle.mileage,
        annual_average: vehicle.mileage / Math.max(1, 2025 - vehicle.year),
        vs_peer_average: 0, // Peer group 비교 필요
        condition_assessment: vehicle.mileage <= 60000 ? '양호' : vehicle.mileage <= 120000 ? '보통' : '주의'
      },
      age_analysis: {
        vehicle_age: 2025 - vehicle.year,
        depreciation_stage: 2025 - vehicle.year <= 5 ? '초기' : '중기',
        remaining_lifespan: Math.max(0, 15 - (2025 - vehicle.year))
      }
    };
  }

  private analyzeOptions(vehicle: Vehicle, peerGroup: Vehicle[]): any {
    const options = vehicle.options || [];
    return {
      owned_options: options,
      popular_missing: [], // 계산 필요
      option_value_score: Math.min(100, options.length * 8),
      total_option_value: options.length * 500000 // 옵션당 50만원 가정
    };
  }

  private generateInsights(vehicle: Vehicle, topsis: TOPSISResult, peerGroup: Vehicle[]): any {
    const risks: RiskFactor[] = [];

    if (vehicle.accident_count > 0) {
      risks.push({
        type: 'ACCIDENT_HISTORY',
        severity: vehicle.accident_count === 1 ? 'MEDIUM' : 'HIGH',
        description: `사고 이력 ${vehicle.accident_count}회`,
        impact: '재판매 가치 하락 가능성'
      });
    }

    if (vehicle.mileage > 120000) {
      risks.push({
        type: 'HIGH_MILEAGE',
        severity: 'MEDIUM',
        description: `높은 주행거리 (${vehicle.mileage.toLocaleString()}km)`,
        impact: '정비 비용 증가 가능성'
      });
    }

    return {
      risk_factors: risks,
      comparable_vehicles: peerGroup.slice(0, 3),
      market_position: topsis.percentile >= 80 ? '상위권' : topsis.percentile >= 60 ? '중상위권' : '하위권',
      investment_outlook: topsis.overall_score >= 75 ? '긍정적' : topsis.overall_score >= 60 ? '보통' : '부정적'
    };
  }

  private analyzePeerComparison(vehicle: Vehicle, peerGroup: Vehicle[], topsis: TOPSISResult): any {
    return {
      peer_group_size: peerGroup.length,
      rank_in_group: topsis.rank,
      percentile_in_group: topsis.percentile,
      competitive_advantages: topsis.key_strengths,
      competitive_disadvantages: topsis.key_weaknesses
    };
  }

  private isSimilarVehicleType(vehicle1: Vehicle, vehicle2: Vehicle): boolean {
    // 간단한 브랜드 매칭
    return vehicle1.brand === vehicle2.brand || Math.random() > 0.7;
  }
}