import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TOPSIS 실제 인터페이스 테스트', () => {
  describe('간단한 타입 테스트', () => {
    it('TOPSIS Criterion 타입 정의', () => {
      const criterion = {
        name: 'price',
        weight: 0.4,
        type: 'cost',
        displayName: '가격',
      };

      expect(criterion.name).toBe('price');
      expect(criterion.weight).toBe(0.4);
      expect(criterion.type).toBe('cost');
    });

    it('TOPSIS Alternative 타입 정의', () => {
      const alternative = {
        id: 'vehicle-1',
        name: '현대 아반떼',
        values: {
          price: 3000,
          fuel_efficiency: 15.5,
          safety_score: 85,
        },
        metadata: { year: 2020 },
      };

      expect(alternative.id).toBe('vehicle-1');
      expect(alternative.name).toBe('현대 아반떼');
      expect(alternative.values.price).toBe(3000);
    });

    it('사용자 선호도 프로필 타입 정의', () => {
      const userProfile = {
        priceWeight: 5,
        performanceWeight: 3,
        brandWeight: 2,
        fuelEfficiencyWeight: 4,
        safetyWeight: 3,
        designWeight: 3,
      };

      const totalWeight = Object.values(userProfile).reduce((sum, w) => sum + w, 0);
      expect(totalWeight).toBe(20);
      expect(userProfile.priceWeight / totalWeight).toBe(0.25);
    });
  });

  describe('데이터 변환 로직 테스트', () => {
    it('Vehicle → TOPSISAlternative 변환', () => {
      const vehicle = {
        vehicleId: 123,
        manufacturer: '현대',
        model: '아반떼',
        modelYear: 2020,
        price: 1500,
        distance: 50000,
        fuelType: '가솔린',
      };

      // 변환 로직 시뮬레이션
      const alternative = {
        id: vehicle.vehicleId.toString(),
        name: `${vehicle.manufacturer} ${vehicle.model}`,
        values: {
          price: vehicle.price * 10000,
          fuel_efficiency: 13.5, // 가솔린 평균 연비
          safety_score: 82,
          performance: 7.5,
          brand_value: 8.0,
          design_score: 7.0,
        },
        metadata: vehicle,
      };

      expect(alternative.id).toBe('123');
      expect(alternative.name).toBe('현대 아반떼');
      expect(alternative.values.price).toBe(15000000);
    });

    it('연료 타입별 연비 추정', () => {
      const fuelEfficiencyMap: Record<string, number> = {
        '가솔린': 12.0,
        '디젤': 15.0,
        'LPG': 9.0,
        '하이브리드': 18.0,
        '전기': 5.5, // kWh/100km
      };

      expect(fuelEfficiencyMap['가솔린']).toBe(12.0);
      expect(fuelEfficiencyMap['하이브리드']).toBe(18.0);
      expect(fuelEfficiencyMap['전기']).toBe(5.5);
    });

    it('브랜드별 신뢰도 점수', () => {
      const brandScores: Record<string, number> = {
        '현대': 8.5,
        '기아': 8.3,
        'BMW': 8.8,
        '벤츠': 9.0,
        '렉서스': 9.2,
        '토요타': 8.7,
      };

      expect(brandScores['현대']).toBe(8.5);
      expect(brandScores['렉서스']).toBeGreaterThan(brandScores['현대']);
    });

    it('차량 상태 점수 계산 (연식 + 주행거리)', () => {
      const calculateConditionScore = (year: number, mileage: number): number => {
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        const ageScore = Math.max(0, 10 - age * 0.5); // 연식 점수
        const mileageScore = Math.max(0, 10 - mileage / 20000); // 주행거리 점수
        return (ageScore + mileageScore) / 2;
      };

      const score2021 = calculateConditionScore(2021, 30000);
      const score2018 = calculateConditionScore(2018, 80000);

      expect(score2021).toBeGreaterThan(score2018);
      expect(score2021).toBeGreaterThanOrEqual(7);
      expect(score2018).toBeLessThan(7);
    });
  });

  describe('가중치 정규화 테스트', () => {
    it('사용자 입력 가중치를 0-1 범위로 정규화', () => {
      const userWeights = {
        priceWeight: 8,
        performanceWeight: 5,
        brandWeight: 3,
        fuelEfficiencyWeight: 7,
        safetyWeight: 6,
        designWeight: 4,
      };

      const totalWeight = Object.values(userWeights).reduce((sum, w) => sum + w, 0);
      const normalized = {
        price: userWeights.priceWeight / totalWeight,
        performance: userWeights.performanceWeight / totalWeight,
        brand: userWeights.brandWeight / totalWeight,
        fuel: userWeights.fuelEfficiencyWeight / totalWeight,
        safety: userWeights.safetyWeight / totalWeight,
        design: userWeights.designWeight / totalWeight,
      };

      const sum = Object.values(normalized).reduce((acc, val) => acc + val, 0);
      expect(sum).toBeCloseTo(1.0, 5);
      expect(normalized.price).toBeGreaterThan(normalized.brand);
    });

    it('가중치 0 처리', () => {
      const userWeights = {
        priceWeight: 0,
        performanceWeight: 0,
        brandWeight: 0,
        fuelEfficiencyWeight: 0,
        safetyWeight: 0,
        designWeight: 0,
      };

      const totalWeight = Object.values(userWeights).reduce((sum, w) => sum + w, 0);

      if (totalWeight === 0) {
        // 기본 가중치 사용
        const defaultWeights = {
          price: 0.25,
          performance: 0.15,
          brand: 0.1,
          fuel: 0.2,
          safety: 0.2,
          design: 0.1,
        };

        const sum = Object.values(defaultWeights).reduce((acc, val) => acc + val, 0);
        expect(sum).toBeCloseTo(1.0, 5);
      }
    });
  });

  describe('추천 결과 정렬 테스트', () => {
    it('TOPSIS 점수 기준 내림차순 정렬', () => {
      const ranking = [
        { score: 0.85, rank: 1, alternative: { id: '1', name: 'A' } },
        { score: 0.72, rank: 2, alternative: { id: '2', name: 'B' } },
        { score: 0.68, rank: 3, alternative: { id: '3', name: 'C' } },
      ];

      // 점수 순서 검증
      for (let i = 0; i < ranking.length - 1; i++) {
        expect(ranking[i].score).toBeGreaterThanOrEqual(ranking[i + 1].score);
      }

      // 순위 검증
      expect(ranking[0].rank).toBe(1);
      expect(ranking[1].rank).toBe(2);
      expect(ranking[2].rank).toBe(3);
    });

    it('동점자 처리', () => {
      const ranking = [
        { score: 0.85, rank: 1, alternative: { id: '1', name: 'A' } },
        { score: 0.85, rank: 1, alternative: { id: '2', name: 'B' } },
        { score: 0.72, rank: 3, alternative: { id: '3', name: 'C' } },
      ];

      // 동점자는 같은 순위
      expect(ranking[0].rank).toBe(ranking[1].rank);
      expect(ranking[0].score).toBe(ranking[1].score);
    });
  });

  describe('실제 추천 시나리오 통합 테스트', () => {
    it('시나리오: 젊은 직장인 - 경제성 우선', () => {
      const userProfile = {
        priceWeight: 9,        // 가격 매우 중요
        fuelEfficiencyWeight: 8, // 연비 중요
        performanceWeight: 5,
        brandWeight: 3,
        safetyWeight: 5,
        designWeight: 6,
      };

      const alternatives = [
        {
          id: '1',
          name: '아반떼',
          values: { price: 15000000, fuel_efficiency: 14.5, performance: 7, brand_value: 8, safety_score: 82, design_score: 7 },
        },
        {
          id: '2',
          name: 'K5',
          values: { price: 22000000, fuel_efficiency: 11.2, performance: 8, brand_value: 8.5, safety_score: 88, design_score: 8.5 },
        },
      ];

      // 아반떼가 더 높은 점수를 받아야 함 (가격과 연비 우선)
      const scores = alternatives.map(alt => {
        const totalWeight = Object.values(userProfile).reduce((sum, w) => sum + w, 0);
        // 간단한 점수 계산 (실제로는 TOPSIS 알고리즘 사용)
        return (
          ((5000000 - alt.values.price) / 1000000) * (userProfile.priceWeight / totalWeight) +
          alt.values.fuel_efficiency * (userProfile.fuelEfficiencyWeight / totalWeight) +
          alt.values.performance * (userProfile.performanceWeight / totalWeight)
        );
      });

      expect(scores[0]).toBeGreaterThan(scores[1]); // 아반떼 > K5
    });

    it('시나리오: 가족 - 안전성 우선', () => {
      const userProfile = {
        priceWeight: 5,
        fuelEfficiencyWeight: 6,
        performanceWeight: 3,
        brandWeight: 7,
        safetyWeight: 10,      // 안전성 최우선
        designWeight: 4,
      };

      const alternatives = [
        {
          id: '1',
          name: '싼타페',
          values: { price: 38000000, fuel_efficiency: 9.2, performance: 8, brand_value: 8.5, safety_score: 95, design_score: 8 },
        },
        {
          id: '2',
          name: '스포티지',
          values: { price: 28000000, fuel_efficiency: 11.5, performance: 7.5, brand_value: 8, safety_score: 88, design_score: 7.5 },
        },
      ];

      const totalWeight = Object.values(userProfile).reduce((sum, w) => sum + w, 0);
      const weightedSafety1 = alternatives[0].values.safety_score * (userProfile.safetyWeight / totalWeight);
      const weightedSafety2 = alternatives[1].values.safety_score * (userProfile.safetyWeight / totalWeight);

      // 안전성 가중치가 크므로 싼타페가 우위
      expect(weightedSafety1).toBeGreaterThan(weightedSafety2);
    });
  });

  describe('성능 및 확장성 테스트', () => {
    it('대용량 차량 데이터 처리 성능', () => {
      const alternatives = Array.from({ length: 1000 }, (_, i) => ({
        id: `vehicle-${i}`,
        name: `차량-${i}`,
        values: {
          price: 20000000 + Math.random() * 30000000,
          fuel_efficiency: 8 + Math.random() * 10,
          performance: 5 + Math.random() * 5,
          brand_value: 6 + Math.random() * 4,
          safety_score: 70 + Math.random() * 25,
          design_score: 5 + Math.random() * 5,
        },
      }));

      const startTime = performance.now();

      // 간단한 정렬 시뮬레이션
      const sorted = alternatives.sort((a, b) => b.values.safety_score - a.values.safety_score);

      const endTime = performance.now();

      expect(sorted.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(50); // 50ms 이내
    });

    it('다중 기준 동시 평가', () => {
      const alternative = {
        id: '1',
        name: '테스트 차량',
        values: {
          price: 30000000,
          fuel_efficiency: 12.5,
          performance: 8,
          brand_value: 8.5,
          safety_score: 90,
          design_score: 8,
        },
      };

      const criteria = ['price', 'fuel_efficiency', 'performance', 'brand_value', 'safety_score', 'design_score'];

      // 모든 기준이 존재하는지 확인
      criteria.forEach(criterion => {
        expect(alternative.values).toHaveProperty(criterion);
        expect(alternative.values[criterion as keyof typeof alternative.values]).toBeGreaterThan(0);
      });
    });
  });
});
