import { Loader2, Brain, Database, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  step?: string;
  className?: string;
}

const getStepIcon = (step?: string) => {
  switch (step) {
    case 'analyzing_needs':
    case 'user_analyst':
      return Brain;
    case 'searching_vehicles':
    case 'searcher':
      return Database;
    case 'final_recommendation':
    case 'manager':
      return BarChart;
    default:
      return Loader2;
  }
};

const getStepMessage = (step?: string) => {
  const messages: Record<string, string> = {
    'analyzing_needs': '🧠 사용자 요구사항 분석 중...',
    'user_analyst': '👤 사용자 프로필 추출 중...',
    'searching_vehicles': '🔍 실시간 매물 검색 중...',
    'searcher': '🚗 조건 맞는 차량 탐색 중...',
    'final_recommendation': '📊 정밀 평가 분석 중...',
    'manager': '🎯 최종 추천 생성 중...',
    'completed': '✅ 추천 완료!'
  };
  return messages[step || ''] || '🤖 AI 시스템 처리 중...';
};

export default function LoadingSpinner({ message, step, className }: LoadingSpinnerProps) {
  const IconComponent = getStepIcon(step);
  const displayMessage = message || getStepMessage(step);

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      {/* 논문 기반 시스템 로딩 애니메이션 */}
      <div className="relative">
        {/* 외부 링 - 논문 2개 + 방법론 표시 */}
        <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-spin">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" title="MACRec (SIGIR 2024)" />
          </div>
          <div className="absolute bottom-0 left-0 translate-x-1/4 translate-y-1/4">
            <div className="w-3 h-3 bg-green-500 rounded-full" title="Alibaba Re-ranking (RecSys 2019)" />
          </div>
          <div className="absolute bottom-0 right-0 -translate-x-1/4 translate-y-1/4">
            <div className="w-3 h-3 bg-purple-500 rounded-full" title="TOPSIS 검증된 방법론" />
          </div>
        </div>

        {/* 중앙 아이콘 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* 메시지 */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground">{displayMessage}</p>

        {step && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
            <span>논문 2개 + 검증된 방법론 기반 AI 시스템 실행 중</span>
          </div>
        )}
      </div>

      {/* 논문 정보 표시 */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-1" />
          <div className="font-medium text-blue-700 dark:text-blue-400">MACRec</div>
          <div className="text-blue-600 dark:text-blue-500">SIGIR 2024</div>
        </div>
        <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1" />
          <div className="font-medium text-green-700 dark:text-green-400">Alibaba</div>
          <div className="text-green-600 dark:text-green-500">RecSys 2019</div>
        </div>
        <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto mb-1" />
          <div className="font-medium text-purple-700 dark:text-purple-400">TOPSIS</div>
          <div className="text-purple-600 dark:text-purple-500">검증된 방법론</div>
        </div>
      </div>
    </div>
  );
}