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

// MACRec 논문 기반 실제 에이전트 정의 (SIGIR 2024)
const agentDefinitions = [
  {
    id: "user_analyst",
    name: "사용자 분석 AI",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    steps: ["analyzing_needs", "user_analyst"]
  },
  {
    id: "searcher",
    name: "차량 검색 AI",
    icon: Database,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    steps: ["searching_vehicles", "searcher"]
  },
  {
    id: "manager",
    name: "통합 관리 AI",
    icon: Award,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
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
      <div className="fixed top-4 right-4 bg-card/90 backdrop-blur-sm rounded-2xl border border-card-border p-4 shadow-lg max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI 3명 대기 중</h3>
            <p className="text-xs text-muted-foreground">질문을 입력하면 협업을 시작합니다</p>
          </div>
        </div>

        <div className="space-y-2">
          {agentDefinitions.map((agent) => {
            const IconComponent = agent.icon;
            return (
              <div key={agent.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <IconComponent className={cn("w-4 h-4", agent.color)} />
                <span className="text-xs font-medium">{agent.name}</span>
                <div className="ml-auto">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-card/95 backdrop-blur-sm rounded-2xl border border-card-border p-4 shadow-xl max-w-sm z-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI 3명 협업 중</h3>
          <p className="text-xs text-muted-foreground">실시간 멀티에이전트 분석</p>
        </div>
      </div>

      <div className="space-y-3">
        {agents.map((agent, index) => (
          <div
            key={agent.id}
            className={cn(
              "p-3 rounded-xl border transition-all duration-300",
              agent.bgColor,
              agent.borderColor || "border-border",
              agent.status === 'active' && "ring-2 ring-offset-1",
              agent.status === 'active' && agent.id === 'user_analyst' && "ring-blue-200 dark:ring-blue-800",
              agent.status === 'active' && agent.id === 'searcher' && "ring-green-200 dark:ring-green-800",
              agent.status === 'active' && agent.id === 'manager' && "ring-purple-200 dark:ring-purple-800"
            )}
            style={{
              animationDelay: `${index * 200}ms`,
              opacity: agent.status === 'waiting' ? 0.6 : 1
            }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStatusIcon(agent)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{agent.name}</h4>
                  {agent.status === 'active' && (
                    <span className="text-xs text-muted-foreground">
                      {agent.progress}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{agent.task}</p>
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
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
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