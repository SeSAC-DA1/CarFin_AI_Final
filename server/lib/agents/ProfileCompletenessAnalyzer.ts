/**
 * Phase 2.5: 프로필 완성도 분석 시스템
 * 사용자 프로필에서 누락된 정보를 감지하고 질문 우선순위를 계산합니다.
 */

export interface ProfileField {
  name: string;
  priority: number;  // 1-10 (높을수록 중요)
  isMissing: boolean;
  category: 'essential' | 'important' | 'optional';
}

export interface ProfileCompletenessReport {
  completenessScore: number;  // 0-100
  missingFields: ProfileField[];
  nextQuestionPriority: ProfileField | null;
  shouldAskQuestion: boolean;
}

/**
 * 프로필 완성도를 분석하고 다음 질문할 필드를 결정하는 클래스
 */
export class ProfileCompletenessAnalyzer {
  /**
   * 프로필 분석 및 완성도 리포트 생성
   */
  analyzeProfile(userProfile: any): ProfileCompletenessReport {
    const fields: ProfileField[] = [
      // Essential fields (우선순위 높음)
      {
        name: 'budget',
        priority: 10,
        isMissing: !userProfile?.budget || userProfile.budget.length === 0,
        category: 'essential'
      },
      {
        name: 'usage',
        priority: 9,
        isMissing: !userProfile?.usage || userProfile.usage.length === 0,
        category: 'essential'
      },
      {
        name: 'carType',
        priority: 8,
        isMissing: !userProfile?.carType,
        category: 'essential'
      },

      // Important fields (중간 우선순위)
      {
        name: 'fuelType',
        priority: 7,
        isMissing: !userProfile?.fuelType,
        category: 'important'
      },
      {
        name: 'importance.fuelEfficiency',
        priority: 6,
        isMissing: !userProfile?.importance?.fuelEfficiency || userProfile.importance.fuelEfficiency === 5,
        category: 'important'
      },
      {
        name: 'importance.safety',
        priority: 6,
        isMissing: !userProfile?.importance?.safety || userProfile.importance.safety === 5,
        category: 'important'
      },

      // Optional fields (낮은 우선순위)
      {
        name: 'brands',
        priority: 5,
        isMissing: !userProfile?.preferredBrands || userProfile.preferredBrands.length === 0,
        category: 'optional'
      },
      {
        name: 'transmission',
        priority: 4,
        isMissing: !userProfile?.transmission,
        category: 'optional'
      },
      {
        name: 'importance.design',
        priority: 3,
        isMissing: !userProfile?.importance?.design || userProfile.importance.design === 5,
        category: 'optional'
      },
      {
        name: 'importance.brand',
        priority: 3,
        isMissing: !userProfile?.importance?.brand || userProfile.importance.brand === 5,
        category: 'optional'
      },
    ];

    const missingFields = fields.filter(f => f.isMissing);
    const completenessScore = Math.round(((fields.length - missingFields.length) / fields.length) * 100);

    // 가장 우선순위 높은 누락 필드 찾기
    const sortedMissing = missingFields.sort((a, b) => b.priority - a.priority);
    const nextQuestionPriority = sortedMissing.length > 0 ? sortedMissing[0] : null;

    // 질문 조건: Essential 필드가 누락되었거나, 전체 완성도가 50% 이하
    const shouldAskQuestion =
      missingFields.some(f => f.category === 'essential') ||
      completenessScore < 50;

    return {
      completenessScore,
      missingFields,
      nextQuestionPriority,
      shouldAskQuestion
    };
  }

  /**
   * 특정 필드가 누락되었는지 확인
   */
  isFieldMissing(userProfile: any, fieldName: string): boolean {
    const report = this.analyzeProfile(userProfile);
    return report.missingFields.some(f => f.name === fieldName);
  }

  /**
   * Essential 필드가 모두 채워졌는지 확인
   */
  hasEssentialFields(userProfile: any): boolean {
    const report = this.analyzeProfile(userProfile);
    return !report.missingFields.some(f => f.category === 'essential');
  }

  /**
   * 프로필 완성도 요약 (디버깅용)
   */
  getSummary(userProfile: any): string {
    const report = this.analyzeProfile(userProfile);
    return `완성도: ${report.completenessScore}%, 누락: ${report.missingFields.map(f => f.name).join(', ')}`;
  }
}
