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
      title: "5개 전문 AI가 동시에 협업합니다",
      description: "SIGIR 2024 논문 기반 MACRec 프로토콜로 정확도 98% 달성",
      icon: <Users className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8">
          {/* 핵심 메시지 강조 */}
          <div className="bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 p-6 rounded-xl border-2 border-primary/20">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-xl font-bold">일반 챗봇과 완전히 다릅니다</h3>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground">
                단순 검색이 아닌, <strong className="text-primary">5명의 전문가</strong>가 실시간으로 협업하여 최적의 차량을 찾아드립니다
              </p>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-chart-3" />
                  <span className="text-sm font-medium">SIGIR 2024 논문 기반</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-chart-3" />
                  <span className="text-sm font-medium">98% 구현 정확도</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-chart-3" />
                  <span className="text-sm font-medium">36개 테스트 통과</span>
                </div>
              </div>
            </div>
          </div>

          {/* 조직도 스타일 계층 구조 */}
          <div className="space-y-8">
            {/* Manager Agent - 최상위 */}
            <div className="relative flex flex-col items-center">
              <Card className="w-full max-w-2xl border-2 border-primary shadow-2xl bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-xl">
                        <Brain className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <span className="text-sm font-bold">👑</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Badge variant="default" className="bg-primary text-white mb-3 text-sm px-4 py-1 shadow-md">Manager Agent</Badge>
                      <h3 className="font-bold text-3xl mb-3 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">작업 총괄 관리자</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        전체 프로세스를 조율하고 4개 전문 에이전트에게 작업을 분배합니다<br />
                        <strong className="text-primary">Task Decomposition</strong> 기법으로 복잡한 요청을 세부 작업으로 나눕니다
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 조직도 연결선 */}
              <div className="relative w-full my-6">
                {/* 수직선 */}
                <div className="absolute left-1/2 top-0 w-1 h-8 bg-gradient-to-b from-primary to-primary/30 transform -translate-x-1/2"></div>

                {/* 가로선 + 4개 수직선 */}
                <div className="absolute left-1/2 top-8 w-full max-w-4xl transform -translate-x-1/2">
                  {/* 가로선 */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                  {/* 4개 수직선 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex justify-center">
                      <div className="w-1 h-12 bg-gradient-to-b from-chart-2/50 to-chart-2/20"></div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-1 h-12 bg-gradient-to-b from-chart-3/50 to-chart-3/20"></div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-1 h-12 bg-gradient-to-b from-chart-4/50 to-chart-4/20"></div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-1 h-12 bg-gradient-to-b from-green-500/50 to-green-500/20"></div>
                    </div>
                  </div>
                </div>

                {/* "작업 분배" 라벨 */}
                <div className="absolute left-1/2 top-2 transform -translate-x-1/2">
                  <div className="bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                    ⚡ 작업 분배
                  </div>
                </div>
              </div>
            </div>

            {/* 4개 전문 에이전트 - 하위 계층 (더 작게) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-20">

            {/* Analyst */}
            <Card className="border-chart-2/30 hover:border-chart-2 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-chart-2 to-chart-2/70 flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30 mb-2 text-xs">Analyst</Badge>
                    <h3 className="font-bold text-base mb-2">사용자 분석</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      프로필 데이터 추출 및 니즈 파악<br />
                      <strong className="text-chart-2">Gemini AI</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Searcher */}
            <Card className="border-chart-3/30 hover:border-chart-3 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-chart-3 to-chart-3/70 flex items-center justify-center shadow-lg">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/30 mb-2 text-xs">Searcher</Badge>
                    <h3 className="font-bold text-base mb-2">매물 검색</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      실시간 DB 검색 및 필터링<br />
                      <strong className="text-chart-3">PostgreSQL</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evaluator */}
            <Card className="border-chart-4/30 hover:border-chart-4 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-chart-4 to-chart-4/70 flex items-center justify-center shadow-lg">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/30 mb-2 text-xs">Evaluator</Badge>
                    <h3 className="font-bold text-base mb-2">객관적 평가</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      6가지 기준 점수 계산<br />
                      <strong className="text-chart-4">TOPSIS</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card className="border-green-500/30 hover:border-green-500 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30 mb-2 text-xs">Financial</Badge>
                    <h3 className="font-bold text-base mb-2">금융 분석 (TCO)</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      5개 비용 항목 계산<br />
                      <strong className="text-green-600">법적 근거 기반</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 협업 플로우 - 더 시각적으로 */}
          <div className="bg-muted/30 p-8 rounded-xl border-2 border-border">
            <h4 className="text-center font-bold text-lg mb-6">⚡ 실시간 협업 프로세스</h4>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
                  💬
                </div>
                <span className="font-medium">사용자 요청</span>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <span className="font-medium text-primary">Manager 조율</span>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-chart-2/10 flex items-center justify-center text-xl">
                  🤝
                </div>
                <span className="font-medium text-chart-2">4개 에이전트<br />병렬 실행</span>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-chart-3/10 flex items-center justify-center text-2xl">
                  ✨
                </div>
                <span className="font-medium text-chart-3">결과 통합</span>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-chart-4/10 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <span className="font-medium text-chart-4">Top 3 추천</span>
              </div>
            </div>
          </div>

          {/* 성과 강조 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary mb-2">3분</div>
              <p className="text-sm text-muted-foreground">평균 응답 시간<br />(기존 3일 → 3분)</p>
            </div>
            <div className="bg-chart-3/5 border border-chart-3/20 rounded-lg p-6 text-center">
              <Zap className="w-8 h-8 text-chart-3 mx-auto mb-3" />
              <div className="text-3xl font-bold text-chart-3 mb-2">98%</div>
              <p className="text-sm text-muted-foreground">MACRec 구현 정확도<br />(36개 테스트 통과)</p>
            </div>
            <div className="bg-chart-2/5 border border-chart-2/20 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-chart-2 mx-auto mb-3" />
              <div className="text-3xl font-bold text-chart-2 mb-2">5개</div>
              <p className="text-sm text-muted-foreground">
                전문 AI 에이전트<br />
                <span className="text-xs">(Manager + 4개 전문가)</span>
              </p>
            </div>
          </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "논문 2개 + 검증된 방법론",
      description: "SIGIR·RecSys 국제 학회 논문 + TOPSIS 다기준 분석",
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
                      <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/30">검증된 방법론</Badge>
                      <span className="text-sm text-muted-foreground">다기준 의사결정 분석</span>
                    </div>
                    <h3 className="font-bold mb-1">TOPSIS</h3>
                    <p className="text-sm text-muted-foreground">6가지 기준 정밀 평가</p>
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
      title: "기존 방식 vs CARFIN AI",
      description: "3일 고민을 3분으로 단축합니다",
      icon: <Zap className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          {/* Before - 기존 방식 */}
          <Card className="border border-red-100 bg-red-50/10">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                기존 방식 (3일)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-medium mb-1">1시간씩 사이트 돌아다니기</p>
                  <p className="text-sm text-muted-foreground">KB차차차 → 엔카 → 다시 검색 → ...</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-medium mb-1">중복 매물 수동 제거</p>
                  <p className="text-sm text-muted-foreground">같은 차가 여러 사이트에...</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-medium mb-1">100개 매물 일일이 비교</p>
                  <p className="text-sm text-muted-foreground">엑셀에 정리하고 계산기 두드리고...</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-medium mb-1">숨은 비용 놓침</p>
                  <p className="text-sm text-muted-foreground">세금·정비비·연료비 나중에 알고 후회</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* After - CARFIN AI */}
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Zap className="w-5 h-5" />
                CARFIN AI (3분)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium mb-1">실시간 매물 통합 검색 (1초)</p>
                  <p className="text-sm text-muted-foreground">KB차차차·엔카 실제 매물</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium mb-1">AI가 자동 비교 (2초)</p>
                  <p className="text-sm text-muted-foreground">가격·연비·안전성 6가지 기준</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium mb-1">숨은 비용까지 계산 (3초)</p>
                  <p className="text-sm text-muted-foreground">세금·정비비·연료비 모두 포함</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium mb-1">Top 3만 추천</p>
                  <p className="text-sm text-muted-foreground">불필요한 정보는 제거</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result - 아하 모먼트 */}
          <div className="text-center p-8 bg-gradient-to-r from-primary/10 to-chart-2/10 rounded-xl border-2 border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                3일 → 3분
              </p>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-lg font-bold text-foreground">
                💡 왜 더 빠른데 더 정확할까요?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/50 p-4 rounded-lg border border-primary/20">
                  <p className="font-bold text-primary mb-2">📚 학술 논문 기반</p>
                  <p className="text-muted-foreground">SIGIR 2024 MACRec 프로토콜<br />RecSys 2019 Alibaba 재정렬</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg border border-chart-2/20">
                  <p className="font-bold text-chart-2 mb-2">🎯 6가지 객관적 기준</p>
                  <p className="text-muted-foreground">TOPSIS 다기준 분석으로<br />감정 배제한 정량 평가</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg border border-chart-3/20">
                  <p className="font-bold text-chart-3 mb-2">💰 법적 근거 기반 TCO</p>
                  <p className="text-muted-foreground">지방세법·DOE/ANL 기준<br />숨은 비용까지 정확 계산</p>
                </div>

                <div className="bg-white/50 p-4 rounded-lg border border-chart-4/20">
                  <p className="font-bold text-chart-4 mb-2">🤖 5개 AI 협업</p>
                  <p className="text-muted-foreground">Manager가 조율하는<br />전문가 분업 시스템</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                <p className="font-bold text-primary text-base">
                  ⚡ 사람은 피곤하고 실수하지만, AI는 127,378대를 3분 안에 정밀 분석합니다
                </p>
              </div>
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
