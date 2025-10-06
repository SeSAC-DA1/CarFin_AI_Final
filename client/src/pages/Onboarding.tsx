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
      title: "3명의 AI가 여러분을 도와드려요",
      description: "각자 다른 전문성을 가진 AI들이 협력해서 딱 맞는 차를 찾아드립니다",
      icon: <Users className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover-elevate border-primary/20">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">🧠 분석 AI</h3>
                <p className="text-sm text-muted-foreground">여러분이 원하는 걸 정확히 파악해요</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate border-chart-2/20">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-lg bg-chart-2/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-chart-2" />
                </div>
                <h3 className="font-bold mb-2">🔍 검색 AI</h3>
                <p className="text-sm text-muted-foreground">15만대 중에서 조건에 맞는 차들을 찾아요</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate border-chart-3/20">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-lg bg-chart-3/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-chart-3" />
                </div>
                <h3 className="font-bold mb-2">⭐ 추천 AI</h3>
                <p className="text-sm text-muted-foreground">여러 기준으로 비교해서 베스트 3대를 골라요</p>
              </CardContent>
            </Card>
          </div>
          <div className="relative bg-gradient-to-r from-primary/5 via-chart-2/5 to-chart-3/5 p-6 rounded-lg border border-primary/20">
            <p className="text-center text-foreground">
              <Sparkles className="w-5 h-5 inline mr-2 text-primary" />
              3명이 어떻게 협력하는지 실시간으로 볼 수 있어요
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "검증된 방법으로 안전하게 추천해요",
      description: "세계적으로 인정받은 3가지 방법을 사용해서 믿을 수 있어요",
      icon: <Shield className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Card className="hover-elevate border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/30">글로벌 AI 학회</Badge>
                    <h3 className="font-bold mb-2">🤝 AI들이 서로 협업하는 기술</h3>
                    <p className="text-sm text-muted-foreground">혼자 하는 것보다 여러 AI가 함께 일하면 더 정확해요</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate border-chart-2/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2 bg-chart-2/10 text-chart-2 border-chart-2/30">글로벌 IT기업</Badge>
                    <h3 className="font-bold mb-2">🧠 실시간으로 배우는 AI</h3>
                    <p className="text-sm text-muted-foreground">여러분이 말씀해주시면 바로 학습해서 다음엔 더 잘해요</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate border-chart-3/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-chart-3" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2 bg-chart-3/10 text-chart-3 border-chart-3/30">산업계 표준</Badge>
                    <h3 className="font-bold mb-2">⚖️ 공정한 비교 평가</h3>
                    <p className="text-sm text-muted-foreground">여러 기준을 편견 없이 객관적으로 비교해서 평가해요</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="relative bg-gradient-to-r from-chart-2/10 to-chart-3/10 p-4 rounded-lg border border-chart-2/20">
            <p className="text-center text-foreground">
              <CheckCircle2 className="w-5 h-5 inline mr-2 text-chart-2" />
              학술적으로 검증된 알고리즘으로 85% 이상의 추천 정확도 달성
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "127만대 중에서 숨은 가성비를 발견",
      description: "방대한 데이터에서 당신만을 위한 특별한 차량을 찾아드립니다",
      icon: <Database className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary/20 to-chart-2/20 rounded-full mb-6 border border-primary/30">
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">127,378</span>
            </div>
            <h3 className="text-xl font-bold mb-2">실시간 중고차 데이터</h3>
            <p className="text-muted-foreground mb-6">국내 최대 규모의 중고차 정보를 실시간으로 분석</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center hover-elevate border-primary/20">
              <CardContent className="p-4">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">3분 이내</div>
                <div className="text-sm text-muted-foreground">분석 완료 시간</div>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate border-chart-2/20">
              <CardContent className="p-4">
                <TrendingUp className="w-6 h-6 text-chart-2 mx-auto mb-2" />
                <div className="text-2xl font-bold text-chart-2 mb-1">85%</div>
                <div className="text-sm text-muted-foreground">추천 만족도</div>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate border-chart-3/20">
              <CardContent className="p-4">
                <BarChart3 className="w-6 h-6 text-chart-3 mx-auto mb-2" />
                <div className="text-2xl font-bold text-chart-3 mb-1">5개 기준</div>
                <div className="text-sm text-muted-foreground">종합 평가 항목</div>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate border-chart-4/20">
              <CardContent className="p-4">
                <Target className="w-6 h-6 text-chart-4 mx-auto mb-2" />
                <div className="text-2xl font-bold text-chart-4 mb-1">Top 3</div>
                <div className="text-sm text-muted-foreground">맞춤 추천 결과</div>
              </CardContent>
            </Card>
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

          {/* Quick Stats */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              이미 많은 분들이 CARFIN AI로 차량을 찾고 계십니다
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">15,000+</div>
                <div className="text-sm text-muted-foreground">상담 완료</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2 mb-1">98%</div>
                <div className="text-sm text-muted-foreground">만족도</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3 mb-1">2.5분</div>
                <div className="text-sm text-muted-foreground">평균 상담시간</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}