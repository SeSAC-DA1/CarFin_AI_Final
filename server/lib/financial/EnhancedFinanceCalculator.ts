import type { VehicleInspect, VehicleInsurance } from "@shared/schema";
import type { Vehicle } from "@shared/types/vehicle";
import type { LoanOption, LeaseOption, InsuranceOption, VehicleFinancialInfo, TotalCostOfOwnership } from "@shared/types/financial";

interface VehicleOptionsAnalysis {
  safetyOptions: string[];
  luxuryOptions: string[];
  performanceOptions: string[];
  convenienceOptions: string[];
  totalOptionValue: number;
}

interface RiskAssessment {
  accidentRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  rateAdjustment: number;
  insurancePremium: number;
  ltv: number;
}

export class EnhancedFinanceCalculator {
  private static readonly OPTION_VALUES = {
    safety: {
      '에어백': { value: 50, insuranceDiscount: 0.05 },
      'ABS': { value: 30, insuranceDiscount: 0.03 },
      'ESP': { value: 40, insuranceDiscount: 0.04 },
      '후방카메라': { value: 35, insuranceDiscount: 0.02 },
      '블랙박스': { value: 25, insuranceDiscount: 0.02 },
      '어라운드뷰': { value: 80, insuranceDiscount: 0.06 },
      '자동긴급제동': { value: 120, insuranceDiscount: 0.08 }
    },
    luxury: {
      '선루프': { value: 150, premium: 0.02 },
      '가죽시트': { value: 100, premium: 0.01 },
      '메모리시트': { value: 80, premium: 0.01 },
      '열선시트': { value: 60, premium: 0.005 },
      '통풍시트': { value: 90, premium: 0.01 },
      '네비게이션': { value: 70, premium: 0.005 },
      'HUD': { value: 120, premium: 0.015 }
    },
    performance: {
      '터보': { value: 200, riskFactor: 0.1 },
      'AWD': { value: 300, riskFactor: 0.05 },
      '스포츠패키지': { value: 180, riskFactor: 0.08 },
      '대형휠': { value: 100, riskFactor: 0.03 },
      '스포츠서스펜션': { value: 150, riskFactor: 0.06 }
    },
    convenience: {
      '파워윈도우': { value: 30 },
      '에어컨': { value: 80 },
      '오토라이트': { value: 25 },
      '레인센서': { value: 20 },
      '스마트키': { value: 60 },
      '무선충전': { value: 40 },
      'USB충전': { value: 15 }
    }
  };

  private static readonly ACCIDENT_RISK_MATRIX = {
    '무사고': { riskLevel: 'LOW', rateAdjustment: 0, insurancePremium: 0, ltv: 85 },
    '소사고': { riskLevel: 'LOW', rateAdjustment: 0.2, insurancePremium: 0.1, ltv: 80 },
    '중사고': { riskLevel: 'MEDIUM', rateAdjustment: 0.5, insurancePremium: 0.25, ltv: 75 },
    '대사고': { riskLevel: 'HIGH', rateAdjustment: 1.0, insurancePremium: 0.4, ltv: 70 },
    '전손': { riskLevel: 'HIGH', rateAdjustment: 1.5, insurancePremium: 0.6, ltv: 65 }
  };

  public static calculateEnhancedFinance(
    vehicle: Vehicle,
    inspect?: VehicleInspect,
    insurance?: VehicleInsurance
  ): VehicleFinancialInfo {
    const optionsAnalysis = EnhancedFinanceCalculator.analyzeVehicleOptions(vehicle.options?.join(',') || null);
    const riskAssessment = EnhancedFinanceCalculator.assessVehicleRisk(vehicle, inspect, insurance);
    const warrantyBenefit = EnhancedFinanceCalculator.calculateWarrantyBenefit(inspect?.warrantyType);

    const loanOptions = EnhancedFinanceCalculator.calculatePreciseLoanOptions(
      vehicle, optionsAnalysis, riskAssessment, warrantyBenefit
    );
    const leaseOptions = EnhancedFinanceCalculator.calculatePreciseLeaseOptions(
      vehicle, optionsAnalysis, riskAssessment
    );
    const insuranceOptions = EnhancedFinanceCalculator.calculatePreciseInsuranceOptions(
      vehicle, optionsAnalysis, riskAssessment
    );

    const firstLoan = loanOptions[0];
    const firstInsurance = insuranceOptions[0];
    const tco = (firstLoan && firstInsurance)
      ? EnhancedFinanceCalculator.calculateEnhancedTCO(vehicle, firstLoan, firstInsurance, optionsAnalysis)
      : {} as TotalCostOfOwnership;

    return {
      vehicleId: vehicle.vehicleId.toString(),
      loanOptions,
      leaseOptions,
      insuranceOptions,
      tco,
      recommendedOption: 'loan',
      savingsAmount: 0,
    };
  }

  private static analyzeVehicleOptions(hasOptions: string | null): VehicleOptionsAnalysis {
    if (!hasOptions) {
      return { safetyOptions: [], luxuryOptions: [], performanceOptions: [], convenienceOptions: [], totalOptionValue: 0 };
    }

    const options = hasOptions.toLowerCase().split(',').map(opt => opt.trim());
    const analysis: VehicleOptionsAnalysis = { safetyOptions: [], luxuryOptions: [], performanceOptions: [], convenienceOptions: [], totalOptionValue: 0 };

    options.forEach(option => {
      Object.keys(EnhancedFinanceCalculator.OPTION_VALUES.safety).forEach(safetyOpt => {
        if (option.includes(safetyOpt.toLowerCase())) {
          analysis.safetyOptions.push(safetyOpt);
          analysis.totalOptionValue += EnhancedFinanceCalculator.OPTION_VALUES.safety[safetyOpt as keyof typeof EnhancedFinanceCalculator.OPTION_VALUES.safety].value;
        }
      });
      Object.keys(EnhancedFinanceCalculator.OPTION_VALUES.luxury).forEach(luxuryOpt => {
        if (option.includes(luxuryOpt.toLowerCase())) {
          analysis.luxuryOptions.push(luxuryOpt);
          analysis.totalOptionValue += EnhancedFinanceCalculator.OPTION_VALUES.luxury[luxuryOpt as keyof typeof EnhancedFinanceCalculator.OPTION_VALUES.luxury].value;
        }
      });
      Object.keys(EnhancedFinanceCalculator.OPTION_VALUES.performance).forEach(perfOpt => {
        if (option.includes(perfOpt.toLowerCase())) {
          analysis.performanceOptions.push(perfOpt);
          analysis.totalOptionValue += EnhancedFinanceCalculator.OPTION_VALUES.performance[perfOpt as keyof typeof EnhancedFinanceCalculator.OPTION_VALUES.performance].value;
        }
      });
      Object.keys(EnhancedFinanceCalculator.OPTION_VALUES.convenience).forEach(convOpt => {
        if (option.includes(convOpt.toLowerCase())) {
          analysis.convenienceOptions.push(convOpt);
          analysis.totalOptionValue += EnhancedFinanceCalculator.OPTION_VALUES.convenience[convOpt as keyof typeof EnhancedFinanceCalculator.OPTION_VALUES.convenience].value;
        }
      });
    });

    return analysis;
  }

  private static assessVehicleRisk(
    vehicle: Vehicle,
    inspect?: VehicleInspect,
    insurance?: VehicleInsurance
  ): RiskAssessment {
    let baseRisk = EnhancedFinanceCalculator.ACCIDENT_RISK_MATRIX['무사고'];

    if (inspect?.accidentHistory && inspect.accidentHistory !== '무사고') {
      const accidentType = inspect.accidentHistory as keyof typeof EnhancedFinanceCalculator.ACCIDENT_RISK_MATRIX;
      baseRisk = EnhancedFinanceCalculator.ACCIDENT_RISK_MATRIX[accidentType] || baseRisk;
    }

    if (insurance) {
      const totalAccidentCost = (insurance.myAccidentCost || 0) + (insurance.otherAccidentCost || 0);
      if (totalAccidentCost > 5000000) {
        baseRisk.rateAdjustment += 0.3;
        baseRisk.insurancePremium += 0.15;
        baseRisk.ltv -= 5;
      }
      if (insurance.ownerChangeCnt && insurance.ownerChangeCnt > 3) {
        baseRisk.rateAdjustment += 0.2;
        baseRisk.ltv -= 3;
      }
    }

    const vehicleAge = 2024 - (vehicle.modelYear || 2020);
    if (vehicleAge > 7) {
      baseRisk.rateAdjustment += 0.5;
      baseRisk.ltv -= 5;
    }

    return {
      accidentRiskLevel: baseRisk.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
      rateAdjustment: Math.min(baseRisk.rateAdjustment, 2.5),
      insurancePremium: Math.min(baseRisk.insurancePremium, 0.8),
      ltv: Math.max(baseRisk.ltv, 60)
    };
  }

  private static calculateWarrantyBenefit(warrantyType?: string | null): number {
    if (!warrantyType) return 0;
    const benefits = {
      '무상AS': 0.1,
      '유상AS': 0.05,
      '보증연장': 0.15,
      '무보증': 0
    };
    return benefits[warrantyType as keyof typeof benefits] || 0;
  }

  private static calculatePreciseLoanOptions(
    vehicle: Vehicle,
    options: VehicleOptionsAnalysis,
    risk: RiskAssessment,
    warrantyBenefit: number
  ): LoanOption[] {
    const baseProviders = [
      { name: '현대캐피탈', baseRate: 4.5, maxLTV: 80 },
      { name: '신한캐피탈', baseRate: 4.2, maxLTV: 85 },
      { name: 'KB캐피탈', baseRate: 4.7, maxLTV: 80 }
    ];

    return baseProviders.map(provider => {
      let adjustedRate = provider.baseRate;
      adjustedRate += risk.rateAdjustment;
      adjustedRate -= warrantyBenefit;

      const optionDiscount = Math.min(options.totalOptionValue / 10000, 0.3);
      adjustedRate -= optionDiscount;

      const adjustedLTV = Math.min(provider.maxLTV, risk.ltv);
      const vehiclePrice = (vehicle.price || 0) * 10000;
      const maxLoanAmount = vehiclePrice * (adjustedLTV / 100);

      const enhancedVehicleValue = vehiclePrice + (options.totalOptionValue * 10000);
      const downPayment = enhancedVehicleValue * 0.2;
      const loanAmount = Math.min(maxLoanAmount, enhancedVehicleValue - downPayment);

      const monthlyRate = Math.max(adjustedRate, 2.0) / 100 / 12;
      const periods = 60;
      const monthlyPayment = loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, periods)) /
        (Math.pow(1 + monthlyRate, periods) - 1);

      return {
        provider: provider.name,
        productName: `${provider.name} 정밀분석 중고차대출`,
        interestRate: Math.round(adjustedRate * 100) / 100,
        monthlyPayment: Math.round(monthlyPayment),
        totalAmount: Math.round(monthlyPayment * periods + downPayment),
        loanPeriod: 60,
        downPayment: Math.round(downPayment),
      };
    });
  }

  private static calculatePreciseLeaseOptions(
    vehicle: Vehicle,
    options: VehicleOptionsAnalysis,
    risk: RiskAssessment
  ): LeaseOption[] {
    const baseProviders = [
      { name: '현대캐피탈 리스', baseRate: 3.8, residualRate: 40 },
      { name: 'SK렌터카 리스', baseRate: 3.9, residualRate: 38 }
    ];

    return baseProviders.map(provider => {
      const vehiclePrice = (vehicle.price || 0) * 10000;
      const enhancedValue = vehiclePrice + (options.totalOptionValue * 10000);

      let adjustedResidualRate = provider.residualRate;
      if (risk.accidentRiskLevel === 'HIGH') {
        adjustedResidualRate -= 5;
      }

      const residualValue = enhancedValue * (adjustedResidualRate / 100);
      const depreciationAmount = enhancedValue - residualValue;

      const monthlyDepreciation = depreciationAmount / 36;
      const monthlyFinance = (enhancedValue + residualValue) * (provider.baseRate / 100 / 12);
      const monthlyPayment = monthlyDepreciation + monthlyFinance;

      return {
        provider: provider.name,
        productName: `${provider.name} 정밀분석 36개월`,
        monthlyPayment: Math.round(monthlyPayment),
        leasePeriod: 36,
        downPayment: Math.round(enhancedValue * 0.1),
        residualValue: Math.round(residualValue),
        maintenanceIncluded: provider.name.includes('렌터카'),
      };
    });
  }

  private static calculatePreciseInsuranceOptions(
    vehicle: Vehicle,
    options: VehicleOptionsAnalysis,
    risk: RiskAssessment
  ): InsuranceOption[] {
    const baseProviders = [
      { name: '삼성화재', basePremium: 80000, discountRate: 0.15 },
      { name: 'DB손해보험', basePremium: 75000, discountRate: 0.12 }
    ];

    return baseProviders.map(provider => {
      let premium = provider.basePremium;
      const priceMultiplier = Math.max(0.5, Math.min(2.0, (vehicle.price || 3000) / 3000));
      premium *= priceMultiplier;
      premium *= (1 + risk.insurancePremium);

      let safetyDiscount = 0;
      options.safetyOptions.forEach(safetyOpt => {
        const optionData = EnhancedFinanceCalculator.OPTION_VALUES.safety[safetyOpt as keyof typeof EnhancedFinanceCalculator.OPTION_VALUES.safety];
        if (optionData) {
          safetyDiscount += optionData.insuranceDiscount;
        }
      });

      premium *= (1 - Math.min(safetyDiscount, 0.25));

      return {
        provider: provider.name,
        productName: `${provider.name} 정밀분석 종합보험`,
        monthlyPremium: Math.round(premium),
        coverage: {
          liability: 300000000,
          property: 200000000,
          ownDamage: (vehicle.price || 0) * 10000,
          injury: 150000000
        },
        deductible: 200000,
      };
    });
  }

  private static calculateEnhancedTCO(
    vehicle: Vehicle,
    loanOption: LoanOption,
    insuranceOption: InsuranceOption,
    options: VehicleOptionsAnalysis
  ): TotalCostOfOwnership {
    const vehiclePrice = (vehicle.price || 0) * 10000;
    const enhancedValue = vehiclePrice + (options.totalOptionValue * 10000);
    const financingCost = loanOption.totalAmount - enhancedValue;
    let maintenanceCost = enhancedValue * 0.05 * 5;
    const luxuryPremium = options.luxuryOptions.length * 50000 * 5;
    maintenanceCost += luxuryPremium;
    const totalCost = enhancedValue + financingCost + 9000000 + (insuranceOption.monthlyPremium * 60) + maintenanceCost + (enhancedValue * 0.07) + 400000 + (enhancedValue * 0.6);

    return {
      vehiclePrice: enhancedValue,
      financingCost,
      fuelCost: 120 * 15000 * 5,
      insuranceCost: insuranceOption.monthlyPremium * 12 * 5,
      maintenanceCost,
      taxCost: enhancedValue * 0.07 + 400000,
      depreciation: enhancedValue * 0.6,
      totalCost,
      monthlyAverage: totalCost / 60,
    };
  }

  private static calculatePrecisionScore(
    vehicle: Vehicle,
    inspect?: VehicleInspect,
    insurance?: VehicleInsurance
  ): number {
    let score = 60;
    if (vehicle.options && vehicle.options.length > 10) {
      score += 15;
    }
    if (inspect) {
      score += 15;
    }
    if (insurance) {
      score += 10;
    }
    return Math.min(score, 100);
  }
}
