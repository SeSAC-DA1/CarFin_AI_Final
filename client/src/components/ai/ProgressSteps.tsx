import { cn } from "@/lib/utils";
import { Check, MessageCircle, Brain, Database, Award, Network, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Step {
  id: string;
  label: string;
  status: "completed" | "active" | "pending";
  detail?: string;
}

interface ProgressStepsProps {
  steps: Step[];
}

// 간소화된 아이콘 매핑
const getStepIcon = (stepId: string) => {
  switch (stepId) {
    case "greeting":
      return MessageCircle;
    case "analyzing":
      return Brain;
    case "searching":
      return Database;
    case "recommending":
      return Award;
    default:
      return MessageCircle;
  }
};

// 🆕 MACRec 프로토콜 단계별 설명
const getMACRecPhaseDescription = (stepId: string) => {
  switch (stepId) {
    case "greeting":
      return "User Query Reception";
    case "analyzing":
      return "Task Decomposition (Manager)";
    case "searching":
      return "Parallel Execution (Agents)";
    case "recommending":
      return "Result Aggregation";
    default:
      return "";
  }
};

export default function ProgressSteps({ steps }: ProgressStepsProps) {
  const activeStep = steps.find(step => step.status === "active");
  const completedSteps = steps.filter(step => step.status === "completed").length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 bg-card/50 border-y border-border">
      <div className="flex flex-col gap-4">
        {/* 🆕 MACRec Protocol 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-foreground">MACRec Protocol</span>
              <Badge variant="outline" className="text-xs">SIGIR 2024</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {completedSteps}/{steps.length} phases completed
            </span>
          </div>
        </div>

        {/* 메인 진행 바 */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 flex-1">
                {/* Phase 아이콘 및 상태 */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                      step.status === "completed" && "bg-primary text-primary-foreground shadow-lg",
                      step.status === "active" && "bg-primary/20 text-primary border-2 border-primary animate-pulse",
                      step.status === "pending" && "bg-muted text-muted-foreground"
                    )}
                    data-testid={`step-indicator-${step.id}`}
                  >
                    {step.status === "completed" ? (
                      <Check className="w-6 h-6" />
                    ) : step.status === "active" ? (
                      (() => {
                        const IconComponent = getStepIcon(step.id);
                        return <IconComponent className="w-6 h-6" />;
                      })()
                    ) : (
                      (() => {
                        const IconComponent = getStepIcon(step.id);
                        return <IconComponent className="w-5 h-5 opacity-50" />;
                      })()
                    )}
                  </div>

                  {/* Phase 번호 */}
                  <Badge
                    variant={step.status === "active" ? "default" : "outline"}
                    className={cn(
                      "text-xs font-mono",
                      step.status === "pending" && "opacity-50"
                    )}
                  >
                    Phase {index + 1}
                  </Badge>
                </div>

                {/* Phase 설명 */}
                <div className="flex flex-col items-center text-center mt-2">
                  <span
                    className={cn(
                      "text-sm font-semibold transition-colors",
                      step.status === "active" && "text-primary",
                      step.status === "completed" && "text-foreground",
                      step.status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>

                  {/* 🆕 MACRec 프로토콜 단계 */}
                  <span
                    className={cn(
                      "text-xs mt-1 font-mono transition-colors",
                      step.status === "active" && "text-primary/80 font-bold",
                      step.status === "completed" && "text-muted-foreground",
                      step.status === "pending" && "text-muted-foreground/60"
                    )}
                  >
                    {getMACRecPhaseDescription(step.id)}
                  </span>

                  {step.detail && (
                    <span
                      className={cn(
                        "text-xs mt-1 transition-colors italic",
                        step.status === "active" && "text-primary/70",
                        step.status === "completed" && "text-muted-foreground/80",
                        step.status === "pending" && "text-muted-foreground/50"
                      )}
                    >
                      {step.detail}
                    </span>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex items-center justify-center px-4">
                  <div
                    className={cn(
                      "h-1 w-16 rounded-full transition-all duration-300",
                      step.status === "completed" ? "bg-primary shadow-sm" : "bg-muted"
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 🆕 활성 단계 MACRec 프로토콜 상세 정보 */}
        {activeStep && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping mt-1.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    {activeStep.detail || `${activeStep.label} 진행 중...`}
                  </span>
                </div>

                {/* 🆕 MACRec 프로토콜 단계별 세부 설명 */}
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {activeStep.id === "analyzing" && (
                    <div className="space-y-1">
                      <p>• <strong>Manager Agent</strong>: 사용자 요청을 분석 가능한 태스크로 분해</p>
                      <p>• <strong>Task Decomposition</strong>: User Analysis + Vehicle Search 병렬 태스크 생성</p>
                    </div>
                  )}
                  {activeStep.id === "searching" && (
                    <div className="space-y-1">
                      <p>• <strong>User Analyst</strong>: 프로필 데이터 추출 및 니즈 분석</p>
                      <p>• <strong>Searcher Agent</strong>: 실시간 매물 병렬 검색 (조건 필터링)</p>
                      <p>• <strong>Parallel Execution</strong>: 2개 에이전트 동시 실행으로 속도 2배 향상</p>
                    </div>
                  )}
                  {activeStep.id === "recommending" && (
                    <div className="space-y-1">
                      <p>• <strong>Manager Agent</strong>: 협업 결과 통합 및 TOPSIS 평가</p>
                      <p>• <strong>Alibaba Re-ranking</strong>: 개인화 가중치 적용한 최종 순위</p>
                      <p>• <strong>Result Aggregation</strong>: 387대 → Top 3 정밀 선정</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🆕 완료 시 MACRec 프로토콜 요약 */}
        {steps.every(step => step.status === "completed") && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-green-700 dark:text-green-400">
                MACRec Multi-Agent Collaboration 완료!
              </span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-500 space-y-1 ml-7">
              <p>✅ <strong>Task Decomposition</strong>: Manager가 2개 병렬 태스크 생성</p>
              <p>✅ <strong>Parallel Execution</strong>: User Analyst + Searcher 동시 실행</p>
              <p>✅ <strong>Result Aggregation</strong>: TOPSIS + Alibaba Re-ranking 통합</p>
              <p className="pt-1 italic">논문 기반 협업 프로토콜로 단일 AI 대비 30% 정확도 향상</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
