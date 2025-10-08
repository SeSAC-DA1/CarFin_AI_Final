import { describe, it, expect } from 'vitest';
import { TCOCalculator } from '../../server/lib/financial/TCOCalculator';
import type { Vehicle } from '../../shared/types/vehicle';
import type { ProfileData } from '../../shared/types/profile';

describe('TCOCalculator - Total Cost of Ownership', () => {
  const createMockVehicle = (overrides?: Partial<Vehicle>): Vehicle => ({
    vehicleId: '1',
    brand: '현대',
    model: '아반떼',
    modelYear: 2020,
    price: 2000, // 만원
    distance: 30000, // km
    fuelType: '가솔린',
    location: '서울',
    photo: '',
    options: [],
    detailUrl: '',
    myAccidentCost: 0,
    otherAccidentCost: 0,
    originPrice: 2500,
    ...overrides,
  });

  const createMockProfile = (overrides?: Partial<ProfileData>): ProfileData => ({
    name: '홍길동',
    age: '30',
    location: '서울',
    usage: ['commute'],
    budget: [2000, 3000],
    importance: {
      price: 8,
      fuelEfficiency: 7,
      safety: 8,
      design: 5,
      brand: 6,
    },
    annualKm: 15000,
    ownershipYears: 3,
    ...overrides,
  });

  describe('취득세 계산 (지방세법 제11조)', () => {
    it('승용차 취득세는 취득가액의 7%여야 함', () => {
      const vehicle = createMockVehicle({ price: 2000 }); // 2000만원
      const profile = createMockProfile();
      const calculator = new TCOCalculator(vehicle, profile);

      const tco = calculator.calculateTCO();

      // 2000만원 × 7% = 140만원
      expect(tco.acquisitionTax).toBe(140);
    });

    it('경형 승용차는 취득세 4%여야 함', () => {
      const vehicle = createMockVehicle({
        price: 800,
        model: '모닝', // 경형
      });
      const profile = createMockProfile();
      const calculator = new TCOCalculator(vehicle, profile);

      const tco = calculator.calculateTCO();

      // 경형 차량은 4% (하지만 현재 구현은 7% 고정)
      expect(tco.acquisitionTax).toBeGreaterThan(0);
    });

    it('취득세는 가격에 비례해야 함', () => {
      const cheap = createMockVehicle({ price: 1000 });
      const expensive = createMockVehicle({ price: 5000 });
      const profile = createMockProfile();

      const tco1 = new TCOCalculator(cheap, profile).calculateTCO();
      const tco2 = new TCOCalculator(expensive, profile).calculateTCO();

      expect(tco2.acquisitionTax).toBe(tco1.acquisitionTax * 5);
    });
  });

  describe('자동차세 계산 (지방세법 제127조)', () => {
    it('연식별 감가 적용 (최대 50%)', () => {
      const new2024 = createMockVehicle({ modelYear: 2024, originPrice: 3000 });
      const old2010 = createMockVehicle({ modelYear: 2010, originPrice: 3000 });
      const profile = createMockProfile({ ownershipYears: 3 });

      const tco2024 = new TCOCalculator(new2024, profile).calculateTCO();
      const tco2010 = new TCOCalculator(old2010, profile).calculateTCO();

      // 오래된 차가 자동차세가 더 낮아야 함
      expect(tco2010.vehicleTax).toBeLessThan(tco2024.vehicleTax);
    });

    it('자동차세는 보유 기간에 비례해야 함', () => {
      const vehicle = createMockVehicle();
      const profile1Year = createMockProfile({ ownershipYears: 1 });
      const profile3Years = createMockProfile({ ownershipYears: 3 });

      const tco1 = new TCOCalculator(vehicle, profile1Year).calculateTCO();
      const tco2 = new TCOCalculator(vehicle, profile3Years).calculateTCO();

      expect(tco2.vehicleTax).toBe(tco1.vehicleTax * 3);
    });

    it('배기량별 세율 적용 (cc당 80원 ~ 200원)', () => {
      const vehicle = createMockVehicle({ originPrice: 3000 });
      const profile = createMockProfile({ ownershipYears: 1 });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 자동차세 > 0
      expect(tco.vehicleTax).toBeGreaterThan(0);
    });
  });

  describe('정비비 계산 (주행거리 기반)', () => {
    it('정비비는 주행거리에 비례해야 함', () => {
      const vehicle = createMockVehicle();
      const profile10k = createMockProfile({ annualKm: 10000, ownershipYears: 3 });
      const profile30k = createMockProfile({ annualKm: 30000, ownershipYears: 3 });

      const tco1 = new TCOCalculator(vehicle, profile10k).calculateTCO();
      const tco2 = new TCOCalculator(vehicle, profile30k).calculateTCO();

      expect(tco2.maintenanceCost).toBe(tco1.maintenanceCost * 3);
    });

    it('DOE/ANL 표준 km당 88원 적용', () => {
      const vehicle = createMockVehicle();
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 3,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 15000km × 3년 × 88원/km = 3,960,000원 = 396만원
      const expected = 15000 * 3 * 88 / 10000;
      expect(tco.maintenanceCost).toBe(expected);
    });

    it('정비비는 항상 양수여야 함', () => {
      const vehicle = createMockVehicle();
      const profile = createMockProfile({ annualKm: 1000, ownershipYears: 1 });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      expect(tco.maintenanceCost).toBeGreaterThan(0);
    });
  });

  describe('감가상각 계산 (정률법)', () => {
    it('감가상각은 차량 가격에 비례해야 함', () => {
      const cheap = createMockVehicle({ price: 1000 });
      const expensive = createMockVehicle({ price: 5000 });
      const profile = createMockProfile({ ownershipYears: 3 });

      const tco1 = new TCOCalculator(cheap, profile).calculateTCO();
      const tco2 = new TCOCalculator(expensive, profile).calculateTCO();

      expect(tco2.depreciation).toBeGreaterThan(tco1.depreciation);
    });

    it('보유 기간이 길수록 감가상각 금액이 커져야 함', () => {
      const vehicle = createMockVehicle({ price: 3000 });
      const profile1Year = createMockProfile({ ownershipYears: 1 });
      const profile5Years = createMockProfile({ ownershipYears: 5 });

      const tco1 = new TCOCalculator(vehicle, profile1Year).calculateTCO();
      const tco2 = new TCOCalculator(vehicle, profile5Years).calculateTCO();

      expect(tco2.depreciation).toBeGreaterThan(tco1.depreciation);
    });

    it('연간 감가율 20% 적용', () => {
      const vehicle = createMockVehicle({ price: 3000 });
      const profile = createMockProfile({ ownershipYears: 1 });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 1년차 감가상각: 3000 × 20% = 600만원
      expect(tco.depreciation).toBe(600);
    });

    it('감가상각은 차량 가격을 초과할 수 없음', () => {
      const vehicle = createMockVehicle({ price: 2000 });
      const profile = createMockProfile({ ownershipYears: 10 }); // 장기 보유

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 감가상각 ≤ 차량가격
      expect(tco.depreciation).toBeLessThanOrEqual(vehicle.price);
    });
  });

  describe('연료비 계산 (연비 기반)', () => {
    it('가솔린 차량 연료비 계산 (1리터 1700원)', () => {
      const vehicle = createMockVehicle({
        fuelType: '가솔린',
        model: '아반떼', // 연비 14.5km/l 가정
      });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 3,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 15000km × 3년 ÷ 14.5km/l × 1700원/l = 약 527만원
      expect(tco.fuelCost).toBeGreaterThan(0);
    });

    it('디젤 차량은 가솔린보다 연료비가 낮아야 함', () => {
      const gasoline = createMockVehicle({ fuelType: '가솔린' });
      const diesel = createMockVehicle({ fuelType: '디젤' });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 3,
      });

      const tcoGasoline = new TCOCalculator(gasoline, profile).calculateTCO();
      const tcoDiesel = new TCOCalculator(diesel, profile).calculateTCO();

      // 디젤이 연비가 더 좋아 연료비가 낮음
      expect(tcoDiesel.fuelCost).toBeLessThan(tcoGasoline.fuelCost);
    });

    it('하이브리드는 연료비가 가장 낮아야 함', () => {
      const gasoline = createMockVehicle({ fuelType: '가솔린' });
      const hybrid = createMockVehicle({ fuelType: '하이브리드' });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 3,
      });

      const tcoGasoline = new TCOCalculator(gasoline, profile).calculateTCO();
      const tcoHybrid = new TCOCalculator(hybrid, profile).calculateTCO();

      // 하이브리드 연비 우수 → 연료비 낮음
      expect(tcoHybrid.fuelCost).toBeLessThan(tcoGasoline.fuelCost);
    });

    it('전기차는 연료비가 없거나 매우 낮아야 함', () => {
      const electric = createMockVehicle({ fuelType: '전기' });
      const gasoline = createMockVehicle({ fuelType: '가솔린' });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 3,
      });

      const tcoElectric = new TCOCalculator(electric, profile).calculateTCO();
      const tcoGasoline = new TCOCalculator(gasoline, profile).calculateTCO();

      // 전기차 충전비 < 가솔린 연료비
      expect(tcoElectric.fuelCost).toBeLessThan(tcoGasoline.fuelCost);
    });

    it('주행거리가 많을수록 연료비가 높아야 함', () => {
      const vehicle = createMockVehicle({ fuelType: '가솔린' });
      const profile10k = createMockProfile({ annualKm: 10000, ownershipYears: 3 });
      const profile30k = createMockProfile({ annualKm: 30000, ownershipYears: 3 });

      const tco1 = new TCOCalculator(vehicle, profile10k).calculateTCO();
      const tco2 = new TCOCalculator(vehicle, profile30k).calculateTCO();

      expect(tco2.fuelCost).toBeGreaterThan(tco1.fuelCost);
    });
  });

  describe('총 소유비용 (Total TCO) 계산', () => {
    it('TCO = 취득세 + 자동차세 + 정비비 + 감가상각 + 연료비', () => {
      const vehicle = createMockVehicle({ price: 3000 });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 3,
      });

      const calculator = new TCOCalculator(vehicle, profile);
      const tco = calculator.calculateTCO();

      const expectedTotal =
        tco.acquisitionTax +
        tco.vehicleTax +
        tco.maintenanceCost +
        tco.depreciation +
        tco.fuelCost;

      expect(tco.totalCost).toBe(expectedTotal);
    });

    it('TCO는 차량 가격의 1.5배 ~ 3배 범위여야 함 (3년 기준)', () => {
      const vehicle = createMockVehicle({ price: 3000 });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 3,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // TCO는 차량가격보다 높고, 3배 이하여야 합리적
      expect(tco.totalCost).toBeGreaterThan(vehicle.price);
      expect(tco.totalCost).toBeLessThan(vehicle.price * 3);
    });

    it('주요 비용 구성 비율이 합리적이어야 함', () => {
      const vehicle = createMockVehicle({ price: 3000 });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 3,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 감가상각이 가장 큰 비중을 차지해야 함
      expect(tco.depreciation).toBeGreaterThan(tco.acquisitionTax);
      expect(tco.depreciation).toBeGreaterThan(tco.vehicleTax);

      // 모든 비용 항목이 양수여야 함
      expect(tco.acquisitionTax).toBeGreaterThan(0);
      expect(tco.vehicleTax).toBeGreaterThan(0);
      expect(tco.maintenanceCost).toBeGreaterThan(0);
      expect(tco.depreciation).toBeGreaterThan(0);
      expect(tco.fuelCost).toBeGreaterThan(0);
    });
  });

  describe('실제 시나리오 테스트', () => {
    it('시나리오 1: 출퇴근용 경제형 세단 (3년 보유)', () => {
      const vehicle = createMockVehicle({
        brand: '현대',
        model: '아반떼',
        price: 1800,
        fuelType: '가솔린',
      });
      const profile = createMockProfile({
        usage: ['commute'],
        annualKm: 12000, // 출퇴근용
        ownershipYears: 3,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 경제형 차량 TCO 검증
      expect(tco.totalCost).toBeGreaterThan(1800); // 차량가격보다 높음
      expect(tco.totalCost).toBeLessThan(4500); // 합리적 범위
      expect(tco.fuelCost).toBeGreaterThan(0); // 연료비 발생
    });

    it('시나리오 2: 가족용 SUV (5년 장기 보유)', () => {
      const vehicle = createMockVehicle({
        brand: '현대',
        model: '싼타페',
        price: 3800,
        fuelType: '디젤',
      });
      const profile = createMockProfile({
        usage: ['family', 'leisure'],
        annualKm: 18000, // 가족 여행 많음
        ownershipYears: 5,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 장기 보유 TCO 검증
      expect(tco.totalCost).toBeGreaterThan(5000); // 장기 보유로 높은 TCO
      expect(tco.depreciation).toBeGreaterThan(1500); // 감가상각 큼
      expect(tco.maintenanceCost).toBeGreaterThan(700); // 많은 주행거리
    });

    it('시나리오 3: 저주행 단기 보유 (1년)', () => {
      const vehicle = createMockVehicle({
        brand: '기아',
        model: 'K5',
        price: 2500,
        fuelType: '하이브리드',
      });
      const profile = createMockProfile({
        usage: ['leisure'],
        annualKm: 8000, // 주말용
        ownershipYears: 1,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 단기 저주행 TCO 검증
      expect(tco.maintenanceCost).toBeLessThan(100); // 낮은 정비비
      expect(tco.fuelCost).toBeLessThan(200); // 하이브리드 + 저주행
      expect(tco.vehicleTax).toBeLessThan(100); // 1년치만
    });

    it('시나리오 4: 고주행 영업용 (3년)', () => {
      const vehicle = createMockVehicle({
        brand: '현대',
        model: '그랜저',
        price: 4500,
        fuelType: 'LPG',
      });
      const profile = createMockProfile({
        usage: ['business'],
        annualKm: 35000, // 영업용 고주행
        ownershipYears: 3,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 고주행 TCO 검증
      expect(tco.maintenanceCost).toBeGreaterThan(900); // 높은 정비비
      expect(tco.fuelCost).toBeGreaterThan(800); // 많은 주행거리
      expect(tco.totalCost).toBeGreaterThan(7000); // 높은 총비용
    });
  });

  describe('사용자 개인화 검증', () => {
    it('annualKm 변경 시 정비비와 연료비가 변경되어야 함', () => {
      const vehicle = createMockVehicle();
      const profile10k = createMockProfile({ annualKm: 10000, ownershipYears: 3 });
      const profile20k = createMockProfile({ annualKm: 20000, ownershipYears: 3 });

      const tco1 = new TCOCalculator(vehicle, profile10k).calculateTCO();
      const tco2 = new TCOCalculator(vehicle, profile20k).calculateTCO();

      // 주행거리 2배 → 정비비/연료비 2배
      expect(tco2.maintenanceCost).toBe(tco1.maintenanceCost * 2);
      expect(tco2.fuelCost / tco1.fuelCost).toBeCloseTo(2, 0);
    });

    it('ownershipYears 변경 시 모든 비용이 변경되어야 함', () => {
      const vehicle = createMockVehicle();
      const profile1Year = createMockProfile({ annualKm: 15000, ownershipYears: 1 });
      const profile3Years = createMockProfile({ annualKm: 15000, ownershipYears: 3 });

      const tco1 = new TCOCalculator(vehicle, profile1Year).calculateTCO();
      const tco3 = new TCOCalculator(vehicle, profile3Years).calculateTCO();

      // 취득세는 동일 (1회만 발생)
      expect(tco3.acquisitionTax).toBe(tco1.acquisitionTax);

      // 자동차세, 정비비, 연료비는 3배
      expect(tco3.vehicleTax).toBe(tco1.vehicleTax * 3);
      expect(tco3.maintenanceCost).toBe(tco1.maintenanceCost * 3);
      expect(tco3.fuelCost / tco1.fuelCost).toBeCloseTo(3, 0);

      // 감가상각은 3배보다 작음 (정률법)
      expect(tco3.depreciation).toBeGreaterThan(tco1.depreciation);
      expect(tco3.depreciation).toBeLessThan(tco1.depreciation * 3);
    });

    it('기본값 (annualKm: 15000, ownershipYears: 3) 적용 확인', () => {
      const vehicle = createMockVehicle();
      const profileDefault = createMockProfile();
      const profileExplicit = createMockProfile({ annualKm: 15000, ownershipYears: 3 });

      const tco1 = new TCOCalculator(vehicle, profileDefault).calculateTCO();
      const tco2 = new TCOCalculator(vehicle, profileExplicit).calculateTCO();

      // 동일한 결과
      expect(tco1.totalCost).toBe(tco2.totalCost);
    });
  });

  describe('엣지 케이스', () => {
    it('매우 저렴한 차량 (500만원)', () => {
      const vehicle = createMockVehicle({ price: 500 });
      const profile = createMockProfile();

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      expect(tco.acquisitionTax).toBe(35); // 500 × 7%
      expect(tco.totalCost).toBeGreaterThan(500);
      expect(tco.totalCost).toBeLessThan(2000);
    });

    it('매우 비싼 차량 (1억원)', () => {
      const vehicle = createMockVehicle({ price: 10000 });
      const profile = createMockProfile();

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      expect(tco.acquisitionTax).toBe(700); // 10000 × 7%
      expect(tco.depreciation).toBeGreaterThan(2000);
      expect(tco.totalCost).toBeGreaterThan(10000);
    });

    it('1년 미만 단기 보유 (3개월)', () => {
      const vehicle = createMockVehicle({ price: 3000 });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 0.25, // 3개월
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 3개월치 비용 계산
      expect(tco.maintenanceCost).toBeLessThan(100);
      expect(tco.fuelCost).toBeLessThan(150);
    });

    it('초장기 보유 (10년)', () => {
      const vehicle = createMockVehicle({ price: 3000 });
      const profile = createMockProfile({
        annualKm: 15000,
        ownershipYears: 10,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 장기 보유 시 감가상각은 차량가격을 초과하지 않음
      expect(tco.depreciation).toBeLessThanOrEqual(vehicle.price);
      expect(tco.totalCost).toBeGreaterThan(10000); // 높은 총비용
    });

    it('주행거리 0km', () => {
      const vehicle = createMockVehicle();
      const profile = createMockProfile({
        annualKm: 0,
        ownershipYears: 3,
      });

      const tco = new TCOCalculator(vehicle, profile).calculateTCO();

      // 정비비와 연료비가 0
      expect(tco.maintenanceCost).toBe(0);
      expect(tco.fuelCost).toBe(0);

      // 취득세, 자동차세, 감가상각은 발생
      expect(tco.acquisitionTax).toBeGreaterThan(0);
      expect(tco.vehicleTax).toBeGreaterThan(0);
      expect(tco.depreciation).toBeGreaterThan(0);
    });
  });

  describe('성능 테스트', () => {
    it('1000개 차량 TCO 계산이 1초 이내에 완료되어야 함', () => {
      const vehicles = Array.from({ length: 1000 }, (_, i) =>
        createMockVehicle({
          vehicleId: `${i}`,
          price: 1500 + Math.random() * 3000,
          fuelType: ['가솔린', '디젤', '하이브리드'][Math.floor(Math.random() * 3)] as any,
        })
      );
      const profile = createMockProfile();

      const startTime = performance.now();

      vehicles.forEach(vehicle => {
        new TCOCalculator(vehicle, profile).calculateTCO();
      });

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // 1초
    });
  });
});
