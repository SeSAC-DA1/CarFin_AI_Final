import { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Target,
  Zap,
  Users,
  Star,
  CheckCircle,
  Eye
} from 'lucide-react';

interface UserProfile {
  price_sensitivity: number;
  safety_priority: number;
  fuel_efficiency_importance: number;
  brand_preference: number;
  year_preference: number;
  family_usage: number;
  confidence_score: number;
}

interface VehicleCandidate {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  originalRank: number;
  personalizedScore: number;
  personalizedRank: number;
  isTopThree: boolean;
  scoreContributions: Record<string, number>;
}

// interface ReRankingProcess {
//   originalCandidates: VehicleCandidate[];
//   userProfile: UserProfile;
//   algorithmSteps: ReRankingStep[];
//   finalTopThree: VehicleCandidate[];
//   totalProcessingTime: number;
// }

interface ReRankingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  processingTime?: number | undefined;
  result?: string | undefined;
}

interface FeedbackUpdate {
  feedback: string;
  profileChanges: Record<string, { from: number; to: number; change: number }>;
  explanation: string;
  needsReRanking: boolean;
}

interface PersonalizationTransparencyDashboardProps {
  isActive: boolean;
  userQuery: string;
  onComplete: () => void;
  className?: string;
}

export default function PersonalizationTransparencyDashboard({
  isActive,
  userQuery,
  onComplete,
  className = ''
}: PersonalizationTransparencyDashboardProps) {
  const [currentStep, setCurrentStep] = useState<string>('profile_extraction');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    price_sensitivity: 0.0,
    safety_priority: 0.0,
    fuel_efficiency_importance: 0.0,
    brand_preference: 0.0,
    year_preference: 0.0,
    family_usage: 0.0,
    confidence_score: 0.0
  });

  const [vehicleCandidates, setVehicleCandidates] = useState<VehicleCandidate[]>([]);
  const [reRankingSteps, setReRankingSteps] = useState<ReRankingStep[]>([
    {
      id: 'feature_extraction',
      name: 'Feature Extraction',
      description: '50개 후보 차량의 특성 벡터 추출',
      status: 'pending'
    },
    {
      id: 'profile_matching',
      name: 'Profile Matching',
      description: '사용자 프로필과 차량 특성 매칭',
      status: 'pending'
    },
    {
      id: 'personalized_scoring',
      name: 'Personalized Scoring',
      description: 'Alibaba 알고리즘으로 개인화 점수 계산',
      status: 'pending'
    },
    {
      id: 'diversity_boosting',
      name: 'Diversity Boosting',
      description: '다양성 보정 및 최종 순위 결정',
      status: 'pending'
    }
  ]);

  const [feedbackUpdate, setFeedbackUpdate] = useState<FeedbackUpdate | null>(null);
  const [simulationPhase, setSimulationPhase] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);

  useEffect(() => {
    if (isActive && !startTime) {
      setStartTime(new Date());
      startPersonalizationSimulation();
    }
  }, [isActive]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setExecutionTime(Date.now() - startTime.getTime());
      }, 100);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [startTime]);

  const startPersonalizationSimulation = async () => {
    console.log('🎯 Alibaba Re-ranking 개인화 시뮬레이션 시작:', userQuery);

    // Phase 1: 사용자 프로필 추출
    await simulateProfileExtraction();

    // Phase 2: 후보 차량 생성
    await simulateCandidateGeneration();

    // Phase 3: Re-ranking 과정
    await simulateReRankingProcess();

    // Phase 4: 결과 표시
    await simulateResultsDisplay();

    // 완료
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const simulateProfileExtraction = async () => {
    setCurrentStep('profile_extraction');

    await delay(1200); // 500ms → 1200ms (사용자가 읽을 시간 확보)

    // 시뮬레이션된 프로필 (쿼리 기반)
    const extractedProfile: UserProfile = {
      price_sensitivity: userQuery.includes('저렴') || userQuery.includes('3000') ? 0.8 : 0.4,
      safety_priority: userQuery.includes('가족') || userQuery.includes('안전') ? 0.9 : 0.5,
      fuel_efficiency_importance: userQuery.includes('연비') || userQuery.includes('출퇴근') ? 0.8 : 0.3,
      brand_preference: userQuery.includes('현대') || userQuery.includes('기아') ? 0.7 : 0.2,
      year_preference: userQuery.includes('신차') || userQuery.includes('최신') ? 0.8 : 0.4,
      family_usage: userQuery.includes('가족') || userQuery.includes('SUV') ? 0.9 : 0.2,
      confidence_score: 0.85
    };

    // 애니메이션으로 프로필 값 증가
    await animateProfileUpdate(extractedProfile);
    setSimulationPhase(1);
  };

  const animateProfileUpdate = async (targetProfile: UserProfile) => {
    const steps = 30; // 20 → 30 단계로 증가
    const delay = 80; // 50ms → 80ms (총 2.4초)

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentProfile: UserProfile = {
        price_sensitivity: targetProfile.price_sensitivity * progress,
        safety_priority: targetProfile.safety_priority * progress,
        fuel_efficiency_importance: targetProfile.fuel_efficiency_importance * progress,
        brand_preference: targetProfile.brand_preference * progress,
        year_preference: targetProfile.year_preference * progress,
        family_usage: targetProfile.family_usage * progress,
        confidence_score: targetProfile.confidence_score * progress
      };

      setUserProfile(currentProfile);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  const simulateCandidateGeneration = async () => {
    setCurrentStep('candidate_generation');

    await delay(800); // 300ms → 800ms (후보 생성 시간 시각화)

    // 50개 후보 차량 시뮬레이션 (일부만 표시)
    const mockCandidates: VehicleCandidate[] = [
      {
        id: '1',
        manufacturer: '현대',
        model: '팰리세이드',
        year: 2023,
        price: 4200,
        originalRank: 5,
        personalizedScore: 0,
        personalizedRank: 0,
        isTopThree: false,
        scoreContributions: {}
      },
      {
        id: '2',
        manufacturer: '기아',
        model: '쏘렌토',
        year: 2022,
        price: 3800,
        originalRank: 8,
        personalizedScore: 0,
        personalizedRank: 0,
        isTopThree: false,
        scoreContributions: {}
      },
      {
        id: '3',
        manufacturer: '현대',
        model: '싼타페',
        year: 2023,
        price: 3500,
        originalRank: 12,
        personalizedScore: 0,
        personalizedRank: 0,
        isTopThree: false,
        scoreContributions: {}
      },
      {
        id: '4',
        manufacturer: '벤츠',
        model: 'GLE',
        year: 2022,
        price: 7800,
        originalRank: 1,
        personalizedScore: 0,
        personalizedRank: 0,
        isTopThree: false,
        scoreContributions: {}
      },
      {
        id: '5',
        manufacturer: 'BMW',
        model: 'X5',
        year: 2022,
        price: 7200,
        originalRank: 2,
        personalizedScore: 0,
        personalizedRank: 0,
        isTopThree: false,
        scoreContributions: {}
      }
    ];

    setVehicleCandidates(mockCandidates);
    setSimulationPhase(2);
  };

  const simulateReRankingProcess = async () => {
    setCurrentStep('re_ranking');

    // 각 단계별 실행 (단계 간 delay 증가)
    for (const step of reRankingSteps) {
      await executeReRankingStep(step.id);
      await delay(1000); // 400ms → 1000ms (각 단계를 명확히 보여줌)
    }

    // 최종 개인화 점수 계산 및 순위 재정렬
    await calculatePersonalizedScores();
    setSimulationPhase(3);
  };

  const executeReRankingStep = async (stepId: string) => {
    updateStepStatus(stepId, 'processing');

    await delay(700); // 300ms → 700ms (각 세부 단계도 천천히)

    let result = '';
    switch (stepId) {
      case 'feature_extraction':
        result = '50개 차량 × 12개 특성 = 600개 특성 벡터 생성';
        break;
      case 'profile_matching':
        result = `신뢰도 ${Math.round(userProfile.confidence_score * 100)}% 프로필과 매칭 완료`;
        break;
      case 'personalized_scoring':
        result = 'Alibaba RecSys 2019 알고리즘 적용 완료';
        break;
      case 'diversity_boosting':
        result = '다양성 팩터 0.1 적용, Top 3 선택 완료';
        break;
    }

    updateStepStatus(stepId, 'completed', result);
  };

  const calculatePersonalizedScores = async () => {
    const updatedCandidates = vehicleCandidates.map((candidate) => {
      // 개인화 점수 계산 (시뮬레이션)
      let personalizedScore = 0.7; // 기본 점수

      const scoreContributions: Record<string, number> = {};

      // 가격 민감도
      if (userProfile.price_sensitivity > 0.5) {
        const priceBonus = Math.max(0, (5000 - candidate.price) / 5000) * 0.2 * userProfile.price_sensitivity;
        personalizedScore += priceBonus;
        scoreContributions['가격 적합성'] = priceBonus;
      }

      // 안전성 우선순위
      if (userProfile.safety_priority > 0.5 && ['현대', '기아', '볼보'].includes(candidate.manufacturer)) {
        const safetyBonus = 0.15 * userProfile.safety_priority;
        personalizedScore += safetyBonus;
        scoreContributions['안전성'] = safetyBonus;
      }

      // 가족 사용
      if (userProfile.family_usage > 0.5 && ['팰리세이드', '쏘렌토', '싼타페'].includes(candidate.model)) {
        const familyBonus = 0.2 * userProfile.family_usage;
        personalizedScore += familyBonus;
        scoreContributions['가족 적합성'] = familyBonus;
      }

      // 브랜드 선호도
      if (userProfile.brand_preference > 0.5 && ['현대', '기아'].includes(candidate.manufacturer)) {
        const brandBonus = 0.1 * userProfile.brand_preference;
        personalizedScore += brandBonus;
        scoreContributions['브랜드 선호'] = brandBonus;
      }

      return {
        ...candidate,
        personalizedScore: Math.min(1, personalizedScore),
        scoreContributions
      };
    });

    // 개인화 점수로 재정렬
    updatedCandidates.sort((a, b) => b.personalizedScore - a.personalizedScore);

    // 새로운 순위 할당
    const reRankedCandidates = updatedCandidates.map((candidate, index) => ({
      ...candidate,
      personalizedRank: index + 1,
      isTopThree: index < 3
    }));

    setVehicleCandidates(reRankedCandidates);
  };

  const simulateResultsDisplay = async () => {
    setCurrentStep('results_display');
    await delay(1200); // 500ms → 1200ms (결과 표시 시간 확보)
    setCurrentStep('completed');
    setSimulationPhase(4);
  };

  const simulateFeedbackUpdate = async (feedback: string) => {
    // 피드백 기반 프로필 업데이트 시뮬레이션
    const profileChanges: Record<string, { from: number; to: number; change: number }> = {};

    if (feedback.includes('비싸')) {
      const oldValue = userProfile.price_sensitivity;
      const newValue = Math.min(1, oldValue + 0.2);
      profileChanges['price_sensitivity'] = { from: oldValue, to: newValue, change: newValue - oldValue };
    }

    if (feedback.includes('안전')) {
      const oldValue = userProfile.safety_priority;
      const newValue = Math.min(1, oldValue + 0.3);
      profileChanges['safety_priority'] = { from: oldValue, to: newValue, change: newValue - oldValue };
    }

    const updateResult: FeedbackUpdate = {
      feedback,
      profileChanges,
      explanation: `피드백 "${feedback}"을 반영하여 선호도를 조정했습니다.`,
      needsReRanking: Object.keys(profileChanges).length > 0
    };

    setFeedbackUpdate(updateResult);

    // 프로필 업데이트
    if (Object.keys(profileChanges).length > 0) {
      const updatedProfile = { ...userProfile };
      Object.entries(profileChanges).forEach(([key, change]) => {
        (updatedProfile as any)[key] = change.to;
      });
      setUserProfile(updatedProfile);

      // 재순위 계산
      await calculatePersonalizedScores();
    }
  };

  const updateStepStatus = (stepId: string, status: ReRankingStep['status'], result?: string) => {
    setReRankingSteps(prev => prev.map(step =>
      step.id === stepId
        ? {
            ...step,
            status,
            result: result !== undefined ? result : undefined,
            processingTime: status === 'completed' ? Date.now() : (step.processingTime !== undefined ? step.processingTime : undefined)
          }
        : step
    ));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getProfileLabel = (key: string): string => {
    const labels: Record<string, string> = {
      price_sensitivity: '가격 민감도',
      safety_priority: '안전성 중시',
      fuel_efficiency_importance: '연비 중요도',
      brand_preference: '브랜드 선호',
      year_preference: '최신차 선호',
      family_usage: '가족 사용',
      confidence_score: '분석 신뢰도'
    };
    return labels[key] || key;
  };

  const getProfileColor = (value: number): string => {
    if (value >= 0.8) return 'text-green-600 dark:text-green-400';
    if (value >= 0.6) return 'text-blue-600 dark:text-blue-400';
    if (value >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (!isActive) return null;

  return (
    <div className={`bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-primary/20 p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-bold text-foreground">
              개인 맞춤 추천 시스템 (학술논문 검증)
            </h3>
            <p className="text-sm text-muted-foreground">
              대화 분석 → 개인 선호도 파악 → 나만의 순위 계산
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4" />
          <span>{(executionTime / 1000).toFixed(1)}초</span>
        </div>
      </div>

      {/* 현재 단계 */}
      <div className="flex items-center space-x-2 mb-6 p-3 bg-background/60 rounded-lg border border-primary/10">
        {currentStep === 'profile_extraction' && <Brain className="w-5 h-5 text-primary animate-pulse" />}
        {currentStep === 'candidate_generation' && <Target className="w-5 h-5 text-primary animate-pulse" />}
        {currentStep === 're_ranking' && <BarChart3 className="w-5 h-5 text-primary animate-pulse" />}
        {currentStep === 'results_display' && <Star className="w-5 h-5 text-primary animate-pulse" />}
        {currentStep === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}

        <span className="font-medium text-foreground">
          {currentStep === 'profile_extraction' && '1️⃣ 대화에서 사용자 선호도 추출 중'}
          {currentStep === 'candidate_generation' && '2️⃣ 50개 후보 차량 준비 중'}
          {currentStep === 're_ranking' && '3️⃣ 나만의 맞춤 순위 계산 중'}
          {currentStep === 'results_display' && '4️⃣ Top 3 결과 생성 중'}
          {currentStep === 'completed' && '✅ 개인화 추천 완료'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 사용자 프로필 실시간 학습 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center">
            <Users className="w-4 h-4 mr-2" />
            실시간 프로필 학습
          </h4>

          <div className="space-y-3">
            {Object.entries(userProfile).map(([key, value]) => (
              <div key={key} className="p-3 bg-background/60 rounded-lg border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {getProfileLabel(key)}
                  </span>
                  <span className={`text-sm font-bold ${getProfileColor(value)}`}>
                    {Math.round(value * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      value >= 0.8 ? 'bg-green-500' :
                      value >= 0.6 ? 'bg-blue-500' :
                      value >= 0.4 ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                {key === 'confidence_score' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    대화 분석 신뢰도
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 피드백 업데이트 시뮬레이션 */}
          <div className="mt-4">
            <h5 className="font-medium text-foreground mb-2">피드백 학습 테스트</h5>
            <div className="flex gap-2">
              <button
                onClick={() => simulateFeedbackUpdate('너무 비싸요')}
                className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                "너무 비싸요"
              </button>
              <button
                onClick={() => simulateFeedbackUpdate('안전이 중요해요')}
                className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                "안전이 중요해요"
              </button>
            </div>
          </div>
        </div>

        {/* Re-ranking 과정 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            개인 맞춤 계산 과정
          </h4>

          <div className="space-y-3">
            {reRankingSteps.map((step) => (
              <div key={step.id} className="p-3 bg-background/60 rounded-lg border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{step.name}</span>
                  <div className="flex items-center space-x-2">
                    {step.status === 'pending' && <Eye className="w-4 h-4 text-gray-400" />}
                    {step.status === 'processing' && <RefreshCw className="w-4 h-4 text-primary animate-spin" />}
                    {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
                {step.result && (
                  <div className="text-xs text-primary mt-1 font-medium">{step.result}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 후보 차량 재순위 결과 */}
      {vehicleCandidates.length > 0 && simulationPhase >= 3 && (
        <div className="mt-6">
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            50개 후보 → Top 3 재순위 결과
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicleCandidates.filter(v => v.isTopThree).map((vehicle, index) => (
              <div key={vehicle.id} className={`p-4 rounded-lg border ${
                index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
                index === 1 ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600' :
                'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-foreground">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {vehicle.manufacturer} {vehicle.model}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {vehicle.originalRank}위 → {vehicle.personalizedRank}위
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  {vehicle.year}년 • {vehicle.price.toLocaleString()}만원
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">개인화 점수</span>
                  <span className="font-bold text-primary">
                    {Math.round(vehicle.personalizedScore * 100)}점
                  </span>
                </div>

                {/* 점수 기여도 */}
                <div className="space-y-1">
                  {Object.entries(vehicle.scoreContributions).map(([factor, contribution]) => (
                    <div key={factor} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{factor}</span>
                      <span className="text-green-600 dark:text-green-400">
                        +{Math.round(contribution * 100)}점
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 피드백 업데이트 결과 */}
      {feedbackUpdate && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            실시간 피드백 학습 결과
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-400">
            <div className="mb-2">피드백: "{feedbackUpdate.feedback}"</div>
            <div className="mb-2">{feedbackUpdate.explanation}</div>
            {Object.entries(feedbackUpdate.profileChanges).map(([key, change]) => (
              <div key={key} className="text-xs">
                • {getProfileLabel(key)}: {Math.round(change.from * 100)}% → {Math.round(change.to * 100)}%
                <span className="text-green-600 dark:text-green-400 ml-1">
                  (+{Math.round(change.change * 100)}%)
                </span>
              </div>
            ))}
            {feedbackUpdate.needsReRanking && (
              <div className="mt-2 text-xs font-medium">
                ⚡ 0.3초 내 재순위 계산 완료 (DB 재검색 없음)
              </div>
            )}
          </div>
        </div>
      )}

      {/* 완료 시 요약 */}
      {currentStep === 'completed' && (
        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm text-foreground space-y-1">
            <div className="font-medium">🎯 나만의 맞춤 추천 완료!</div>
            <div>• 대화 분석 → 개인 취향 파악 (정확도: {Math.round(userProfile.confidence_score * 100)}%)</div>
            <div>• 50개 후보 → 개인별 점수 계산</div>
            <div>• 다양성 고려 → 최고 3개 선택</div>
            <div>• 피드백 반영 → 실시간 학습</div>
            <div className="pt-2 text-xs text-muted-foreground">
              💫 검증된 학술 알고리즘으로 투명하고 정확한 개인 맞춤 추천을 제공했습니다
            </div>
          </div>
        </div>
      )}
    </div>
  );
}