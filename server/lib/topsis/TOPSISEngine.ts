/**
 * TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) 엔진
 *
 * 📚 논문 기반: TOPSIS 다기준 의사결정 방법론
 * 🎯 목적: 차량 평가에서 여러 기준을 종합하여 최적의 선택지 도출
 * 🚗 적용: 가격, 연비, 안전성, 브랜드 등 다양한 기준을 통합 평가
 */

export interface TOPSISCriterion {
  name: string;           // 기준명 (예: "price", "fuel_efficiency", "safety")
  weight: number;         // 가중치 (0-1, 합계는 1)
  type: 'benefit' | 'cost'; // benefit: 높을수록 좋음, cost: 낮을수록 좋음
  displayName: string;    // 표시명 (예: "가격", "연비", "안전성")
}

export interface TOPSISAlternative {
  id: string;             // 대안 ID (차량 ID)
  name: string;           // 대안명 (차량명)
  values: Record<string, number>; // 기준별 값 (criterion name -> value)
  metadata?: any;         // 추가 메타데이터 (차량 상세 정보)
}

export interface TOPSISResult {
  ranking: Array<{
    alternative: TOPSISAlternative;
    score: number;        // TOPSIS 점수 (0-1, 높을수록 좋음)
    rank: number;         // 순위 (1이 최고)
    distanceToIdeal: number;      // 이상해에 대한 거리
    distanceToNegativeIdeal: number; // 부정이상해에 대한 거리
  }>;
  criteria: TOPSISCriterion[];
  idealSolution: Record<string, number>;     // 이상해 (각 기준별 최적값)
  negativeIdealSolution: Record<string, number>; // 부정이상해 (각 기준별 최악값)
  normalizedMatrix: Record<string, Record<string, number>>; // 정규화된 의사결정 매트릭스
  weightedMatrix: Record<string, Record<string, number>>;   // 가중 정규화 매트릭스
}

export interface UserPreferenceProfile {
  priceWeight: number;      // 가격 민감도 (0-1)
  performanceWeight: number; // 성능 중시도 (0-1)
  brandWeight: number;      // 브랜드 중시도 (0-1)
  fuelEfficiencyWeight: number; // 연비 중시도 (0-1)
  safetyWeight: number;     // 안전성 중시도 (0-1)
  designWeight: number;     // 디자인 중시도 (0-1)
}

/**
 * 🎯 TOPSIS 다기준 의사결정 엔진
 *
 * 논문 기반 핵심 알고리즘:
 * 1. 의사결정 매트릭스 구성
 * 2. 매트릭스 정규화
 * 3. 가중치 적용
 * 4. 이상해(Ideal Solution) 및 부정이상해(Negative Ideal Solution) 결정
 * 5. 각 대안의 이상해/부정이상해와의 거리 계산
 * 6. 상대적 근접도 계산 및 순위 결정
 */
export class TOPSISEngine {
  private criteria: TOPSISCriterion[] = [];

  constructor() {
    console.log('🎯 TOPSIS 다기준 의사결정 엔진 초기화');
  }

  /**
   * 🛠️ 평가 기준 설정 (사용자 선호도 기반)
   */
  setCriteria(userProfile: UserPreferenceProfile): void {
    // 사용자 선호도를 바탕으로 기준과 가중치 설정
    const totalWeight = userProfile.priceWeight + userProfile.performanceWeight +
                       userProfile.brandWeight + userProfile.fuelEfficiencyWeight +
                       userProfile.safetyWeight + userProfile.designWeight;

    this.criteria = [
      {
        name: 'price',
        weight: userProfile.priceWeight / totalWeight,
        type: 'cost', // 가격은 낮을수록 좋음
        displayName: '가격'
      },
      {
        name: 'performance',
        weight: userProfile.performanceWeight / totalWeight,
        type: 'benefit', // 성능은 높을수록 좋음
        displayName: '성능'
      },
      {
        name: 'brand_value',
        weight: userProfile.brandWeight / totalWeight,
        type: 'benefit', // 브랜드 가치는 높을수록 좋음
        displayName: '브랜드'
      },
      {
        name: 'fuel_efficiency',
        weight: userProfile.fuelEfficiencyWeight / totalWeight,
        type: 'benefit', // 연비는 높을수록 좋음
        displayName: '연비'
      },
      {
        name: 'safety_score',
        weight: userProfile.safetyWeight / totalWeight,
        type: 'benefit', // 안전성은 높을수록 좋음
        displayName: '안전성'
      },
      {
        name: 'design_score',
        weight: userProfile.designWeight / totalWeight,
        type: 'benefit', // 디자인은 높을수록 좋음
        displayName: '디자인'
      }
    ];

    console.log('📊 TOPSIS 평가 기준 설정 완료:', this.criteria);
  }

  /**
   * 🎯 TOPSIS 알고리즘 실행
   */
  async evaluate(alternatives: TOPSISAlternative[]): Promise<TOPSISResult> {
    console.log(`🔢 TOPSIS 평가 시작: ${alternatives.length}개 대안, ${this.criteria.length}개 기준`);

    if (alternatives.length === 0) {
      throw new Error('평가할 대안이 없습니다.');
    }

    if (this.criteria.length === 0) {
      throw new Error('평가 기준이 설정되지 않았습니다.');
    }

    // 1단계: 의사결정 매트릭스 구성 및 검증
    this.validateDecisionMatrix(alternatives);

    // 2단계: 매트릭스 정규화 (벡터 정규화)
    const normalizedMatrix = this.normalizeMatrix(alternatives);

    // 3단계: 가중치 적용 (가중 정규화 매트릭스)
    const weightedMatrix = this.applyWeights(normalizedMatrix);

    // 4단계: 이상해(A+) 및 부정이상해(A-) 결정
    const idealSolution = this.calculateIdealSolution(weightedMatrix);
    const negativeIdealSolution = this.calculateNegativeIdealSolution(weightedMatrix);

    // 5단계: 각 대안의 이상해/부정이상해와의 거리 계산
    const distances = this.calculateDistances(weightedMatrix, idealSolution, negativeIdealSolution);

    // 6단계: 상대적 근접도 계산 및 순위 결정
    const ranking = this.calculateRanking(alternatives, distances);

    const result: TOPSISResult = {
      ranking,
      criteria: this.criteria,
      idealSolution,
      negativeIdealSolution,
      normalizedMatrix,
      weightedMatrix
    };

    console.log('✅ TOPSIS 평가 완료:', result.ranking.slice(0, 3).map(r =>
      `${r.rank}위: ${r.alternative.name} (점수: ${r.score.toFixed(3)})`
    ));

    return result;
  }

  /**
   * 📊 의사결정 매트릭스 검증
   */
  private validateDecisionMatrix(alternatives: TOPSISAlternative[]): void {
    for (const alternative of alternatives) {
      for (const criterion of this.criteria) {
        if (!(criterion.name in alternative.values)) {
          throw new Error(`대안 "${alternative.name}"에 기준 "${criterion.name}" 값이 없습니다.`);
        }
        if (alternative.values[criterion.name] < 0) {
          throw new Error(`대안 "${alternative.name}"의 기준 "${criterion.name}" 값이 음수입니다.`);
        }
      }
    }
  }

  /**
   * 🔢 매트릭스 정규화 (벡터 정규화)
   * 논문 기반: rij = xij / √(Σ(xij²))
   */
  private normalizeMatrix(alternatives: TOPSISAlternative[]): Record<string, Record<string, number>> {
    const normalizedMatrix: Record<string, Record<string, number>> = {};

    // 각 기준별로 정규화
    for (const criterion of this.criteria) {
      // 1. 각 기준의 모든 값들의 제곱합 계산
      const sumOfSquares = alternatives.reduce((sum, alt) => {
        const value = alt.values[criterion.name];
        return sum + (value * value);
      }, 0);

      const denominator = Math.sqrt(sumOfSquares);

      // 2. 각 대안의 해당 기준 값을 정규화
      for (const alternative of alternatives) {
        if (!normalizedMatrix[alternative.id]) {
          normalizedMatrix[alternative.id] = {};
        }

        const originalValue = alternative.values[criterion.name];
        normalizedMatrix[alternative.id][criterion.name] = originalValue / denominator;
      }
    }

    return normalizedMatrix;
  }

  /**
   * ⚖️ 가중치 적용 (가중 정규화 매트릭스)
   * 논문 기반: vij = wi × rij
   */
  private applyWeights(normalizedMatrix: Record<string, Record<string, number>>): Record<string, Record<string, number>> {
    const weightedMatrix: Record<string, Record<string, number>> = {};

    for (const alternativeId in normalizedMatrix) {
      weightedMatrix[alternativeId] = {};

      for (const criterion of this.criteria) {
        const normalizedValue = normalizedMatrix[alternativeId][criterion.name];
        weightedMatrix[alternativeId][criterion.name] = criterion.weight * normalizedValue;
      }
    }

    return weightedMatrix;
  }

  /**
   * 🎯 이상해(Ideal Solution) 계산
   * 논문 기반: A+ = {max(vij) if benefit, min(vij) if cost}
   */
  private calculateIdealSolution(weightedMatrix: Record<string, Record<string, number>>): Record<string, number> {
    const idealSolution: Record<string, number> = {};

    for (const criterion of this.criteria) {
      const values = Object.values(weightedMatrix).map(alt => alt[criterion.name]);

      if (criterion.type === 'benefit') {
        // benefit 기준: 최대값이 이상적
        idealSolution[criterion.name] = Math.max(...values);
      } else {
        // cost 기준: 최소값이 이상적
        idealSolution[criterion.name] = Math.min(...values);
      }
    }

    return idealSolution;
  }

  /**
   * 🎯 부정이상해(Negative Ideal Solution) 계산
   * 논문 기반: A- = {min(vij) if benefit, max(vij) if cost}
   */
  private calculateNegativeIdealSolution(weightedMatrix: Record<string, Record<string, number>>): Record<string, number> {
    const negativeIdealSolution: Record<string, number> = {};

    for (const criterion of this.criteria) {
      const values = Object.values(weightedMatrix).map(alt => alt[criterion.name]);

      if (criterion.type === 'benefit') {
        // benefit 기준: 최소값이 부정이상적
        negativeIdealSolution[criterion.name] = Math.min(...values);
      } else {
        // cost 기준: 최대값이 부정이상적
        negativeIdealSolution[criterion.name] = Math.max(...values);
      }
    }

    return negativeIdealSolution;
  }

  /**
   * 📏 각 대안의 이상해/부정이상해와의 거리 계산
   * 논문 기반: 유클리드 거리 사용
   */
  private calculateDistances(
    weightedMatrix: Record<string, Record<string, number>>,
    idealSolution: Record<string, number>,
    negativeIdealSolution: Record<string, number>
  ): Record<string, { toIdeal: number; toNegativeIdeal: number }> {
    const distances: Record<string, { toIdeal: number; toNegativeIdeal: number }> = {};

    for (const alternativeId in weightedMatrix) {
      let sumToIdeal = 0;
      let sumToNegativeIdeal = 0;

      for (const criterion of this.criteria) {
        const value = weightedMatrix[alternativeId][criterion.name];

        // 이상해와의 거리
        const diffToIdeal = value - idealSolution[criterion.name];
        sumToIdeal += diffToIdeal * diffToIdeal;

        // 부정이상해와의 거리
        const diffToNegativeIdeal = value - negativeIdealSolution[criterion.name];
        sumToNegativeIdeal += diffToNegativeIdeal * diffToNegativeIdeal;
      }

      distances[alternativeId] = {
        toIdeal: Math.sqrt(sumToIdeal),
        toNegativeIdeal: Math.sqrt(sumToNegativeIdeal)
      };
    }

    return distances;
  }

  /**
   * 🏆 상대적 근접도 계산 및 순위 결정
   * 논문 기반: Ci = Di- / (Di+ + Di-)
   */
  private calculateRanking(
    alternatives: TOPSISAlternative[],
    distances: Record<string, { toIdeal: number; toNegativeIdeal: number }>
  ): Array<{
    alternative: TOPSISAlternative;
    score: number;
    rank: number;
    distanceToIdeal: number;
    distanceToNegativeIdeal: number;
  }> {
    // 상대적 근접도 계산
    const scores = alternatives.map(alternative => {
      const dist = distances[alternative.id];
      const totalDistance = dist.toIdeal + dist.toNegativeIdeal;

      // TOPSIS 핵심 공식: Ci = Di- / (Di+ + Di-)
      let score = 0;
      if (totalDistance > 0) {
        score = dist.toNegativeIdeal / totalDistance;
      } else {
        // 거리가 모두 0인 경우 (동일한 값) 중간 점수
        score = 0.5;
      }

      return {
        alternative,
        score: Math.max(0, Math.min(1, score)), // 0-1 범위로 정규화
        distanceToIdeal: dist.toIdeal,
        distanceToNegativeIdeal: dist.toNegativeIdeal,
        rank: 0 // 임시값, 아래에서 설정
      };
    });

    // 점수 기준 내림차순 정렬 (높은 점수가 더 좋음)
    scores.sort((a, b) => b.score - a.score);

    // 순위 부여
    scores.forEach((item, index) => {
      item.rank = index + 1;
    });

    return scores;
  }

  /**
   * 📈 평가 결과 상세 분석
   */
  analyzeResult(result: TOPSISResult): {
    topChoice: string;
    criteriaImpact: Array<{ criterion: string; impact: number }>;
    decisionConfidence: number;
    alternativeComparison: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[]
    }>;
  } {
    const topChoice = result.ranking[0];

    // 기준별 영향도 분석
    const criteriaImpact = this.criteria.map(criterion => ({
      criterion: criterion.displayName,
      impact: criterion.weight
    })).sort((a, b) => b.impact - a.impact);

    // 의사결정 신뢰도 계산 (1위와 2위의 점수 차이로 판단)
    const decisionConfidence = result.ranking.length > 1 ?
      (result.ranking[0].score - result.ranking[1].score) * 100 : 100;

    // 대안별 강점/약점 분석
    const alternativeComparison = result.ranking.slice(0, 3).map(item => {
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      this.criteria.forEach(criterion => {
        const value = item.alternative.values[criterion.name];
        const maxValue = Math.max(...result.ranking.map(r => r.alternative.values[criterion.name]));
        const minValue = Math.min(...result.ranking.map(r => r.alternative.values[criterion.name]));

        const normalizedValue = (value - minValue) / (maxValue - minValue);

        if (normalizedValue > 0.7) {
          strengths.push(criterion.displayName);
        } else if (normalizedValue < 0.3) {
          weaknesses.push(criterion.displayName);
        }
      });

      return {
        name: item.alternative.name,
        strengths,
        weaknesses
      };
    });

    return {
      topChoice: topChoice.alternative.name,
      criteriaImpact,
      decisionConfidence: Math.round(decisionConfidence),
      alternativeComparison
    };
  }

  /**
   * 🎨 결과 시각화 데이터 생성
   */
  generateVisualizationData(result: TOPSISResult): {
    radarChartData: any;
    rankingChartData: any;
    criteriaWeightData: any;
  } {
    // 레이더 차트 데이터 (상위 3개 대안)
    const radarChartData = {
      categories: this.criteria.map(c => c.displayName),
      series: result.ranking.slice(0, 3).map(item => ({
        name: item.alternative.name,
        data: this.criteria.map(c => item.alternative.values[c.name])
      }))
    };

    // 순위 차트 데이터
    const rankingChartData = {
      categories: result.ranking.map(r => r.alternative.name),
      scores: result.ranking.map(r => (r.score * 100).toFixed(1))
    };

    // 기준 가중치 데이터
    const criteriaWeightData = {
      categories: this.criteria.map(c => c.displayName),
      weights: this.criteria.map(c => (c.weight * 100).toFixed(1))
    };

    return {
      radarChartData,
      rankingChartData,
      criteriaWeightData
    };
  }
}

/**
 * 🚗 차량 TOPSIS 평가 유틸리티
 */
export class VehicleTOPSISEvaluator {
  private topsisEngine: TOPSISEngine;

  constructor() {
    this.topsisEngine = new TOPSISEngine();
  }

  /**
   * 🚙 차량 데이터를 TOPSIS 대안으로 변환
   */
  convertVehiclesToAlternatives(vehicles: any[]): TOPSISAlternative[] {
    return vehicles.map(vehicle => ({
      id: vehicle.vehicle_id || vehicle.id,
      name: `${vehicle.manufacturer || vehicle.brand} ${vehicle.model}`,
      values: {
        price: vehicle.price || 0,
        performance: this.calculatePerformanceScore(vehicle),
        brand_value: this.calculateBrandValue(vehicle.manufacturer || vehicle.brand),
        fuel_efficiency: this.calculateFuelEfficiency(vehicle),
        safety_score: this.calculateSafetyScore(vehicle),
        design_score: this.calculateDesignScore(vehicle)
      },
      metadata: vehicle
    }));
  }

  /**
   * 🏎️ 성능 점수 계산 (배기량, 마력 등 종합)
   */
  private calculatePerformanceScore(vehicle: any): number {
    let score = 50; // 기본 점수

    // 배기량 고려
    if (vehicle.displacement) {
      score += Math.min(vehicle.displacement / 100, 30); // 최대 30점
    }

    // 연식 고려 (최신일수록 높은 점수)
    const year = vehicle.model_year || vehicle.year;
    if (year) {
      const currentYear = new Date().getFullYear();
      const yearScore = Math.max(0, 20 - (currentYear - year) * 2);
      score += yearScore;
    }

    // 브랜드별 성능 보정
    const brand = vehicle.manufacturer || vehicle.brand || '';
    const performanceBrands = ['BMW', '벤츠', '아우디', '포르쉐', '페라리', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ferrari'];
    if (performanceBrands.some(b => brand.includes(b))) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  /**
   * 🏆 브랜드 가치 계산
   */
  private calculateBrandValue(brand: string = ''): number {
    const brandScores: Record<string, number> = {
      '현대': 75, '기아': 73, '제네시스': 85,
      '벤츠': 95, 'BMW': 93, '아우디': 90,
      '토요타': 88, '혼다': 85, '닛산': 80,
      '폭스바겐': 82, '포르쉐': 98, '페라리': 100,
      '테슬라': 92, '볼보': 85, '랜드로버': 87,
      'Mercedes-Benz': 95, 'Audi': 90, 'Hyundai': 75,
      'Kia': 73, 'Genesis': 85, 'Toyota': 88,
      'Honda': 85, 'Nissan': 80, 'Volkswagen': 82,
      'Porsche': 98, 'Ferrari': 100, 'Tesla': 92,
      'Volvo': 85, 'Land Rover': 87, 'KG모빌리티(쌍용)': 65
    };

    // 정확한 매칭 시도
    for (const [key, value] of Object.entries(brandScores)) {
      if (brand.includes(key)) {
        return value;
      }
    }

    return 70; // 기본값
  }

  /**
   * 🛡️ 안전성 점수 계산
   */
  private calculateSafetyScore(vehicle: any): number {
    let score = 70; // 기본 점수

    // 최신 차량일수록 안전성 높음
    const year = vehicle.model_year || vehicle.year;
    if (year) {
      const currentYear = new Date().getFullYear();
      const yearScore = Math.max(0, 30 - (currentYear - year) * 2);
      score += yearScore;
    }

    // 브랜드별 안전성 보정
    const brand = vehicle.manufacturer || vehicle.brand || '';
    const safetyBrands = ['볼보', '벤츠', 'BMW', '아우디', '제네시스', 'Volvo', 'Mercedes-Benz', 'Genesis'];
    if (safetyBrands.some(b => brand.includes(b))) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * ⛽ 연비 계산 (실제 데이터 기반)
   */
  private calculateFuelEfficiency(vehicle: any): number {
    // 실제 연비 데이터가 있으면 사용
    if (vehicle.fuel_efficiency) {
      return vehicle.fuel_efficiency;
    }

    // 연료 타입별 기본 연비 추정
    const fuelType = vehicle.fuel_type || vehicle.fuelType || '';

    if (fuelType.includes('하이브리드') || fuelType.includes('hybrid')) {
      return 16; // 하이브리드 평균 연비
    } else if (fuelType.includes('전기') || fuelType.includes('electric')) {
      return 20; // 전기차 효율성을 연비로 환산
    } else if (fuelType.includes('디젤') || fuelType.includes('diesel')) {
      return 12; // 디젤 평균 연비
    } else {
      return 10; // 가솔린 평균 연비
    }
  }

  /**
   * 🎨 디자인 점수 계산
   */
  private calculateDesignScore(vehicle: any): number {
    let score = 70; // 기본 점수

    // 브랜드별 디자인 보정
    const brand = vehicle.manufacturer || vehicle.brand || '';
    const designBrands = ['벤츠', 'BMW', '아우디', '제네시스', '포르쉐', 'Mercedes-Benz', 'Audi', 'Genesis', 'Porsche'];
    if (designBrands.some(b => brand.includes(b))) {
      score += 15;
    }

    // 연식별 디자인 보정 (최신 디자인 선호)
    const year = vehicle.model_year || vehicle.year;
    if (year) {
      const currentYear = new Date().getFullYear();
      if (currentYear - year <= 3) {
        score += 15;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * 🎯 사용자 맞춤 차량 평가 실행
   */
  async evaluateVehicles(
    vehicles: any[],
    userProfile: UserPreferenceProfile
  ): Promise<TOPSISResult> {
    console.log('🚗 차량 TOPSIS 평가 시작');

    // 차량을 TOPSIS 대안으로 변환
    const alternatives = this.convertVehiclesToAlternatives(vehicles);

    // 사용자 선호도 기반 기준 설정
    this.topsisEngine.setCriteria(userProfile);

    // TOPSIS 평가 실행
    const result = await this.topsisEngine.evaluate(alternatives);

    console.log('✅ 차량 TOPSIS 평가 완료');
    return result;
  }
}