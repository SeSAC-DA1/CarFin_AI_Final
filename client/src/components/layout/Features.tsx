import { Brain, TrendingUp, Shield, Clock, Users, Sparkles, Wallet, X, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Wallet,
    title: "총 소유비용(TCO) 계산",
    others: "차량 가격만 표시",
    carfin: "법적 근거 기반 5가지 비용으로 3년 실제 비용 투명 공개",
    badge: "Fintech 핵심"
  },
  {
    icon: Brain,
    title: "5개 AI 에이전트 협업",
    others: "단순 키워드 검색",
    carfin: "SIGIR 2024 멀티 에이전트가 실시간 협업",
    badge: "MACRec"
  },
  {
    icon: TrendingUp,
    title: "개인화 추천 시스템",
    others: "정적 추천 리스트",
    carfin: "RecSys 2019 Best Paper로 선호도 즉시 반영",
    badge: "Alibaba"
  },
  {
    icon: Shield,
    title: "객관적 다기준 평가",
    others: "주관적 평가",
    carfin: "6가지 기준으로 정밀 분석하는 TOPSIS 방법론",
    badge: "TOPSIS"
  },
  {
    icon: Clock,
    title: "대용량 데이터 빠른 분석",
    others: "제한된 매물 검색",
    carfin: "PostgreSQL + Redis로 12만대 이상 3초 내 분석",
    badge: "빅데이터"
  },
  {
    icon: Users,
    title: "대화 맥락 기억",
    others: "단발성 질의응답",
    carfin: "AI가 이전 대화 기억하고 맥락 이해",
    badge: "컨텍스트"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">일반 서비스와 무엇이 다른가요?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            학술 논문 기반 검증된 방법론으로 더 정확한 추천을 제공합니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover-elevate border-card-border transition-all duration-200"
              data-testid={`card-feature-${index}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-mono">
                    {feature.badge}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2 items-start">
                      <X className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground" data-testid={`text-feature-others-${index}`}>
                        일반: {feature.others}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium" data-testid={`text-feature-carfin-${index}`}>
                        CarFin: {feature.carfin}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
