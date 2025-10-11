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
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">논문 3개 기반 검증된 AI 시스템</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15]">
              <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                멀티에이전트 협업 시스템
              </span>
              <br />
              <span className="text-foreground">15만대 매물 3분 분석</span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-semibold text-muted-foreground">
                Top 3 최적 차량 추천
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed">
              <span className="text-foreground/90 font-medium">SIGIR·RecSys 국제 학회 논문 구현</span>
              <br />
              <span className="text-muted-foreground">5개 전문 AI가 협업하여 최적 차량 선정</span>
              <br />
              <span className="text-primary font-medium">KB차차차·엔카 실시간 데이터 통합</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow" data-testid="button-start-chat">
                <Link href="/onboarding">
                  시작하기
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2" data-testid="button-learn-more">
                <Link href="/onboarding">
                  시스템 소개
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
                {/* Header */}
                <div className="text-center pb-4 border-b border-border">
                  <p className="text-2xl font-bold mb-2">3분 분석 과정</p>
                  <p className="text-sm text-muted-foreground">15만대 → Top 3</p>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-bold mb-1">0초</p>
                      <p className="text-sm text-muted-foreground">프로필 데이터 자동 분석</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                      <Database className="w-8 h-8 text-chart-2" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-bold mb-1">1초</p>
                      <p className="text-sm text-muted-foreground">15만대 DB 실시간 검색</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-8 h-8 text-chart-3" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-bold mb-1">2초</p>
                      <p className="text-sm text-muted-foreground">TOPSIS 6가지 기준 평가</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-bold mb-1">3초</p>
                      <p className="text-sm text-muted-foreground">TCO 비용 계산 완료</p>
                    </div>
                  </div>
                </div>

                {/* Result */}
                <div className="pt-4 border-t border-border">
                  <div className="bg-primary/10 rounded-2xl p-4 text-center">
                    <p className="text-sm text-primary font-bold mb-1">분석 완료</p>
                    <p className="text-xs text-muted-foreground">당신을 위한 최적 차량 3대</p>
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
