/**
 * 손상비율 정교한 계산 시스템 (팀원 코드에서 포팅)
 * 사고 이력을 기반으로 차량의 신뢰도 점수 계산
 */

/**
 * 만원 단위 변환 계수 (팀원 코드 기준)
 */
const MY_COST_TO_MANWON = 1.0 / 10000.0;    // 자기 사고비용
const OTHER_COST_TO_MANWON = 1.0;           // 타인 사고비용

/**
 * 비용을 만원 단위로 변환
 */
function toManwon(value: number | null | undefined, factor: number = 1.0): number {
  return (value || 0) * factor;
}

/**
 * 손상비율 기반 점수 계산 (팀원 코드 로직)
 *
 * @param totalCostManwon 총 사고비용 (만원)
 * @param originPriceManwon 차량 원가 (만원)
 * @returns 손상 점수 (0.0 ~ 1.0, 높을수록 좋음)
 */
export function calculateDamageScore(
  totalCostManwon: number,
  originPriceManwon: number
): number {
  if (!originPriceManwon || originPriceManwon <= 0) {
    return 0.5; // 기본 점수
  }

  const ratio = totalCostManwon / originPriceManwon;

  // 팀원 코드와 동일한 로직
  if (ratio <= 0.10) {
    return 1.0;  // 10% 이하: 완벽한 상태
  }

  if (ratio <= 0.20) {
    return 1.0 - 0.5 * ((ratio - 0.10) / 0.10);  // 10-20%: 선형 감소
  }

  return Math.max(0.0, 0.5 * (1.0 - (ratio - 0.20) / 0.30));  // 20% 이상: 급격한 감소
}

/**
 * 차량 손상 분석 결과
 */
export interface DamageAnalysis {
  myCostManwon: number;       // 자기 사고비용 (만원)
  otherCostManwon: number;    // 타인 사고비용 (만원)
  totalCostManwon: number;    // 총 사고비용 (만원)
  damageRatio: number;        // 손상 비율 (0~1)
  damageScore: number;        // 손상 점수 (0~1, 높을수록 좋음)
  grade: string;              // 등급 (S, A, B, C, D)
}

/**
 * 종합적인 손상 분석
 *
 * @param myCost 자기 사고비용
 * @param otherCost 타인 사고비용
 * @param originPrice 차량 원가
 * @returns 손상 분석 결과
 */
export function analyzeDamage(
  myCost: number | null | undefined,
  otherCost: number | null | undefined,
  originPrice: number | null | undefined
): DamageAnalysis {
  const myCostManwon = toManwon(myCost, MY_COST_TO_MANWON);
  const otherCostManwon = toManwon(otherCost, OTHER_COST_TO_MANWON);
  const totalCostManwon = myCostManwon + otherCostManwon;
  const originPriceManwon = originPrice || 1;

  const damageRatio = totalCostManwon / originPriceManwon;
  const damageScore = calculateDamageScore(totalCostManwon, originPriceManwon);

  // 등급 산정
  let grade: string;
  if (damageScore >= 0.9) grade = 'S';
  else if (damageScore >= 0.7) grade = 'A';
  else if (damageScore >= 0.5) grade = 'B';
  else if (damageScore >= 0.3) grade = 'C';
  else grade = 'D';

  return {
    myCostManwon,
    otherCostManwon,
    totalCostManwon,
    damageRatio: Math.round(damageRatio * 10000) / 10000, // 소수점 4자리
    damageScore,
    grade
  };
}

/**
 * 사고 횟수 정규화 (팀원 코드 기준)
 *
 * @param accidentCount 사고 횟수
 * @returns 정규화된 점수 (0~1)
 */
export function normalizeAccidentCount(accidentCount: number | null | undefined): number {
  const count = accidentCount || 0;
  return 1 - Math.min(1.0, count / 10);  // 10회 이상이면 0점
}

/**
 * 주행거리 정규화 (팀원 코드 기준)
 *
 * @param mileage 주행거리 (km)
 * @param maxMileage 최대 기준 주행거리 (기본: 200,000km)
 * @returns 정규화된 점수 (0~1)
 */
export function normalizeMileage(
  mileage: number | null | undefined,
  maxMileage: number = 200000
): number {
  const km = mileage || 0;
  return 1 - Math.min(1.0, km / maxMileage);
}

/**
 * 가격 정규화 (팀원 코드 기준)
 *
 * @param price 차량 가격 (만원)
 * @param minPrice 최소 기준 가격 (기본: 500만원)
 * @param maxPrice 최대 기준 가격 (기본: 20,000만원)
 * @returns 정규화된 점수 (0~1)
 */
export function normalizePrice(
  price: number | null | undefined,
  minPrice: number = 500,
  maxPrice: number = 20000
): number {
  if (!price) return 0.0;

  const [lo, hi] = minPrice <= maxPrice ? [minPrice, maxPrice] : [maxPrice, minPrice];
  if (hi === lo) return 0.0;

  const normalized = (price - lo) / (hi - lo);
  return Math.min(1.0, Math.max(0.0, normalized));
}