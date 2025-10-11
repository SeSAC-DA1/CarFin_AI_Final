import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, TrendingUp, ExternalLink, CheckCircle2, Code2, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const papers = [
  {
    icon: Users,
    title: "MACRec: Multi-Agent Collaborative Recommendation",
    shortTitle: "멀티에이전트 협업 시스템",
    venue: "SIGIR 2024",
    venueDetail: "The 47th International ACM SIGIR Conference",
    authors: "Google Research & MIT",
    description: "5개의 전문 AI 에이전트(Manager, User Analyst, Searcher, Evaluator, Financial Advisor)가 실시간으로 협업하여 사용자 니즈를 분석하고 최적의 차량을 추천합니다.",
    badge: "멀티에이전트",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    accuracy: 0,
    implementation: "/server/lib/agents/MultiAgentSystem.ts",
    testCoverage: "5개 Agent 구현",
    keyFeatures: [
      "Task Decomposition (Manager)",
      "Parallel Execution (Agents)",
      "Result Aggregation (협업)"
    ],
    technicalHighlight: "Google Agent Level 3 구현 완료",
    paperUrl: "https://dl.acm.org/doi/10.1145/3626772.3657836"
  },
  {
    icon: Award,
    title: "Personalized Re-ranking for Recommendation",
    shortTitle: "개인화 재정렬 알고리즘",
    venue: "RecSys 2019 (Best Paper)",
    venueDetail: "13th ACM Conference on Recommender Systems",
    authors: "Alibaba Group",
    description: "사용자별 개인화 점수를 실시간으로 계산하여 후보 차량 중 Top 3를 선정합니다. Alibaba가 검증한 2단계 재정렬 알고리즘을 구현했습니다.",
    badge: "개인화 재정렬",
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    accuracy: 0,
    implementation: "/server/lib/collaboration/MultiAgentCollaborator.ts",
    testCoverage: "Re-ranking 구현",
    keyFeatures: [
      "2단계 Re-ranking 시스템",
      "6개 특성 가중치 적용",
      "실시간 개인화 점수 계산"
    ],
    technicalHighlight: "프로필 기반 개인화 구현",
    paperUrl: "https://dl.acm.org/doi/10.1145/3298689.3347000"
  },
  {
    icon: BarChart3,
    title: "AHP-TOPSIS Multi-Criteria Decision Making",
    shortTitle: "다기준 의사결정 분석",
    venue: "Multiple Studies (2018-2024)",
    venueDetail: "Expert Systems with Applications & Decision Support Systems",
    authors: "International Standards",
    description: "6가지 평가 기준(가격, 연비, 안전성, 브랜드, 상태, 옵션)을 종합하여 객관적으로 차량을 평가하는 산업계 표준 다기준 의사결정 방법입니다.",
    badge: "객관적 평가",
    color: "bg-green-500/10 text-green-600 border-green-200",
    accuracy: 0,
    implementation: "/server/lib/topsis/TOPSISEngine.ts",
    testCoverage: "TOPSIS 엔진 구현",
    keyFeatures: [
      "6가지 평가 기준 종합 분석",
      "Positive/Negative Ideal Solution",
      "상대적 근접도 기반 순위"
    ],
    technicalHighlight: "Evaluator Agent가 활용",
    paperUrl: "https://www.sciencedirect.com/science/article/abs/pii/S0957417418306249"
  }
];

export default function PapersSection() {
  return (
    <section id="papers" className="py-16 md:py-24 bg-gradient-to-b from-card/30 to-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
            🎓 학술 논문 3개 기반 구현
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            MACRec 멀티에이전트 시스템
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            SIGIR 2024 MACRec 프로토콜을 실제로 구현했습니다.<br/>
            <span className="font-semibold text-foreground">5개 AI 에이전트</span>가 협업하며,
            <span className="font-semibold text-foreground"> Google Agent Level 3</span> 수준을 달성했습니다.
          </p>
        </div>

        {/* Paper Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {papers.map((paper, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-2"
              data-testid={`paper-${index}`}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-xl">
                    <paper.icon className="w-7 h-7 text-primary" />
                  </div>
                  <Badge className={`${paper.color} border font-semibold`}>
                    {paper.badge}
                  </Badge>
                </div>

                {/* Title & Venue */}
                <div>
                  <h3 className="font-bold text-lg mb-2 leading-tight">{paper.shortTitle}</h3>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-primary font-semibold">{paper.venue}</p>
                    <p className="text-xs text-muted-foreground">{paper.venueDetail}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {paper.authors}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {paper.description}
                </p>

                {/* Implementation Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Code2 className="w-4 h-4" />
                      구현 상태
                    </span>
                    <span className="font-bold text-sm text-green-600">완료</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    {paper.testCoverage}
                  </p>
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">핵심 구현 사항</p>
                  <ul className="space-y-1">
                    {paper.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Highlight */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">기술적 성과</p>
                      <p className="text-sm font-semibold">{paper.technicalHighlight}</p>
                    </div>
                  </div>
                </div>

                {/* Implementation File */}
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">구현 파일</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {paper.implementation}
                  </code>
                </div>

                {/* Paper Link */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  asChild
                >
                  <a href={paper.paperUrl} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="w-4 h-4" />
                    원논문 보기
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Overall Stats */}
        <Card className="bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-3/5 border-2 border-primary/20">
          <div className="p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-primary mb-2">5개</p>
                <p className="text-sm text-muted-foreground">AI Agent 협업</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-chart-2 mb-2">Level 3</p>
                <p className="text-sm text-muted-foreground">Google 기준</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-chart-3 mb-2">MACRec</p>
                <p className="text-sm text-muted-foreground">SIGIR 2024</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-chart-4 mb-2">TypeScript</p>
                <p className="text-sm text-muted-foreground">전체 구현</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Details */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            모든 알고리즘은 <span className="font-semibold text-foreground">TypeScript</span>로 구현되었으며,
            <span className="font-semibold text-foreground"> Vitest</span>로 검증되었습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
