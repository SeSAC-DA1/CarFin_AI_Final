// 🏦 금융 상품 및 계산 타입 정의

export interface LoanOption {
  provider: string;          // 금융사명 (현대캐피탈, 신한캐피탈 등)
  productName: string;       // 상품명
  interestRate: number;      // 연이율 (%)
  monthlyPayment: number;    // 월 납입금 (원)
  totalAmount: number;       // 총 납입금액 (원)
  loanPeriod: number;        // 대출 기간 (개월)
  downPayment: number;       // 초기 납입금 (원)
}

export interface LeaseOption {
  provider: string;          // 리스사명
  productName: string;       // 상품명
  monthlyPayment: number;    // 월 리스료 (원)
  leasePeriod: number;       // 리스 기간 (개월)
  downPayment: number;       // 보증금 (원)
  residualValue: number;     // 잔가 (원)
  maintenanceIncluded: boolean; // 정비 포함 여부
}

export interface InsuranceOption {
  provider: string;          // 보험사명
  productName: string;       // 상품명
  monthlyPremium: number;    // 월 보험료 (원)
  coverage: {
    liability: number;       // 대인배상 (원)
    property: number;        // 대물배상 (원)
    ownDamage: number;      // 자차보상 (원)
    injury: number;         // 자상보상 (원)
  };
  deductible: number;       // 자기부담금 (원)
}

export interface TotalCostOfOwnership {
  vehiclePrice: number;      // 차량 가격

  // 금융 비용
  financingCost: number;     // 금융 이자 비용

  // 운영 비용 (5년 기준)
  fuelCost: number;         // 연료비
  insuranceCost: number;    // 보험료
  maintenanceCost: number;  // 정비비
  taxCost: number;          // 세금 (취득세, 자동차세)

  // 감가상각
  depreciation: number;      // 5년 후 잔가 손실

  // 총계
  totalCost: number;        // 5년 총 소유비용
  monthlyAverage: number;   // 월평균 비용
}

export interface VehicleFinancialInfo {
  vehicleId: string;
  loanOptions: LoanOption[];
  leaseOptions: LeaseOption[];
  insuranceOptions: InsuranceOption[];
  tco: TotalCostOfOwnership;
  recommendedOption: 'loan' | 'lease';
  savingsAmount: number;    // 추천 옵션으로 절약되는 금액
}

// 🎯 사용자 금융 프로필
export interface UserFinancialProfile {
  creditScore?: number;      // 신용점수
  monthlyIncome?: number;    // 월소득
  existingDebt?: number;     // 기존 부채
  preferredPaymentType: 'loan' | 'lease' | 'cash';
  maxMonthlyPayment: number; // 최대 월 납입가능금액
  downPaymentBudget: number; // 초기 납입가능금액
}

// 🤖 금융 상담 에이전트 응답
export interface FinancialAdviceResponse {
  recommendation: string;    // 추천 금융상품
  reasoning: string[];      // 추천 이유
  riskAssessment: string;   // 리스크 평가
  alternatives: string[];   // 대안 제시
  actionItems: string[];    // 구체적 액션 아이템
}