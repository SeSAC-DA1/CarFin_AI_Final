import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Database, Award, ArrowRight, MessageCircle, Sparkles } from "lucide-react";

interface WelcomeFlowProps {
  onStart: () => void;
  onQuickStart: (message: string) => void;
}

const agents = [
  {
    id: "needs",
    name: "니즈 분석 AI",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    description: "당신의 말에서 진짜 원하는 것을 찾아요",
    detail: "대화 내용을 분석해서 예산, 용도, 선호도를 정확히 파악합니다"
  },
  {
    id: "search",
    name: "검색 AI",
    icon: Database,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    description: "15만대 중에서 조건에 맞는 차량을 빠르게 검색해요",
    detail: "0.5초만에 수만 대의 매물에서 당신의 조건에 맞는 차량을 찾습니다"
  },
  {
    id: "evaluation",
    name: "평가 AI",
    icon: Award,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    description: "6가지 기준으로 객관적으로 평가해요",
    detail: "가격, 성능, 안전성, 연비, 옵션, 상태를 종합해서 정확히 평가합니다"
  }
];

const exampleQuestions = [
  "가족용으로 안전한 차 찾아요",
  "출퇴근용 연비 좋은 차 추천해주세요",
  "2500만원 이하로 SUV 찾고 있어요",
  "신혼부부용 예쁘고 실용적인 차"
];

export default function WelcomeFlow({ onStart, onQuickStart }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "안녕하세요! 👋",
      subtitle: "AI 3명으로 구성된 차량 추천 팀입니다",
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="text-lg text-muted-foreground">
              복잡한 차량 선택을 단순하게 만들어드립니다
            </div>
            <div className="text-sm text-muted-foreground">
              각자 전문 분야가 있는 AI 3명이 협업해서 완벽한 추천을 찾아드려요
            </div>
          </div>

          <div className="grid gap-4">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  className={`p-4 rounded-2xl border transition-all duration-500 ${agent.bgColor}
                    animate-fade-in`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                      <Icon className={`w-5 h-5 ${agent.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{agent.description}</p>
                      <p className="text-xs text-muted-foreground">{agent.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center space-y-4">
            <Button
              onClick={() => setCurrentStep(1)}
              className="gap-2"
              size="lg"
            >
              다음: 사용법 알아보기
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "사용법은 아주 간단해요 ✨",
      subtitle: "자연스러운 대화로 원하는 차를 알려주세요",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg text-muted-foreground mb-4">
                이런 식으로 편하게 말씀해주세요:
              </div>
            </div>

            <div className="grid gap-3">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onQuickStart(question)}
                  className="p-4 text-left rounded-xl border border-dashed border-primary/30
                    bg-primary/5 hover:bg-primary/10 transition-colors group
                    animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">💡 이렇게 하면 더 정확해요</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 예산 범위를 알려주세요 ("3000만원 이하")</li>
                    <li>• 용도를 말씀해주세요 ("출퇴근용", "가족용")</li>
                    <li>• 중요한 조건을 말씀해주세요 ("안전성", "연비")</li>
                  </ul>
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
              >
                직접 대화 시작하기
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-card-border p-6">
          {steps[currentStep].content}
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