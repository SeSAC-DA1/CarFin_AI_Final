import { MessageSquare, Search, BarChart3, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "대화 시작",
    description: "자연어로 원하는 차량 조건 입력"
  },
  {
    icon: Search,
    number: "02",
    title: "AI 협업 분석",
    description: "3개 에이전트가 실시간 협업"
  },
  {
    icon: BarChart3,
    number: "03",
    title: "TOPSIS 평가",
    description: "다기준 의사결정으로 순위 결정"
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "추천 완료",
    description: "상세 분석과 함께 결과 제공"
  }
];

export default function Process() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">추천 프로세스</h2>
          <p className="text-lg text-muted-foreground">
            4단계로 완성되는 정밀한 차량 추천
          </p>
        </div>

        <div className="relative">
          {/* Desktop Timeline */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-border" />
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative" data-testid={`step-${index}`}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center relative z-10">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold font-mono">
                      {step.number}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Mobile connector */}
                {index < steps.length - 1 && (
                  <div className="md:hidden w-0.5 h-8 bg-border mx-auto my-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
