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
}

// 검색 필터 타입
export interface VehicleSearchFilters {
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minYear?: number | undefined;
  maxYear?: number | undefined;
  fuelType?: string | undefined;
  manufacturer?: string | undefined;
  model?: string | undefined;
  carType?: string | undefined;
  location?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
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
    photo: raw.photo || undefined,
    detailUrl: raw.detailUrl || undefined,
    options: raw.hasOptions ? raw.hasOptions.split(',').map(o => o.trim()) : [],
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
