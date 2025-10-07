/**
 * TCO (Total Cost of Ownership) Calculator
 * 총 소유 비용 계산기 - 5가지 비용 항목 통합
 *
 * 법률/연구 근거:
 * - 취득세: 지방세법 제11조
 * - 자동차세: 지방세법 제127조
 * - 정비/소모품: DOE/ANL 연구 데이터 (88원/km)
 * - 감가상각: 일반 감가율 15% (향후 회귀분석 확장)
 * - 연료비: 공인 연비 + 현재 유가
 */

import type { Vehicle } from "@shared/types/vehicle";

// ============================================================================
// Type Definitions
// ============================================================================

export interface TCOInput {
  vehicle: Vehicle;
  annualKm: number;          // 연간 주행거리 (기본: 15,000km)
  ownershipYears: number;    // 보유 기간 (기본: 3년)
  currentYear: number;       // 현재 년도 (기본: 2025)
}

export interface TCOBreakdown {
  acquisitionTax: number;    // 취득세 (원)
  vehicleTax: number;        // 자동차세 총합 (원)
  maintenance: number;       // 정비/소모품비 (원)
  depreciation: number;      // 감가상각 (원)
  fuelCost: number;          // 연료비 (원)
}

export interface TCOResult {
  vehicleId: number;
  totalCost: number;         // 총 비용 (원)
  breakdown: TCOBreakdown;
  confidence: number;        // 신뢰도 (0.0 ~ 1.0)
  warnings: string[];        // 경고 메시지
}

// ============================================================================
// Constants
// ============================================================================

/**
 * 유가 기본값 (2025년 1월 기준, 원/L)
 */
const DEFAULT_FUEL_PRICES: Record<string, number> = {
  "가솔린": 1600,
  "디젤": 1400,
  "LPG": 900,
  "하이브리드": 1600,
  "전기": 300  // kWh당
};

/**
 * 연료타입별 평균 연비 (폴백용)
 */
const DEFAULT_FUEL_EFFICIENCY: Record<string, number> = {
  "가솔린": 11,      // km/L
  "디젤": 14,        // km/L
  "LPG": 9,          // km/L
  "하이브리드": 16,  // km/L
  "전기": 5          // km/kWh
};

/**
 * 브랜드별 평균 배기량 (폴백용, cc)
 */
const DEFAULT_DISPLACEMENT_BY_BRAND: Record<string, number> = {
  "현대": 1800,
  "기아": 1800,
  "제네시스": 2500,
  "쌍용": 2000,
  "르노": 1600,
  "쉐보레": 1600,
  "BMW": 2200,
  "벤츠": 2500,
  "아우디": 2200,
  "폭스바겐": 1800,
  "토요타": 2000,
  "혼다": 2000,
  "렉서스": 2500
};

/**
 * 가격대별 평균 배기량 (폴백용 최종 단계)
 */
function getDisplacementByPrice(priceInManWon: number): number {
  if (priceInManWon < 2000) return 1600;
  if (priceInManWon < 3000) return 1800;
  if (priceInManWon < 5000) return 2200;
  return 2500;
}

// ============================================================================
// Main TCO Calculator Class
// ============================================================================

export class TCOCalculator {
  /**
   * 총 소유 비용(TCO) 계산 메인 메서드
   */
  static async calculate(input: TCOInput): Promise<TCOResult> {
    const { vehicle, annualKm, ownershipYears, currentYear } = input;
    const warnings: string[] = [];

    console.log(`🧮 TCO 계산 시작: ${vehicle.manufacturer} ${vehicle.model} (${vehicle.modelYear})`);

    // 1. 취득세 계산
    const acquisitionTax = this.calculateAcquisitionTax(vehicle.price);
    console.log(`  💰 취득세: ${acquisitionTax.toLocaleString()}원`);

    // 2. 자동차세 계산
    let displacement = vehicle.displacement;
    if (!displacement) {
      displacement = this.estimateDisplacement(vehicle);
      warnings.push(`배기량 정보 없음: 추정값 ${displacement}cc 사용`);
    }
    const vehicleTax = this.calculateVehicleTax(
      displacement,
      vehicle.modelYear,
      ownershipYears,
      currentYear
    );
    console.log(`  🏛️ 자동차세 (${ownershipYears}년): ${vehicleTax.toLocaleString()}원`);

    // 3. 정비/소모품비 계산
    const maintenance = this.calculateMaintenance(annualKm, ownershipYears);
    console.log(`  🔧 정비/소모품: ${maintenance.toLocaleString()}원`);

    // 4. 감가상각 계산
    const depreciation = this.calculateDepreciation(
      vehicle.price,
      vehicle.model,
      vehicle.modelYear,
      ownershipYears
    );
    console.log(`  📉 감가상각: ${depreciation.toLocaleString()}원`);

    // 5. 연료비 계산
    const fuelCostResult = this.calculateFuelCost(
      annualKm,
      vehicle.fuelType,
      ownershipYears
    );
    if (fuelCostResult.fallbackUsed) {
      warnings.push(`연비 정보 없음: ${vehicle.fuelType} 평균 연비 사용`);
    }
    console.log(`  ⛽ 연료비: ${fuelCostResult.cost.toLocaleString()}원`);

    // 6. 총합 계산
    const totalCost = acquisitionTax + vehicleTax + maintenance + depreciation + fuelCostResult.cost;
    console.log(`  ✅ 총 소유 비용: ${totalCost.toLocaleString()}원`);

    // 7. 신뢰도 계산
    const confidence = this.calculateConfidence(vehicle, warnings);

    return {
      vehicleId: vehicle.vehicleId,
      totalCost,
      breakdown: {
        acquisitionTax,
        vehicleTax,
        maintenance,
        depreciation,
        fuelCost: fuelCostResult.cost
      },
      confidence,
      warnings
    };
  }

  // ==========================================================================
  // 1. 취득세 계산 (지방세법 제11조)
  // ==========================================================================

  /**
   * 취득세 계산: 차량 가격의 7%
   * 법적 근거: 지방세법 제11조
   *
   * @param vehiclePrice 차량 가격 (만원)
   * @returns 취득세 (원)
   */
  private static calculateAcquisitionTax(vehiclePrice: number): number {
    return vehiclePrice * 10000 * 0.07;  // 만원 → 원 변환 후 7% 적용
  }

  // ==========================================================================
  // 2. 자동차세 계산 (지방세법 제127조)
  // ==========================================================================

  /**
   * 자동차세 계산 (차령 감액 포함)
   * 법적 근거: 지방세법 제127조
   *
   * 세율:
   * - 1600cc 이하: cc × 140원 × 1.3 (교육세 포함)
   * - 1600cc 초과: cc × 200원 × 1.3 (교육세 포함)
   *
   * 차령 감액:
   * - 3년차부터 매년 5%씩 감액 (최대 50%)
   *
   * @param displacement 배기량 (cc)
   * @param modelYear 연식
   * @param ownershipYears 보유 기간 (년)
   * @param currentYear 현재 년도
   * @returns 총 자동차세 (원)
   */
  private static calculateVehicleTax(
    displacement: number,
    modelYear: number,
    ownershipYears: number,
    currentYear: number
  ): number {
    // 기본 세율 결정
    const baseRate = displacement <= 1600 ? 140 : 200;
    const baseTax = displacement * baseRate * 1.3;  // 교육세 30% 포함

    let totalTax = 0;

    // 보유 기간 동안 연간 세금 계산
    for (let year = 0; year < ownershipYears; year++) {
      const vehicleAge = (currentYear - modelYear) + year;

      // 차령 감액 계산 (3년차부터 5%씩, 최대 50%)
      let ageDiscount = 0;
      if (vehicleAge >= 3) {
        const yearsForDiscount = vehicleAge - 2;
        ageDiscount = Math.min(yearsForDiscount * 0.05, 0.5);
      }

      const annualTax = baseTax * (1 - ageDiscount);
      totalTax += annualTax;
    }

    return Math.round(totalTax);
  }

  // ==========================================================================
  // 3. 정비/소모품비 계산 (DOE/ANL 연구)
  // ==========================================================================

  /**
   * 정비/소모품비 계산
   * 연구 근거: 미국 에너지부(DOE) / 아르곤 연구소(ANL)
   *
   * 계산식: 연간 주행거리 × 88원/km × 보유 기간
   *
   * @param annualKm 연간 주행거리 (km)
   * @param ownershipYears 보유 기간 (년)
   * @returns 총 정비/소모품비 (원)
   */
  private static calculateMaintenance(annualKm: number, ownershipYears: number): number {
    const costPerKm = 88;  // 원/km (DOE/ANL 연구 데이터)
    return annualKm * costPerKm * ownershipYears;
  }

  // ==========================================================================
  // 4. 감가상각 계산
  // ==========================================================================

  /**
   * 감가상각 계산 (일반 감가율 적용)
   *
   * 현재: 일반 감가율 15% 적용
   * 향후: DB 기반 회귀 분석으로 확장 예정
   *
   * @param vehiclePrice 차량 가격 (만원)
   * @param model 모델명
   * @param modelYear 연식
   * @param ownershipYears 보유 기간 (년)
   * @returns 총 감가상각 (원)
   */
  private static calculateDepreciation(
    vehiclePrice: number,
    model: string,
    modelYear: number,
    ownershipYears: number
  ): number {
    // 일반 감가율: 연간 15%
    const depreciationRate = 0.15;

    const currentValue = vehiclePrice * 10000;  // 만원 → 원
    const futureValue = currentValue * Math.pow(1 - depreciationRate, ownershipYears);
    const totalDepreciation = currentValue - futureValue;

    return Math.round(totalDepreciation);
  }

  // ==========================================================================
  // 5. 연료비 계산
  // ==========================================================================

  /**
   * 연료비 계산
   *
   * 계산식: (연간 주행거리 ÷ 연비) × 유가 × 보유 기간
   *
   * @param annualKm 연간 주행거리 (km)
   * @param fuelType 연료 타입
   * @param ownershipYears 보유 기간 (년)
   * @returns { cost: 총 연료비, fallbackUsed: 폴백 사용 여부 }
   */
  private static calculateFuelCost(
    annualKm: number,
    fuelType: string,
    ownershipYears: number
  ): { cost: number; fallbackUsed: boolean } {
    // 유가 결정
    const fuelPrice = DEFAULT_FUEL_PRICES[fuelType] || DEFAULT_FUEL_PRICES["가솔린"];

    // 연비 결정 (현재는 평균값 사용, 향후 실제 연비 데이터 통합 예정)
    const fuelEfficiency = DEFAULT_FUEL_EFFICIENCY[fuelType] || DEFAULT_FUEL_EFFICIENCY["가솔린"];
    const fallbackUsed = true;  // 현재는 항상 평균값 사용

    // 연간 연료 소비량 계산
    const annualFuelConsumption = annualKm / fuelEfficiency;

    // 연간 연료비 계산
    const annualCost = annualFuelConsumption * fuelPrice;

    // 총 연료비 계산
    const totalCost = annualCost * ownershipYears;

    return {
      cost: Math.round(totalCost),
      fallbackUsed
    };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * 배기량 추정 (데이터 누락 시 폴백 전략)
   *
   * 전략:
   * 1. 브랜드별 평균 배기량
   * 2. 가격대별 평균 배기량
   */
  private static estimateDisplacement(vehicle: Vehicle): number {
    // 전략 1: 브랜드별 평균
    if (vehicle.manufacturer && DEFAULT_DISPLACEMENT_BY_BRAND[vehicle.manufacturer]) {
      return DEFAULT_DISPLACEMENT_BY_BRAND[vehicle.manufacturer];
    }

    // 전략 2: 가격대별 평균
    return getDisplacementByPrice(vehicle.price);
  }

  /**
   * TCO 신뢰도 계산
   *
   * 기준:
   * - 배기량 있음: +0.15
   * - 연비 있음: +0.15 (현재는 항상 폴백)
   * - 기본 신뢰도: 0.70
   */
  private static calculateConfidence(vehicle: Vehicle, warnings: string[]): number {
    let confidence = 0.70;  // 기본 신뢰도

    // 배기량 정보 있음
    if (vehicle.displacement) {
      confidence += 0.15;
    }

    // 향후 실제 연비 데이터 추가 시
    // if (vehicle.fuelEfficiency) {
    //   confidence += 0.15;
    // }

    return Math.min(confidence, 1.0);
  }
}
