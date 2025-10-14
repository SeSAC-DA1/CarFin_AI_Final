import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Users, Search, BarChart3, Wallet, Award, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WorkflowStep {
  id: string;
  phase: string;
  title: string;
  subtitle: string;
  paper: string;
  paperBadge: string;
  color: string;
  icon: any;
  details: {
    description: string;
    agents?: { icon: string; name: string; result: string }[];
    process?: string[];
    result?: string;
    before?: { rank: number; car: string; score: number }[];
    after?: { rank: number; car: string; score: number; highlight?: boolean }[];
  };
}

const workflowSteps: WorkflowStep[] = [
  {
    id: "phase1",
    phase: "Phase 1",
    title: "Task Decomposition",
    subtitle: "작업을 4개로 분해",
    paper: "SIGIR 2024",
    paperBadge: "MACRec",
    color: "blue",
    icon: Users,
    details: {
      description: "Manager Agent가 복잡한 추천 작업을 4개의 전문 작업으로 분해합니다.",
      agents: [
        { icon: "📊", name: "User Analyst", result: "사용자 니즈 분석" },
        { icon: "🔍", name: "Searcher", result: "DB 검색 (387대)" },
        { icon: "⚖️", name: "Evaluator", result: "TOPSIS 평가" },
        { icon: "💰", name: "Financial", result: "TCO 계산" }
      ]
    }
  },
  {
    id: "phase2",
    phase: "Phase 2",
    title: "Parallel Execution",
    subtitle: "4개 Agent 동시 실행 (30초)",
    paper: "SIGIR 2024",
    paperBadge: "MACRec",
    color: "blue",
    icon: Search,
    details: {
      description: "4개의 전문 Agent가 독립적으로 동시에 작업을 수행합니다.",
      agents: [
        { icon: "📊", name: "User Analyst", result: "'가족용 + 연비 중요' 추출" },
        { icon: "🔍", name: "Searcher", result: "387대 후보 차량 발견" },
        { icon: "⚖️", name: "Evaluator", result: "TOPSIS 엔진 실행 중..." },
        { icon: "💰", name: "Financial", result: "5년 TCO 계산 완료" }
      ],
      result: "⏱️ 총 소요시간: 30초 (순차 실행 대비 70% 단축)"
    }
  },
  {
    id: "topsis",
    phase: "내부 실행",
    title: "TOPSIS 객관 평가",
    subtitle: "6가지 기준으로 정밀 분석",
    paper: "Multiple Studies 2018-2024",
    paperBadge: "TOPSIS",
    color: "green",
    icon: BarChart3,
    details: {
      description: "6가지 기준(가격, 연비, 안전성, 브랜드, 상태, 옵션)을 0-1로 정규화하여 객관적으로 평가합니다.",
      process: [
        "Step 1: 정규화 (0-1 변환)",
        "Step 2: 가중치 적용",
        "Step 3: 이상해/부이상해 거리 계산",
        "Step 4: 유틸리티 점수 산출"
      ],
      before: [
        { rank: 1, car: "🚗 쏘렌토 (디젤)", score: 0.95 },
        { rank: 2, car: "🚗 싼타페 (가솔린)", score: 0.93 },
        { rank: 3, car: "🚗 QM6 (하이브리드)", score: 0.91 }
      ]
    }
  },
  {
    id: "phase3",
    phase: "Phase 3",
    title: "Result Aggregation + Alibaba Re-ranking",
    subtitle: "개인 선호도 반영",
    paper: "RecSys 2019 Best Paper",
    paperBadge: "Alibaba",
    color: "orange",
    icon: TrendingUp,
    details: {
      description: "TOPSIS의 객관적 점수에 사용자 선호도 가중치를 적용하여 최종 순위를 결정합니다.",
      process: [
        "사용자 선호도: '연비 중요' ⭐⭐⭐⭐⭐",
        "하이브리드/전기 차량: +30% 보너스",
        "디젤 차량: +10% 보너스",
        "가솔린 차량: 보너스 없음"
      ],
      after: [
        { rank: 1, car: "🚗 QM6 (하이브리드)", score: 1.183, highlight: true },
        { rank: 2, car: "🚗 쏘렌토 (디젤)", score: 1.045 },
        { rank: 3, car: "🚗 싼타페 (가솔린)", score: 0.93 }
      ],
      result: "💡 객관적으로 3위였던 QM6가 사용자 선호도 반영 후 최종 1위로 역전!"
    }
  }
];

const colorMap: { [key: string]: { bg: string; border: string; text: string; badge: string } } = {
  blue: {
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-600",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  green: {
    bg: "bg-green-500/5",
    border: "border-green-500/20",
    text: "text-green-600",
    badge: "bg-green-500/10 text-green-600 border-green-500/20"
  },
  orange: {
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
    text: "text-orange-600",
    badge: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  }
};

export default function PaperBasedWorkflow() {
  const [expandedStep, setExpandedStep] = useState<string | null>("phase1");

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">논문 기반 구현</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">추천 워크플로우</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SIGIR 2024 MACRec + RecSys 2019 Alibaba + TOPSIS 방법론으로<br />
            3분 내 최적의 차량 3대를 추천합니다
          </p>
        </div>

        {/* User Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-chart-2/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👤</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">사용자 요청</p>
                <p className="text-lg font-semibold">"3000만원 이하 가족용 SUV 찾아요. 연비가 중요해요"</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const colors = colorMap[step.color];
            const isExpanded = expandedStep === step.id;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden border-2 ${colors.border} transition-all duration-300 ${
                  isExpanded ? "shadow-lg" : "shadow-sm"
                }`}>
                  {/* Header */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`w-full p-6 ${colors.bg} hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl ${colors.badge} border-2 flex items-center justify-center`}>
                          <step.icon className={`w-7 h-7 ${colors.text}`} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-mono ${colors.badge} border`}>
                              {step.paperBadge}
                            </span>
                            <span className="text-xs text-muted-foreground">{step.paper}</span>
                          </div>
                          <h3 className="text-xl font-bold mb-1">
                            {step.phase}: {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t-2 border-card-border"
                    >
                      <div className="p-6 space-y-6">
                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed">
                          {step.details.description}
                        </p>

                        {/* Agents */}
                        {step.details.agents && (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {step.details.agents.map((agent, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                              >
                                <span className="text-2xl">{agent.icon}</span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold">{agent.name}</p>
                                  <p className="text-xs text-muted-foreground">{agent.result}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Process */}
                        {step.details.process && (
                          <div className="bg-background rounded-lg border p-4">
                            <div className="space-y-2">
                              {step.details.process.map((proc, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${colors.badge} border flex items-center justify-center text-xs font-bold`}>
                                    {idx + 1}
                                  </div>
                                  <p className="text-sm">{proc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Before Scores */}
                        {step.details.before && (
                          <div>
                            <p className="text-sm font-semibold mb-3">📊 객관 점수 (개인 취향 반영 X)</p>
                            <div className="space-y-2">
                              {step.details.before.map((item) => (
                                <div key={item.rank} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-muted-foreground">{item.rank}위</span>
                                    <span className="text-sm">{item.car}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono font-bold">{item.score.toFixed(2)}</span>
                                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${colors.bg.replace('/5', '')} transition-all`}
                                        style={{ width: `${item.score * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* After Scores */}
                        {step.details.after && (
                          <div>
                            <p className="text-sm font-semibold mb-3">🏆 최종 순위 (개인 선호도 반영 O)</p>
                            <div className="space-y-2">
                              {step.details.after.map((item) => (
                                <div
                                  key={item.rank}
                                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                    item.highlight
                                      ? "bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30 shadow-md"
                                      : "bg-background"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold ${item.highlight ? "text-orange-600" : "text-muted-foreground"}`}>
                                      {item.rank}위
                                    </span>
                                    <span className="text-sm font-medium">{item.car}</span>
                                    {item.highlight && <span className="text-xl">⭐</span>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-mono font-bold ${item.highlight ? "text-orange-600" : ""}`}>
                                      {item.score.toFixed(3)}
                                    </span>
                                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all ${
                                          item.highlight ? "bg-gradient-to-r from-orange-500 to-yellow-500" : "bg-muted-foreground/30"
                                        }`}
                                        style={{ width: `${Math.min(item.score * 85, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Result */}
                        {step.details.result && (
                          <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
                            <p className="text-sm font-medium">{step.details.result}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Final Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎉</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">최종 추천 완료</p>
                <p className="text-lg font-bold text-green-600">
                  "당신에게 가장 좋은 차는 QM6 (하이브리드)입니다!"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  💡 이유: 객관적으로는 3위였지만, 연비를 중요하게 생각하는 당신에게는 하이브리드 QM6가 최적의 선택입니다.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl">
            <a href="/onboarding">
              지금 바로 내 차 찾기
              <Award className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
