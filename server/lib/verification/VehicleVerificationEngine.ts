/**
 * 🛡️ 차량 신뢰성 검증 엔진
 * 침수이력, 허위매물, 이상치, 하자 검증 시스템
 */

export interface FloodHistory {
  isFloodDamaged: boolean;
  floodLevel: 'none' | 'light' | 'moderate' | 'severe';
  confidence: number; // 0-100 (신뢰도)
  detectionMethod: string[];
  riskScore: number; // 0-100 (낮을수록 위험)
}

export interface FraudDetection {
  priceAnomaly: {
    isAnomalous: boolean;
    marketPriceRange: [number, number]; // [최저, 최고]
    currentPrice: number;
    deviationPercent: number; // 시세 대비 편차 %
    verdict: 'too_cheap' | 'too_expensive' | 'reasonable';
  };

  mileageManipulation: {
    isSuspicious: boolean;
    expectedMileage: [number, number]; // 연식 기준 예상 주행거리 범위
    actualMileage: number;
    suspicionLevel: 'none' | 'low' | 'medium' | 'high';
    reasons: string[];
  };

  specInconsistency: {
    hasInconsistency: boolean;
    inconsistentFields: string[];
    severity: 'minor' | 'major' | 'critical';
  };

  overallTrustScore: number; // 0-100 (높을수록 신뢰)
}

export interface ComprehensiveRisk {
  totalRiskScore: number; // 0-100 (낮을수록 위험)
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskFactors: Array<{
    category: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    impact: number; // 0-100
  }>;
  recommendation: 'highly_recommended' | 'recommended' | 'caution' | 'avoid';
}

export interface VehicleVerificationResult {
  vehicleId: string;
  analysisTimestamp: Date;

  // 검증 결과
  floodHistory: FloodHistory;
  fraudDetection: FraudDetection;
  comprehensiveRisk: ComprehensiveRisk;

  // 추가 인사이트
  marketComparison: {
    percentile: number; // 0-100 (상위 몇 %인지)
    similarVehiclesCount: number;
    betterAlternatives: number;
  };

  // 숨겨진 비용 예측
  hiddenCosts: {
    expectedMaintenanceCost: number; // 연간 예상 정비비
    insurancePremiumRange: [number, number]; // 보험료 범위
    depreciationRate: number; // 연간 감가상각률 %
    totalOwnershipCost: number; // 3년 총 소유비용
  };
}

export class VehicleVerificationEngine {

  /**
   * 🌊 침수이력 검증
   */
  static analyzeFloodHistory(vehicle: any): FloodHistory {
    const detectionMethods: string[] = [];
    let riskScore = 100;
    let floodLevel: FloodHistory['floodLevel'] = 'none';
    let confidence = 95;

    // 1. 가격 이상치 분석 (침수차는 시세보다 현저히 저렴)
    const marketPrice = this.estimateMarketPrice(vehicle);
    const priceDeviation = (marketPrice - vehicle.price) / marketPrice;

    if (priceDeviation > 0.3) { // 시세보다 30% 이상 저렴
      detectionMethods.push('가격 이상치 (시세 대비 과도하게 저렴)');
      riskScore -= 30;
      floodLevel = 'moderate';
    }

    // 2. 지역 분석 (침수 위험 지역)
    const floodProneAreas = ['부산', '울산', '강릉', '포항', '여수'];
    if (floodProneAreas.some(area => vehicle.location?.includes(area))) {
      detectionMethods.push('침수 위험 지역 차량');
      riskScore -= 10;
      confidence -= 5;
    }

    // 3. 연식 대비 과도한 가격 하락
    const expectedDepreciation = this.calculateExpectedDepreciation(vehicle);
    const actualDepreciation = (vehicle.originPrice - vehicle.price) / vehicle.originPrice;

    if (actualDepreciation > expectedDepreciation * 1.5) {
      detectionMethods.push('연식 대비 과도한 가격 하락');
      riskScore -= 20;
      if (floodLevel === 'none') floodLevel = 'light';
    }

    // 4. 특정 키워드 패턴 분석
    const suspiciousKeywords = ['급매', '빠른매매', '이유있음', '협의가능'];
    const vehicleDescription = `${vehicle.grade} ${vehicle.trim}`.toLowerCase();

    if (suspiciousKeywords.some(keyword => vehicleDescription.includes(keyword))) {
      detectionMethods.push('의심스러운 판매 문구');
      riskScore -= 15;
    }

    return {
      isFloodDamaged: riskScore < 70,
      floodLevel,
      confidence: Math.max(confidence, 60),
      detectionMethod: detectionMethods,
      riskScore: Math.max(riskScore, 0)
    };
  }

  /**
   * 🕵️ 허위매물 탐지
   */
  static detectFraud(vehicle: any, similarVehicles: any[]): FraudDetection {
    // 가격 이상치 분석
    const prices = similarVehicles.map(v => v.price).sort((a, b) => a - b);
    const q1 = prices[Math.floor(prices.length * 0.25)];
    const q3 = prices[Math.floor(prices.length * 0.75)];
    const median = prices[Math.floor(prices.length * 0.5)];

    const priceDeviation = ((vehicle.price - median) / median) * 100;
    let priceVerdict: FraudDetection['priceAnomaly']['verdict'] = 'reasonable';

    if (vehicle.price < q1 * 0.7) priceVerdict = 'too_cheap';
    else if (vehicle.price > q3 * 1.3) priceVerdict = 'too_expensive';

    // 주행거리 조작 의심 분석
    const vehicleAge = new Date().getFullYear() - vehicle.modelYear;
    const expectedMileageMin = vehicleAge * 8000; // 연간 최소 8,000km
    const expectedMileageMax = vehicleAge * 25000; // 연간 최대 25,000km

    const mileageReasons: string[] = [];
    let suspicionLevel: FraudDetection['mileageManipulation']['suspicionLevel'] = 'none';

    if (vehicle.distance < expectedMileageMin * 0.5) {
      mileageReasons.push('연식 대비 과도하게 낮은 주행거리');
      suspicionLevel = 'high';
    } else if (vehicle.distance < expectedMileageMin * 0.7) {
      mileageReasons.push('연식 대비 낮은 주행거리');
      suspicionLevel = 'medium';
    }

    if (vehicle.distance > expectedMileageMax * 1.5) {
      mileageReasons.push('연식 대비 과도하게 높은 주행거리');
      suspicionLevel = 'medium';
    }

    // 제원 정합성 검증
    const specIssues = this.validateSpecifications(vehicle);

    // 종합 신뢰도 점수
    let trustScore = 100;
    if (priceVerdict !== 'reasonable') trustScore -= 25;
    if (suspicionLevel === 'high') trustScore -= 30;
    else if (suspicionLevel === 'medium') trustScore -= 15;
    if (specIssues.hasInconsistency) trustScore -= 20;

    return {
      priceAnomaly: {
        isAnomalous: priceVerdict !== 'reasonable',
        marketPriceRange: [q1, q3],
        currentPrice: vehicle.price,
        deviationPercent: priceDeviation,
        verdict: priceVerdict
      },
      mileageManipulation: {
        isSuspicious: suspicionLevel !== 'none',
        expectedMileage: [expectedMileageMin, expectedMileageMax],
        actualMileage: vehicle.distance,
        suspicionLevel,
        reasons: mileageReasons
      },
      specInconsistency: specIssues,
      overallTrustScore: Math.max(trustScore, 0)
    };
  }

  /**
   * 📊 종합 리스크 분석
   */
  static analyzeComprehensiveRisk(
    vehicle: any,
    floodHistory: FloodHistory,
    fraudDetection: FraudDetection
  ): ComprehensiveRisk {
    const riskFactors: ComprehensiveRisk['riskFactors'] = [];

    // 침수 리스크
    if (floodHistory.isFloodDamaged) {
      riskFactors.push({
        category: '침수 이력',
        severity: floodHistory.floodLevel === 'severe' ? 'high' : 'medium',
        description: `침수 의심 (${floodHistory.detectionMethod.join(', ')})`,
        impact: 100 - floodHistory.riskScore
      });
    }

    // 가격 리스크
    if (fraudDetection.priceAnomaly.isAnomalous) {
      const severity = Math.abs(fraudDetection.priceAnomaly.deviationPercent) > 50 ? 'high' : 'medium';
      riskFactors.push({
        category: '가격 이상',
        severity,
        description: `시세 대비 ${fraudDetection.priceAnomaly.deviationPercent.toFixed(1)}% 편차`,
        impact: Math.min(Math.abs(fraudDetection.priceAnomaly.deviationPercent), 100)
      });
    }

    // 주행거리 리스크
    if (fraudDetection.mileageManipulation.isSuspicious) {
      riskFactors.push({
        category: '주행거리 의심',
        severity: fraudDetection.mileageManipulation.suspicionLevel === 'high' ? 'high' : 'medium',
        description: fraudDetection.mileageManipulation.reasons.join(', '),
        impact: fraudDetection.mileageManipulation.suspicionLevel === 'high' ? 70 : 40
      });
    }

    // 사고 이력 리스크
    if (vehicle.accident_count > 0) {
      riskFactors.push({
        category: '사고 이력',
        severity: vehicle.accident_count > 2 ? 'high' : 'medium',
        description: `사고 이력 ${vehicle.accident_count}회`,
        impact: vehicle.accident_count * 20
      });
    }

    // 총 리스크 점수 계산
    const totalImpact = riskFactors.reduce((sum, factor) => sum + factor.impact, 0);
    const totalRiskScore = Math.max(100 - totalImpact, 0);

    let riskLevel: ComprehensiveRisk['riskLevel'] = 'very_low';
    if (totalRiskScore < 20) riskLevel = 'very_high';
    else if (totalRiskScore < 40) riskLevel = 'high';
    else if (totalRiskScore < 60) riskLevel = 'medium';
    else if (totalRiskScore < 80) riskLevel = 'low';

    let recommendation: ComprehensiveRisk['recommendation'] = 'highly_recommended';
    if (totalRiskScore < 30) recommendation = 'avoid';
    else if (totalRiskScore < 50) recommendation = 'caution';
    else if (totalRiskScore < 70) recommendation = 'recommended';

    return {
      totalRiskScore,
      riskLevel,
      riskFactors,
      recommendation
    };
  }

  /**
   * 🏆 종합 분석 실행
   */
  static async analyzeVehicle(vehicle: any, similarVehicles: any[] = []): Promise<VehicleVerificationResult> {
    const floodHistory = this.analyzeFloodHistory(vehicle);
    const fraudDetection = this.detectFraud(vehicle, similarVehicles);
    const comprehensiveRisk = this.analyzeComprehensiveRisk(vehicle, floodHistory, fraudDetection);

    // 시장 비교 분석
    const marketComparison = this.analyzeMarketPosition(vehicle, similarVehicles);

    // 숨겨진 비용 예측
    const hiddenCosts = this.predictHiddenCosts(vehicle);

    return {
      vehicleId: vehicle.vehicleId?.toString() || vehicle.id?.toString(),
      analysisTimestamp: new Date(),
      floodHistory,
      fraudDetection,
      comprehensiveRisk,
      marketComparison,
      hiddenCosts
    };
  }

  // ==================== 유틸리티 메서드들 ====================

  private static estimateMarketPrice(vehicle: any): number {
    // 간단한 감가상각 모델
    const age = new Date().getFullYear() - vehicle.modelYear;
    const depreciationRate = 0.15; // 연간 15% 감가상각
    return vehicle.originPrice * Math.pow(1 - depreciationRate, age);
  }

  private static calculateExpectedDepreciation(vehicle: any): number {
    const age = new Date().getFullYear() - vehicle.modelYear;
    return 1 - Math.pow(0.85, age); // 연간 15% 감가상각
  }

  private static validateSpecifications(vehicle: any): FraudDetection['specInconsistency'] {
    const issues: string[] = [];

    // 기본적인 제원 검증
    if (vehicle.displacement && vehicle.displacement > 5000) {
      issues.push('배기량이 비정상적으로 큼');
    }

    if (vehicle.modelYear > new Date().getFullYear() + 1) {
      issues.push('미래 연식');
    }

    if (vehicle.price < 50 && vehicle.modelYear > 2010) {
      issues.push('연식 대비 비정상적으로 저렴한 가격');
    }

    return {
      hasInconsistency: issues.length > 0,
      inconsistentFields: issues,
      severity: issues.length > 2 ? 'critical' : issues.length > 0 ? 'major' : 'minor'
    };
  }

  private static analyzeMarketPosition(vehicle: any, similarVehicles: any[]) {
    if (similarVehicles.length === 0) {
      return {
        percentile: 50,
        similarVehiclesCount: 0,
        betterAlternatives: 0
      };
    }

    // 가격 기준 percentile 계산
    const prices = similarVehicles.map(v => v.price).sort((a, b) => a - b);
    const lowerCount = prices.filter(p => p < vehicle.price).length;
    const percentile = Math.round((lowerCount / prices.length) * 100);

    // 더 나은 대안 개수 (더 저렴하면서 연식이 더 좋은 차량)
    const betterAlternatives = similarVehicles.filter(v =>
      v.price <= vehicle.price && v.modelYear >= vehicle.modelYear && v.distance <= vehicle.distance
    ).length;

    return {
      percentile,
      similarVehiclesCount: similarVehicles.length,
      betterAlternatives
    };
  }

  private static predictHiddenCosts(vehicle: any) {
    const age = new Date().getFullYear() - vehicle.modelYear;

    // 연간 정비비 예측 (차량 가격과 연식 기반)
    const baseMaintenanceCost = vehicle.price * 0.03; // 차량 가격의 3%
    const ageMultiplier = 1 + (age * 0.1); // 연식당 10% 증가
    const expectedMaintenanceCost = Math.round(baseMaintenanceCost * ageMultiplier);

    // 보험료 추정 (차종과 가격 기반)
    const baseInsurance = vehicle.price * 0.02; // 차량 가격의 2%
    const insurancePremiumRange: [number, number] = [
      Math.round(baseInsurance * 0.8),
      Math.round(baseInsurance * 1.2)
    ];

    // 감가상각률 (연간)
    const depreciationRate = age < 5 ? 15 : age < 10 ? 10 : 5;

    // 3년 총 소유비용
    const totalOwnershipCost =
      expectedMaintenanceCost * 3 + // 3년 정비비
      (insurancePremiumRange[0] + insurancePremiumRange[1]) / 2 * 3 + // 3년 보험료
      vehicle.price * (depreciationRate / 100) * 3; // 3년 감가상각

    return {
      expectedMaintenanceCost,
      insurancePremiumRange,
      depreciationRate,
      totalOwnershipCost: Math.round(totalOwnershipCost)
    };
  }
}