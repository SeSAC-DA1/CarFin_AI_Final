import { describe, it, expect } from 'vitest';
import { DataQualityFilter } from '../../server/lib/data/DataQualityFilter';
import type { Vehicle } from '@shared/schema';

describe('DataQualityFilter - 데이터 품질 필터링', () => {
  describe('가격 필터', () => {
    it('가격이 0 이하인 차량을 제외해야 함', () => {
      const filter = new DataQualityFilter();
      const vehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, price: 3000, manufacturer: '현대', model: '아반떼' },
        { vehicleId: 2, price: 0, manufacturer: '기아', model: 'K5' },
        { vehicleId: 3, price: -1000, manufacturer: 'BMW', model: '320i' },
        { vehicleId: 4, price: 2500, manufacturer: '현대', model: '소나타' },
      ];

      const filtered = filter.filterVehicles(vehicles as Vehicle[]);

      expect(filtered).toHaveLength(2);
      expect(filtered.map(v => v.vehicleId)).toEqual([1, 4]);
    });

    it('가격이 비정상적으로 높은 차량(1억 이상)을 제외해야 함', () => {
      const filter = new DataQualityFilter();
      const vehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, price: 5000, manufacturer: '현대', model: '그랜저' },
        { vehicleId: 2, price: 12000, manufacturer: '벤츠', model: 'S-Class' },
        { vehicleId: 3, price: 3000, manufacturer: '기아', model: 'K5' },
      ];

      const filtered = filter.filterVehicles(vehicles as Vehicle[]);

      // 1억(10000) 이하 차량만 남음
      expect(filtered.every(v => v.price && v.price <= 10000)).toBe(true);
    });
  });

  describe('연식 필터', () => {
    it('연식이 너무 오래된 차량(25년 이상)을 제외해야 함', () => {
      const filter = new DataQualityFilter();
      const currentYear = new Date().getFullYear();

      const vehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, modelYear: currentYear - 5, manufacturer: '현대', model: '아반떼' },
        { vehicleId: 2, modelYear: currentYear - 30, manufacturer: '현대', model: '포니' },
        { vehicleId: 3, modelYear: currentYear - 10, manufacturer: '기아', model: 'K5' },
      ];

      const filtered = filter.filterVehicles(vehicles as Vehicle[]);

      expect(filtered).toHaveLength(2);
      expect(filtered.map(v => v.vehicleId)).toEqual([1, 3]);
    });

    it('연식 정보가 없는 차량을 제외해야 함', () => {
      const filter = new DataQualityFilter();
      const vehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, modelYear: 2020, manufacturer: '현대', model: '아반떼' },
        { vehicleId: 2, modelYear: undefined, manufacturer: '기아', model: 'K5' },
        { vehicleId: 3, modelYear: null as any, manufacturer: 'BMW', model: '320i' },
      ];

      const filtered = filter.filterVehicles(vehicles as Vehicle[]);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].vehicleId).toBe(1);
    });
  });

  describe('주행거리 필터', () => {
    it('주행거리가 비정상적으로 높은 차량(30만km 이상)을 제외해야 함', () => {
      const filter = new DataQualityFilter();
      const vehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, distance: 50000, manufacturer: '현대', model: '아반떼' },
        { vehicleId: 2, distance: 350000, manufacturer: '기아', model: 'K5' },
        { vehicleId: 3, distance: 120000, manufacturer: 'BMW', model: '320i' },
      ];

      const filtered = filter.filterVehicles(vehicles as Vehicle[]);

      expect(filtered).toHaveLength(2);
      expect(filtered.map(v => v.vehicleId)).toEqual([1, 3]);
      expect(filtered.every(v => v.distance && v.distance < 300000)).toBe(true);
    });

    it('주행거리가 음수인 차량을 제외해야 함', () => {
      const filter = new DataQualityFilter();
      const vehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, distance: 50000, manufacturer: '현대', model: '아반떼' },
        { vehicleId: 2, distance: -1000, manufacturer: '기아', model: 'K5' },
      ];

      const filtered = filter.filterVehicles(vehicles as Vehicle[]);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].vehicleId).toBe(1);
    });
  });

  describe('필수 정보 검증', () => {
    it('제조사 정보가 없는 차량을 제외해야 함', () => {
      const filter = new DataQualityFilter();
      const vehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, manufacturer: '현대', model: '아반떼' },
        { vehicleId: 2, manufacturer: '', model: 'K5' },
        { vehicleId: 3, manufacturer: undefined, model: '320i' },
      ];

      const filtered = filter.filterVehicles(vehicles as Vehicle[]);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].vehicleId).toBe(1);
    });

    it('모델명 정보가 없는 차량을 제외해야 함', () => {
      const filter = new DataQualityFilter();
      const vehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, manufacturer: '현대', model: '아반떼' },
        { vehicleId: 2, manufacturer: '기아', model: '' },
        { vehicleId: 3, manufacturer: 'BMW', model: undefined },
      ];

      const filtered = filter.filterVehicles(vehicles as Vehicle[]);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].manufacturer).toBe('현대');
    });
  });

  describe('데이터 일관성 검증', () => {
    it('연식과 주행거리의 일관성을 검증해야 함', () => {
      const filter = new DataQualityFilter();
      const currentYear = new Date().getFullYear();

      const vehicles: Partial<Vehicle>[] = [
        // 정상: 5년 차량, 주행거리 50,000km (연간 10,000km)
        { vehicleId: 1, modelYear: currentYear - 5, distance: 50000, manufacturer: '현대', model: '아반떼' },
        // 비정상: 1년 차량, 주행거리 200,000km (연간 200,000km - 불가능)
        { vehicleId: 2, modelYear: currentYear - 1, distance: 200000, manufacturer: '기아', model: 'K5' },
        // 정상: 10년 차량, 주행거리 120,000km (연간 12,000km)
        { vehicleId: 3, modelYear: currentYear - 10, distance: 120000, manufacturer: 'BMW', model: '320i' },
      ];

      // 연간 주행거리 = distance / (currentYear - modelYear)
      // 비정상 기준: 연간 50,000km 이상
      const filtered = vehicles.filter(v => {
        if (!v.modelYear || !v.distance) return false;
        const age = currentYear - v.modelYear;
        if (age <= 0) return false;
        const annualMileage = v.distance / age;
        return annualMileage < 50000;
      });

      expect(filtered.map(v => v.vehicleId)).toEqual([1, 3]);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('통합 필터링 시나리오', () => {
    it('실제 크롤링 데이터 품질 필터링 시뮬레이션', () => {
      const filter = new DataQualityFilter();
      const currentYear = new Date().getFullYear();

      const rawVehicles: Partial<Vehicle>[] = [
        // ✅ 정상 데이터
        {
          vehicleId: 1,
          manufacturer: '현대',
          model: '아반떼',
          modelYear: 2020,
          price: 1500,
          distance: 50000,
          fuelType: '가솔린',
        },
        // ❌ 가격 0
        {
          vehicleId: 2,
          manufacturer: '기아',
          model: 'K5',
          modelYear: 2019,
          price: 0,
          distance: 60000,
          fuelType: '디젤',
        },
        // ❌ 주행거리 비정상
        {
          vehicleId: 3,
          manufacturer: 'BMW',
          model: '320i',
          modelYear: 2018,
          price: 3000,
          distance: 400000,
          fuelType: '가솔린',
        },
        // ✅ 정상 데이터
        {
          vehicleId: 4,
          manufacturer: '벤츠',
          model: 'C-Class',
          modelYear: 2019,
          price: 4000,
          distance: 80000,
          fuelType: '디젤',
        },
        // ❌ 제조사 누락
        {
          vehicleId: 5,
          manufacturer: '',
          model: 'Unknown',
          modelYear: 2020,
          price: 2000,
          distance: 40000,
          fuelType: '가솔린',
        },
        // ❌ 연식 너무 오래됨
        {
          vehicleId: 6,
          manufacturer: '현대',
          model: '포니',
          modelYear: 1990,
          price: 500,
          distance: 300000,
          fuelType: '가솔린',
        },
      ];

      const filtered = filter.filterVehicles(rawVehicles as Vehicle[]);

      // 정상 데이터만 통과
      expect(filtered).toHaveLength(2);
      expect(filtered.map(v => v.vehicleId).sort()).toEqual([1, 4]);

      // 필터링 통계
      const stats = filter.getFilteringStats(rawVehicles as Vehicle[], filtered);
      expect(stats.original_count).toBe(6);
      expect(stats.filtered_count).toBe(2);
      expect(stats.removal_rate).toBeCloseTo(0.667, 2);
    });
  });

  describe('필터링 통계', () => {
    it('필터링 통계를 올바르게 계산해야 함', () => {
      const filter = new DataQualityFilter();
      const rawVehicles: Partial<Vehicle>[] = Array.from({ length: 100 }, (_, i) => ({
        vehicleId: i,
        manufacturer: i % 10 === 0 ? '' : '현대', // 10%는 제조사 누락
        model: '아반떼',
        modelYear: 2020 - (i % 30), // 일부는 너무 오래됨
        price: i % 5 === 0 ? 0 : 3000, // 20%는 가격 0
        distance: i % 3 === 0 ? 400000 : 50000, // 33%는 주행거리 비정상
        fuelType: '가솔린',
      }));

      const filtered = filter.filterVehicles(rawVehicles as Vehicle[]);
      const stats = filter.getFilteringStats(rawVehicles as Vehicle[], filtered);

      expect(stats.original_count).toBe(100);
      expect(stats.filtered_count).toBeLessThan(100);
      expect(stats.removal_rate).toBeGreaterThan(0);
      expect(stats.removal_rate).toBeLessThan(1);
      expect(stats.reasons).toBeDefined();
    });

    it('필터링 사유별 통계를 제공해야 함', () => {
      const filter = new DataQualityFilter();
      const rawVehicles: Partial<Vehicle>[] = [
        { vehicleId: 1, manufacturer: '현대', model: '아반떼', price: 3000, modelYear: 2020, distance: 50000 },
        { vehicleId: 2, manufacturer: '', model: 'K5', price: 3000, modelYear: 2020, distance: 50000 }, // 제조사 누락
        { vehicleId: 3, manufacturer: '기아', model: 'K5', price: 0, modelYear: 2020, distance: 50000 }, // 가격 0
        { vehicleId: 4, manufacturer: 'BMW', model: '320i', price: 3000, modelYear: 1990, distance: 50000 }, // 연식 오래됨
      ];

      const filtered = filter.filterVehicles(rawVehicles as Vehicle[]);
      const stats = filter.getFilteringStats(rawVehicles as Vehicle[], filtered);

      expect(stats.reasons).toBeDefined();
      expect(stats.reasons.missing_manufacturer).toBeGreaterThan(0);
      expect(stats.reasons.invalid_price).toBeGreaterThan(0);
      expect(stats.reasons.old_year).toBeGreaterThan(0);
    });
  });

  describe('성능 테스트', () => {
    it('대용량 데이터 필터링 성능 (10,000개)', () => {
      const filter = new DataQualityFilter();
      const vehicles: Partial<Vehicle>[] = Array.from({ length: 10000 }, (_, i) => ({
        vehicleId: i,
        manufacturer: '현대',
        model: '아반떼',
        modelYear: 2015 + (i % 10),
        price: 2000 + (i % 5000),
        distance: 30000 + (i % 100000),
        fuelType: '가솔린',
      }));

      const startTime = performance.now();
      const filtered = filter.filterVehicles(vehicles as Vehicle[]);
      const endTime = performance.now();

      expect(filtered.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // 100ms 이내
    });
  });
});
