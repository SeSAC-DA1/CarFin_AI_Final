// 🏦 실제 한국 자동차 금융 시장 기반 계산 엔진

import { LoanOption, LeaseOption, InsuranceOption, TotalCostOfOwnership, VehicleFinancialInfo, UserFinancialProfile } from '@shared/types/financial';

interface VehicleBasicInfo {
  price: number;      // 차량 가격 (만원)
  year: number;       // 연식
  mileage: number;    // 주행거리
  manufacturer: string; // 제조사
  fuelType: string;   // 연료타입
}

export class VehicleFinanceCalculator {
  // 🏦 실제 한국 금융사 데이터 (2024년 기준)
  private static readonly FINANCIAL_PROVIDERS = {
    loans: [
      { name: '현대캐피탈', baseRate: 4.5, maxLTV: 80 },
      { name: '신한캐피탈', baseRate: 4.2, maxLTV: 85 },
      { name: 'KB캐피탈', baseRate: 4.7, maxLTV: 80 },
      { name: '롯데캐피탈', baseRate: 4.8, maxLTV: 75 },
      { name: '하나캐피탈', baseRate: 4.6, maxLTV: 80 }
    ],
    leases: [
      { name: '현대캐피탈 리스', baseRate: 3.8, residualRate: 40 },
      { name: 'SK렌터카 리스', baseRate: 3.9, residualRate: 38 },
      { name: 'AJ렌터카 리스', baseRate: 4.1, residualRate: 42 },
      { name: '롯데렌터카 리스', baseRate: 4.0, residualRate: 40 }
    ],
    insurance: [
      { name: '삼성화재', basePremium: 80000, discountRate: 0.15 },
      { name: 'DB손해보험', basePremium: 75000, discountRate: 0.12 },
      { name: '현대해상', basePremium: 78000, discountRate: 0.14 },
      { name: 'KB손해보험', basePremium: 77000, discountRate: 0.13 },
      { name: 'NH농협손해보험', basePremium: 74000, discountRate: 0.11 }
    ]
  };

  // 🚗 차량별 운영비 계수 (실제 데이터 기반)
  private static readonly OPERATING_COSTS = {
    // 연료비 (km당 원, 연간 15,000km 가정)
    fuel: {
      '가솔린': 140,
      '디젤': 120,
      '하이브리드': 80,
      'LPG': 90,
      '전기': 40
    },
    // 정비비 (연간, 차량가격 대비 %)
    maintenance: {
      '현대': 0.04,
      '기아': 0.04,
      'BMW': 0.08,
      '벤츠': 0.09,
      '아우디': 0.08,
      '토요타': 0.03,
      '렉서스': 0.05,
      '기본': 0.05
    },
    // 감가상각률 (연간 %)
    depreciation: {
      'new': 0.20,      // 신차 첫해
      'year1-3': 0.15,  // 1-3년차
      'year4-7': 0.12,  // 4-7년차
      'year8+': 0.08    // 8년 이상
    }
  };

  /**
   * 차량별 맞춤 금융 정보 계산
   */
  public static calculateVehicleFinance(
    vehicle: VehicleBasicInfo,
    userProfile?: UserFinancialProfile
  ): VehicleFinancialInfo {
    const vehiclePrice = vehicle.price * 10000; // 만원 -> 원 변환

    // 1. 대출 옵션 계산
    const loanOptions = this.calculateLoanOptions(vehiclePrice, vehicle, userProfile);

    // 2. 리스 옵션 계산
    const leaseOptions = this.calculateLeaseOptions(vehiclePrice, vehicle);

    // 3. 보험 옵션 계산
    const insuranceOptions = this.calculateInsuranceOptions(vehicle);

    // 4. 총 소유비용(TCO) 계산
    const firstLoan = loanOptions[0];
    const firstInsurance = insuranceOptions[0];
    if (!firstLoan || !firstInsurance) {
      throw new Error('Failed to calculate loan or insurance options');
    }
    const tco = this.calculateTCO(vehicle, firstLoan, firstInsurance);

    // 5. 최적 옵션 추천
    const { recommendedOption, savingsAmount } = this.recommendBestOption(
      loanOptions, leaseOptions, userProfile
    );

    return {
      vehicleId: vehicle.manufacturer + vehicle.year,
      loanOptions,
      leaseOptions,
      insuranceOptions,
      tco,
      recommendedOption,
      savingsAmount
    };
  }

  /**
   * 대출 옵션 계산 (실제 금융사 조건 반영)
   */
  private static calculateLoanOptions(
    vehiclePrice: number,
    vehicle: VehicleBasicInfo,
    userProfile?: UserFinancialProfile
  ): LoanOption[] {
    return this.FINANCIAL_PROVIDERS.loans.map(provider => {
      // 차량 연식에 따른 금리 조정
      const ageAdjustment = this.calculateAgeAdjustment(vehicle.year);

      // 신용등급에 따른 금리 조정 (가정)
      const creditAdjustment = userProfile?.creditScore
        ? (900 - userProfile.creditScore) * 0.01
        : 1.0;

      const adjustedRate = provider.baseRate + ageAdjustment + creditAdjustment;

      // LTV 적용
      const maxLoanAmount = vehiclePrice * (provider.maxLTV / 100);
      const downPayment = userProfile?.downPaymentBudget || vehiclePrice * 0.2; // 기본 20%
      const loanAmount = Math.min(maxLoanAmount, vehiclePrice - downPayment);

      // 60개월 기준 월 상환금 계산
      const monthlyRate = adjustedRate / 100 / 12;
      const periods = 60;
      const monthlyPayment = loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, periods)) /
        (Math.pow(1 + monthlyRate, periods) - 1);

      return {
        provider: provider.name,
        productName: `${provider.name} 중고차 대출`,
        interestRate: adjustedRate,
        monthlyPayment: Math.round(monthlyPayment),
        totalAmount: Math.round(monthlyPayment * periods + downPayment),
        loanPeriod: 60,
        downPayment: Math.round(downPayment)
      };
    });
  }

  /**
   * 리스 옵션 계산
   */
  private static calculateLeaseOptions(
    vehiclePrice: number,
    vehicle: VehicleBasicInfo
  ): LeaseOption[] {
    return this.FINANCIAL_PROVIDERS.leases.map(provider => {
      const residualValue = vehiclePrice * (provider.residualRate / 100);
      const depreciationAmount = vehiclePrice - residualValue;

      // 36개월 리스 기준
      const monthlyDepreciation = depreciationAmount / 36;
      const monthlyFinance = (vehiclePrice + residualValue) * (provider.baseRate / 100 / 12);
      const monthlyPayment = monthlyDepreciation + monthlyFinance;

      return {
        provider: provider.name,
        productName: `${provider.name} 36개월`,
        monthlyPayment: Math.round(monthlyPayment),
        leasePeriod: 36,
        downPayment: Math.round(vehiclePrice * 0.1), // 보증금 10%
        residualValue: Math.round(residualValue),
        maintenanceIncluded: provider.name.includes('렌터카')
      };
    });
  }

  /**
   * 보험 옵션 계산 (차량 특성 반영)
   */
  private static calculateInsuranceOptions(vehicle: VehicleBasicInfo): InsuranceOption[] {
    return this.FINANCIAL_PROVIDERS.insurance.map(provider => {
      // 차량 가격에 따른 보험료 조정
      const priceMultiplier = Math.max(0.5, Math.min(2.0, vehicle.price / 3000));

      // 차량 연식에 따른 할인
      const ageDiscount = vehicle.year >= 2020 ? 0.9 :
                         vehicle.year >= 2017 ? 0.8 : 0.7;

      const basePremium = provider.basePremium * priceMultiplier * ageDiscount;
      const monthlyPremium = basePremium * (1 - provider.discountRate);

      return {
        provider: provider.name,
        productName: `${provider.name} 종합보험`,
        monthlyPremium: Math.round(monthlyPremium),
        coverage: {
          liability: 300000000,  // 대인 3억
          property: 200000000,   // 대물 2억
          ownDamage: vehicle.price * 10000, // 자차 = 차량가
          injury: 150000000      // 자상 1.5억
        },
        deductible: 200000       // 자부담 20만원
      };
    });
  }

  /**
   * 총 소유비용(TCO) 계산 (5년 기준)
   */
  private static calculateTCO(
    vehicle: VehicleBasicInfo,
    loanOption: LoanOption,
    insuranceOption: InsuranceOption
  ): TotalCostOfOwnership {
    const vehiclePrice = vehicle.price * 10000;

    // 1. 금융 비용 (이자)
    const financingCost = loanOption.totalAmount - vehiclePrice;

    // 2. 연료비 (연간 15,000km × 5년)
    const fuelCostPerKm = this.OPERATING_COSTS.fuel[vehicle.fuelType as keyof typeof this.OPERATING_COSTS.fuel] || 120;
    const fuelCost = fuelCostPerKm * 15000 * 5;

    // 3. 보험료 (5년)
    const insuranceCost = insuranceOption.monthlyPremium * 12 * 5;

    // 4. 정비비 (제조사별 계수 적용)
    const maintenanceRate = this.OPERATING_COSTS.maintenance[vehicle.manufacturer as keyof typeof this.OPERATING_COSTS.maintenance] || 0.05;
    const maintenanceCost = vehiclePrice * maintenanceRate * 5;

    // 5. 세금 (취득세 + 자동차세 5년)
    const acquisitionTax = vehiclePrice * 0.07; // 취득세 7%
    const carTax = Math.max(80000, vehiclePrice * 0.001) * 5; // 연간 자동차세
    const taxCost = acquisitionTax + carTax;

    // 6. 감가상각 (5년 후 잔가 손실)
    const currentAge = 2024 - vehicle.year;
    const futureAge = currentAge + 5;
    const depreciationRate = futureAge > 10 ? 0.7 :
                           futureAge > 7 ? 0.6 :
                           futureAge > 5 ? 0.5 : 0.4;
    const futureValue = vehiclePrice * (1 - depreciationRate);
    const depreciation = vehiclePrice - futureValue;

    // 총계 계산
    const totalCost = vehiclePrice + financingCost + fuelCost + insuranceCost +
                     maintenanceCost + taxCost + depreciation;

    return {
      vehiclePrice,
      financingCost,
      fuelCost,
      insuranceCost,
      maintenanceCost,
      taxCost,
      depreciation,
      totalCost,
      monthlyAverage: Math.round(totalCost / 60) // 5년 = 60개월
    };
  }

  /**
   * 최적 금융 옵션 추천
   */
  private static recommendBestOption(
    loanOptions: LoanOption[],
    leaseOptions: LeaseOption[],
    userProfile?: UserFinancialProfile
  ): { recommendedOption: 'loan' | 'lease'; savingsAmount: number } {
    if (!userProfile?.preferredPaymentType || userProfile.preferredPaymentType === 'cash') {
      // 현금 구매가 불가능한 경우, 총비용이 낮은 옵션 추천
      const bestLoan = loanOptions[0];
      const bestLease = leaseOptions[0];

      if (!bestLoan || !bestLease) {
        return { recommendedOption: 'cash', savingsAmount: 0 };
      }

      const loanTotalCost = bestLoan.totalAmount;
      const leaseTotalCost = bestLease.monthlyPayment * bestLease.leasePeriod + bestLease.downPayment;

      if (loanTotalCost < leaseTotalCost) {
        return {
          recommendedOption: 'loan',
          savingsAmount: leaseTotalCost - loanTotalCost
        };
      } else {
        return {
          recommendedOption: 'lease',
          savingsAmount: loanTotalCost - leaseTotalCost
        };
      }
    }

    // 사용자 선호도에 따른 추천
    return {
      recommendedOption: userProfile.preferredPaymentType === 'lease' ? 'lease' : 'loan',
      savingsAmount: 0
    };
  }

  /**
   * 차량 연식에 따른 금리 조정 계산
   */
  private static calculateAgeAdjustment(year: number): number {
    const age = 2024 - year;
    if (age <= 3) return 0;      // 3년 이하: 추가 금리 없음
    if (age <= 5) return 0.5;    // 4-5년: +0.5%
    if (age <= 7) return 1.0;    // 6-7년: +1.0%
    if (age <= 10) return 1.5;   // 8-10년: +1.5%
    return 2.0;                  // 10년 초과: +2.0%
  }
}