import type { Vehicle } from "@shared/types/vehicle";

export interface TOPSISCriterion {
  name: string;
  weight: number;
  type: 'benefit' | 'cost';
  displayName: string;
}

export interface TOPSISAlternative {
  id: string;
  name: string;
  values: Record<string, number>;
  metadata?: any;
}

export interface TOPSISResult {
  ranking: Array<{
    alternative: TOPSISAlternative;
    score: number;
    rank: number;
    distanceToIdeal: number;
    distanceToNegativeIdeal: number;
  }>;
  criteria: TOPSISCriterion[];
  idealSolution: Record<string, number>;
  negativeIdealSolution: Record<string, number>;
  normalizedMatrix: Record<string, Record<string, number>>;
  weightedMatrix: Record<string, Record<string, number>>;
}

export interface UserPreferenceProfile {
  priceWeight: number;
  performanceWeight: number;
  brandWeight: number;
  fuelEfficiencyWeight: number;
  safetyWeight: number;
  designWeight: number;
}

export class TOPSISEngine {
  private criteria: TOPSISCriterion[] = [];

  constructor() {
    console.log('🎯 TOPSIS 다기준 의사결정 엔진 초기화');
  }

  setCriteria(userProfile: UserPreferenceProfile): void {
    const totalWeight = userProfile.priceWeight + userProfile.performanceWeight +
                       userProfile.brandWeight + userProfile.fuelEfficiencyWeight +
                       userProfile.safetyWeight + userProfile.designWeight;

    if (totalWeight === 0) {
        // Avoid division by zero
        this.criteria = [];
        return;
    }

    this.criteria = [
      { name: 'tco', weight: userProfile.priceWeight / totalWeight, type: 'cost', displayName: 'TCO(총 소유비용)' },  // ✨ Phase 1: price → tco
      { name: 'performance', weight: userProfile.performanceWeight / totalWeight, type: 'benefit', displayName: '성능' },
      { name: 'brand_value', weight: userProfile.brandWeight / totalWeight, type: 'benefit', displayName: '브랜드' },
      { name: 'fuel_efficiency', weight: userProfile.fuelEfficiencyWeight / totalWeight, type: 'benefit', displayName: '연비' },
      { name: 'safety_score', weight: userProfile.safetyWeight / totalWeight, type: 'benefit', displayName: '안전성' },
      { name: 'design_score', weight: userProfile.designWeight / totalWeight, type: 'benefit', displayName: '디자인' }
    ];
    console.log('📊 TOPSIS 평가 기준 설정 완료 (TCO 포함):', this.criteria);
  }

  async evaluate(alternatives: TOPSISAlternative[]): Promise<TOPSISResult> {
    console.log(`🔢 TOPSIS 평가 시작: ${alternatives.length}개 대안, ${this.criteria.length}개 기준`);

    if (alternatives.length === 0) throw new Error('평가할 대안이 없습니다.');
    if (this.criteria.length === 0) throw new Error('평가 기준이 설정되지 않았습니다.');

    this.validateDecisionMatrix(alternatives);
    const normalizedMatrix = this.normalizeMatrix(alternatives);
    const weightedMatrix = this.applyWeights(normalizedMatrix);
    const idealSolution = this.calculateIdealSolution(weightedMatrix);
    const negativeIdealSolution = this.calculateNegativeIdealSolution(weightedMatrix);
    const distances = this.calculateDistances(weightedMatrix, idealSolution, negativeIdealSolution);
    const ranking = this.calculateRanking(alternatives, distances);

    const result: TOPSISResult = { ranking, criteria: this.criteria, idealSolution, negativeIdealSolution, normalizedMatrix, weightedMatrix };
    console.log('✅ TOPSIS 평가 완료:', result.ranking.slice(0, 3).map(r => `${r.rank}위: ${r.alternative.name} (점수: ${r.score.toFixed(3)})`));
    return result;
  }

  private validateDecisionMatrix(alternatives: TOPSISAlternative[]): void {
    for (const alternative of alternatives) {
      for (const criterion of this.criteria) {
        const value = alternative.values[criterion.name];
        if (value === undefined) {
          throw new Error(`대안 "${alternative.name}"에 기준 "${criterion.name}" 값이 없습니다.`);
        }
        if (value < 0) {
          throw new Error(`대안 "${alternative.name}"의 기준 "${criterion.name}" 값이 음수입니다.`);
        }
      }
    }
  }

  private normalizeMatrix(alternatives: TOPSISAlternative[]): Record<string, Record<string, number>> {
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    for (const criterion of this.criteria) {
      const sumOfSquares = alternatives.reduce((sum, alt) => {
        const value = alt.values[criterion.name] || 0;
        return sum + (value * value);
      }, 0);
      const denominator = Math.sqrt(sumOfSquares);
      for (const alternative of alternatives) {
        if (!normalizedMatrix[alternative.id]) {
          normalizedMatrix[alternative.id] = {};
        }
        const originalValue = alternative.values[criterion.name];
        if (originalValue !== undefined) {
          normalizedMatrix[alternative.id]![criterion.name] = denominator > 0 ? originalValue / denominator : 0;
        }
      }
    }
    return normalizedMatrix;
  }

  private applyWeights(normalizedMatrix: Record<string, Record<string, number>>): Record<string, Record<string, number>> {
    const weightedMatrix: Record<string, Record<string, number>> = {};
    for (const alternativeId in normalizedMatrix) {
      weightedMatrix[alternativeId] = {};
      for (const criterion of this.criteria) {
        const normalizedValue = normalizedMatrix[alternativeId]?.[criterion.name] || 0;
        weightedMatrix[alternativeId][criterion.name] = criterion.weight * normalizedValue;
      }
    }
    return weightedMatrix;
  }

  private calculateIdealSolution(weightedMatrix: Record<string, Record<string, number>>): Record<string, number> {
    const idealSolution: Record<string, number> = {};
    for (const criterion of this.criteria) {
      const values = Object.values(weightedMatrix).map(alt => alt[criterion.name]).filter(v => v !== undefined) as number[];
      if (values.length === 0) {
        idealSolution[criterion.name] = 0;
        continue;
      }
      idealSolution[criterion.name] = criterion.type === 'benefit' ? Math.max(...values) : Math.min(...values);
    }
    return idealSolution;
  }

  private calculateNegativeIdealSolution(weightedMatrix: Record<string, Record<string, number>>): Record<string, number> {
    const negativeIdealSolution: Record<string, number> = {};
    for (const criterion of this.criteria) {
      const values = Object.values(weightedMatrix).map(alt => alt[criterion.name]).filter(v => v !== undefined) as number[];
       if (values.length === 0) {
        negativeIdealSolution[criterion.name] = 0;
        continue;
      }
      negativeIdealSolution[criterion.name] = criterion.type === 'benefit' ? Math.min(...values) : Math.max(...values);
    }
    return negativeIdealSolution;
  }

  private calculateDistances(weightedMatrix: Record<string, Record<string, number>>, idealSolution: Record<string, number>, negativeIdealSolution: Record<string, number>): Record<string, { toIdeal: number; toNegativeIdeal: number }> {
    const distances: Record<string, { toIdeal: number; toNegativeIdeal: number }> = {};
    for (const alternativeId in weightedMatrix) {
      let sumToIdeal = 0;
      let sumToNegativeIdeal = 0;
      for (const criterion of this.criteria) {
        const value = weightedMatrix[alternativeId]?.[criterion.name] || 0;
        const idealValue = idealSolution[criterion.name] || 0;
        const negativeIdealValue = negativeIdealSolution[criterion.name] || 0;
        sumToIdeal += Math.pow(value - idealValue, 2);
        sumToNegativeIdeal += Math.pow(value - negativeIdealValue, 2);
      }
      distances[alternativeId] = { toIdeal: Math.sqrt(sumToIdeal), toNegativeIdeal: Math.sqrt(sumToNegativeIdeal) };
    }
    return distances;
  }

  private calculateRanking(alternatives: TOPSISAlternative[], distances: Record<string, { toIdeal: number; toNegativeIdeal: number }>): Array<{ alternative: TOPSISAlternative; score: number; rank: number; distanceToIdeal: number; distanceToNegativeIdeal: number; }> {
    const scores = alternatives.map(alternative => {
      const dist = distances[alternative.id];
      if (!dist) return { alternative, score: 0, distanceToIdeal: 0, distanceToNegativeIdeal: 0, rank: 0 };
      const totalDistance = dist.toIdeal + dist.toNegativeIdeal;
      let score = totalDistance > 0 ? dist.toNegativeIdeal / totalDistance : 0.5;
      return { alternative, score: Math.max(0, Math.min(1, score)), distanceToIdeal: dist.toIdeal, distanceToNegativeIdeal: dist.toNegativeIdeal, rank: 0 };
    });
    scores.sort((a, b) => b.score - a.score);
    scores.forEach((item, index) => { item.rank = index + 1; });
    return scores;
  }
}

export class VehicleTOPSISEvaluator {
  private topsisEngine: TOPSISEngine;

  constructor() {
    this.topsisEngine = new TOPSISEngine();
  }

  convertVehiclesToAlternatives(vehicles: Vehicle[]): TOPSISAlternative[] {
    return vehicles.map(vehicle => ({
      id: String(vehicle.vehicleId),
      name: `${vehicle.manufacturer} ${vehicle.model}`,
      values: {
        price: vehicle.price || 0,
        performance: this.calculatePerformanceScore(vehicle),
        brand_value: this.calculateBrandValue(vehicle.manufacturer),
        fuel_efficiency: this.calculateFuelEfficiency(vehicle),
        safety_score: this.calculateSafetyScore(vehicle),
        design_score: this.calculateDesignScore(vehicle)
      },
      metadata: vehicle
    }));
  }

  private calculatePerformanceScore(vehicle: Vehicle): number {
    let score = 50;
    if (vehicle.displacement) {
      score += Math.min(vehicle.displacement / 100, 30);
    }
    const year = vehicle.modelYear;
    if (year) {
      const currentYear = new Date().getFullYear();
      score += Math.max(0, 20 - (currentYear - year) * 2);
    }
    const brand = vehicle.manufacturer || '';
    const performanceBrands = ['BMW', '벤츠', '아우디', '포르쉐', '페라리', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ferrari'];
    if (performanceBrands.some(b => brand.includes(b))) {
      score += 15;
    }
    return Math.min(score, 100);
  }

  private calculateBrandValue(brand: string | null): number {
    if (!brand) return 70;
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
    for (const [key, value] of Object.entries(brandScores)) {
      if (brand.includes(key)) {
        return value;
      }
    }
    return 70;
  }

  private calculateSafetyScore(vehicle: Vehicle): number {
    let score = 70;
    const year = vehicle.modelYear;
    if (year) {
      const currentYear = new Date().getFullYear();
      score += Math.max(0, 30 - (currentYear - year) * 2);
    }
    const brand = vehicle.manufacturer || '';
    const safetyBrands = ['볼보', '벤츠', 'BMW', '아우디', '제네시스', 'Volvo', 'Mercedes-Benz', 'Genesis'];
    if (safetyBrands.some(b => brand.includes(b))) {
      score += 10;
    }
    return Math.min(score, 100);
  }

  private calculateFuelEfficiency(vehicle: Vehicle): number {
    const fuelType = vehicle.fuelType || '';
    if (fuelType.includes('하이브리드') || fuelType.includes('hybrid')) return 16;
    if (fuelType.includes('전기') || fuelType.includes('electric')) return 20;
    if (fuelType.includes('디젤') || fuelType.includes('diesel')) return 12;
    return 10;
  }

  private calculateDesignScore(vehicle: Vehicle): number {
    let score = 70;
    const brand = vehicle.manufacturer || '';
    const designBrands = ['벤츠', 'BMW', '아우디', '제네시스', '포르쉐', 'Mercedes-Benz', 'Audi', 'Genesis', 'Porsche'];
    if (designBrands.some(b => brand.includes(b))) {
      score += 15;
    }
    const year = vehicle.modelYear;
    if (year) {
      const currentYear = new Date().getFullYear();
      if (currentYear - year <= 3) {
        score += 15;
      }
    }
    return Math.min(score, 100);
  }

  async evaluateVehicles(vehicles: Vehicle[], userProfile: UserPreferenceProfile): Promise<TOPSISResult> {
    console.log('🚗 차량 TOPSIS 평가 시작');
    const alternatives = this.convertVehiclesToAlternatives(vehicles);
    this.topsisEngine.setCriteria(userProfile);
    const result = await this.topsisEngine.evaluate(alternatives);
    console.log('✅ 차량 TOPSIS 평가 완료');
    return result;
  }
}
