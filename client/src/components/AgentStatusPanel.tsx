import { useState, useEffect } from "react";
import { Brain, Database, Award, CheckCircle, Clock, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

const agentDefinitions = [
  {
    id: "needs",
    name: "니즈 분석 AI",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800"
  },
  {
    id: "search",
    name: "검색 AI",
    icon: Database,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800"
  },
  {
    id: "evaluation",
    name: "평가 AI",
    icon: Award,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800"
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

  // 시뮬레이션: 실제 멀티에이전트 협업 과정
  useEffect(() => {
    if (!isActive || !userQuery) return;

    const simulateCollaboration = async () => {
      // 1단계: 니즈 분석 AI 시작
      setAgents(prev => prev.map(agent =>
        agent.id === 'needs'
          ? {
              ...agent,
              status: 'active',
              task: '사용자 요구사항 분석 중',
              detail: `"${userQuery.slice(0, 20)}..." 분석 중`,
              progress: 0
            }
          : agent
      ));

      // 니즈 분석 진행
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setAgents(prev => prev.map(agent =>
          agent.id === 'needs' ? { ...agent, progress: i } : agent
        ));
      }

      // 니즈 분석 완료
      setAgents(prev => prev.map(agent =>
        agent.id === 'needs'
          ? {
              ...agent,
              status: 'completed',
              task: '요구사항 분석 완료',
              detail: '예산, 용도, 선호도 파악 완료',
              progress: 100
            }
          : agent
      ));

      await new Promise(resolve => setTimeout(resolve, 500));

      // 2단계: 검색 AI 시작
      setAgents(prev => prev.map(agent =>
        agent.id === 'search'
          ? {
              ...agent,
              status: 'active',
              task: '15만대 데이터 검색 중',
              detail: '조건에 맞는 차량 검색 중',
              progress: 0
            }
          : agent
      ));

      // 검색 진행 (빠르게)
      for (let i = 0; i <= 100; i += 25) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setAgents(prev => prev.map(agent =>
          agent.id === 'search' ? { ...agent, progress: i } : agent
        ));
      }

      // 검색 완료
      setAgents(prev => prev.map(agent =>
        agent.id === 'search'
          ? {
              ...agent,
              status: 'completed',
              task: '차량 검색 완료',
              detail: '387대 후보 차량 발견',
              progress: 100
            }
          : agent
      ));

      await new Promise(resolve => setTimeout(resolve, 500));

      // 3단계: 평가 AI 시작
      setAgents(prev => prev.map(agent =>
        agent.id === 'evaluation'
          ? {
              ...agent,
              status: 'active',
              task: 'TOPSIS 알고리즘 분석 중',
              detail: '6가지 기준으로 정밀 평가',
              progress: 0
            }
          : agent
      ));

      // 평가 진행
      for (let i = 0; i <= 100; i += 15) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setAgents(prev => prev.map(agent =>
          agent.id === 'evaluation' ? { ...agent, progress: i } : agent
        ));
      }

      // 평가 완료
      setAgents(prev => prev.map(agent =>
        agent.id === 'evaluation'
          ? {
              ...agent,
              status: 'completed',
              task: '평가 분석 완료',
              detail: 'Top 3 차량 선별 완료',
              progress: 100
            }
          : agent
      ));

      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete?.();
    };

    simulateCollaboration();
  }, [isActive, userQuery, onComplete]);

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
            agent.id === 'needs' && "bg-blue-500",
            agent.id === 'search' && "bg-green-500",
            agent.id === 'evaluation' && "bg-purple-500"
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
              agent.status === 'active' && agent.id === 'needs' && "ring-blue-200 dark:ring-blue-800",
              agent.status === 'active' && agent.id === 'search' && "ring-green-200 dark:ring-green-800",
              agent.status === 'active' && agent.id === 'evaluation' && "ring-purple-200 dark:ring-purple-800"
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