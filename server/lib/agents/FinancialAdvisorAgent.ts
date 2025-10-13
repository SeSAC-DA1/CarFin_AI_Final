/**
 * FinancialAdvisorAgent - 금융 상품 추천 에이전트
 *
 * Phase 3-E: 핀테크 완성
 *
 * 기능:
 * - 일시불/할부/리스 3가지 결제 방식 계산
 * - 원리금균등상환 공식 기반 할부 계산
 * - 잔가 30% 가정 리스 계산
 * - 연령별 보험료 차등 적용
 * - 5년 현금흐름 시뮬레이션
 * - 사용자 프로필 기반 개인화 추천
 *
 * 법률 근거:
 * - 할부 금리: 여신전문금융업법 시행령 (4.5-6.5%)
 * - 리스 금리: 여신전문금융업법 제50조 (5.0-7.0%)
 * - 보험료: 보험업법 시행령 제79조
 */

import type { Vehicle } from "@shared/types/vehicle";
import type {
  FinancingOption,
  FinancingRecommendation,
  CashFlowYear,
  UserDrivingProfile
} from "@shared/types/vehicle";
import { TCOCalculator, type TCOInput, type TCOBreakdown } from "../financial/TCOCalculator";

// ============================================================================
// Constants & Configuration
// ============================================================================

/**
 * 연령대별 기본 할부 금리 (연 %)
 * 신용등급 가정: 중위권 (5-7등급)
 */
const LOAN_INTEREST_RATES: Record<string, number> = {
  "under25": 0.065,   // 6.5% (젊은 층 높은 금리)
  "under35": 0.055,   // 5.5%
  "under50": 0.045,   // 4.5% (중년층 낮은 금리)
  "over50": 0.050     // 5.0%
};

/**
 * 리스 기본 금리 (연 %)
 */
const LEASE_INTEREST_RATE = 0.055; // 5.5%

/**
 * 리스 잔가율
 */
const LEASE_RESIDUAL_VALUE_RATE = 0.30; // 30%

/**
 * 보험료 기본 요율 (차량가 대비 %)
 */
const INSURANCE_BASE_RATE = {
  full: 0.03,      // 종합보험 3%
  liability: 0.015 // 책임보험 1.5%
};

/**
 * 보험료 연령별 할증률
 */
const INSURANCE_AGE_MULTIPLIER: Record<string, number> = {
  "under26": 1.5,  // 26세 미만 1.5배
  "under35": 1.2,  // 35세 미만 1.2배
  "under50": 1.0,  // 50세 미만 1.0배
  "over50": 1.1    // 50세 이상 1.1배
};

// ============================================================================
// FinancialAdvisorAgent Class
// ============================================================================

export class FinancialAdvisorAgent {
  /**
   * 차량에 대한 금융 옵션 전체 추천
   *
   * 🆕 Phase 3-E: 에러 핸들링 강화
   * - TCO 데이터 검증
   * - 계산 실패 시 fallback
   * - 최소 1개 옵션 보장
   */
  async recommendFinancing(
    vehicle: Vehicle,
    tcoBreakdown: TCOBreakdown,
    userProfile: UserDrivingProfile
  ): Promise<FinancingRecommendation> {
    try {
      // 🔍 입력 데이터 검증
      if (!vehicle || !vehicle.price || vehicle.price <= 0) {
        console.error('❌ 잘못된 차량 데이터:', vehicle);
        throw new Error('Invalid vehicle data');
      }

      if (!tcoBreakdown) {
        console.warn('⚠️ TCO 데이터 없음, 기본값 사용');
        // TCO 없어도 금융 옵션은 계산 가능하도록 fallback
        tcoBreakdown = this.generateFallbackTCO(vehicle, userProfile);
      }

      const sellType = vehicle.sellType || '일반';
      console.log(`💰 금융 추천 시작: ${vehicle.manufacturer} ${vehicle.model} (매물타입: ${sellType})`);

      // 매물 타입별 분기 처리
      if (sellType === '리스') {
        return this.recommendLeaseOnly(vehicle, tcoBreakdown, userProfile);
      }

      if (sellType === '렌트') {
        return this.recommendRentalOnly(vehicle, userProfile);
      }

      // 일반 매물: 3가지 옵션 모두 계산
      return this.recommendAllOptions(vehicle, tcoBreakdown, userProfile);

    } catch (error) {
      console.error('❌ 금융 추천 전체 실패:', error);
      // 최소한 일시불 옵션만이라도 반환
      return this.createEmergencyFallback(vehicle, userProfile);
    }
  }

  /**
   * TCO 데이터 없을 때 기본값 생성
   */
  private generateFallbackTCO(vehicle: Vehicle, userProfile: UserDrivingProfile): TCOBreakdown {
    const priceInWon = vehicle.price * 10000;
    const years = userProfile.ownershipYears || 3;

    return {
      acquisitionTax: Math.round(priceInWon * 0.07),        // 취득세 7%
      vehicleTax: Math.round(priceInWon * 0.02 * years),    // 자동차세 추정
      maintenance: Math.round(userProfile.annualKm * 88 * years), // 정비비
      depreciation: Math.round(priceInWon * 0.20 * years),  // 감가상각
      fuelCost: Math.round(userProfile.annualKm * 150 * years)   // 연료비 추정
    };
  }

  /**
   * 긴급 fallback: 최소한 일시불 옵션만 반환
   */
  private createEmergencyFallback(vehicle: Vehicle, userProfile: UserDrivingProfile): FinancingRecommendation {
    const priceInWon = vehicle.price * 10000;
    const tco = this.generateFallbackTCO(vehicle, userProfile);
    const totalTCO = priceInWon + tco.acquisitionTax + tco.vehicleTax + tco.maintenance + tco.depreciation + tco.fuelCost;

    const cashOption: FinancingOption = {
      type: 'cash',
      downPayment: priceInWon,
      monthlyPayment: 0,
      totalPayment: priceInWon,
      totalInterest: 0,
      tco5Year: totalTCO,
      cashFlow: [],
      recommendation: {
        score: 70,
        reason: '일시불 구매 (금융 옵션 계산 불가)',
        pros: ['이자 부담 없음', '즉시 소유권 확보'],
        cons: ['초기 자금 부담', '상세 분석 불가']
      },
      financialDetails: {
        interestRate: 0,
        insuranceType: 'liability'
      }
    };

    return {
      vehicleSellType: vehicle.sellType || '일반',
      cashOption,
      bestRecommendation: cashOption,
      comparison: {
        cheapest: cashOption,
        mostAffordable: cashOption,
        bestValue: cashOption,
        note: '금융 옵션 계산 중 오류가 발생하여 일시불 옵션만 표시됩니다.'
      }
    };
  }

  /**
   * 일반 매물: 일시불 + 할부 + 리스 모두 계산
   */
  private async recommendAllOptions(
    vehicle: Vehicle,
    tcoBreakdown: TCOBreakdown,
    userProfile: UserDrivingProfile
  ): Promise<FinancingRecommendation> {
    // 🐛 Fix: userProfile 기본값 확실하게 설정
    const safeUserProfile: UserDrivingProfile = {
      annualKm: userProfile?.annualKm || 15000,
      ownershipYears: userProfile?.ownershipYears || 3,
      age: userProfile?.age || 35,
      monthlyIncome: userProfile?.monthlyIncome,
      hasOtherLoans: userProfile?.hasOtherLoans || false
    };

    const allOptions: FinancingOption[] = [];

    try {
      // 1. 일시불 계산
      const cashOption = this.calculateCashOption(vehicle, tcoBreakdown, safeUserProfile);
      allOptions.push(cashOption);

      // 2. 할부 옵션 (24/36/48/60개월)
      const loanTerms = [24, 36, 48, 60];
      const loanOptions: FinancingOption[] = [];

      for (const term of loanTerms) {
        try {
          const loanOption = this.calculateLoanOption(vehicle, tcoBreakdown, term, safeUserProfile);
          loanOptions.push(loanOption);
          allOptions.push(loanOption);
        } catch (err) {
          console.error(`❌ 할부 ${term}개월 계산 실패:`, err instanceof Error ? err.message : err);
        }
      }

      // 3. 리스 옵션 (24/36개월)
      const leaseTerms = [24, 36];
      const leaseOptions: FinancingOption[] = [];

      for (const term of leaseTerms) {
        try {
          const leaseOption = this.calculateLeaseOption(vehicle, tcoBreakdown, term, safeUserProfile);
          leaseOptions.push(leaseOption);
          allOptions.push(leaseOption);
        } catch (err) {
          console.error(`❌ 리스 ${term}개월 계산 실패:`, err instanceof Error ? err.message : err);
        }
      }

      // 4. 최적 옵션 선택
      const bestRecommendation = this.selectBestOption(allOptions, safeUserProfile);

      // 5. 비교 분석
      const comparison = {
        cheapest: this.findCheapest(allOptions),
        mostAffordable: this.findMostAffordable(allOptions),
        bestValue: bestRecommendation,
        note: this.generateComparisonNote(allOptions)
      };

      return {
        vehicleSellType: '일반',
        cashOption,
        loanOptions: loanOptions.length > 0 ? loanOptions : undefined,
        leaseOptions: leaseOptions.length > 0 ? leaseOptions : undefined,
        bestRecommendation,
        comparison
      };
    } catch (err) {
      console.error('❌ 금융 옵션 계산 실패 (전체 catch):', err instanceof Error ? err.message : err);
      console.error('❌ 금융 옵션 계산 스택:', err instanceof Error ? err.stack : '');

      // Fallback: 일시불만 제공
      const cashFallback = this.calculateBasicCashOption(vehicle, tcoBreakdown, userProfile);
      return {
        vehicleSellType: '일반',
        cashOption: cashFallback,
        bestRecommendation: cashFallback,
        comparison: {
          cheapest: cashFallback,
          mostAffordable: cashFallback,
          bestValue: cashFallback,
          note: '일부 금융 옵션 계산에 실패했습니다.'
        }
      };
    }
  }

  /**
   * 리스 전용 매물 추천
   */
  private async recommendLeaseOnly(
    vehicle: Vehicle,
    tcoBreakdown: TCOBreakdown,
    userProfile: UserDrivingProfile
  ): Promise<FinancingRecommendation> {
    const leaseOptions: FinancingOption[] = [];

    // 24/36개월 리스 옵션
    for (const term of [24, 36]) {
      try {
        const leaseOption = this.calculateLeaseOption(vehicle, tcoBreakdown, term, userProfile);
        leaseOptions.push(leaseOption);
      } catch (err) {
        console.error(`리스 ${term}개월 계산 실패:`, err);
      }
    }

    const bestLease = leaseOptions.length > 0
      ? leaseOptions.reduce((best, current) =>
          current.recommendation.score > best.recommendation.score ? current : best
        )
      : this.calculateLeaseOption(vehicle, tcoBreakdown, 36, userProfile);

    return {
      vehicleSellType: '리스',
      dedicatedOptions: leaseOptions,
      bestRecommendation: bestLease,
      comparison: {
        cheapest: leaseOptions[0] || bestLease,
        mostAffordable: leaseOptions[0] || bestLease,
        bestValue: bestLease,
        note: '리스 전용 매물입니다. 차량 소유권은 딜러에게 있습니다.'
      }
    };
  }

  /**
   * 렌트 전용 매물 추천 (단순 버전)
   */
  private async recommendRentalOnly(
    vehicle: Vehicle,
    userProfile: UserDrivingProfile
  ): Promise<FinancingRecommendation> {
    // 렌트는 단기이므로 간단한 계산
    const monthlyRental = Math.round(vehicle.price * 10000 * 0.025); // 차량가의 2.5%

    const rentalOption: FinancingOption = {
      type: 'lease',
      term: 12,
      downPayment: 0,
      monthlyPayment: monthlyRental,
      totalPayment: monthlyRental * 12,
      totalInterest: 0,
      tco5Year: monthlyRental * 12, // 1년만 계산
      cashFlow: [{
        year: 1,
        monthlyPayment: monthlyRental,
        vehicleTax: 0,
        insurance: 0,
        maintenance: 0,
        fuelCost: 0,
        totalAnnualCost: monthlyRental * 12,
        cumulativeCost: monthlyRental * 12
      }],
      recommendation: {
        score: 70,
        reason: '렌트 전용 매물 (단기 이용)',
        pros: ['단기 계약', '유지비 포함'],
        cons: ['소유권 없음', '장기 이용 불가']
      }
    };

    return {
      vehicleSellType: '렌트',
      dedicatedOptions: [rentalOption],
      bestRecommendation: rentalOption,
      comparison: {
        cheapest: rentalOption,
        mostAffordable: rentalOption,
        bestValue: rentalOption,
        note: '렌트 전용 매물입니다.'
      }
    };
  }

  // ============================================================================
  // 일시불 계산
  // ============================================================================

  /**
   * 일시불 옵션 계산
   */
  private calculateCashOption(
    vehicle: Vehicle,
    tcoBreakdown: TCOBreakdown,
    userProfile: UserDrivingProfile
  ): FinancingOption {
    const priceInWon = vehicle.price * 10000;

    // 보험료 (책임보험 선택 가능)
    const insurance = this.calculateInsurance(vehicle, userProfile.age, 'liability');

    // 5년 현금흐름 생성
    const cashFlow = this.generateCashFlow(
      vehicle,
      tcoBreakdown,
      0, // 월 납부액 없음
      insurance,
      userProfile,
      'cash'
    );

    // 5년 총비용 = 차량가 + TCO
    const tco5Year = priceInWon + this.sumCashFlow(cashFlow);

    // 추천 점수 계산
    const recommendation = this.scoreFinancingOption(
      'cash',
      undefined,
      0,
      tco5Year,
      userProfile
    );

    return {
      type: 'cash',
      downPayment: priceInWon,
      monthlyPayment: 0,
      totalPayment: priceInWon,
      totalInterest: 0,
      tco5Year,
      cashFlow,
      recommendation,
      financialDetails: {
        interestRate: 0,
        insuranceType: 'liability',
        monthlyIncome: userProfile.monthlyIncome,
        paymentRatio: 0
      }
    };
  }

  /**
   * 기본 일시불 계산 (Fallback용 - 에러 시)
   */
  private calculateBasicCashOption(
    vehicle: Vehicle,
    tcoBreakdown: TCOBreakdown,
    userProfile: UserDrivingProfile
  ): FinancingOption {
    const priceInWon = vehicle.price * 10000;
    const simpleTco = Object.values(tcoBreakdown).reduce((sum, val) => sum + val, 0);

    return {
      type: 'cash',
      downPayment: priceInWon,
      monthlyPayment: 0,
      totalPayment: priceInWon,
      totalInterest: 0,
      tco5Year: priceInWon + simpleTco,
      cashFlow: [{
        year: 1,
        monthlyPayment: 0,
        vehicleTax: tcoBreakdown.vehicleTax / userProfile.ownershipYears,
        insurance: priceInWon * 0.015,
        maintenance: tcoBreakdown.maintenance / userProfile.ownershipYears,
        fuelCost: tcoBreakdown.fuelCost / userProfile.ownershipYears,
        depreciation: tcoBreakdown.depreciation / userProfile.ownershipYears,
        totalAnnualCost: simpleTco / userProfile.ownershipYears,
        cumulativeCost: simpleTco / userProfile.ownershipYears
      }],
      recommendation: {
        score: 50,
        reason: '이자 부담 없음 (총 비용 최소)',
        pros: ['이자 없음', '차량 소유권 즉시'],
        cons: ['초기 목돈 필요']
      }
    };
  }

  // ============================================================================
  // 할부 계산
  // ============================================================================

  /**
   * 할부 옵션 계산 (원리금균등상환)
   */
  private calculateLoanOption(
    vehicle: Vehicle,
    tcoBreakdown: TCOBreakdown,
    term: number,
    userProfile: UserDrivingProfile
  ): FinancingOption {
    const priceInWon = vehicle.price * 10000;

    // 연령별 금리
    const annualRate = this.getInterestRate(userProfile.age, 'loan');
    const monthlyRate = annualRate / 12;

    // 원리금균등상환 공식: P × (r × (1+r)^n) / ((1+r)^n - 1)
    const monthlyPayment = this.calculateMonthlyPayment(priceInWon, monthlyRate, term);

    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - priceInWon;

    // 보험료 (할부는 종합보험 필수)
    const insurance = this.calculateInsurance(vehicle, userProfile.age, 'full');

    // 현금흐름 생성
    const cashFlow = this.generateCashFlow(
      vehicle,
      tcoBreakdown,
      monthlyPayment,
      insurance,
      userProfile,
      'loan',
      term
    );

    const tco5Year = totalPayment + this.sumCashFlow(cashFlow);

    // 추천 점수
    const recommendation = this.scoreFinancingOption(
      'loan',
      term,
      monthlyPayment,
      tco5Year,
      userProfile
    );

    const paymentRatio = userProfile.monthlyIncome
      ? monthlyPayment / userProfile.monthlyIncome
      : 0;

    return {
      type: 'loan',
      term,
      downPayment: 0,
      monthlyPayment,
      totalPayment,
      totalInterest,
      tco5Year,
      cashFlow,
      recommendation,
      financialDetails: {
        interestRate: annualRate * 100,
        insuranceType: 'full',
        monthlyIncome: userProfile.monthlyIncome,
        paymentRatio
      }
    };
  }

  /**
   * 원리금균등상환 월 납부액 계산
   */
  private calculateMonthlyPayment(
    principal: number,
    monthlyRate: number,
    months: number
  ): number {
    if (monthlyRate === 0) {
      return principal / months;
    }

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    return Math.round(principal * (numerator / denominator));
  }

  // ============================================================================
  // 리스 계산
  // ============================================================================

  /**
   * 리스 옵션 계산
   */
  private calculateLeaseOption(
    vehicle: Vehicle,
    tcoBreakdown: TCOBreakdown,
    term: number,
    userProfile: UserDrivingProfile
  ): FinancingOption {
    const priceInWon = vehicle.price * 10000;

    // 잔가 계산 (30%)
    const residualValue = Math.round(priceInWon * LEASE_RESIDUAL_VALUE_RATE);
    const depreciationCost = priceInWon - residualValue;

    // 리스 이자
    const totalInterest = Math.round(priceInWon * LEASE_INTEREST_RATE * (term / 12));

    // 월 리스료
    const monthlyPayment = Math.round((depreciationCost + totalInterest) / term);

    // 보증금 (10%)
    const downPayment = Math.round(priceInWon * 0.10);

    // 보험료 (리스는 종합보험 필수)
    const insurance = this.calculateInsurance(vehicle, userProfile.age, 'full');

    // 현금흐름 (리스는 감가상각 제외)
    const cashFlow = this.generateCashFlow(
      vehicle,
      tcoBreakdown,
      monthlyPayment,
      insurance,
      userProfile,
      'lease',
      term
    );

    const totalPayment = downPayment + (monthlyPayment * term);
    const tco5Year = totalPayment + this.sumCashFlow(cashFlow);

    // 추천 점수
    const recommendation = this.scoreFinancingOption(
      'lease',
      term,
      monthlyPayment,
      tco5Year,
      userProfile
    );

    const paymentRatio = userProfile.monthlyIncome
      ? monthlyPayment / userProfile.monthlyIncome
      : 0;

    return {
      type: 'lease',
      term,
      downPayment,
      monthlyPayment,
      totalPayment,
      totalInterest,
      tco5Year,
      cashFlow,
      recommendation,
      financialDetails: {
        interestRate: LEASE_INTEREST_RATE * 100,
        insuranceType: 'full',
        monthlyIncome: userProfile.monthlyIncome,
        paymentRatio
      }
    };
  }

  // ============================================================================
  // 보험료 및 부가 비용 계산
  // ============================================================================

  /**
   * 보험료 계산 (연간)
   */
  private calculateInsurance(
    vehicle: Vehicle,
    age: number,
    type: 'full' | 'liability'
  ): number {
    const priceInWon = vehicle.price * 10000;

    // 기본 보험료
    const baseRate = type === 'full'
      ? INSURANCE_BASE_RATE.full
      : INSURANCE_BASE_RATE.liability;

    const basePremium = priceInWon * baseRate;

    // 연령별 할증
    const ageMultiplier = this.getAgeMultiplier(age);

    return Math.round(basePremium * ageMultiplier);
  }

  /**
   * 연령별 보험료 할증률
   */
  private getAgeMultiplier(age: number): number {
    if (age < 26) return INSURANCE_AGE_MULTIPLIER["under26"];
    if (age < 35) return INSURANCE_AGE_MULTIPLIER["under35"];
    if (age < 50) return INSURANCE_AGE_MULTIPLIER["under50"];
    return INSURANCE_AGE_MULTIPLIER["over50"];
  }

  /**
   * 연령별 금리
   */
  private getInterestRate(age: number, type: 'loan' | 'lease'): number {
    if (type === 'lease') {
      return LEASE_INTEREST_RATE;
    }

    // 할부 금리
    if (age < 25) return LOAN_INTEREST_RATES["under25"];
    if (age < 35) return LOAN_INTEREST_RATES["under35"];
    if (age < 50) return LOAN_INTEREST_RATES["under50"];
    return LOAN_INTEREST_RATES["over50"];
  }

  // ============================================================================
  // 현금흐름 생성
  // ============================================================================

  /**
   * 5년 현금흐름 생성
   */
  private generateCashFlow(
    vehicle: Vehicle,
    tcoBreakdown: TCOBreakdown,
    monthlyPayment: number,
    annualInsurance: number,
    userProfile: UserDrivingProfile,
    type: 'cash' | 'loan' | 'lease',
    loanTerm?: number
  ): CashFlowYear[] {
    const cashFlow: CashFlowYear[] = [];
    const years = 5;

    // 연간 비용 분할
    const annualVehicleTax = tcoBreakdown.vehicleTax / userProfile.ownershipYears;
    const annualMaintenance = tcoBreakdown.maintenance / userProfile.ownershipYears;
    const annualFuelCost = tcoBreakdown.fuelCost / userProfile.ownershipYears;
    const annualDepreciation = type !== 'lease'
      ? tcoBreakdown.depreciation / userProfile.ownershipYears
      : 0;

    let cumulativeCost = 0;

    for (let year = 1; year <= years; year++) {
      // 할부/리스 기간 종료 체크
      const monthlyInYear = (loanTerm && year * 12 > loanTerm) ? 0 : monthlyPayment;

      const yearData: CashFlowYear = {
        year,
        monthlyPayment: monthlyInYear,
        vehicleTax: Math.round(annualVehicleTax),
        insurance: Math.round(annualInsurance),
        maintenance: Math.round(annualMaintenance),
        fuelCost: Math.round(annualFuelCost),
        totalAnnualCost: 0,
        cumulativeCost: 0
      };

      // 1년차: 초기 비용 추가
      if (year === 1) {
        if (type === 'cash' || type === 'loan') {
          yearData.acquisitionTax = tcoBreakdown.acquisitionTax;
        }
        if (type === 'cash') {
          yearData.downPayment = vehicle.price * 10000;
        }
        if (type === 'lease') {
          yearData.downPayment = Math.round(vehicle.price * 10000 * 0.10);
        }
      }

      // 감가상각 (일시불만)
      if (type === 'cash') {
        yearData.depreciation = Math.round(annualDepreciation);
      }

      // 연간 총비용 계산
      yearData.totalAnnualCost =
        (yearData.acquisitionTax || 0) +
        (yearData.downPayment || 0) +
        (monthlyInYear * 12) +
        yearData.vehicleTax +
        yearData.insurance +
        yearData.maintenance +
        yearData.fuelCost +
        (yearData.depreciation || 0);

      cumulativeCost += yearData.totalAnnualCost;
      yearData.cumulativeCost = Math.round(cumulativeCost);

      cashFlow.push(yearData);
    }

    return cashFlow;
  }

  /**
   * 현금흐름 합계 (TCO 부분만)
   */
  private sumCashFlow(cashFlow: CashFlowYear[]): number {
    return cashFlow.reduce((sum, year) => {
      return sum +
        year.vehicleTax +
        year.insurance +
        year.maintenance +
        year.fuelCost +
        (year.depreciation || 0) +
        (year.acquisitionTax || 0);
    }, 0);
  }

  // ============================================================================
  // 추천 점수 계산
  // ============================================================================

  /**
   * 금융 옵션 점수 계산 (0-100)
   */
  private scoreFinancingOption(
    type: 'cash' | 'loan' | 'lease',
    term: number | undefined,
    monthlyPayment: number,
    tco5Year: number,
    userProfile: UserDrivingProfile
  ): { score: number; reason: string; pros: string[]; cons: string[] } {
    let score = 50; // 기본 점수
    const pros: string[] = [];
    const cons: string[] = [];
    let reason = '';

    // 1. 월 소득 대비 부담 평가 (30% 이하 권장)
    if (userProfile.monthlyIncome && monthlyPayment > 0) {
      const paymentRatio = monthlyPayment / userProfile.monthlyIncome;

      if (paymentRatio < 0.20) {
        score += 20;
        pros.push(`월 소득 대비 ${(paymentRatio * 100).toFixed(1)}% - 여유로운 부담`);
      } else if (paymentRatio < 0.30) {
        score += 10;
        pros.push(`월 소득 대비 ${(paymentRatio * 100).toFixed(1)}% - 적정 수준`);
      } else if (paymentRatio < 0.40) {
        score -= 5;
        cons.push(`월 소득 대비 ${(paymentRatio * 100).toFixed(1)}% - 부담 높음`);
      } else {
        score -= 15;
        cons.push(`월 소득 대비 ${(paymentRatio * 100).toFixed(1)}% - 과도한 부담`);
      }
    }

    // 2. 타입별 장단점
    if (type === 'cash') {
      score += 30; // 이자 부담 없음
      pros.push('이자 부담 없음 (총 비용 최소)');
      pros.push('차량 소유권 즉시 확보');
      cons.push('초기 목돈 필요');
      reason = '총 비용이 가장 저렴하지만, 초기 자금 부담이 큽니다.';
    } else if (type === 'loan') {
      score += 15;
      pros.push('초기 부담 적음 (월 분할 납부)');
      pros.push('차량 소유권 확보');
      cons.push(`${term}개월 이자 부담`);
      reason = `${term}개월 할부로 월 부담을 분산하되, 이자가 발생합니다.`;

      // 할부 기간 평가 (36개월 권장)
      if (term === 36) {
        score += 5;
      } else if (term && term > 48) {
        score -= 5;
        cons.push('장기 할부로 이자 부담 증가');
      }
    } else {
      // lease
      score += 10;
      pros.push('월 부담 가장 적음');
      pros.push('신차 교체 용이');
      cons.push('차량 소유권 없음');
      cons.push('주행거리 제한 있음');
      reason = `${term}개월 리스로 월 부담이 적지만, 소유권이 없습니다.`;
    }

    // 3. 연령별 추가 점수
    if (userProfile.age < 30) {
      // 젊은 층: 리스 선호
      if (type === 'lease') score += 5;
    } else if (userProfile.age >= 40) {
      // 중장년층: 일시불 선호
      if (type === 'cash') score += 5;
    }

    // 점수 범위 제한 (0-100)
    score = Math.max(0, Math.min(100, score));

    return { score, reason, pros, cons };
  }

  // ============================================================================
  // 최적 옵션 선택
  // ============================================================================

  /**
   * 사용자 프로필 기반 최적 옵션 선택
   */
  private selectBestOption(
    options: FinancingOption[],
    userProfile: UserDrivingProfile
  ): FinancingOption {
    // 월 소득 정보가 있으면 부담 가능한 옵션만 필터링
    if (userProfile.monthlyIncome) {
      const affordableOptions = options.filter(opt => {
        if (opt.monthlyPayment === 0) return true; // 일시불
        const ratio = opt.monthlyPayment / (userProfile.monthlyIncome || 1);
        return ratio < 0.40; // 40% 이하만
      });

      if (affordableOptions.length > 0) {
        return affordableOptions.reduce((best, current) =>
          current.recommendation.score > best.recommendation.score ? current : best
        );
      }
    }

    // 기본: 종합 점수 최고
    return options.reduce((best, current) =>
      current.recommendation.score > best.recommendation.score ? current : best
    );
  }

  /**
   * 총액 최소 옵션 찾기
   */
  private findCheapest(options: FinancingOption[]): FinancingOption {
    return options.reduce((cheapest, current) =>
      current.tco5Year < cheapest.tco5Year ? current : cheapest
    );
  }

  /**
   * 월 부담 최소 옵션 찾기
   */
  private findMostAffordable(options: FinancingOption[]): FinancingOption {
    return options.reduce((mostAffordable, current) => {
      // 월 납부액 비교 (일시불은 제외)
      if (current.monthlyPayment === 0) return mostAffordable;
      if (mostAffordable.monthlyPayment === 0) return current;
      return current.monthlyPayment < mostAffordable.monthlyPayment ? current : mostAffordable;
    });
  }

  /**
   * 비교 분석 노트 생성
   */
  private generateComparisonNote(options: FinancingOption[]): string {
    const hasLoan = options.some(opt => opt.type === 'loan');
    const hasLease = options.some(opt => opt.type === 'lease');

    if (hasLoan && hasLease) {
      return '일시불은 총 비용이 적고, 리스는 월 부담이 적습니다.';
    } else if (hasLoan) {
      return '할부는 월 분할 납부로 초기 부담을 줄일 수 있습니다.';
    } else if (hasLease) {
      return '리스는 차량 교체가 용이하지만 소유권이 없습니다.';
    }

    return '';
  }
}
