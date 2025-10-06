import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, TrendingUp } from "lucide-react";

const papers = [
  {
    icon: BookOpen,
    title: "AI 3명이 서로 협업",
    venue: "글로벌 AI 학회 검증",
    description: "세계적으로 인정받은 AI 협업 기술로 각각 다른 전문성을 가진 AI들이 함께 일해요",
    badge: "자율 협업",
    color: "bg-chart-1/10 text-chart-1",
    impact: "각자 다른 방식으로 분석"
  },
  {
    icon: Award,
    title: "실시간으로 배우는 AI",
    venue: "글로벌 IT기업 실증",
    description: "알리바바 같은 대기업에서 실제로 사용하는 기술로 여러분 피드백을 바로 학습해요",
    badge: "즉시 학습",
    color: "bg-chart-2/10 text-chart-2",
    impact: "말씀해주시면 바로 개선"
  },
  {
    icon: TrendingUp,
    title: "과학적 비교 평가",
    venue: "산업계 표준 방법",
    description: "자동차 업계에서 오랫동안 쓰인 검증된 방법으로 여러 기준을 공정하게 비교해요",
    badge: "객관적 평가",
    color: "bg-chart-3/10 text-chart-3",
    impact: "편견 없이 정확한 분석"
  }
];

export default function PapersSection() {
  return (
    <section className="py-16 md:py-24 bg-card/30" id="technology">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">믿을 수 있는 검증된 기술</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            세계적으로 인정받은 3가지 기술로 안전하고 정확하게 추천해드려요
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
