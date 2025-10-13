import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  icon: string;
  status: 'pending' | 'working' | 'completed';
  message?: string;
}

interface AgentCollaborationViewerProps {
  currentStep: string;
  progress: number;
  foundCount?: number;
}

export function AgentCollaborationViewer({
  currentStep,
  progress,
  foundCount
}: AgentCollaborationViewerProps) {

  // 현재 단계에 따라 에이전트 상태 결정
  const agents: Agent[] = [
    {
      id: 'manager',
      name: 'Manager',
      icon: '🎯',
      status: ['manager_start', 'profile_analysis'].includes(currentStep) ? 'working' :
              currentStep === 'pending' ? 'pending' : 'completed',
      message: '태스크 분해 및 조율'
    },
    {
      id: 'user_analyst',
      name: 'User Analyst',
      icon: '👤',
      status: currentStep === 'profile_analysis' ? 'working' :
              ['manager_start'].includes(currentStep) ? 'pending' : 'completed',
      message: '사용자 니즈 분석'
    },
    {
      id: 'searcher',
      name: 'Searcher',
      icon: '🔍',
      status: ['db_search_start', 'db_search_done'].includes(currentStep) ? 'working' :
              ['manager_start', 'profile_analysis'].includes(currentStep) ? 'pending' : 'completed',
      message: foundCount ? `${foundCount.toLocaleString()}대 발견` : '차량 검색'
    }
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-chart-2/5">
      <CardContent className="p-6">
        {/* 진행률 바 */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">AI 협업 진행률</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-chart-2"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 에이전트 카드 */}
        <div className="grid grid-cols-3 gap-4">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={`
                p-4 rounded-lg border-2 transition-all duration-300
                ${agent.status === 'working'
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : agent.status === 'completed'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-muted bg-muted/5'}
              `}>
                {/* 아이콘 */}
                <div className="flex items-center justify-center mb-2">
                  <span className={`text-3xl ${agent.status === 'working' ? 'animate-bounce' : ''}`}>
                    {agent.icon}
                  </span>
                </div>

                {/* 이름 */}
                <h4 className="text-center font-semibold mb-1">{agent.name}</h4>

                {/* 메시지 */}
                <p className="text-xs text-center text-muted-foreground mb-2">
                  {agent.message}
                </p>

                {/* 상태 아이콘 */}
                <div className="flex justify-center">
                  {agent.status === 'pending' && <Circle className="w-4 h-4 text-muted-foreground" />}
                  {agent.status === 'working' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                  {agent.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
              </div>

              {/* 작업 중 효과 */}
              {agent.status === 'working' && (
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-primary"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* 현재 단계 메시지 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {getStepMessage(currentStep, foundCount)}
            </p>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function getStepMessage(step: string, foundCount?: number): string {
  const messages: Record<string, string> = {
    'manager_start': '태스크 분해 및 에이전트 할당 중...',
    'profile_analysis': '사용자 프로필 상세 분석 중...',
    'db_search_start': '159,578대의 실시간 매물 검색 중...',
    'db_search_done': `${foundCount?.toLocaleString() || 0}대의 조건 부합 차량 발견!`,
    'topsis_start': 'TOPSIS 다기준 평가 진행 중 (6가지 기준)...',
    'reranking': 'Alibaba Re-ranking으로 개인화 최적화 중...',
    'complete': '추천 완료! 최적의 차량 3대를 선정했습니다.',
  };

  return messages[step] || '분석 중...';
}
