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
  Zap,
  CheckCircle2,
  Shield,
  Clock,
  Database
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
      title: "5개 AI가 협업합니다",
      description: "각 전문 AI가 역할을 분담하여 최적의 차량을 찾습니다",
      icon: <Users className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Manager */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Manager</h3>
                <p className="text-sm text-muted-foreground">작업 조율</p>
              </CardContent>
            </Card>

            {/* Analyst */}
            <Card className="border-chart-2/20 hover:border-chart-2/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-chart-2" />
                </div>
                <h3 className="font-bold mb-2">Analyst</h3>
                <p className="text-sm text-muted-foreground">프로필 분석</p>
              </CardContent>
            </Card>

            {/* Searcher */}
            <Card className="border-chart-3/20 hover:border-chart-3/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-chart-3" />
                </div>
                <h3 className="font-bold mb-2">Searcher</h3>
                <p className="text-sm text-muted-foreground">차량 검색</p>
              </CardContent>
            </Card>

            {/* Evaluator */}
            <Card className="border-chart-4/20 hover:border-chart-4/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-chart-4" />
                </div>
                <h3 className="font-bold mb-2">Evaluator</h3>
                <p className="text-sm text-muted-foreground">차량 평가</p>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Financial</h3>
                <p className="text-sm text-muted-foreground">비용 분석</p>
              </CardContent>
            </Card>
          </div>

          {/* Flow */}
          <div className="bg-muted/30 p-6 rounded-lg border border-border">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="font-medium">요청</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-primary">분석</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-chart-2">검색</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-chart-3">평가</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-chart-4">추천</span>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">평균 3분 이내 완료</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "검증된 알고리즘",
      description: "SIGIR, RecSys 등 국제 학회 논문 기반 구현",
      icon: <Shield className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* MACRec */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">SIGIR 2024</Badge>
                      <span className="text-sm text-muted-foreground">Google Research</span>
                    </div>
                    <h3 className="font-bold mb-1">MACRec</h3>
                    <p className="text-sm text-muted-foreground">Multi-Agent Collaborative Recommendation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alibaba */}
            <Card className="border-chart-2/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-chart-2" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30">RecSys 2019</Badge>
                      <span className="text-sm text-muted-foreground">Alibaba Group</span>
                    </div>
                    <h3 className="font-bold mb-1">Personalized Re-ranking</h3>
                    <p className="text-sm text-muted-foreground">개인화 점수 기반 재정렬</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TOPSIS */}
            <Card className="border-chart-3/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-chart-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/30">AHP-TOPSIS</Badge>
                      <span className="text-sm text-muted-foreground">Multi-Criteria Decision</span>
                    </div>
                    <h3 className="font-bold mb-1">다기준 의사결정</h3>
                    <p className="text-sm text-muted-foreground">6가지 기준 동시 평가</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border text-center">
            <p className="text-sm">
              <CheckCircle2 className="w-4 h-4 inline mr-2 text-chart-3" />
              <strong>171개 단위 테스트</strong> 통과
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "실시간 매물 분석",
      description: "15만대 데이터를 즉시 검색하고 분석합니다",
      icon: <Database className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="border-primary/20 text-center">
              <CardContent className="p-6">
                <Database className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary mb-1">15만대</div>
                <div className="text-xs text-muted-foreground">통합 매물</div>
              </CardContent>
            </Card>

            <Card className="border-chart-2/20 text-center">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-chart-2 mx-auto mb-3" />
                <div className="text-3xl font-bold text-chart-2 mb-1">3분</div>
                <div className="text-xs text-muted-foreground">분석 시간</div>
              </CardContent>
            </Card>

            <Card className="border-chart-3/20 text-center">
              <CardContent className="p-6">
                <Target className="w-8 h-8 text-chart-3 mx-auto mb-3" />
                <div className="text-3xl font-bold text-chart-3 mb-1">Top 3</div>
                <div className="text-xs text-muted-foreground">추천 차량</div>
              </CardContent>
            </Card>

            <Card className="border-chart-4/20 text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-chart-4 mx-auto mb-3" />
                <div className="text-3xl font-bold text-chart-4 mb-1">5개</div>
                <div className="text-xs text-muted-foreground">AI 협업</div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
              <CheckCircle2 className="w-5 h-5 text-chart-3 flex-shrink-0" />
              <span className="text-sm">KB차차차·엔카 실시간 데이터 통합</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
              <CheckCircle2 className="w-5 h-5 text-chart-3 flex-shrink-0" />
              <span className="text-sm">TOPSIS 6가지 기준 자동 평가</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
              <CheckCircle2 className="w-5 h-5 text-chart-3 flex-shrink-0" />
              <span className="text-sm">TCO 총 소유비용 자동 계산</span>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">실제 매물만 추천</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              CARFIN AI
            </span>
          </h1>
          <p className="text-muted-foreground">멀티에이전트 차량 추천 시스템</p>
        </div>

        {/* Progress */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{currentStep + 1} / {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep] && (
                <Card className="mb-8">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        {steps[currentStep].icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-2">
                      {steps[currentStep].title}
                    </CardTitle>
                    <CardDescription>
                      {steps[currentStep].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {steps[currentStep].content}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={skipOnboarding}
              className="text-muted-foreground"
            >
              건너뛰기
            </Button>

            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? '시작하기' : '다음'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
