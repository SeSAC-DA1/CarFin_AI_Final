import { useState, useEffect } from "react";
import { Brain, Database, Award, CheckCircle, Clock, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// 백엔드 step에 따른 작업 메시지 매핑
const getTaskForStep = (step: string): string => {
  const taskMap: Record<string, string> = {
    'analyzing_needs': '사용자 요구사항 분석 중',
    'user_analyst': '프로필 추출 중',
    'searching_vehicles': '15만대 데이터 검색 중',
    'searcher': '조건 맞는 차량 탐색 중',
    'final_recommendation': 'TOPSIS 정밀 평가 중',
    'manager': '최종 추천 통합 중',
    'completed': '협업 완료'
  };
  return taskMap[step] || '작업 중';
};

const getDetailForStep = (step: string, userQuery: string): string => {
  const detailMap: Record<string, string> = {
    'analyzing_needs': `"${userQuery.slice(0, 20)}..." 분석 중`,
    'user_analyst': '예산, 용도, 선호도 파악 중',
    'searching_vehicles': '조건에 맞는 차량 검색 중',
    'searcher': 'MACRec 프로토콜 실행 중',
    'final_recommendation': '6가지 기준 정밀 평가',
    'manager': 'Alibaba Re-ranking 적용 중',
    'completed': 'Top 3 차량 선별 완료'
  };
  return detailMap[step] || '처리 중';
};

const getCompletedTaskForAgent = (agentId: string): string => {
  const completedTaskMap: Record<string, string> = {
    'user_analyst': '사용자 분석 완료',
    'searcher': '차량 검색 완료',
    'manager': '평가 분석 완료'
  };
  return completedTaskMap[agentId] || '작업 완료';
};

interface Agent {
  id: string;
  name: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
  status: 'waiting' | 'active' | 'completed';
  task: string;
  detail?: string;
  progress?: number;
}

interface AgentStatusPanelProps {
  isActive?: boolean;
  currentStep?: string;
  userQuery?: string;
  onComplete?: () => void;
}

// MACRec 논문 기반 실제 에이전트 정의 (SIGIR 2024) - 사용자 맞춤 이름
const agentDefinitions = [
  {
    id: "user_analyst",
    name: "니즈 분석 에이전트",
    role: "사용자의 구매 조건과 선호도를 분석합니다",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    glowColor: "shadow-blue-500/20",
    steps: ["analyzing_needs", "user_analyst"]
  },
  {
    id: "searcher",
    name: "데이터 분석 에이전트",
    role: "15만대 매물에서 조건에 맞는 차량을 검색합니다",
    icon: Database,
    color: "text-green-600",
    bgColor: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    glowColor: "shadow-green-500/20",
    steps: ["searching_vehicles", "searcher"]
  },
  {
    id: "manager",
    name: "매니저 에이전트",
    role: "6가지 기준으로 차량을 종합 평가하고 최종 추천합니다",
    icon: Award,
    color: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    glowColor: "shadow-purple-500/20",
    steps: ["final_recommendation", "manager", "completed"]
  }
];

export default function AgentStatusPanel({
  isActive = false,
  currentStep = "",
  userQuery = "",
  onComplete
}: AgentStatusPanelProps) {
  const [agents, setAgents] = useState<Agent[]>(() =>
    agentDefinitions.map(def => ({
      ...def,
      status: 'waiting' as const,
      task: '대기 중',
      progress: 0
    }))
  );

  // 실제 백엔드 progress와 연동
  useEffect(() => {
    if (!currentStep) {
      // 초기 상태로 리셋
      setAgents(agentDefinitions.map(def => ({
        ...def,
        status: 'waiting' as const,
        task: '대기 중',
        progress: 0
      })));
      return;
    }

    // 백엔드 step에 따라 에이전트 상태 업데이트
    setAgents(prev => prev.map(agent => {
      // 현재 스텝에 해당하는 에이전트 찾기
      const isCurrentAgent = (agent as any).steps?.includes(currentStep);

      if (isCurrentAgent) {
        // 현재 활성 에이전트
        return {
          ...agent,
          status: 'active' as const,
          task: getTaskForStep(currentStep),
          detail: getDetailForStep(currentStep, userQuery),
          progress: 50 // 진행 중 표시
        };
      } else {
        // 이전에 완료된 에이전트인지 확인
        const stepOrder = ['analyzing_needs', 'searching_vehicles', 'final_recommendation', 'completed'];
        const currentStepIndex = stepOrder.indexOf(currentStep);
        const agentStepIndex = Math.min(...(agent as any).steps.map((s: string) => stepOrder.indexOf(s)).filter((i: number) => i >= 0));

        if (agentStepIndex < currentStepIndex) {
          // 이미 완료된 에이전트
          return {
            ...agent,
            status: 'completed' as const,
            task: getCompletedTaskForAgent(agent.id),
            progress: 100
          };
        } else {
          // 대기 중인 에이전트
          return {
            ...agent,
            status: 'waiting' as const,
            task: '대기 중',
            progress: 0
          };
        }
      }
    }));

    // completed 상태일 때 모든 에이전트 완료 처리
    if (currentStep === 'completed') {
      setTimeout(() => {
        setAgents(prev => prev.map(agent => ({
          ...agent,
          status: 'completed' as const,
          progress: 100
        })));
        onComplete?.();
      }, 1000);
    }
  }, [currentStep, userQuery, onComplete]);

  const getStatusIcon = (agent: Agent) => {
    const IconComponent = agent.icon;

    switch (agent.status) {
      case 'waiting':
        return <Clock className={cn("w-5 h-5", agent.color)} />;
      case 'active':
        return <Loader2 className={cn("w-5 h-5 animate-spin", agent.color)} />;
      case 'completed':
        return <CheckCircle className={cn("w-5 h-5", agent.color)} />;
      default:
        return <IconComponent className={cn("w-5 h-5", agent.color)} />;
    }
  };

  const getProgressBar = (agent: Agent) => {
    if (agent.status === 'waiting') return null;

    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            agent.id === 'user_analyst' && "bg-blue-500",
            agent.id === 'searcher' && "bg-green-500",
            agent.id === 'manager' && "bg-purple-500"
          )}
          style={{ width: `${agent.progress || 0}%` }}
        />
      </div>
    );
  };

  if (!isActive) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI 3명 대기 중</h3>
            <p className="text-xs text-muted-foreground">질문을 입력하면 협업을 시작합니다</p>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {agentDefinitions.map((agent) => {
            const IconComponent = agent.icon;
            return (
              <div key={agent.id} className="p-3 rounded-lg bg-muted/20 border border-border">
                <div className="flex items-start gap-3">
                  <IconComponent className={cn("w-4 h-4 mt-1", agent.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{agent.name}</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">
                      {agent.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI 3명 협업 중</h3>
          <p className="text-xs text-muted-foreground">실시간 멀티에이전트 분석</p>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={cn(
              "p-3 rounded-lg border transition-colors duration-300",
              agent.bgColor,
              agent.borderColor || "border-border",
              // 활성 상태 - 애니메이션 줄임
              agent.status === 'active' && "border-primary/30 bg-primary/5",
              // 완료 상태
              agent.status === 'completed' && "opacity-80",
              // 대기 상태
              agent.status === 'waiting' && "opacity-60"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStatusIcon(agent)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">{agent.name}</h4>
                  {agent.status === 'active' && (
                    <span className="text-xs font-mono font-bold text-primary">
                      {agent.progress}%
                    </span>
                  )}
                </div>

                {/* 에이전트 역할 설명 */}
                <p className="text-xs text-muted-foreground/90 mb-2 leading-relaxed">
                  {(agent as any).role}
                </p>

                {/* 현재 작업 상태 */}
                <div className={cn(
                  "text-xs font-medium mb-1",
                  agent.status === 'active' && "text-primary font-bold",
                  agent.status === 'completed' && "text-green-600 dark:text-green-400",
                  agent.status === 'waiting' && "text-muted-foreground"
                )}>
                  {agent.task}
                </div>

                {agent.detail && (
                  <p className="text-xs text-muted-foreground/80 italic">
                    {agent.detail}
                  </p>
                )}
                {getProgressBar(agent)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {agents.every(agent => agent.status === 'completed') && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              AI 3명 협업 완료!
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            15만대 → 387대 → Top 3 추천 완성
          </p>
        </div>
      )}
    </div>
  );
}