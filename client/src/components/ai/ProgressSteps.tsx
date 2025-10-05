import { cn } from "@/lib/utils";
import { Check, Brain, Database, Award, MessageCircle, Users, RotateCcw, BarChart } from "lucide-react";

interface Step {
  id: string;
  label: string;
  status: "completed" | "active" | "pending";
  detail?: string;
  agent?: string;
  paper?: string; // 논문 정보 추가
}

interface ProgressStepsProps {
  steps: Step[];
}

// 논문 기반 아이콘 매핑
const getStepIcon = (stepId: string, agent?: string) => {
  switch (stepId) {
    case "greeting":
      return MessageCircle;
    case "macrec":
      return Users; // 멀티에이전트 협업
    case "reranking":
      return RotateCcw; // 재정렬
    case "topsis":
      return BarChart; // 분석
    default:
      // 레거시 지원
      switch (agent) {
        case "니즈 분석 AI":
        case "Manager + User Analyst + Searcher":
          return Brain;
        case "검색 AI":
        case "Personalized Re-ranking Engine":
          return Database;
        case "평가 AI":
        case "TOPSIS Evaluation Engine":
          return Award;
        default:
          return MessageCircle;
      }
  }
};

export default function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 bg-card/50 border-y border-border">
      <div className="flex flex-col gap-4">
        {/* 메인 진행 바 */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    step.status === "completed" && "bg-primary text-primary-foreground shadow-lg",
                    step.status === "active" && "bg-primary/20 text-primary border-2 border-primary animate-pulse",
                    step.status === "pending" && "bg-muted text-muted-foreground"
                  )}
                  data-testid={`step-indicator-${step.id}`}
                >
                  {step.status === "completed" ? (
                    <Check className="w-5 h-5" />
                  ) : step.status === "active" ? (
                    (() => {
                      const IconComponent = getStepIcon(step.id, step.agent);
                      return <IconComponent className="w-5 h-5" />;
                    })()
                  ) : (
                    (() => {
                      const IconComponent = getStepIcon(step.id, step.agent);
                      return <IconComponent className="w-4 h-4 opacity-50" />;
                    })()
                  )}
                </div>
                <div className="flex flex-col">
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
                  {step.detail && (
                    <span
                      className={cn(
                        "text-xs mt-0.5 transition-colors",
                        step.status === "active" && "text-primary/80",
                        step.status === "completed" && "text-muted-foreground",
                        step.status === "pending" && "text-muted-foreground/60"
                      )}
                    >
                      {step.detail}
                    </span>
                  )}
                  {step.paper && (
                    <span className="text-xs text-primary/60 mt-0.5 font-medium">
                      {step.paper}
                    </span>
                  )}
                  {step.agent && step.status === "active" && (
                    <span className="text-xs text-primary/70 mt-0.5 font-medium">
                      {step.agent} 작업 중
                    </span>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-1 flex-1 mx-4 rounded-full transition-all duration-300",
                    step.status === "completed" ? "bg-primary shadow-sm" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* 활성 단계 상세 정보 */}
        {steps.find(step => step.status === "active") && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="text-sm font-medium text-primary">
                {steps.find(step => step.status === "active")?.detail ||
                 `${steps.find(step => step.status === "active")?.label} 진행 중...`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
