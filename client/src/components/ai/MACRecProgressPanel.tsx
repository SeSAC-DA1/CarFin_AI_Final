import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, ChevronRight, ChevronLeft, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  label: string;
  status: "completed" | "active" | "pending";
  detail: string;
}

interface MACRecProgressPanelProps {
  steps: Phase[];
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function MACRecProgressPanel({
  steps,
  isOpen,
  onToggle,
  className
}: MACRecProgressPanelProps) {
  const completedCount = steps.filter(s => s.status === "completed").length;
  const totalCount = steps.length;

  return (
    <>
      {/* 토글 버튼 (사이드바 닫혔을 때) */}
      {!isOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="fixed right-0 top-24 z-50 rounded-l-lg rounded-r-none shadow-lg bg-card/95 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* 사이드바 패널 */}
      <div
        className={cn(
          "fixed right-0 top-16 h-[calc(100vh-4rem)] bg-card/95 backdrop-blur-sm border-l border-border shadow-2xl transition-all duration-300 z-40",
          isOpen ? "w-80 translate-x-0" : "w-0 translate-x-full",
          className
        )}
      >
        {isOpen && (
          <div className="h-full flex flex-col p-4 overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">MACRec Protocol</h3>
                  <p className="text-xs text-muted-foreground">SIGIR 2024</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* 진행률 */}
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">진행 상황</span>
                <Badge variant="outline" className="text-xs">
                  {completedCount}/{totalCount} 완료
                </Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Phase 단계 */}
            <div className="space-y-3 flex-1">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-300",
                    step.status === "completed" && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                    step.status === "active" && "bg-primary/5 border-primary/20 animate-pulse",
                    step.status === "pending" && "bg-muted/30 border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* 아이콘 */}
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === "completed" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      {step.status === "active" && (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      )}
                      {step.status === "pending" && (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          Phase {index + 1}
                        </span>
                        {step.status === "active" && (
                          <Badge variant="default" className="text-xs animate-pulse">
                            진행 중
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold mb-1">{step.label}</h4>
                      <p className="text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 푸터 정보 */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Task Decomposition (Manager)
                </p>
                <p className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Parallel Execution (Agents)
                </p>
                <p className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Result Aggregation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 오버레이 (모바일에서 사이드바 열렸을 때) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
