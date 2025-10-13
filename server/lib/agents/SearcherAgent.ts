import type { Vehicle } from "@shared/types/vehicle";
import type { AgentTask, AgentResult } from "./ManagerAgent";

/**
 * Searcher Agent - MACRec Protocol
 *
 * 역할:
 * 1. 차량 데이터베이스 검색
 * 2. 필터링 (가격, 연식, 주행거리)
 * 3. 브랜드 다양성 확보
 */
export class SearcherAgent {
  private agentId = 'searcher';

  /**
   * Execute Agent Task
   */
  async execute(task: AgentTask, vehicles: Vehicle[]): Promise<AgentResult> {
    const startTime = Date.now();

    console.log(`🔍 Searcher Agent: ${task.action} 시작 (${vehicles.length}대 검색)`);

    try {
      let output: any;

      switch (task.action) {
        case 'filter_vehicles':
          output = await this.filterVehicles(vehicles, task.input.criteria, task.input.userMessage);
          break;

        case 'search_by_criteria':
          output = await this.searchByCriteria(vehicles, task.input);
          break;

        default:
          throw new Error(`Unknown action: ${task.action}`);
      }

      const executionTime = Date.now() - startTime;

      console.log(`✅ Searcher Agent: ${output.length}대 발견 (${executionTime}ms)`);

      return {
        taskId: task.taskId,
        agent: this.agentId,
        success: true,
        output,
        executionTime,
        timestamp: new Date()
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Searcher Agent: ${task.action} 실패`, error);

      return {
        taskId: task.taskId,
        agent: this.agentId,
        success: false,
        output: { error: error instanceof Error ? error.message : 'Unknown error' },
        executionTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Filter Vehicles (차량 필터링)
   */
  private filterVehicles(vehicles: Vehicle[], criteria: any, userMessage?: string): Vehicle[] {
    const currentYear = new Date().getFullYear();

    // 🔧 프로필 정규화 (필드명 통일)
    const normalizedCriteria = {
      ...criteria,
      carType: criteria.carType || criteria.vehicleTypes?.[0] || null,
      carTypes: criteria.carTypes || criteria.vehicleTypes || [],
      brand: criteria.brand || criteria.preferredBrands?.[0] || null,
      brands: criteria.brands || criteria.preferredBrands || [],
    };

    console.log('📋 정규화된 criteria:', JSON.stringify(normalizedCriteria, null, 2));

    // 🐛 Fix: userMessage가 명시적 예산을 지정한 경우 프로필 예산보다 우선 적용
    let minPrice = 0;
    let maxPrice = 5000; // 만원 단위
    let messageBudgetOverride = false;

    // 1. userMessage에서 예산 추출 (최우선)
    if (userMessage) {
      // 🐛 Fix: "만원" 키워드가 명확히 있는 경우만 예산으로 인식 (15,000km 같은 오인식 방지)
      const priceMatch = userMessage.match(/(\d{1,4})만원/);
      if (priceMatch && priceMatch[1]) {
        const targetPrice = parseInt(priceMatch[1]);
        messageBudgetOverride = true;

        // 🐛 Fix: "이하" 키워드 감지 - 정확한 예산 준수
        if (userMessage.includes('이하') || userMessage.includes('까지') || userMessage.includes('안') || userMessage.includes('내')) {
          minPrice = 0;
          maxPrice = targetPrice; // 정확히 지정된 금액까지만
          console.log(`📍 userMessage 예산 우선: ${targetPrice}만원 이하로 엄격하게 필터링`);
        } else {
          // "대략", "정도" 등의 경우만 ±20% 여유
          minPrice = Math.floor(targetPrice * 0.8);
          maxPrice = Math.ceil(targetPrice * 1.2);
          console.log(`📍 userMessage 예산 우선: ${targetPrice}만원 ±20% 유연 필터링`);
        }
      }
    }

    // 2. normalizedCriteria.budget (프로필 예산)은 userMessage 예산이 없을 때만 사용
    if (!messageBudgetOverride && normalizedCriteria.budget && Array.isArray(normalizedCriteria.budget)) {
      minPrice = normalizedCriteria.budget[0] || 0;
      maxPrice = normalizedCriteria.budget[1] || 5000;
      console.log(`📍 프로필 예산 사용: ${minPrice}~${maxPrice}만원`);
    }

    console.log(`💰 최종 예산 범위: ${minPrice}만원 ~ ${maxPrice}만원`);

    // 🐛 Fix: userMessage에서 직접 차종 추출 (normalizedCriteria.carType이 없을 경우 대비)
    let targetCarType = normalizedCriteria.carType;
    if (!targetCarType && userMessage) {
      const lowerMsg = userMessage.toLowerCase();
      if (lowerMsg.includes('suv') || lowerMsg.includes('에스유브이')) {
        targetCarType = 'SUV';
        console.log(`🔍 메시지에서 차종 추출: SUV`);
      } else if (lowerMsg.includes('세단')) {
        targetCarType = '세단';
        console.log(`🔍 메시지에서 차종 추출: 세단`);
      } else if (lowerMsg.includes('경차')) {
        targetCarType = '경차';
        console.log(`🔍 메시지에서 차종 추출: 경차`);
      }
    }

    if (targetCarType) {
      console.log(`🚗 차종 필터: ${targetCarType}`);
    }

    // 브랜드 필터
    const targetBrands = normalizedCriteria.brands && normalizedCriteria.brands.length > 0
      ? normalizedCriteria.brands
      : null;
    if (targetBrands) {
      console.log(`🏷️ 브랜드 필터: ${targetBrands.join(', ')}`);
    }

    // 상용차 키워드 (제외 대상)
    const commercialVehicleKeywords = [
      'st1', '포터', '봉고', '다마스', '라보',
      '화물', '트럭', '냉동', '탑차', '밴'
    ];

    // 필터링
    const filtered = vehicles.filter(v => {
      // 상용차 제외
      const modelLower = (v.model || '').toLowerCase();
      const carTypeLower = (v.carType || '').toLowerCase();
      const isCommercialVehicle = commercialVehicleKeywords.some(keyword =>
        modelLower.includes(keyword) || carTypeLower.includes(keyword)
      );
      if (isCommercialVehicle) return false;

      // 가격 필터
      if (v.price && (v.price < minPrice || v.price > maxPrice)) return false;

      // 연식 필터 (15년 이내)
      if (v.modelYear && v.modelYear < currentYear - 15) return false;

      // 주행거리 필터 (20만km 이하)
      if (v.distance && v.distance > 200000) return false;

      // 차종 필터
      if (targetCarType) {
        const requestedType = targetCarType.toLowerCase();
        if (requestedType === 'suv') {
          // ❌ 명시적으로 승합차 제외
          if (carTypeLower.includes('승합') ||
              carTypeLower.includes('미니밴') ||
              carTypeLower.includes('van') ||
              carTypeLower.includes('mpv')) {
            console.log(`🚫 SUV 제외: ${v.model} (${v.carType} - 승합차)`);
            return false;
          }

          // ❌ 세단도 제외
          if (carTypeLower.includes('세단') || carTypeLower.includes('sedan')) {
            console.log(`🚫 SUV 제외: ${v.model} (${v.carType} - 세단)`);
            return false;
          }

          // ❌ 경차도 제외
          if (carTypeLower.includes('경차') || carTypeLower.includes('경형')) {
            console.log(`🚫 SUV 제외: ${v.model} (${v.carType} - 경차)`);
            return false;
          }

          // ✅ SUV 매칭
          const isSUV = carTypeLower.includes('suv') ||
                        carTypeLower.includes('rv') ||
                        (carTypeLower.includes('스포츠') && carTypeLower.includes('유틸리티'));

          if (!isSUV) {
            console.log(`🚫 SUV 아님: ${v.model} (${v.carType})`);
            return false;
          }

          console.log(`✅ SUV 매칭: ${v.model} (${v.carType})`);

        } else if (requestedType === '세단') {
          const isSedan = carTypeLower.includes('세단') || carTypeLower.includes('sedan');
          if (!isSedan) return false;
        } else if (requestedType === '경차') {
          const isKCar = carTypeLower.includes('경차') || carTypeLower.includes('경형');
          if (!isKCar) return false;
        } else if (requestedType === '승합' || requestedType === '승합차') {
          const isVan = carTypeLower.includes('승합') ||
                        carTypeLower.includes('미니밴') ||
                        carTypeLower.includes('van') ||
                        carTypeLower.includes('mpv');
          if (!isVan) return false;
        }
      }

      // 브랜드 필터 (선호 브랜드가 있을 경우)
      if (targetBrands && targetBrands.length > 0) {
        const vehicleBrand = (v.manufacturer || '').toLowerCase();
        const matchesBrand = targetBrands.some(brand =>
          vehicleBrand.includes(brand.toLowerCase())
        );

        if (!matchesBrand) {
          console.log(`🚫 브랜드 불일치: ${v.manufacturer} (선호: ${targetBrands.join(', ')})`);
          return false;
        }

        console.log(`✅ 브랜드 매칭: ${v.manufacturer}`);
      }

      return true;
    });

    // 품질 점수로 정렬
    const sorted = filtered.sort((a, b) => {
      const aScore = (a.modelYear || 2000) * 0.7 - (a.distance || 0) * 0.00001;
      const bScore = (b.modelYear || 2000) * 0.7 - (b.distance || 0) * 0.00001;
      return bScore - aScore;
    });

    // 브랜드 다양성 확보
    const brandDiverse = this.ensureBrandDiversity(sorted, 50);

    console.log(`🎨 브랜드 다양성: ${brandDiverse.length}대 선택`);

    return brandDiverse;
  }

  /**
   * Search By Criteria (기준 기반 검색)
   */
  private searchByCriteria(vehicles: Vehicle[], criteria: any): Vehicle[] {
    return this.filterVehicles(vehicles, criteria);
  }

  /**
   * Ensure Brand Diversity (브랜드 다양성 확보)
   */
  private ensureBrandDiversity(vehicles: Vehicle[], maxCount: number): Vehicle[] {
    const brandMap = new Map<string, Vehicle[]>();

    // 브랜드별로 그룹화
    for (const vehicle of vehicles) {
      const brand = vehicle.manufacturer || '기타';
      if (!brandMap.has(brand)) {
        brandMap.set(brand, []);
      }
      brandMap.get(brand)!.push(vehicle);
    }

    // 라운드 로빈 방식으로 선택
    const brandDiverseVehicles: Vehicle[] = [];
    const maxPerBrand = Math.ceil(maxCount / Math.max(brandMap.size, 1));
    let round = 0;

    while (brandDiverseVehicles.length < maxCount && round < maxPerBrand) {
      for (const [brand, vehicleList] of brandMap) {
        if (vehicleList[round]) {
          brandDiverseVehicles.push(vehicleList[round]);
          if (brandDiverseVehicles.length >= maxCount) break;
        }
      }
      round++;
    }

    return brandDiverseVehicles.slice(0, maxCount);
  }
}
