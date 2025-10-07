/**
 * VehicleOptionAnalyzer
 * 차량 옵션 분석 및 가치 평가 엔진
 */

export interface VehicleOption {
  name: string;
  category: string;
  value: number;
}

export interface OptionAnalysisResult {
  totalValue: number;
  premiumOptions: string[];
  standardOptions: string[];
  missingOptions: string[];
}

export class VehicleOptionAnalyzer {
  /**
   * 차량 옵션을 분석하여 가치를 평가합니다
   */
  analyzeOptions(options: string[], vehiclePrice: number): OptionAnalysisResult {
    const optionArray = Array.isArray(options) ? options : [];

    return {
      totalValue: optionArray.length * 50, // 임시 계산
      premiumOptions: optionArray.filter(opt =>
        opt.includes('선루프') || opt.includes('내비게이션') || opt.includes('가죽시트')
      ),
      standardOptions: optionArray.filter(opt =>
        !opt.includes('선루프') && !opt.includes('내비게이션') && !opt.includes('가죽시트')
      ),
      missingOptions: [],
    };
  }

  /**
   * 옵션 점수를 계산합니다 (0-100)
   */
  calculateOptionScore(options: string[], vehiclePrice: number): number {
    if (!options || options.length === 0) return 50; // 기본 점수

    const premiumCount = options.filter(opt =>
      opt.includes('선루프') || opt.includes('내비게이션') || opt.includes('가죽시트')
    ).length;

    return Math.min(100, 50 + (premiumCount * 10) + (options.length * 2));
  }
}

export default VehicleOptionAnalyzer;
