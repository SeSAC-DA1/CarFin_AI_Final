/**
 * 옵션 매칭 시스템 (팀원 코드에서 포팅)
 * 사용자가 원하는 차량 옵션과 실제 매물 옵션을 매칭
 */

/**
 * 인기 옵션 목록 (팀원 코드 기반)
 */
export const POPULAR_OPTIONS = [
  "선루프(일반)",
  "에어백(운전석)",
  "후방 카메라",
  "통풍시트(운전석)",
  "스마트키",
  "블루투스",
  "하이패스",
  "열선 스티어링 휠",
  "네비게이션",
  "크루즈 컨트롤",
  "LED 헤드라이트",
  "주차 감지 센서"
];

/**
 * 문자열 정규화 함수
 */
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * 사용자가 원하는 옵션과 차량 옵션 매칭률 계산
 *
 * @param desiredOptions 사용자가 원하는 옵션 배열
 * @param actualOptions 차량이 가진 옵션 배열
 * @returns 매칭률 (0-1)
 */
export function calculateOptionMatchRatio(
  desiredOptions: string[],
  actualOptions: string[]
): number {
  if (!desiredOptions || desiredOptions.length === 0) {
    return 0.0;
  }

  const desiredSet = new Set(desiredOptions.map(normalize));
  const actualSet = new Set(actualOptions.map(normalize));

  if (desiredSet.size === 0) {
    return 0.0;
  }

  const intersection = new Set([...desiredSet].filter(x =>
    [...actualSet].some(actual => actual.includes(x) || x.includes(actual))
  ));

  return intersection.size / desiredSet.size;
}

/**
 * 옵션 매칭 상세 결과
 */
export interface OptionMatchResult {
  matchCount: number;     // 일치하는 옵션 개수
  totalWanted: number;    // 원하는 옵션 총 개수
  matchRatio: number;     // 매칭률 (0-1)
  matchedOptions: string[]; // 실제 매칭된 옵션들
}

/**
 * 상세한 옵션 매칭 결과 반환
 *
 * @param desiredOptions 사용자가 원하는 옵션 배열
 * @param actualOptions 차량이 가진 옵션 배열
 * @returns 상세 매칭 결과
 */
export function matchOptions(
  desiredOptions: string[],
  actualOptions: string[]
): OptionMatchResult {
  if (!desiredOptions || desiredOptions.length === 0) {
    return {
      matchCount: 0,
      totalWanted: 0,
      matchRatio: 0.0,
      matchedOptions: []
    };
  }

  const desiredSet = new Set(desiredOptions.map(normalize));
  const actualNormalized = actualOptions.map(normalize);

  const matchedOptions: string[] = [];

  desiredOptions.forEach(desired => {
    const normalizedDesired = normalize(desired);
    const matched = actualNormalized.some(actual =>
      actual.includes(normalizedDesired) || normalizedDesired.includes(actual)
    );

    if (matched) {
      matchedOptions.push(desired);
    }
  });

  return {
    matchCount: matchedOptions.length,
    totalWanted: desiredOptions.length,
    matchRatio: matchedOptions.length / desiredOptions.length,
    matchedOptions: matchedOptions.sort()
  };
}

/**
 * 메시지에서 원하는 옵션 추출
 *
 * @param message 사용자 메시지
 * @returns 추출된 옵션 배열
 */
export function extractOptionsFromMessage(message: string): string[] {
  const extractedOptions: string[] = [];

  // 옵션 키워드 매핑
  const optionKeywords = {
    "선루프": "선루프(일반)",
    "에어백": "에어백(운전석)",
    "후방카메라": "후방 카메라",
    "백카메라": "후방 카메라",
    "통풍시트": "통풍시트(운전석)",
    "스마트키": "스마트키",
    "블루투스": "블루투스",
    "하이패스": "하이패스",
    "열선핸들": "열선 스티어링 휠",
    "네비": "네비게이션",
    "내비": "네비게이션",
    "크루즈": "크루즈 컨트롤",
    "LED": "LED 헤드라이트",
    "주차센서": "주차 감지 센서"
  };

  Object.entries(optionKeywords).forEach(([keyword, option]) => {
    if (message.includes(keyword)) {
      extractedOptions.push(option);
    }
  });

  return extractedOptions;
}