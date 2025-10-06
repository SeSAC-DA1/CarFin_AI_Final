/**
 * 차량 데이터 품질 필터링 및 이상치 제거 모듈
 * 9999만원 같은 더미 데이터와 비현실적인 매물 제거
 */

interface Vehicle {
  vehicleId: number;
  price: number;
  modelYear: number;
  distance: number;
  originPrice: number;
  manufacturer: string;
  fuelType: string;
  firstRegistrationDate: number;
}

interface DataQualityRules {
  // 가격 필터링
  minPrice: number;           // 최소 허용 가격 (만원)
  maxPrice: number;           // 최대 허용 가격 (만원)
  dummyPrices: number[];      // 제거할 더미 가격들

  // 연식 필터링
  minYear: number;            // 최소 허용 연식
  maxYear: number;            // 최대 허용 연식

  // 주행거리 필터링
  maxDistance: number;        // 최대 허용 주행거리 (km)

  // 가격 대비 연식 검증
  priceYearRatio: {
    enabled: boolean;
    maxDepreciationRate: number; // 연간 최대 감가율
  };
}

class DataQualityFilter {
  private rules: DataQualityRules;

  constructor() {
    const currentYear = new Date().getFullYear();

    this.rules = {
      // 가격 필터링 (한국 중고차 시장 기준)
      minPrice: 50,              // 50만원 이하는 의심
      maxPrice: 8000,            // 8000만원 이상은 고급차 (일반 추천 제외)
      dummyPrices: [9999, 8888, 7777, 6666], // 명백한 더미 가격들

      // 연식 필터링
      minYear: 2005,             // 2005년 이후 차량만
      maxYear: currentYear + 1,  // 미래 연식 제외

      // 주행거리 필터링
      maxDistance: 300000,       // 30만km 이상은 과주행

      // 가격-연식 상관관계 검증
      priceYearRatio: {
        enabled: true,
        maxDepreciationRate: 0.25  // 연간 25% 이상 감가는 의심
      }
    };
  }

  /**
   * 차량 배열에서 이상치 데이터 제거
   */
  filterVehicles(vehicles: Vehicle[]): Vehicle[] {
    return vehicles.filter(vehicle => this.isValidVehicle(vehicle));
  }

  /**
   * 개별 차량 데이터 유효성 검증
   */
  private isValidVehicle(vehicle: Vehicle): boolean {
    // 1. 기본 필드 존재 여부 확인
    if (!this.hasRequiredFields(vehicle)) {
      console.log(`❌ 필수 필드 누락: vehicleId ${vehicle.vehicleId}`);
      return false;
    }

    // 2. 더미 가격 제거
    if (this.isDummyPrice(vehicle.price)) {
      console.log(`❌ 더미 가격 감지: ${vehicle.price}만원 (vehicleId: ${vehicle.vehicleId})`);
      return false;
    }

    // 3. 가격 범위 검증
    if (!this.isValidPriceRange(vehicle.price)) {
      console.log(`❌ 가격 범위 초과: ${vehicle.price}만원 (vehicleId: ${vehicle.vehicleId})`);
      return false;
    }

    // 4. 연식 검증
    if (!this.isValidYear(vehicle.modelYear)) {
      console.log(`❌ 연식 범위 초과: ${vehicle.modelYear}년 (vehicleId: ${vehicle.vehicleId})`);
      return false;
    }

    // 5. 주행거리 검증
    if (!this.isValidDistance(vehicle.distance)) {
      console.log(`❌ 주행거리 과다: ${vehicle.distance}km (vehicleId: ${vehicle.vehicleId})`);
      return false;
    }

    // 6. 가격-연식 상관관계 검증
    if (!this.isValidPriceYearRatio(vehicle)) {
      console.log(`❌ 가격-연식 비율 이상: ${vehicle.price}만원/${vehicle.modelYear}년 (vehicleId: ${vehicle.vehicleId})`);
      return false;
    }

    // 7. 등록일 검증
    if (!this.isValidRegistrationDate(vehicle.firstRegistrationDate)) {
      console.log(`❌ 등록일 이상: ${vehicle.firstRegistrationDate} (vehicleId: ${vehicle.vehicleId})`);
      return false;
    }

    return true;
  }

  /**
   * 필수 필드 존재 여부 확인
   */
  private hasRequiredFields(vehicle: Vehicle): boolean {
    return !!(
      vehicle.vehicleId &&
      vehicle.price &&
      vehicle.modelYear &&
      vehicle.manufacturer &&
      typeof vehicle.distance === 'number'
    );
  }

  /**
   * 더미 가격 감지 (9999, 8888 등)
   */
  private isDummyPrice(price: number): boolean {
    return this.rules.dummyPrices.includes(price);
  }

  /**
   * 가격 범위 검증
   */
  private isValidPriceRange(price: number): boolean {
    return price >= this.rules.minPrice && price <= this.rules.maxPrice;
  }

  /**
   * 연식 검증
   */
  private isValidYear(year: number): boolean {
    return year >= this.rules.minYear && year <= this.rules.maxYear;
  }

  /**
   * 주행거리 검증
   */
  private isValidDistance(distance: number): boolean {
    return distance >= 0 && distance <= this.rules.maxDistance;
  }

  /**
   * 가격-연식 상관관계 검증
   * 너무 오래된 차가 비싸거나, 새 차가 너무 싸면 의심
   */
  private isValidPriceYearRatio(vehicle: Vehicle): boolean {
    if (!this.rules.priceYearRatio.enabled) return true;

    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicle.modelYear;

    // 연식이 너무 오래된 경우 (15년 이상)
    if (age > 15 && vehicle.price > 2000) {
      return false; // 15년 이상 된 차가 2000만원 이상이면 의심
    }

    // 신차급인데 너무 싼 경우 (3년 이내)
    if (age <= 3 && vehicle.price < 1000) {
      return false; // 3년 이내 차가 1000만원 미만이면 의심
    }

    // 신차 가격 대비 너무 비싼 경우
    if (vehicle.originPrice && vehicle.price > vehicle.originPrice * 1.2) {
      return false; // 신차가 대비 120% 이상이면 의심
    }

    return true;
  }

  /**
   * 등록일 검증
   */
  private isValidRegistrationDate(regDate: number): boolean {
    // 0이거나 비현실적인 날짜 제외
    if (!regDate || regDate === 0) return false;

    // YYYYMMDD 형식 검증
    const dateStr = regDate.toString();
    if (dateStr.length !== 8) return false;

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));

    // 기본적인 날짜 유효성 검증
    if (year < 2000 || year > 2025) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    return true;
  }

  /**
   * 필터링 통계 생성
   */
  getFilteringStats(originalVehicles: Vehicle[], filteredVehicles: Vehicle[]) {
    const removed = originalVehicles.length - filteredVehicles.length;
    const removalRate = (removed / originalVehicles.length * 100).toFixed(2);

    return {
      original: originalVehicles.length,
      filtered: filteredVehicles.length,
      removed: removed,
      removalRate: `${removalRate}%`,
      qualityScore: ((filteredVehicles.length / originalVehicles.length) * 100).toFixed(2) + '%'
    };
  }

  /**
   * 추천용 고품질 차량만 필터링
   * 추천 시스템에서 사용할 더 엄격한 기준
   */
  filterForRecommendation(vehicles: Vehicle[]): Vehicle[] {
    return vehicles.filter(vehicle => {
      // 기본 품질 검증
      if (!this.isValidVehicle(vehicle)) return false;

      // 추천용 추가 기준
      const currentYear = new Date().getFullYear();
      const age = currentYear - vehicle.modelYear;

      // 추천용 더 엄격한 기준
      return (
        vehicle.price >= 300 &&           // 300만원 이상
        vehicle.price <= 5000 &&         // 5000만원 이하
        age <= 12 &&                     // 12년 이내
        vehicle.distance <= 200000 &&    // 20만km 이하
        vehicle.manufacturer !== '' &&   // 제조사 정보 있음
        vehicle.fuelType !== ''          // 연료 타입 정보 있음
      );
    });
  }
}

export { DataQualityFilter, type Vehicle, type DataQualityRules };