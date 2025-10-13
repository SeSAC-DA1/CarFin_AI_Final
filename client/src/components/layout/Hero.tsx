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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
              <span className="text-foreground/90 font-medium">5개 전문 AI가 실시간 협업 추천</span>
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

          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-card-border space-y-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold">3단계로 끝나는 AI 차량 추천</p>
                  <p className="text-sm text-muted-foreground mt-1">총 소요시간: 약 3분</p>
                </div>

                <div className="space-y-5">
                  {/* STEP 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                      <p className="font-semibold text-base">📋 프로필 설정 <span className="text-muted-foreground text-sm">(2분)</span></p>
                    </div>
                    <div className="ml-10 text-sm text-muted-foreground space-y-0.5">
                      <p>• 예산 3000만원 이하</p>
                      <p>• 가족용 SUV, 연비·안전성 중요</p>
                    </div>
                  </div>

                  {/* STEP 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-chart-2 text-white flex items-center justify-center font-bold text-sm">2</div>
                      <p className="font-semibold text-base">🤖 5개 AI 동시 협업 <span className="text-muted-foreground text-sm">(1분)</span></p>
                    </div>
                    <div className="ml-10 p-3 bg-muted/30 rounded-lg border border-border space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span>🎯</span>
                        <span className="font-medium">총괄 AI</span>
                        <span className="text-muted-foreground">→ 작업 분배 중...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span className="font-medium">분석 AI</span>
                        <span className="text-muted-foreground">→ 프로필 분석 완료</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🔍</span>
                        <span className="font-medium">검색 AI</span>
                        <span className="text-muted-foreground">→ {isLoading ? '...' : `${vehicleCount.toLocaleString()}대`} 중 500대 발견</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⭐</span>
                        <span className="font-medium">평가 AI</span>
                        <span className="text-muted-foreground">→ 6가지 기준 평가 중</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🎨</span>
                        <span className="font-medium">최적화 AI</span>
                        <span className="text-muted-foreground">→ 개인화 재정렬</span>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-chart-3 text-white flex items-center justify-center font-bold text-sm">3</div>
                      <p className="font-semibold text-base">✨ 딱 3대 추천 완료</p>
                    </div>
                    <div className="ml-10 text-sm text-muted-foreground space-y-0.5">
                      <p>• 가격·연비·안전성·브랜드·상태·옵션</p>
                      <p className="text-primary font-medium">• 당신에게 딱 맞는 3대</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
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
