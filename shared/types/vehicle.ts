/**
 * 공통 Vehicle 타입 정의
 * DB 스키마와 애플리케이션 로직에서 사용하는 통합 타입
 */

// DB에서 조회한 원시 데이터 타입 (모든 필드가 nullable)
export interface RawVehicleData {
  vehicleId: number;
  carSeq: number;
  vehicleNo: string;
  platform: string | null;
  origin: string | null;
  carType: string | null;
  manufacturer: string | null;
  modelGroup: string | null;
  model: string | null;
  grade: string | null;
  trim: string | null;
  fuelType: string | null;
  transmission: string | null;
  displacement: number | null;
  colorName: string | null;
  modelYear: number | null;
  firstRegistrationDate: number | null;
  distance: number | null;
  price: number | null;
  originPrice: number | null;
  sellType: string | null;
  location: string | null;
  detailUrl: string | null;
  photo: string | null;
  hasOptions: string | null;
}

// 애플리케이션에서 사용하는 정제된 Vehicle 타입
export interface Vehicle {
  vehicleId: number;
  manufacturer: string;
  model: string;
  modelYear: number;
  price: number;
  distance: number;
  fuelType: string;
  location: string;
  sellType?: string | undefined;          // 🆕 Phase 3-E: 매물 타입 ('일반', '리스', '렌트')
  photo?: string | undefined;
  detailUrl?: string | undefined;
  options?: string[] | undefined;
  carType?: string | undefined;
  grade?: string | undefined;
  transmission?: string | undefined;
  displacement?: number | undefined;
  color?: string | undefined;
  originPrice?: number | undefined;
  myAccidentCost?: number | undefined;
  otherAccidentCost?: number | undefined;

  // 🆕 Phase 3-E: 금융 옵션 (FinancialAdvisorAgent에서 추가)
  financingOptions?: FinancingRecommendation | undefined;

  // TCO 데이터 (기존)
  tco?: {
    total: number;
    breakdown: any;
    confidence?: number;
    ownershipYears?: number;
    timeline?: any;
  } | undefined;
}

// 검색 필터 타입
export interface VehicleSearchFilters {
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minYear?: number | undefined;
  maxYear?: number | undefined;
  fuelType?: string | undefined;
  manufacturer?: string | undefined;
  manufacturers?: string[] | undefined;  // 🆕 복수 브랜드 필터 (IN 절)
  model?: string | undefined;
  carType?: string | undefined;
  location?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;

  // 🆕 Phase 3-E: 매물 타입 필터
  sellType?: '일반' | '리스' | '렌트' | 'all' | undefined;
}

// Raw 데이터를 Vehicle로 변환하는 유틸리티 함수
export function rawToVehicle(raw: RawVehicleData): Vehicle {
  return {
    vehicleId: raw.vehicleId,
    manufacturer: raw.manufacturer || '알 수 없음',
    model: raw.model || '알 수 없음',
    modelYear: raw.modelYear || 0,
    price: raw.price || 0,
    distance: raw.distance || 0,
    fuelType: raw.fuelType || '알 수 없음',
    location: raw.location || '알 수 없음',
    sellType: raw.sellType || undefined,  // 🆕 Phase 3-E: 매물 타입 매핑
    photo: raw.photo || undefined,
    detailUrl: raw.detailUrl || undefined,
    options: raw.hasOptions && typeof raw.hasOptions === 'string'
      ? raw.hasOptions.split(',').map(o => o.trim())
      : (Array.isArray(raw.hasOptions) ? raw.hasOptions : []),
    carType: raw.carType || undefined,
    grade: raw.grade || undefined,
    transmission: raw.transmission || undefined,
    displacement: raw.displacement || undefined,
    color: raw.colorName || undefined,
    originPrice: raw.originPrice || undefined,
  };
}

// Vehicle 배열 변환 헬퍼
export function rawArrayToVehicles(rawArray: RawVehicleData[]): Vehicle[] {
  return rawArray.map(rawToVehicle);
}

// ============================================================================
// 📊 Finance & TCO Types (Phase 3-E: 금융 에이전트 시스템)
// ============================================================================

/**
 * 사용자 주행 프로필 (TCO 개인화 계산용)
 */
export interface UserDrivingProfile {
  annualKm: number;          // 연간 주행거리 (기본: 15,000km)
  ownershipYears: number;    // 보유 기간 (기본: 3년)
  age: number;               // 사용자 연령 (보험료 계산용)
  monthlyIncome?: number;    // 월 소득 (선택, 금융 추천 가중치용)
  hasOtherLoans?: boolean;   // 기타 대출 여부 (할부 가능 여부)
}

/**
 * 연도별 현금흐름 (5년 시뮬레이션)
 */
export interface CashFlowYear {
  year: number;              // 1, 2, 3, 4, 5

  // 초기 비용 (1년차만)
  acquisitionTax?: number;   // 취득세 (지방세법 제11조 - 7%)
  downPayment?: number;      // 계약금 (할부) or 보증금 (리스)

  // 고정 월 비용 (× 12개월)
  monthlyPayment: number;    // 할부금 또는 리스료

  // 연간 고정 비용
  vehicleTax: number;        // 자동차세 (지방세법 제127조)
  insurance: number;         // 보험료 (종합/책임)

  // 변동 비용 (주행거리 기반)
  maintenance: number;       // 정비비 (DOE/ANL 88원/km)
  fuelCost: number;          // 연료비 (유가 × 연비)

  // 감가상각 (일시불만)
  depreciation?: number;     // 정률법 20%

  // 합계
  totalAnnualCost: number;   // 연간 총비용
  cumulativeCost: number;    // 누적 총비용
}

/**
 * 금융 옵션 (일시불, 할부, 리스)
 */
export interface FinancingOption {
  type: 'cash' | 'loan' | 'lease';
  term?: number;             // 개월수 (할부/리스만 해당, 24/36/48/60)

  // 초기 비용
  downPayment: number;       // 계약금 또는 보증금

  // 월 비용
  monthlyPayment: number;    // 월 납부액 (0원 for cash)

  // 총 비용 (5년 기준)
  totalPayment: number;      // 총 납부 금액
  totalInterest: number;     // 총 이자 (할부/리스만)
  tco5Year: number;          // TCO + 금융비용 합계

  // 현금흐름
  cashFlow: CashFlowYear[];  // 5년 연도별 비용

  // 추천 근거
  recommendation: {
    score: number;           // 0-100 (사용자 프로필 기반)
    reason: string;          // 추천 이유 한줄
    pros: string[];          // 장점 2-3개
    cons: string[];          // 단점 1-2개
  };

  // 금융 상품 세부 정보
  financialDetails?: {
    interestRate: number;    // 연 이자율 (%)
    insuranceType: 'full' | 'liability';  // 보험 종류
    monthlyIncome?: number;  // 월 소득 (부담률 계산용)
    paymentRatio?: number;   // 월 소득 대비 납부액 비율
  };
}

/**
 * 차량별 금융 추천 결과
 */
export interface FinancingRecommendation {
  vehicleSellType: '일반' | '리스' | '렌트';

  // 일반 매물: 3가지 옵션 모두
  cashOption?: FinancingOption;
  loanOptions?: FinancingOption[];  // 24/36/48/60개월
  leaseOptions?: FinancingOption[]; // 24/36개월

  // 리스/렌트 전용 매물: 해당 옵션만
  dedicatedOptions?: FinancingOption[];

  // AI 최종 추천
  bestRecommendation: FinancingOption;

  // 비교 분석
  comparison: {
    cheapest: FinancingOption;           // 총액 최소
    mostAffordable: FinancingOption;     // 월 부담 최소
    bestValue: FinancingOption;          // 종합 점수 최고
    note?: string;                       // 특이사항
  };
}

/**
 * 차량 추천 결과 (기존 타입 확장)
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

  // 🆕 Phase 3-E: 금융 옵션 추가
  financingOptions?: FinancingRecommendation;

  // 🆕 TCO 상세 정보 (선택적)
  tco?: {
    totalCost: number;
    breakdown: {
      acquisitionTax: number;
      vehicleTax: number;
      maintenance: number;
      depreciation: number;
      fuelCost: number;
    };
  };
}

// ============================================================================
// 🤝 Agent System Types (Phase 3-A: Result Aggregation)
// ============================================================================

/**
 * Agent 투표 결과
 */
export interface AgentVote {
  agent: string;             // 'user_analyst' | 'searcher' | 'evaluator'
  rank: number;              // 순위 (1-10)
  score: number;             // 점수 (0-1)
  agentWeight: number;       // Agent 가중치 (0-1)
  reason?: string;           // 투표 이유
}

/**
 * 차량별 투표 집계
 */
export interface VotingResult {
  vehicleId: number;
  votes: AgentVote[];
  weightedScore: number;     // 가중 점수 합계
  agreement: 'unanimous' | 'majority' | 'conflict';  // 합의 수준
}

/**
 * Result Aggregation 합의 결과
 */
export interface ConsensusResult {
  // 최종 순위
  finalRanking: VehicleRecommendation[];

  // 투표 메타데이터
  votingMetadata: {
    totalVotes: number;           // 총 투표 수
    unanimousCount: number;       // 만장일치 개수
    majorityCount: number;        // 다수 합의 개수
    conflictCount: number;        // 충돌 개수
    avgAgreementScore: number;    // 평균 합의 점수 (0-1)
    executionTime: number;        // 실행 시간 (ms)
  };

  // 투표 상세 (디버깅/시각화용)
  votingDetails?: VotingResult[];
}
