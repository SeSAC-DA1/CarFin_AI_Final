/**
 * BrandTierReviewEngine
 * 브랜드 등급 및 리뷰 분석 엔진
 */

export interface BrandTier {
  brand: string;
  tier: 'premium' | 'mainstream' | 'economy';
  reliabilityScore: number;
  satisfactionScore: number;
}

export interface BrandAnalysisResult {
  tier: BrandTier;
  strengths: string[];
  weaknesses: string[];
  recommendationScore: number;
}

export class BrandTierReviewEngine {
  private brandTiers: Map<string, BrandTier> = new Map([
    ['현대', { brand: '현대', tier: 'mainstream', reliabilityScore: 85, satisfactionScore: 80 }],
    ['기아', { brand: '기아', tier: 'mainstream', reliabilityScore: 83, satisfactionScore: 78 }],
    ['제네시스', { brand: '제네시스', tier: 'premium', reliabilityScore: 90, satisfactionScore: 88 }],
    ['BMW', { brand: 'BMW', tier: 'premium', reliabilityScore: 82, satisfactionScore: 85 }],
    ['벤츠', { brand: '벤츠', tier: 'premium', reliabilityScore: 84, satisfactionScore: 87 }],
    ['아우디', { brand: '아우디', tier: 'premium', reliabilityScore: 81, satisfactionScore: 84 }],
    ['폭스바겐', { brand: '폭스바겐', tier: 'mainstream', reliabilityScore: 80, satisfactionScore: 75 }],
    ['쉐보레', { brand: '쉐보레', tier: 'mainstream', reliabilityScore: 75, satisfactionScore: 70 }],
    ['르노', { brand: '르노', tier: 'economy', reliabilityScore: 70, satisfactionScore: 68 }],
  ]);

  /**
   * 브랜드 분석 결과를 반환합니다
   */
  analyzeBrand(brand: string): BrandAnalysisResult {
    const tier = this.brandTiers.get(brand) || {
      brand,
      tier: 'mainstream' as const,
      reliabilityScore: 75,
      satisfactionScore: 70,
    };

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (tier.reliabilityScore >= 85) {
      strengths.push('높은 신뢰성');
    } else if (tier.reliabilityScore < 75) {
      weaknesses.push('신뢰성 개선 필요');
    }

    if (tier.satisfactionScore >= 85) {
      strengths.push('높은 고객 만족도');
    } else if (tier.satisfactionScore < 75) {
      weaknesses.push('고객 만족도 개선 필요');
    }

    if (tier.tier === 'premium') {
      strengths.push('프리미엄 브랜드 가치');
    }

    return {
      tier,
      strengths,
      weaknesses,
      recommendationScore: (tier.reliabilityScore + tier.satisfactionScore) / 2,
    };
  }

  /**
   * 브랜드 점수를 계산합니다 (0-100)
   */
  calculateBrandScore(brand: string): number {
    const analysis = this.analyzeBrand(brand);
    return analysis.recommendationScore;
  }

  /**
   * 브랜드 등급을 반환합니다
   */
  getBrandTier(brand: string): BrandTier['tier'] {
    const tier = this.brandTiers.get(brand);
    return tier?.tier || 'mainstream';
  }
}

export default BrandTierReviewEngine;
