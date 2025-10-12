import { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Target,
  Lightbulb,
  ArrowRight,
  Workflow,
  Sparkles,
  Network,
  Timer,
  Award
} from 'lucide-react';

interface MACRecAgent {
  id: string;
  name: string;
  emoji: string;
  specialty: string;
  status: 'idle' | 'thinking' | 'processing' | 'collaborating' | 'done';
  currentTask?: string | undefined;
  progress?: number | undefined;
}

interface TaskDecompositionStep {
  id: string;
  task: string;
  assignedAgent: string;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Date | undefined;
  endTime?: Date | undefined;
}

interface CollaborationMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  type: 'task_assignment' | 'result_sharing' | 'clarification' | 'consensus';
  timestamp: Date;
}

interface ReflectionProcess {
  userFeedback: string;
  satisfactionScore: number;
  needsReRecommendation: boolean;
  profileUpdates: string[];
  newCriteria: Record<string, number>;
}

interface MACRecCollaborationViewerProps {
  query: string;
  isActive: boolean;
  onComplete: () => void;
  className?: string;
}

export default function MACRecCollaborationViewer({
  query,
  isActive,
  className = ''
}: MACRecCollaborationViewerProps) {
  const [currentStep, setCurrentStep] = useState<string>('initializing');
  const [agents, setAgents] = useState<MACRecAgent[]>([
    {
      id: 'manager',
      name: 'Manager Agent',
      emoji: '🎯',
      specialty: 'Task Decomposition & Coordination',
      status: 'idle'
    },
    {
      id: 'user_analyst',
      name: 'User Analyst',
      emoji: '🧠',
      specialty: '사용자 니즈 분석 및 프로필 추출',
      status: 'idle'
    },
    {
      id: 'searcher',
      name: 'Searcher Agent',
      emoji: '🔍',
      specialty: '차량 DB 검색 및 필터링',
      status: 'idle'
    },
    {
      id: 'evaluator',
      name: 'Evaluator Agent',
      emoji: '⭐',
      specialty: 'TOPSIS 다기준 평가',
      status: 'idle'
    },
    {
      id: 'financial_advisor',
      name: 'Financial Advisor',
      emoji: '💰',
      specialty: 'TCO 계산 및 금융 옵션 분석',
      status: 'idle'
    }
  ]);

  const [taskDecomposition, setTaskDecomposition] = useState<TaskDecompositionStep[]>([]);
  const [collaborationMessages, setCollaborationMessages] = useState<CollaborationMessage[]>([]);
  const [reflectionProcess, setReflectionProcess] = useState<ReflectionProcess | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // 시뮬레이션 상태 (used for tracking simulation progress)
  const [simulationPhase, setSimulationPhase] = useState(0);
  console.log('Current simulation phase:', simulationPhase);

  useEffect(() => {
    if (isActive && !startTime) {
      setStartTime(new Date());
      startMACRecSimulation();
    }
  }, [isActive]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setExecutionTime(Date.now() - startTime.getTime());
      }, 100);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [startTime]);

  const startMACRecSimulation = async () => {
    console.log('🚀 MACRec 협업 시뮬레이션 시작:', query);

    // Phase 1: Manager Agent가 태스크 분해
    await simulateTaskDecomposition();

    // Phase 2: 병렬 에이전트 실행
    await simulateParallelExecution();

    // Phase 3: 결과 통합
    await simulateResultAggregation();

    // Phase 4: Reflector 검증 (시뮬레이션)
    await simulateReflection();

    // 완료 - 사용자 피드백: 협업 과정을 계속 표시
    // setTimeout(() => {
    //   onComplete();
    // }, 1000);
  };

  const simulateTaskDecomposition = async () => {
    setCurrentStep('task_decomposition');
    updateAgentStatus('manager', 'thinking', '사용자 요청 분석 중...');

    await delay(800);

    // Manager가 태스크 분해
    const decomposedTasks: TaskDecompositionStep[] = [
      {
        id: 'task_1',
        task: '사용자 니즈 및 선호도 분석',
        assignedAgent: 'needs_analyst',
        dependencies: [],
        status: 'pending'
      },
      {
        id: 'task_2',
        task: '실시간 매물에서 조건 매칭 차량 검색',
        assignedAgent: 'data_analyst',
        dependencies: [],
        status: 'pending'
      },
      {
        id: 'task_3',
        task: '개인화 추천 및 순위 결정',
        assignedAgent: 'manager',
        dependencies: ['task_1', 'task_2'],
        status: 'pending'
      }
    ];

    setTaskDecomposition(decomposedTasks);

    addCollaborationMessage({
      from: 'manager',
      to: 'all',
      message: `요청 "${query}"를 3개 태스크로 분해 완료. 병렬 실행 시작합니다.`,
      type: 'task_assignment'
    });

    updateAgentStatus('manager', 'done', '태스크 분해 완료');
    setSimulationPhase(1);
  };

  const simulateParallelExecution = async () => {
    setCurrentStep('parallel_execution');

    // Task 1 & 2 병렬 시작
    updateTaskStatus('task_1', 'in_progress');
    updateTaskStatus('task_2', 'in_progress');
    updateAgentStatus('needs_analyst', 'processing', '대화에서 선호도 추출 중...');
    updateAgentStatus('data_analyst', 'processing', 'PostgreSQL 쿼리 실행 중...');

    await delay(600);

    // Needs Analyst 진행 상황
    addCollaborationMessage({
      from: 'needs_analyst',
      to: 'manager',
      message: '가족용, 예산 3000만원, 안전성 중시 패턴 감지됨',
      type: 'result_sharing'
    });

    await delay(400);

    // Data Analyst 진행 상황
    addCollaborationMessage({
      from: 'data_analyst',
      to: 'manager',
      message: '387대 후보 차량 발견. SUV 67%, 세단 33%',
      type: 'result_sharing'
    });

    await delay(500);

    // Task 1 완료
    updateTaskStatus('task_1', 'completed');
    updateAgentStatus('needs_analyst', 'done', '니즈 분석 완료');

    addCollaborationMessage({
      from: 'needs_analyst',
      to: 'manager',
      message: 'UserProfile 생성 완료: safety_priority=0.8, budget_limit=30000000',
      type: 'result_sharing'
    });

    await delay(300);

    // Task 2 완료
    updateTaskStatus('task_2', 'completed');
    updateAgentStatus('data_analyst', 'done', '데이터 검색 완료');

    addCollaborationMessage({
      from: 'data_analyst',
      to: 'manager',
      message: '조건별 필터링 완료: 387대 → 최종 50대 후보 선별',
      type: 'result_sharing'
    });

    await delay(400);

    // Task 3 시작 (의존성 해결됨)
    updateTaskStatus('task_3', 'in_progress');
    updateAgentStatus('manager', 'collaborating', '결과 통합 및 개인화 중...');

    setSimulationPhase(2);
  };

  const simulateResultAggregation = async () => {
    setCurrentStep('result_aggregation');

    await delay(700);

    addCollaborationMessage({
      from: 'manager',
      to: 'all',
      message: 'Alibaba Re-ranking 알고리즘 적용: 50대 → Top 3 선택 완료',
      type: 'consensus'
    });

    await delay(300);

    updateTaskStatus('task_3', 'completed');
    updateAgentStatus('manager', 'done', '추천 생성 완료');

    addCollaborationMessage({
      from: 'manager',
      to: 'reflector',
      message: 'Top 3 추천 결과 검증 요청: 팰리세이드(92점), 쏘렌토(87점), 싼타페(83점)',
      type: 'task_assignment'
    });

    setSimulationPhase(3);
  };

  const simulateReflection = async () => {
    setCurrentStep('reflection');
    updateAgentStatus('reflector', 'thinking', '추천 품질 검증 중...');

    await delay(500);

    // 시뮬레이션 Reflection 결과
    const reflection: ReflectionProcess = {
      userFeedback: '만족',
      satisfactionScore: 0.95,
      needsReRecommendation: false,
      profileUpdates: [],
      newCriteria: {}
    };

    setReflectionProcess(reflection);

    addCollaborationMessage({
      from: 'reflector',
      to: 'manager',
      message: '추천 품질 검증 완료: 만족도 95%, 재추천 불필요',
      type: 'consensus'
    });

    await delay(400);

    updateAgentStatus('reflector', 'done', '검증 완료');
    setCurrentStep('completed');
    setSimulationPhase(4);
  };

  const updateAgentStatus = (agentId: string, status: MACRecAgent['status'], task?: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, status, currentTask: task !== undefined ? task : undefined }
        : agent
    ));
  };

  const updateTaskStatus = (taskId: string, status: TaskDecompositionStep['status']) => {
    setTaskDecomposition(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            status,
            startTime: status === 'in_progress' ? new Date() : (task.startTime !== undefined ? task.startTime : undefined),
            endTime: status === 'completed' ? new Date() : (task.endTime !== undefined ? task.endTime : undefined)
          }
        : task
    ));
  };

  const addCollaborationMessage = (message: Omit<CollaborationMessage, 'id' | 'timestamp'>) => {
    const newMessage: CollaborationMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date()
    };
    setCollaborationMessages(prev => [...prev, newMessage]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getAgentStatusColor = (status: MACRecAgent['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-400';
      case 'thinking': return 'bg-yellow-400 animate-pulse';
      case 'processing': return 'bg-blue-400 animate-pulse';
      case 'collaborating': return 'bg-purple-400 animate-pulse';
      case 'done': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'task_decomposition': return <Brain className="w-5 h-5" />;
      case 'parallel_execution': return <Network className="w-5 h-5" />;
      case 'result_aggregation': return <Workflow className="w-5 h-5" />;
      case 'reflection': return <Award className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (!isActive) return null;

  return (
    <div className={`bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-primary/20 p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-bold text-foreground">
              MACRec 멀티에이전트 협업 (SIGIR 2024)
            </h3>
            <p className="text-sm text-muted-foreground">
              실시간 태스크 분해 → 병렬 실행 → 결과 통합 → 품질 검증
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Timer className="w-4 h-4" />
          <span>{(executionTime / 1000).toFixed(1)}초</span>
        </div>
      </div>

      {/* 현재 단계 표시 */}
      <div className="flex items-center space-x-2 mb-6 p-3 bg-background/60 rounded-lg border border-primary/10">
        {getStepIcon(currentStep)}
        <span className="font-medium text-foreground">
          {currentStep === 'task_decomposition' && '1️⃣ Manager가 태스크 분해 중'}
          {currentStep === 'parallel_execution' && '2️⃣ 전문 에이전트들이 병렬 실행 중'}
          {currentStep === 'result_aggregation' && '3️⃣ Manager가 결과 통합 중'}
          {currentStep === 'reflection' && '4️⃣ Reflector가 품질 검증 중'}
          {currentStep === 'completed' && '✅ 멀티에이전트 협업 완료'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 에이전트 상태 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center">
            <Users className="w-4 h-4 mr-2" />
            전문 에이전트 상태
          </h4>

          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/10">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(agent.status)}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">{agent.specialty}</div>
                  {agent.currentTask && (
                    <div className="text-sm text-primary mt-1">{agent.currentTask}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 태스크 분해 결과 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center">
            <Target className="w-4 h-4 mr-2" />
            태스크 분해 및 실행
          </h4>

          <div className="space-y-3">
            {taskDecomposition.map((task, index) => (
              <div key={task.id} className="p-3 bg-background/60 rounded-lg border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">
                    {index + 1}. {task.task}
                  </span>
                  <div className="flex items-center space-x-2">
                    {task.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                    {task.status === 'in_progress' && <Zap className="w-4 h-4 text-primary animate-pulse" />}
                    {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  담당: {agents.find(a => a.id === task.assignedAgent)?.name}
                </div>
                {task.dependencies.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    의존성: {task.dependencies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 협업 메시지 로그 */}
      {collaborationMessages.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            에이전트 간 실시간 협업 메시지
          </h4>

          <div className="bg-background/30 rounded-lg p-4 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {collaborationMessages.slice(-5).map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-primary">
                      {agents.find(a => a.id === msg.from)?.emoji}
                      {agents.find(a => a.id === msg.from)?.name.split(' ')[0]}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {msg.to === 'all' ? '전체' : agents.find(a => a.id === msg.to)?.name?.split(' ')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="text-foreground ml-2 mt-1">{msg.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reflection 결과 */}
      {reflectionProcess && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Reflector Agent 품질 검증 결과
          </h4>
          <div className="text-sm text-green-700 dark:text-green-400">
            <div>만족도 점수: {Math.round(reflectionProcess.satisfactionScore * 100)}%</div>
            <div>재추천 필요: {reflectionProcess.needsReRecommendation ? '예' : '아니오'}</div>
            <div className="mt-2 text-xs">
              💡 협업 결과가 사용자 요구사항을 {Math.round(reflectionProcess.satisfactionScore * 100)}% 만족시킵니다
            </div>
          </div>
        </div>
      )}

      {/* 완료 시 요약 */}
      {currentStep === 'completed' && (
        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm text-foreground space-y-1">
            <div className="font-medium">🎯 멀티에이전트 협업 완료!</div>
            <div>• Manager: 태스크 분해 + 결과 통합</div>
            <div>• Needs Analyst: 사용자 선호도 분석</div>
            <div>• Data Analyst: 실시간 매물 검색</div>
            <div>• Reflector: 추천 품질 검증</div>
            <div className="pt-2 text-xs text-muted-foreground">
              💫 단일 AI로는 불가능한 전문화된 협업으로 최적의 결과를 제공했습니다
            </div>
          </div>
        </div>
      )}
    </div>
  );
}