import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, Award, ArrowRight, MessageCircle, Sparkles, Crown, Users, Target, DollarSign, GraduationCap, Shield, Info, Clock, TrendingUp } from "lucide-react";

interface WelcomeFlowProps {
  onStart: () => void;
  onQuickStart: (message: string) => void;
}

// 🎬 시연용 최적화 스크립트 (구체적 조건 포함)
const demoScripts = [
  {
    id: "scenario-a",
    label: "시나리오 A: 가족용 SUV",
    badge: "권장",
    badgeColor: "bg-green-500",
    icon: Users,
    script: "3000만원 이하 가족용 SUV 찾습니다. 5인 가족이고 안전성이 가장 중요해요. 주말에 가족 여행 자주 가고, 연간 15,000km 정도 달립니다. 5년 보유 예정입니다.",
    expectedVehicles: "현대 투싼, 기아 스포티지, 쌍용 토레스",
    estimatedTime: "약 3분",
    conditions: ["✓ 예산: 3000만원 이하", "✓ 용도: 가족용", "✓ 중요도: 안전성 최우선", "✓ TCO: 15,000km/년, 5년"]
  },
  {
    id: "scenario-b",
    label: "시나리오 B: 출퇴근용 세단",
    badge: "인기",
    badgeColor: "bg-blue-500",
    icon: TrendingUp,
    script: "2500만원 예산으로 출퇴근용 세단 찾습니다. 편도 25km 거리 매일 출퇴근하고, 연비가 제일 중요합니다. 연간 20,000km 정도 예상되고 3년 보유 계획입니다.",
    expectedVehicles: "아반떼, K3, SM6 하이브리드",
    estimatedTime: "약 2.5분",
    conditions: ["✓ 예산: 2500만원 이하", "✓ 용도: 출퇴근", "✓ 중요도: 연비 최우선", "✓ TCO: 20,000km/년, 3년"]
  },
  {
    id: "scenario-c",
    label: "시나리오 C: 신혼부부용 컴팩트",
    badge: "추천",
    badgeColor: "bg-purple-500",
    icon: Sparkles,
    script: "2800만원 예산으로 신혼부부용 차량 찾습니다. 디자인과 안전성 둘 다 중요하고, 주말 드라이브 자주 갑니다. 연간 12,000km 정도 달리고 4년 보유 예정입니다.",
    expectedVehicles: "셀토스, 베뉴, 코나",
    estimatedTime: "약 3분",
    conditions: ["✓ 예산: 2800만원 이하", "✓ 용도: 신혼부부", "✓ 중요도: 디자인+안전", "✓ TCO: 12,000km/년, 4년"]
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
                  className={`p-3 rounded-lg bg-${badge.color}-50 border border-${badge.color}-200 text-center animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className={`w-4 h-4 text-${badge.color}-600 mx-auto mb-1`} />
                  <p className="text-xs font-medium text-${badge.color}-900">{badge.text}</p>
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
              className={`p-5 rounded-xl border-2 ${aiTeamStructure.manager.borderColor} ${aiTeamStructure.manager.bgColor} shadow-lg animate-fade-in`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white shadow-md">
                  <Crown className={`w-6 h-6 ${aiTeamStructure.manager.color}`} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiTeamStructure.specialists.map((agent, index) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.id}
                    className={`p-4 rounded-xl border ${agent.borderColor} ${agent.bgColor} animate-fade-in`}
                    style={{ animationDelay: `${(index + 1) * 150}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        <Icon className={`w-5 h-5 ${agent.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{agent.name}</h3>
                          <Badge variant="outline" className="text-xs">{agent.badge}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{agent.description}</p>
                        <p className="text-xs text-muted-foreground">{agent.detail}</p>
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
      title: "🎬 시연용 권장 시나리오",
      subtitle: "정확한 추천을 위해 구체적인 조건이 포함된 스크립트를 선택하세요",
      content: (
        <div className="space-y-6">
          {/* 시연 안내 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  💡 시연 시 권장사항
                </p>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• 시나리오 A-C 중 하나를 선택하시면 <strong>3분 이내 정확한 추천</strong>을 받으실 수 있습니다</li>
                  <li>• 각 시나리오는 <strong>예산·용도·중요도·TCO 조건</strong>이 모두 포함되어 최적화되어 있습니다</li>
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
                  className="w-full text-left p-5 rounded-xl border-2 border-primary/20 hover:border-primary
                    bg-gradient-to-br from-white to-primary/5 hover:shadow-lg transition-all group
                    animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="space-y-3">
                    {/* 헤더 */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm">{scenario.label}</h3>
                          <Badge className={`${scenario.badgeColor} text-white text-xs`}>
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
            <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
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