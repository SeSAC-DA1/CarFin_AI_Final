/**
 * Vehicle TOPSIS Adapter
 * 차량 데이터를 TOPSIS 엔진에 맞게 변환
 */

import type { Vehicle } from "@shared/types/vehicle";
import { TOPSISAlternative, TOPSISEngine, UserPreferenceProfile } from "./TOPSISEngine";

/**
 * 브랜드별 가치 점수 (0-100)
 * 객관적인 브랜드 가치 데이터
 */
const BRAND_VALUE_MAP: Record<string, number> = {
  '벤츠': 95,
  'BMW': 93,
  '아우디': 90,
  '제네시스': 88,
  '렉서스': 87,
  '포르쉐': 98,
  '볼보': 85,
  '테슬라': 92,
  '현대': 75,
  '기아': 73,
  '쌍용': 65,
  '르노': 68,
  '쉐보레': 70,
  '토요타': 80,
  '혼다': 78,
  '닛산': 72,
  '폭스바겐': 82,
  '미니': 85,
  '랜드로버': 89,
  '재규어': 88,
  '마세라티': 94,
  '페라리': 100,
  '람보르기니': 99,
  '벤틀리': 97,
  '롤스로이스': 100,
};

/**
 * 성능 점수 계산
 * 연식과 주행거리를 기반으로 추정
 */
function calculatePerformanceScore(vehicle: Vehicle): number {
  const currentYear = new Date().getFullYear();
  const age = vehicle.modelYear ? currentYear - vehicle.modelYear : 10;
  const mileage = vehicle.distance || 100000;
  
  const ageScore = Math.max(0, 100 - age * 8);
  const mileageScore = Math.max(0, 100 - (mileage / 2000));
  
  return Math.min(100, (ageScore * 0.6) + (mileageScore * 0.4));
}

/**
 * 디자인 점수 계산
 * 브랜드 가치와 연식을 기반으로 추정
 */
function calculateDesignScore(vehicle: Vehicle): number {
  const brandValue = BRAND_VALUE_MAP[vehicle.manufacturer || ''] || 70;
  const currentYear = new Date().getFullYear();
  const age = vehicle.modelYear ? currentYear - vehicle.modelYear : 10;
  
  const ageDeduction = Math.min(age * 5, 40);
  
  return Math.max(20, brandValue - ageDeduction);
}

/**
 * 차량 데이터를 TOPSIS Alternative로 변환
 */
export function convertVehicleToTOPSISAlternative(vehicle: Vehicle): TOPSISAlternative {
  const brandValue = BRAND_VALUE_MAP[vehicle.manufacturer || ''] || 70;
  
  return {
    id: vehicle.vehicleId.toString(),
    name: `${vehicle.manufacturer || ''} ${vehicle.model || ''} (${vehicle.modelYear || ''})`,
    values: {
      price: vehicle.price || 0,
      performance: calculatePerformanceScore(vehicle),
      brand_value: brandValue,
      fuel_efficiency: vehicle.fuelType === '전기' ? 95 : vehicle.fuelType === '하이브리드' ? 85 : 70,
      safety_score: calculatePerformanceScore(vehicle),
      design_score: calculateDesignScore(vehicle),
    },
    metadata: vehicle,
  };
}

/**
 * 차량 리스트를 TOPSIS 엔진으로 평가
 */
export async function rankVehiclesWithTOPSIS(
  vehicles: Vehicle[],
  userProfile: UserPreferenceProfile
) {
  const topsisEngine = new TOPSISEngine();
  topsisEngine.setCriteria(userProfile);
  
  const alternatives = vehicles.map(convertVehicleToTOPSISAlternative);
  const result = await topsisEngine.evaluate(alternatives);
  
  return result;
}

/**
 * 기본 사용자 선호도 프로필
 *
 * 📚 Alibaba Re-ranking 논문 기반:
 * - 실제 시스템에서는 대화를 통해 동적으로 추출
 * - 이 프로필은 초기값일 뿐, UserProfileExtractor로 실시간 계산
 * - 페르소나가 아닌 개인화된 가중치 사용
 */
export const DEFAULT_USER_PROFILE: UserPreferenceProfile = {
  priceWeight: 0.20,           // 가격 20% (가격편중 방지)
  performanceWeight: 0.20,     // 성능 20% (중요도 증가)
  brandWeight: 0.15,           // 브랜드 15% (유지)
  fuelEfficiencyWeight: 0.15,  // 연비 15% (실용성)
  safetyWeight: 0.25,          // 안전성 25% (가장 중요)
  designWeight: 0.05,          // 디자인 5% (보조적)
};

/**
 * 사용자 피드백 기반 가중치 조정 (Alibaba Personalized Re-ranking)
 *
 * @param baseProfile 기본 사용자 프로필
 * @param userFeedback 사용자 피드백 {"safety": 1.5, "price": 0.8}
 * @returns 조정된 사용자 프로필
 */
export function adjustWeightsFromFeedback(
  baseProfile: UserPreferenceProfile,
  userFeedback: Record<string, number>
): UserPreferenceProfile {
  const adjustedProfile = { ...baseProfile };

  // 매핑: 사용자 키워드 -> UserPreferenceProfile 키
  const keyMapping: Record<string, keyof UserPreferenceProfile> = {
    'safety': 'safetyWeight',
    'price': 'priceWeight',
    'performance': 'performanceWeight',
    'brand': 'brandWeight',
    'fuel': 'fuelEfficiencyWeight',
    'design': 'designWeight'
  };

  // 사용자 피드백 적용
  Object.entries(userFeedback).forEach(([key, multiplier]) => {
    const profileKey = keyMapping[key];
    if (profileKey && adjustedProfile[profileKey] !== undefined) {
      (adjustedProfile[profileKey] as number) *= multiplier;
    }
  });

  // 가중치 합계가 1이 되도록 정규화
  const totalWeight = Object.values(adjustedProfile).reduce((sum, weight) => sum + (weight as number), 0);
  if (totalWeight > 0) {
    Object.keys(adjustedProfile).forEach(key => {
      const profileKey = key as keyof UserPreferenceProfile;
      (adjustedProfile[profileKey] as number) /= totalWeight;
    });
  }

  return adjustedProfile;
}

/**
 * 메시지에서 사용자 피드백 추출
 *
 * @param message 사용자 메시지
 * @returns 피드백 가중치 조정값
 */
export function extractUserFeedbackFromMessage(message: string): Record<string, number> {
  const feedback: Record<string, number> = {};

  // 안전성 중요
  if (message.includes('안전') || message.includes('사고')) {
    feedback.safety = 1.5;
  }

  // 가격 중요도 낮춤
  if (message.includes('가격보다') || message.includes('돈보다')) {
    feedback.price = 0.8;
  }

  // 성능 중요
  if (message.includes('성능') || message.includes('파워')) {
    feedback.performance = 1.3;
  }

  // 연비 중요
  if (message.includes('연비') || message.includes('기름값')) {
    feedback.fuel = 1.4;
  }

  return feedback;
}
