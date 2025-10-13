import { ArrowRight, Sparkles, Database, Zap, MessageCircle, Search, BarChart3, Shield, Clock, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState } from "react";

export default function Hero() {
  const [vehicleCount, setVehicleCount] = useState<number>(127378); // 기본값
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실시간 매물 수 가져오기
    const fetchVehicleCount = async () => {
      try {
        const response = await fetch('/api/vehicles/count');
        if (response.ok) {
          const data = await response.json();
          setVehicleCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch vehicle count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleCount();
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-green-600/10 opacity-30" />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">논문 2개 + 검증된 방법론 기반</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15]">
              <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                멀티 에이전트 기반
              </span>
              <br />
              <span className="text-foreground">중고차 추천 시스템</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed">
              <span className="text-foreground/90 font-medium">논문 기반 멀티에이전트 협업 (SIGIR·RecSys)</span>
              <br />
              <span className="text-muted-foreground">총 소유비용(TCO) 법적 근거 기반 계산</span>
              <br />
              <span className="text-primary font-medium">최신 매물 데이터 3분 내 정밀 분석</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 rounded-full shadow-lg hover:shadow-xl transition-shadow" data-testid="button-start-chat">
                <Link href="/onboarding">
                  차 찾기 시작하기
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/30 hover:bg-blue-500/20" data-testid="button-demo-a">
                <Link href="/profile-setup?demo=A">
                  🎬 시연 시나리오 (3000만원 이하 SUV)
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <Database className="w-6 h-6 text-chart-1" />
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {isLoading ? (
                      <span className="animate-pulse">로딩 중...</span>
                    ) : (
                      <span className="font-mono">{vehicleCount.toLocaleString()}대</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3 text-green-500" />
                    AirFlow 실시간 업데이트
                  </p>
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

          <div className="relative hidden lg:block lg:pl-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-card-border space-y-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">실시간 AI 협업</p>
                      <p className="text-xs text-muted-foreground">약 3분 소요</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* 사용자 메시지 */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-base">👤</span>
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <p className="text-xs text-muted-foreground mb-1">사용자</p>
                      <p className="text-sm leading-relaxed">"3000만원 이하 가족용 SUV 찾아요. 연비랑 안전성이 중요해요"</p>
                    </div>
                  </div>

                  {/* 총괄 AI */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base">🎯</span>
                    </div>
                    <div className="flex-1 bg-primary/5 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-primary/10">
                      <p className="text-xs text-primary mb-1">총괄 AI</p>
                      <p className="text-sm leading-relaxed">"5개 AI에게 작업을 분배했어요"</p>
                    </div>
                  </div>

                  {/* 분석 AI */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base">👤</span>
                    </div>
                    <div className="flex-1 bg-chart-2/5 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-chart-2/10">
                      <p className="text-xs text-chart-2 mb-1">분석 AI</p>
                      <p className="text-sm leading-relaxed">"프로필 분석 완료: 예산 3000만원, 가족용 SUV, 연비·안전성 우선"</p>
                    </div>
                  </div>

                  {/* 검색 AI */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base">🔍</span>
                    </div>
                    <div className="flex-1 bg-chart-3/5 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-chart-3/10">
                      <p className="text-xs text-chart-3 mb-1">검색 AI</p>
                      <p className="text-sm leading-relaxed">"{isLoading ? '...' : vehicleCount.toLocaleString()}대 중 500대 발견!"</p>
                    </div>
                  </div>

                  {/* 평가 AI */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base">⭐</span>
                    </div>
                    <div className="flex-1 bg-amber-500/5 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-amber-500/10">
                      <p className="text-xs text-amber-600 mb-1">평가 AI</p>
                      <p className="text-sm leading-relaxed">"6가지 기준(가격·연비·안전성·브랜드·상태·옵션)으로 평가 중..."</p>
                    </div>
                  </div>

                  {/* 금융 상담 AI */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base">💰</span>
                    </div>
                    <div className="flex-1 bg-purple-500/5 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-purple-500/10">
                      <p className="text-xs text-purple-600 mb-1">금융 상담 AI</p>
                      <p className="text-sm leading-relaxed">"일시불·할부·리스 중 가장 유리한 방법을 분석 중이에요"</p>
                    </div>
                  </div>

                  {/* 최종 추천 (시스템) */}
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base">✨</span>
                    </div>
                    <div className="flex-1 bg-green-500/5 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-green-500/10">
                      <p className="text-xs text-green-600 mb-1">시스템</p>
                      <p className="text-sm leading-relaxed">"당신에게 딱 맞는 3대를 선정했어요! 🎉"</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <div className="flex-1 h-9 bg-muted/50 rounded-full flex items-center px-4">
                    <span className="text-xs text-muted-foreground">메시지를 입력하세요...</span>
                  </div>
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary-foreground" />
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
