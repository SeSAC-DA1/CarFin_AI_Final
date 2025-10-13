import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, Award, ArrowRight, MessageCircle, Sparkles, Crown, Users, Target, DollarSign, GraduationCap, Shield, Info, Clock, TrendingUp } from "lucide-react";

interface WelcomeFlowProps {
  onStart: () => void;
  onQuickStart: (message: string) => void;
}

// 🎬 시연 시나리오 A (강화된 버전 - 단일 시나리오)
const demoScripts = [
  {
    id: "scenario-a",
    label: "시연 시나리오 A",
    badge: "시연용",
    badgeColor: "bg-green-500",
    icon: Users,
    script: "3000만원 이하 가솔린 국내차 SUV 찾습니다. 5인 가족이고 안전성이 가장 중요해요. 연식은 5년 이내로 주행거리 10만km 이내 무사고 차량으로 추천해 주세요.",
    expectedVehicles: "현대 싼타페, 기아 쏘렌토, 현대 팰리세이드, 기아 카니발",
    estimatedTime: "약 2-3분",
    conditions: [
      "✓ 예산: 3000만원 이하",
      "✓ 연료: 가솔린",
      "✓ 브랜드: 국내차 (현대/기아)",
      "✓ 차종: SUV 전용",
      "✓ 연식: 5년 이내 (2020년+)",
      "✓ 주행거리: 10만km 이내",
      "✓ 사고이력: 무사고",
      "✓ 중요도: 안전성 최우선"
    ]
  }
];

// 🏆 Manager Agent + 4개 전문 에이전트 (계층 구조)
const aiTeamStructure = {
  manager: {
    name: "Manager Agent",
    icon: Crown,
    badge: "👑 총괄",
    color: "text-yellow-600",
    bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200",
    description: "4개 전문 에이전트를 조율하고 작업을 분배합니다",
    detail: "Task Decomposition으로 복잡한 요청을 세부 작업으로 나눕니다",
    isManager: true
  },
  specialists: [
    {
      id: "analyst",
      name: "User Analyst",
      icon: Users,
      badge: "분석",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      description: "프로필 데이터를 추출하고 니즈를 파악합니다",
      detail: "Gemini AI로 예산·용도·선호도 정밀 분석"
    },
    {
      id: "searcher",
      name: "Searcher",
      icon: Database,
      badge: "검색",
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      description: "실시간 매물 DB에서 조건 맞는 차량 검색",
      detail: "PostgreSQL 실시간 데이터 중 최적 후보 필터링"
    },
    {
      id: "evaluator",
      name: "Evaluator",
      icon: Target,
      badge: "평가",
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      description: "6가지 기준으로 객관적 점수 계산",
      detail: "TOPSIS 다기준 분석 (가격·연비·안전·브랜드·상태·옵션)"
    },
    {
      id: "financial",
      name: "Financial Advisor",
      icon: DollarSign,
      badge: "금융",
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      description: "5년 총 소유비용(TCO) 법적 근거 기반 계산",
      detail: "지방세법 제11조·127조 + DOE/ANL 88원/km"
    }
  ]
};

// 🎓 신뢰도 배지
const trustBadges = [
  { icon: GraduationCap, text: "SIGIR 2024 논문", color: "blue" },
  { icon: Award, text: "98% 구현 정확도", color: "green" },
  { icon: Shield, text: "법적 근거 TCO", color: "purple" },
  { icon: Database, text: "실시간 데이터", color: "orange" }
];

export default function WelcomeFlow({ onStart, onQuickStart }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "논문 기반 멀티에이전트 추천 시스템 🎓",
      subtitle: "SIGIR 2024·RecSys 2019 국제 학회 논문으로 구현",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="text-base text-muted-foreground">
              5개 전문 AI가 <strong className="text-primary">MACRec 프로토콜</strong>로 협업하여
            </div>
            <div className="text-base font-semibold text-foreground">
              실시간 데이터를 3분 안에 체계적으로 분석합니다
            </div>
          </div>

          {/* 신뢰도 배지 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/30 border border-border text-center animate-fade-in hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">{badge.text}</p>
                </div>
              );
            })}
          </div>

          {/* Manager Agent (상위) */}
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                계층 구조
              </Badge>
            </div>

            <div
              className="p-5 rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-3/5 shadow-sm animate-fade-in"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white shadow-sm border border-border">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-base">{aiTeamStructure.manager.name}</h3>
                    <span className="text-lg">{aiTeamStructure.manager.badge}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{aiTeamStructure.manager.description}</p>
                  <p className="text-xs text-muted-foreground">{aiTeamStructure.manager.detail}</p>
                </div>
              </div>
            </div>

            {/* 4개 전문 에이전트 (하위) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {aiTeamStructure.specialists.map((agent, index) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.id}
                    className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors animate-fade-in text-center"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 rounded-lg bg-background border border-border">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs mb-1">{agent.name}</h3>
                        <Badge variant="outline" className="text-xs">{agent.badge}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center space-y-4">
            <Button
              onClick={() => setCurrentStep(1)}
              className="gap-2"
              size="lg"
            >
              다음: 시연 시나리오 선택
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "🎬 시연 시나리오",
      subtitle: "정확한 추천을 위해 구체적인 조건이 포함된 시나리오를 사용하세요",
      content: (
        <div className="space-y-6">
          {/* 시연 안내 */}
          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  💡 시연 시나리오 안내
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• 아래 시나리오를 선택하시면 <strong className="text-foreground">2-3분 이내 정확한 추천</strong>을 받으실 수 있습니다</li>
                  <li>• <strong className="text-foreground">300-500대의 검증된 차량 풀</strong>에서만 추천합니다 (더미 데이터 완전 제거)</li>
                  <li>• <strong className="text-foreground">인기 SUV 모델 우선</strong>: 싼타페, 쏘렌토, 팰리세이드, 카니발</li>
                  <li>• 직접 입력 시에도 위 조건들을 포함하시면 더 정확한 추천이 가능합니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 시연 시나리오 카드 */}
          <div className="space-y-3">
            {demoScripts.map((scenario, index) => {
              const Icon = scenario.icon;
              return (
                <button
                  key={scenario.id}
                  onClick={() => onQuickStart(scenario.script)}
                  className="w-full text-left p-5 rounded-xl border border-border hover:border-primary
                    bg-muted/20 hover:bg-muted/40 hover:shadow-md transition-all group
                    animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="space-y-3">
                    {/* 헤더 */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background border border-border">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm">{scenario.label}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {scenario.badge}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    {/* 스크립트 */}
                    <div className="pl-11">
                      <p className="text-sm text-muted-foreground mb-3">
                        "{scenario.script}"
                      </p>

                      {/* 조건 표시 */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {scenario.conditions.map((condition, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>{condition}</span>
                          </div>
                        ))}
                      </div>

                      {/* 예상 결과 */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-medium">{scenario.estimatedTime}</span>
                        </div>
                        <div className="text-muted-foreground">
                          예상: {scenario.expectedVehicles}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 하단 버튼 */}
          <div className="space-y-3">
            <div className="p-4 bg-muted/20 rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">💬 직접 입력도 가능합니다</h3>
                  <p className="text-xs text-muted-foreground">
                    시나리오 대신 원하는 조건을 자유롭게 입력하셔도 됩니다.
                    예산·용도·중요도를 포함하면 더 정확합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(0)}
                className="flex-1"
              >
                이전
              </Button>
              <Button
                onClick={onStart}
                className="flex-1 gap-2"
                variant="secondary"
              >
                직접 입력하기
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const step = steps[currentStep];

  if (!step) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{step.title}</h2>
          <p className="text-muted-foreground">{step.subtitle}</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-card-border p-6">
          {step.content}
        </div>

        <div className="flex justify-center">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}