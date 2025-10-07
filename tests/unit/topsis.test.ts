import { describe, it, expect } from 'vitest';
import { TOPSISEngine, type Criterion, type Alternative } from '../../server/lib/topsis/TOPSISEngine';

describe('TOPSISEngine - AHP-TOPSIS 다기준 의사결정', () => {
  describe('정규화 (Normalization)', () => {
    it('의사결정 행렬을 정규화해야 함', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = [
        { id: '1', values: [100, 50, 80], metadata: { name: 'Option 1' } },
        { id: '2', values: [200, 100, 60], metadata: { name: 'Option 2' } },
        { id: '3', values: [150, 75, 70], metadata: { name: 'Option 3' } },
      ];
      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.4, beneficial: false },
        { name: 'Quality', weight: 0.4, beneficial: true },
        { name: 'Speed', weight: 0.2, beneficial: true },
      ];

      const result = engine.evaluate(alternatives, criteria);

      expect(result).toBeDefined();
      expect(result.ranking).toHaveLength(3);
      expect(result.ranking[0].rank).toBe(1);
      expect(result.ranking[0].score).toBeGreaterThan(0);
      expect(result.ranking[0].score).toBeLessThanOrEqual(1);
    });
  });

  describe('최적해 및 비최적해 계산', () => {
    it('Positive Ideal Solution을 올바르게 계산해야 함', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = [
        { id: '1', values: [3000, 15, 85], metadata: { price: 3000 } },
        { id: '2', values: [2500, 20, 90], metadata: { price: 2500 } },
      ];
      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.5, beneficial: false }, // 낮을수록 좋음
        { name: 'Fuel', weight: 0.3, beneficial: true },   // 높을수록 좋음
        { name: 'Safety', weight: 0.2, beneficial: true }, // 높을수록 좋음
      ];

      const result = engine.evaluate(alternatives, criteria);

      // 가격이 낮고(2500) 연비와 안전성이 높은(20, 90) 2번이 1위
      expect(result.ranking[0].alternative.id).toBe('2');
      expect(result.ranking[0].score).toBeGreaterThan(result.ranking[1].score);
    });

    it('Negative Ideal Solution을 올바르게 계산해야 함', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = [
        { id: 'worst', values: [5000, 5, 50], metadata: { quality: 'worst' } },
        { id: 'best', values: [2000, 25, 95], metadata: { quality: 'best' } },
      ];
      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.4, beneficial: false },
        { name: 'Fuel', weight: 0.3, beneficial: true },
        { name: 'Safety', weight: 0.3, beneficial: true },
      ];

      const result = engine.evaluate(alternatives, criteria);

      // 'best' 옵션이 1위, 'worst' 옵션이 2위
      expect(result.ranking[0].alternative.id).toBe('best');
      expect(result.ranking[1].alternative.id).toBe('worst');
    });
  });

  describe('상대적 근접도 (Relative Closeness)', () => {
    it('상대적 근접도를 0-1 범위로 계산해야 함', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = [
        { id: '1', values: [3000, 12, 80], metadata: {} },
        { id: '2', values: [2800, 15, 85], metadata: {} },
        { id: '3', values: [3200, 10, 75], metadata: {} },
      ];
      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.4, beneficial: false },
        { name: 'Efficiency', weight: 0.4, beneficial: true },
        { name: 'Rating', weight: 0.2, beneficial: true },
      ];

      const result = engine.evaluate(alternatives, criteria);

      // 모든 점수가 0-1 범위
      result.ranking.forEach(item => {
        expect(item.score).toBeGreaterThanOrEqual(0);
        expect(item.score).toBeLessThanOrEqual(1);
      });

      // 순위가 올바르게 매겨져야 함 (1, 2, 3)
      expect(result.ranking[0].rank).toBe(1);
      expect(result.ranking[1].rank).toBe(2);
      expect(result.ranking[2].rank).toBe(3);
    });
  });

  describe('가중치 적용', () => {
    it('기준별 가중치를 올바르게 적용해야 함', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = [
        { id: 'cheap', values: [1000, 5, 50], metadata: {} },
        { id: 'expensive', values: [5000, 20, 95], metadata: {} },
      ];

      // 가격 가중치가 매우 높음 (90%)
      const priceHeavy: Criterion[] = [
        { name: 'Price', weight: 0.9, beneficial: false },
        { name: 'Quality', weight: 0.05, beneficial: true },
        { name: 'Safety', weight: 0.05, beneficial: true },
      ];

      const result1 = engine.evaluate(alternatives, priceHeavy);
      // 가격이 낮은 'cheap'이 1위
      expect(result1.ranking[0].alternative.id).toBe('cheap');

      // 품질+안전 가중치가 매우 높음 (90%)
      const qualityHeavy: Criterion[] = [
        { name: 'Price', weight: 0.1, beneficial: false },
        { name: 'Quality', weight: 0.5, beneficial: true },
        { name: 'Safety', weight: 0.4, beneficial: true },
      ];

      const result2 = engine.evaluate(alternatives, qualityHeavy);
      // 품질과 안전이 높은 'expensive'가 1위
      expect(result2.ranking[0].alternative.id).toBe('expensive');
    });
  });

  describe('엣지 케이스', () => {
    it('대안이 1개만 있어도 정상 작동해야 함', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = [
        { id: 'only', values: [3000, 15, 80], metadata: {} },
      ];
      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.5, beneficial: false },
        { name: 'Quality', weight: 0.5, beneficial: true },
      ];

      const result = engine.evaluate(alternatives, criteria);

      expect(result.ranking).toHaveLength(1);
      expect(result.ranking[0].rank).toBe(1);
      expect(result.ranking[0].alternative.id).toBe('only');
    });

    it('모든 값이 동일한 경우 처리해야 함', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = [
        { id: '1', values: [3000, 15, 80], metadata: {} },
        { id: '2', values: [3000, 15, 80], metadata: {} },
        { id: '3', values: [3000, 15, 80], metadata: {} },
      ];
      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.5, beneficial: false },
        { name: 'Quality', weight: 0.5, beneficial: true },
      ];

      const result = engine.evaluate(alternatives, criteria);

      expect(result.ranking).toHaveLength(3);
      // 모든 점수가 비슷해야 함 (완전히 동일하거나 매우 유사)
      const scores = result.ranking.map(r => r.score);
      const maxDiff = Math.max(...scores) - Math.min(...scores);
      expect(maxDiff).toBeLessThan(0.01);
    });

    it('가중치 합이 1이 아닌 경우 정규화해야 함', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = [
        { id: '1', values: [3000, 15], metadata: {} },
        { id: '2', values: [2500, 20], metadata: {} },
      ];
      const criteria: Criterion[] = [
        { name: 'Price', weight: 3, beneficial: false },  // 합이 5
        { name: 'Quality', weight: 2, beneficial: true }, // 정규화되어야 함
      ];

      const result = engine.evaluate(alternatives, criteria);

      expect(result.ranking).toHaveLength(2);
      expect(result.ranking[0].score).toBeDefined();
      expect(result.ranking[0].score).toBeGreaterThan(0);
    });
  });

  describe('실제 차량 추천 시나리오', () => {
    it('중고차 추천 시나리오: 가족용 SUV 선택', () => {
      const engine = new TOPSISEngine();
      const vehicles: Alternative[] = [
        {
          id: 'sorento',
          values: [3500, 8.5, 92, 8, 50000],
          metadata: { name: '기아 쏘렌토', year: 2020 },
        },
        {
          id: 'santafe',
          values: [3800, 9.2, 95, 9, 45000],
          metadata: { name: '현대 싼타페', year: 2021 },
        },
        {
          id: 'carnival',
          values: [3200, 7.8, 88, 7, 60000],
          metadata: { name: '기아 카니발', year: 2019 },
        },
      ];

      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.3, beneficial: false },      // 가격 (낮을수록 좋음)
        { name: 'Fuel', weight: 0.2, beneficial: true },        // 연비 (높을수록 좋음)
        { name: 'Safety', weight: 0.25, beneficial: true },     // 안전성 (높을수록 좋음)
        { name: 'Space', weight: 0.15, beneficial: true },      // 공간 (높을수록 좋음)
        { name: 'Mileage', weight: 0.1, beneficial: false },    // 주행거리 (낮을수록 좋음)
      ];

      const result = engine.evaluate(vehicles, criteria);

      // 싼타페가 1위 (연비, 안전성, 주행거리 우수)
      expect(result.ranking[0].alternative.id).toBe('santafe');
      expect(result.ranking[0].score).toBeGreaterThan(0.5);

      // 카니발이 3위 (주행거리가 가장 높음)
      expect(result.ranking[2].alternative.id).toBe('carnival');
    });

    it('중고차 추천 시나리오: 경제성 우선', () => {
      const engine = new TOPSISEngine();
      const vehicles: Alternative[] = [
        { id: 'avante', values: [1200, 14.5, 85, 30000], metadata: { name: '아반떼' } },
        { id: 'k5', values: [2200, 11.2, 90, 40000], metadata: { name: 'K5' } },
        { id: 'genesis', values: [3500, 8.5, 95, 35000], metadata: { name: '제네시스' } },
      ];

      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.5, beneficial: false },      // 경제성 최우선
        { name: 'Fuel', weight: 0.3, beneficial: true },
        { name: 'Safety', weight: 0.15, beneficial: true },
        { name: 'Mileage', weight: 0.05, beneficial: false },
      ];

      const result = engine.evaluate(vehicles, criteria);

      // 아반떼가 1위 (가격이 가장 저렴하고 연비 우수)
      expect(result.ranking[0].alternative.id).toBe('avante');
      expect(result.ranking[0].score).toBeGreaterThan(0.6);

      // 제네시스가 3위 (가격이 가장 비쌈)
      expect(result.ranking[2].alternative.id).toBe('genesis');
    });
  });

  describe('성능 테스트', () => {
    it('대용량 데이터 처리 (100개 대안)', () => {
      const engine = new TOPSISEngine();
      const alternatives: Alternative[] = Array.from({ length: 100 }, (_, i) => ({
        id: `vehicle-${i}`,
        values: [
          2000 + Math.random() * 3000,  // 가격
          8 + Math.random() * 8,         // 연비
          70 + Math.random() * 25,       // 안전성
        ],
        metadata: { index: i },
      }));

      const criteria: Criterion[] = [
        { name: 'Price', weight: 0.4, beneficial: false },
        { name: 'Fuel', weight: 0.4, beneficial: true },
        { name: 'Safety', weight: 0.2, beneficial: true },
      ];

      const startTime = performance.now();
      const result = engine.evaluate(alternatives, criteria);
      const endTime = performance.now();

      expect(result.ranking).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // 100ms 이내

      // 순위가 올바르게 매겨졌는지 확인
      for (let i = 0; i < result.ranking.length - 1; i++) {
        expect(result.ranking[i].score).toBeGreaterThanOrEqual(result.ranking[i + 1].score);
      }
    });
  });
});
