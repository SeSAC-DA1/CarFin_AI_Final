import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, TrendingUp } from "lucide-react";

const papers = [
  {
    icon: BookOpen,
    title: "멀티 에이전트 협업",
    venue: "SIGIR 2024",
    description: "정보검색 분야 최고 학회에서 발표된 최신 멀티 에이전트 협업 프레임워크를 적용했습니다",
    badge: "핵심 시스템",
    color: "bg-chart-1/10 text-chart-1",
    impact: "3명의 AI가 역할별로 협업"
  },
  {
    icon: Award,
    title: "개인화 재정렬",
    venue: "RecSys 2019 Best Paper",
    description: "Alibaba가 실제 배포한 개인화 재정렬 알고리즘으로 사용자 피드백을 즉시 반영합니다",
    badge: "실시간 학습",
    color: "bg-chart-2/10 text-chart-2",
    impact: "0.5초 내 재추천"
  },
  {
    icon: TrendingUp,
    title: "TOPSIS 의사결정",
    venue: "Industry Standard",
    description: "자동차 업계에서 수십년간 검증된 다기준 의사결정 방법론으로 객관적 평가를 제공합니다",
    badge: "산업 표준",
    color: "bg-chart-3/10 text-chart-3",
    impact: "6가지 기준 정밀 분석"
  }
];

export default function PapersSection() {
  return (
    <section className="py-16 md:py-24 bg-card/30" id="technology">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">3개 논문 기반 검증된 시스템</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            최신 AI 연구와 산업 표준을 결합한 과학적 추천 엔진
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {papers.map((paper, index) => (
            <Card key={index} className="p-6 hover-elevate border-card-border" data-testid={`paper-${index}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <paper.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge className={paper.color}>
                    {paper.badge}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-1">{paper.title}</h3>
                  <p className="text-xs font-mono text-muted-foreground mb-3">{paper.venue}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {paper.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">적용 효과</p>
                    <p className="text-sm font-medium">{paper.impact}</p>
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
