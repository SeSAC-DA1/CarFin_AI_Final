import { ArrowRight, Sparkles, Database, Zap, MessageCircle, Search, BarChart3, Shield, Clock, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-green-600/10 opacity-30" />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI가 3분 안에 찾아드립니다</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15]">
              <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                멀티 에이전트 기반
              </span>
              <br />
              <span className="text-foreground">중고차 추천 시스템</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed">
              <span className="text-foreground/90 font-medium">예산, 용도, 연비까지 종합 분석</span>
              <br />
              <span className="text-muted-foreground">3분이면 당신에게 꼭 맞는 차를 찾습니다</span>
              <br />
              <span className="text-primary font-medium">실제 매물 15만대 실시간 분석</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow" data-testid="button-start-chat">
                <Link href="/onboarding">
                  차 찾기 시작하기
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2" data-testid="button-learn-more">
                <Link href="/onboarding">
                  어떻게 하는지 볼래요
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <Search className="w-6 h-6 text-chart-1" />
                </div>
                <div>
                  <p className="text-lg font-semibold">15만대</p>
                  <p className="text-xs text-muted-foreground">실시간 매물</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-lg font-semibold">3분</p>
                  <p className="text-xs text-muted-foreground">빠른 추천</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-3/10 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-lg font-semibold">딱 3대</p>
                  <p className="text-xs text-muted-foreground">개인 맞춤</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-card-border space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">멀티에이전트 협업</p>
                    <p className="text-sm text-muted-foreground">5개 Agent 실시간 분석</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-2xl">
                    <p className="text-sm text-muted-foreground mb-1">👤 사용자</p>
                    <p className="text-sm">"가족용 SUV 찾는데, 연비도 좋고 안전했으면 좋겠어요"</p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <p className="text-sm text-primary mb-1">🧠 분석 AI</p>
                    <p className="text-sm">"가족용, SUV, 연비, 안전성을 핵심으로 분석할게요"</p>
                  </div>

                  <div className="p-4 bg-chart-2/10 rounded-2xl">
                    <p className="text-sm text-chart-2 mb-1">🔍 검색 AI</p>
                    <p className="text-sm">"조건에 맞는 차량 243대를 찾았어요"</p>
                  </div>

                  <div className="p-4 bg-chart-3/10 rounded-2xl">
                    <p className="text-sm text-chart-3 mb-1">⭐ 추천 AI</p>
                    <p className="text-sm">"여러 기준으로 평가해서 베스트 3대 완성!"</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-muted/50 rounded-full" />
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
