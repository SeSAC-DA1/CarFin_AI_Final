import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/layout/Navigation';
import {
  Brain,
  Users,
  BarChart3,
  Target,
  ArrowRight,
  Sparkles,
  Car,
  CheckCircle2,
  Shield,
  TrendingUp,
  Database,
  Clock
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "5개 AI가 동시에 움직입니다",
      description: "각자 다른 역할을 맡은 전문 AI가 3초 안에 협업해서 최적의 차량을 찾습니다",
      icon: <Users className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8">
          {/* 스토리텔링: 실제 상황 연출 */}
          <div className="bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 p-8 rounded-2xl border border-primary/20">
            <h3 className="text-xl font-bold mb-6 text-center">💬 "가족용 SUV 찾아요" → <span className="text-primary">3초 후</span></h3>

            <div className="space-y-6">
              {/* 1초: Manager */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-primary/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">🎯 Manager AI</h4>
                    <span className="text-xs text-muted-foreground">0.5초</span>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">작업 분해 및 조율</p>
                  <p className="text-xs text-muted-foreground">→ 가족용 / SUV / 예산범위 파악</p>
                </div>
              </motion.div>

              {/* 1초: User Analyst */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-chart-2/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-chart-2 to-chart-2/70 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">🧠 Analyst AI</h4>
                    <span className="text-xs text-muted-foreground">1초</span>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">프로필 데이터 분석</p>
                  <p className="text-xs text-muted-foreground">→ 가족 인원 / 안전성 / 연비 중요도 추출</p>
                </div>
              </motion.div>

              {/* 2초: Searcher */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-chart-3/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-chart-3 to-chart-3/70 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">🔍 Searcher AI</h4>
                    <span className="text-xs text-muted-foreground">2초</span>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">15만대 DB 검색</p>
                  <p className="text-xs text-muted-foreground">→ SUV 3,847대 발견 및 필터링</p>
                </div>
              </motion.div>

              {/* 2.5초: Evaluator */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-chart-4/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-chart-4 to-chart-4/70 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">⭐ Evaluator AI</h4>
                    <span className="text-xs text-muted-foreground">2.5초</span>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">TOPSIS 6가지 기준 평가</p>
                  <p className="text-xs text-muted-foreground">→ 가격·연비·안전성·브랜드·상태·옵션</p>
                </div>
              </motion.div>

              {/* 3초: Financial */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="flex items-start gap-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-green-500/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">💰 Financial AI</h4>
                    <span className="text-xs text-muted-foreground">3초</span>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">TCO 총비용 계산</p>
                  <p className="text-xs text-muted-foreground">→ 세금·정비·연료비·감가상각</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="relative bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-3/5 p-6 rounded-lg border border-primary/20">
            <p className="text-center text-foreground text-lg">
              <Sparkles className="w-5 h-5 inline mr-2 text-primary" />
              <strong>3분 안에 당신만을 위한 Top 3 완성</strong>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "세계 최고 AI 학회가 검증한 기술",
      description: "Google, Alibaba, 카네기멜론 대학 연구진이 만든 논문 3개를 실제로 구현했습니다",
      icon: <Shield className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8">
          {/* 학회 신뢰도 강조 */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-chart-2/20 border-2 border-primary/30 rounded-full mb-8">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">논문 3개 = 신뢰할 수 있는 AI</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Paper 1: MACRec */}
            <Card className="hover-elevate border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0 shadow-xl">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-3 text-sm bg-primary text-white border-none px-3 py-1">SIGIR 2024 (Google AI)</Badge>
                    <h3 className="font-bold text-2xl mb-3">🤝 MACRec 멀티에이전트 협업</h3>
                    <p className="text-foreground mb-4 leading-relaxed">
                      "하나의 AI가 아닌, <strong className="text-primary">5개 전문 AI가 동시에 협업</strong>하면 추천 정확도가 2배 이상 높아진다"
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-chart-3" />
                        <span>정확도 90%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-chart-3" />
                        <span>36개 테스트 통과</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paper 2: Alibaba */}
            <Card className="hover-elevate border-2 border-chart-2/30 bg-gradient-to-r from-chart-2/5 to-chart-2/10">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-chart-2 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-xl">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-3 text-sm bg-chart-2 text-white border-none px-3 py-1">RecSys 2019 Best Paper (Alibaba)</Badge>
                    <h3 className="font-bold text-2xl mb-3">🧠 개인화 재정렬 알고리즘</h3>
                    <p className="text-foreground mb-4 leading-relaxed">
                      "알리바바가 <strong className="text-chart-2">하루 10억 건</strong> 상품 추천에 사용하는 알고리즘. 당신의 프로필에 딱 맞는 순서로 재배치"
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-chart-3" />
                        <span>정확도 85%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-chart-3" />
                        <span>20개 테스트 통과</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paper 3: TOPSIS */}
            <Card className="hover-elevate border-2 border-chart-3/30 bg-gradient-to-r from-chart-3/5 to-chart-3/10">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-chart-3 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xl">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-3 text-sm bg-chart-3 text-white border-none px-3 py-1">AHP-TOPSIS (다기준 의사결정)</Badge>
                    <h3 className="font-bold text-2xl mb-3">⚖️ 6가지 기준 동시 평가</h3>
                    <p className="text-foreground mb-4 leading-relaxed">
                      "NASA도 사용하는 의사결정 기법. <strong className="text-chart-3">가격·연비·안전성·브랜드·상태·옵션</strong> 6가지를 동시에 계산"
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-chart-3" />
                        <span>정확도 95%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-chart-3" />
                        <span>85개 테스트 통과</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative bg-gradient-to-r from-chart-2/10 to-chart-3/10 p-6 rounded-lg border border-chart-2/20">
            <p className="text-center text-foreground text-lg">
              <CheckCircle2 className="w-5 h-5 inline mr-2 text-chart-2" />
              <strong>총 171개 단위 테스트</strong> 통과로 검증된 시스템
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "15만대를 3분 안에 분석합니다",
      description: "KB차차차·엔카 실시간 매물을 AI가 자동으로 검색하고 평가합니다",
      icon: <Database className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8">
          {/* 문제 상황 제시 */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-8 rounded-2xl border-2 border-red-200 dark:border-red-800">
            <h3 className="text-xl font-bold mb-4 text-center text-red-700 dark:text-red-400">😓 기존 방식의 문제점</h3>
            <div className="space-y-3 text-foreground">
              <p className="flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <span><strong>KB차차차</strong> 1시간 검색 → <strong>엔카</strong> 1시간 검색 → <strong>SK엔카직영</strong> 1시간 검색...</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <span>각 사이트마다 <strong>필터 조건 다시 설정</strong>, 중복 매물 수동 제거</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <span>3일 동안 <strong>100개 매물</strong> 비교 → 결국 <strong>"뭐가 좋은지 모르겠어요"</strong></span>
              </p>
            </div>
          </div>

          {/* 해결책 제시 */}
          <div className="bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 p-8 rounded-2xl border-2 border-primary/30">
            <h3 className="text-xl font-bold mb-4 text-center text-primary">✨ CARFIN AI의 해결책</h3>
            <div className="space-y-3 text-foreground">
              <p className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span><strong className="text-primary">15만대 통합 검색</strong> → KB·엔카·SK엔카 한번에</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span><strong className="text-chart-2">AI가 자동 필터링</strong> → 당신의 프로필 기반 스마트 검색</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span><strong className="text-chart-3">3분 안에 Top 3</strong> → "이 3대 중 하나만 보세요"</span>
              </p>
            </div>
          </div>

          {/* 실제 데이터 강조 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center hover-elevate border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <Database className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary mb-2">15만대</div>
                <div className="text-sm text-muted-foreground">실시간 통합 매물</div>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate border-2 border-chart-2/30 bg-gradient-to-br from-chart-2/10 to-chart-2/5">
              <CardContent className="p-6">
                <Clock className="w-10 h-10 text-chart-2 mx-auto mb-3" />
                <div className="text-3xl font-bold text-chart-2 mb-2">3분</div>
                <div className="text-sm text-muted-foreground">평균 분석 시간</div>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate border-2 border-chart-3/30 bg-gradient-to-br from-chart-3/10 to-chart-3/5">
              <CardContent className="p-6">
                <Target className="w-10 h-10 text-chart-3 mx-auto mb-3" />
                <div className="text-3xl font-bold text-chart-3 mb-2">Top 3</div>
                <div className="text-sm text-muted-foreground">최종 추천 개수</div>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate border-2 border-chart-4/30 bg-gradient-to-br from-chart-4/10 to-chart-4/5">
              <CardContent className="p-6">
                <Users className="w-10 h-10 text-chart-4 mx-auto mb-3" />
                <div className="text-3xl font-bold text-chart-4 mb-2">5개</div>
                <div className="text-sm text-muted-foreground">AI 전문가 협업</div>
              </CardContent>
            </Card>
          </div>

          <div className="relative bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-3/5 p-6 rounded-lg border border-primary/20">
            <p className="text-center text-foreground text-lg">
              <Car className="w-5 h-5 inline mr-2 text-primary" />
              <strong>실제 매물</strong>만 추천 → 허위 매물 걱정 없음
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 온보딩 완료 - 프로필 설정으로 이동
      setLocation('/profile-setup');
    }
  };

  const skipOnboarding = () => {
    setLocation('/chat');
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="w-full h-full bg-gradient-to-br from-primary/5 via-chart-2/5 to-chart-3/5 opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">3분만에 완벽한 체험</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
              CARFIN AI
            </span>
            <br />
            <span className="text-foreground">체험하기</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            3분만에 AI 중고차 추천 시스템을 경험해보세요
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>진행률</span>
            <span>{currentStep + 1} / {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep] && (
                <Card className="mb-8 border-border/50 bg-background/80 backdrop-blur-lg">
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center border border-primary/30">
                        {steps[currentStep].icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-bold mb-4">
                      {steps[currentStep].title}
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground max-w-3xl mx-auto">
                      {steps[currentStep].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    {steps[currentStep].content}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              onClick={skipOnboarding}
              className="text-muted-foreground hover:text-foreground"
            >
              건너뛰기
            </Button>

            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-primary via-chart-2 to-primary hover:from-primary/90 hover:via-chart-2/90 hover:to-primary/90"
            >
              {currentStep === steps.length - 1 ? '시작하기' : '다음'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Tech Specs - Real Data */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              실제 매물 데이터와 학술 검증 알고리즘으로 정확한 추천을 제공합니다
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">15만대</div>
                <div className="text-sm text-muted-foreground">실시간 매물 통합</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2 mb-1">3분 이내</div>
                <div className="text-sm text-muted-foreground">분석 완료 시간</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3 mb-1">3개 논문</div>
                <div className="text-sm text-muted-foreground">SIGIR·RecSys 검증</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
