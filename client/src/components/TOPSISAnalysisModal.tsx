import { useState, useEffect } from 'react';
import {
  X,
  BarChart3,
  Award,
  Calculator,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  CheckCircle,
  AlertTriangle,
  Star,
  Eye,
  Zap,
  Trophy
} from 'lucide-react';

interface Vehicle {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  displacement?: number;
  location?: string;
}

interface CriteriaWeight {
  id: string;
  name: string;
  weight: number;
  type: 'benefit' | 'cost';
  description: string;
  userImportance: number;
}

interface TOPSISStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  result?: string;
  calculation?: string;
}

interface PeerVehicle {
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  normalizedScore: number;
  rank: number;
}

interface TOPSISResult {
  overallScore: number;
  rank: number;
  totalPeers: number;
  percentile: number;
  idealDistance: number;
  antiIdealDistance: number;
  criteriaScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

interface TOPSISAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  className?: string;
}

export default function TOPSISAnalysisModal({
  isOpen,
  onClose,
  vehicle,
  className = ''
}: TOPSISAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<'process' | 'results' | 'comparison'>('process');
  const [currentStep, setCurrentStep] = useState<string>('initialization');
  const [topsisSteps, setTopsisSteps] = useState<TOPSISStep[]>([
    {
      id: 'normalization',
      name: '정규화 (Normalization)',
      description: '모든 기준을 0-1 스케일로 변환',
      status: 'pending'
    },
    {
      id: 'weighting',
      name: '가중치 적용 (Weighting)',
      description: 'AHP 방법론으로 계산된 가중치 적용',
      status: 'pending'
    },
    {
      id: 'ideal_solutions',
      name: '이상해 계산 (Ideal Solutions)',
      description: '최고/최악 이상적 대안 결정',
      status: 'pending'
    },
    {
      id: 'distance_calculation',
      name: '거리 계산 (Distance Calculation)',
      description: '유클리드 거리로 이상해까지의 거리 측정',
      status: 'pending'
    },
    {
      id: 'closeness_coefficient',
      name: '근접계수 (Closeness Coefficient)',
      description: '최종 TOPSIS 점수 계산',
      status: 'pending'
    }
  ]);

  const [criteriaWeights] = useState<CriteriaWeight[]>([
    {
      id: 'price',
      name: '가격 경쟁력',
      weight: 0.25,
      type: 'cost',
      description: '동급 대비 가격 적정성',
      userImportance: 0.8
    },
    {
      id: 'mileage',
      name: '주행거리',
      weight: 0.20,
      type: 'cost',
      description: '차량 사용 정도 (낮을수록 좋음)',
      userImportance: 0.7
    },
    {
      id: 'year',
      name: '연식',
      weight: 0.15,
      type: 'benefit',
      description: '차량 신정도 (높을수록 좋음)',
      userImportance: 0.6
    },
    {
      id: 'fuel_efficiency',
      name: '연비 효율성',
      weight: 0.15,
      type: 'benefit',
      description: '연료 경제성',
      userImportance: 0.7
    },
    {
      id: 'safety',
      name: '안전성',
      weight: 0.15,
      type: 'benefit',
      description: '브랜드 안전성 점수',
      userImportance: 0.9
    },
    {
      id: 'options',
      name: '옵션 충실도',
      weight: 0.10,
      type: 'benefit',
      description: '편의 옵션 구성',
      userImportance: 0.5
    }
  ]);

  const [topsisResult, setTopsisResult] = useState<TOPSISResult | null>(null);
  const [peerVehicles, setPeerVehicles] = useState<PeerVehicle[]>([]);
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startTOPSISAnalysis();
    }
  }, [isOpen]);

  const startTOPSISAnalysis = async () => {
    setIsAnalysisRunning(true);
    setCurrentStep('initialization');

    // 동급 차량 생성 (시뮬레이션)
    generatePeerVehicles();

    // TOPSIS 단계별 실행
    for (const step of topsisSteps) {
      await executeTOPSISStep(step.id);
      await delay(600);
    }

    // 최종 결과 계산
    calculateFinalTOPSISResult();

    setCurrentStep('completed');
    setIsAnalysisRunning(false);
  };

  const generatePeerVehicles = () => {
    // 동급 차량 시뮬레이션 데이터
    const mockPeers: PeerVehicle[] = [
      { manufacturer: '현대', model: '팰리세이드', year: 2023, price: 4200, normalizedScore: 0.95, rank: 1 },
      { manufacturer: '기아', model: '쏘렌토', year: 2022, price: 3800, normalizedScore: 0.87, rank: 2 },
      { manufacturer: '현대', model: '싼타페', year: 2023, price: 3500, normalizedScore: 0.83, rank: 3 },
      { manufacturer: 'GM', model: '트래버스', year: 2022, price: 4500, normalizedScore: 0.79, rank: 4 },
      { manufacturer: '폭스바겐', model: '티구안', year: 2021, price: 3900, normalizedScore: 0.76, rank: 5 },
      { manufacturer: '닛산', model: '엑스트레일', year: 2022, price: 3600, normalizedScore: 0.72, rank: 6 },
      { manufacturer: '혼다', model: 'CR-V', year: 2021, price: 3400, normalizedScore: 0.68, rank: 7 },
      { manufacturer: '토요타', model: 'RAV4', year: 2022, price: 3800, normalizedScore: 0.65, rank: 8 }
    ];

    setPeerVehicles(mockPeers);
  };

  const executeTOPSISStep = async (stepId: string) => {
    updateStepStatus(stepId, 'processing');

    let result = '';
    let calculation = '';

    switch (stepId) {
      case 'normalization':
        result = '6개 기준 × 18개 동급 차량 정규화 완료';
        calculation = '모든 기준을 동일한 척도(0~1)로 변환';
        break;
      case 'weighting':
        result = 'AHP 가중치 벡터 적용 완료';
        calculation = '각 기준의 중요도를 반영한 점수 계산';
        break;
      case 'ideal_solutions':
        result = '이상해(A+) 및 부정이상해(A-) 결정';
        calculation = '가장 좋은 조건과 가장 나쁜 조건 기준점 설정';
        break;
      case 'distance_calculation':
        result = '유클리드 거리 계산 완료';
        calculation = '이상적 조건과 현실 차량 간 차이 측정';
        break;
      case 'closeness_coefficient':
        result = 'TOPSIS 최종 점수 도출';
        calculation = '좋은 조건에 가까울수록 높은 점수 부여';
        break;
    }

    updateStepStatus(stepId, 'completed', result, calculation);
  };

  const calculateFinalTOPSISResult = () => {
    // 시뮬레이션된 TOPSIS 결과
    const vehicleScore = 0.85; // 시뮬레이션
    const rank = 3;
    const totalPeers = peerVehicles.length;
    const percentile = Math.round(((totalPeers - rank + 1) / totalPeers) * 100);

    const criteriaScores: Record<string, number> = {
      price: 0.75,        // 가격 경쟁력 75%
      mileage: 0.65,      // 주행거리 65%
      year: 0.90,         // 연식 90%
      fuel_efficiency: 0.70, // 연비 70%
      safety: 0.95,       // 안전성 95%
      options: 0.60       // 옵션 60%
    };

    const strengths = ['최신 연식', '높은 안전성', '브랜드 신뢰도'];
    const weaknesses = ['높은 주행거리', '제한적 옵션'];

    let recommendation: TOPSISResult['recommendation'];
    if (vehicleScore >= 0.9) recommendation = 'EXCELLENT';
    else if (vehicleScore >= 0.8) recommendation = 'GOOD';
    else if (vehicleScore >= 0.7) recommendation = 'FAIR';
    else recommendation = 'POOR';

    setTopsisResult({
      overallScore: vehicleScore,
      rank,
      totalPeers,
      percentile,
      idealDistance: 0.15,
      antiIdealDistance: 0.85,
      criteriaScores,
      strengths,
      weaknesses,
      recommendation
    });
  };

  const updateStepStatus = (stepId: string, status: TOPSISStep['status'], result?: string, calculation?: string) => {
    setTopsisSteps(prev => prev.map(step =>
      step.id === stepId
        ? { ...step, status, result, calculation }
        : step
    ));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getCriteriaIcon = (criteriaId: string) => {
    const icons: Record<string, JSX.Element> = {
      price: <DollarSign className="w-4 h-4" />,
      mileage: <Gauge className="w-4 h-4" />,
      year: <Calendar className="w-4 h-4" />,
      fuel_efficiency: <Fuel className="w-4 h-4" />,
      safety: <Shield className="w-4 h-4" />,
      options: <Settings className="w-4 h-4" />
    };
    return icons[criteriaId] || <BarChart3 className="w-4 h-4" />;
  };

  const getRecommendationColor = (recommendation: TOPSISResult['recommendation']) => {
    switch (recommendation) {
      case 'EXCELLENT': return 'text-green-600 dark:text-green-400';
      case 'GOOD': return 'text-blue-600 dark:text-blue-400';
      case 'FAIR': return 'text-yellow-600 dark:text-yellow-400';
      case 'POOR': return 'text-red-600 dark:text-red-400';
    }
  };

  const getRecommendationLabel = (recommendation: TOPSISResult['recommendation']) => {
    switch (recommendation) {
      case 'EXCELLENT': return '적극 추천';
      case 'GOOD': return '추천';
      case 'FAIR': return '보통';
      case 'POOR': return '비추천';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-background rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden ${className}`}>

        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                차량 분석 대시보드
              </h2>
              <p className="text-sm text-muted-foreground">
                {vehicle.manufacturer} {vehicle.model} ({vehicle.year}년) • 6가지 기준 종합 평가
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-border">
          {[
            { id: 'process', label: '평가 과정', icon: <Calculator className="w-4 h-4" /> },
            { id: 'results', label: '분석 결과', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'comparison', label: '동급 비교', icon: <Trophy className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary bg-primary/5 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">

          {/* TOPSIS 과정 탭 */}
          {activeTab === 'process' && (
            <div className="space-y-6">

              {/* 기준 가중치 */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  AHP 기준 가중치
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criteriaWeights.map((criteria) => (
                    <div key={criteria.id} className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCriteriaIcon(criteria.id)}
                          <span className="font-medium text-foreground">{criteria.name}</span>
                        </div>
                        <span className="font-bold text-primary">
                          {Math.round(criteria.weight * 100)}%
                        </span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${criteria.weight * 100}%` }}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">{criteria.description}</p>

                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-muted-foreground">
                          {criteria.type === 'benefit' ? '높을수록 좋음' : '낮을수록 좋음'}
                        </span>
                        <span className="text-primary">
                          사용자 중요도: {Math.round(criteria.userImportance * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOPSIS 단계별 과정 */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  TOPSIS 계산 과정
                </h3>

                <div className="space-y-4">
                  {topsisSteps.map((step, index) => (
                    <div key={step.id} className="p-4 bg-background border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            step.status === 'completed' ? 'bg-green-500 text-white' :
                            step.status === 'processing' ? 'bg-primary text-primary-foreground animate-pulse' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{step.name}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {step.status === 'pending' && <Eye className="w-4 h-4 text-muted-foreground" />}
                          {step.status === 'processing' && <Zap className="w-4 h-4 text-primary animate-pulse" />}
                          {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>

                      {step.calculation && (
                        <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-border">
                          <div className="text-xs text-muted-foreground mb-1">계산 방법:</div>
                          <code className="text-sm font-mono text-primary">{step.calculation}</code>
                        </div>
                      )}

                      {step.result && (
                        <div className="mt-3 text-sm text-foreground font-medium">
                          ✅ {step.result}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 분석 결과 탭 */}
          {activeTab === 'results' && topsisResult && (
            <div className="space-y-6">

              {/* 종합 점수 */}
              <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">
                  {Math.round(topsisResult.overallScore * 100)}점
                </div>
                <div className="text-lg font-semibold text-foreground mb-2">
                  TOPSIS 종합 평가
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  동급 {topsisResult.totalPeers}대 중 {topsisResult.rank}위 (상위 {topsisResult.percentile}%)
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  topsisResult.recommendation === 'EXCELLENT' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  topsisResult.recommendation === 'GOOD' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                  topsisResult.recommendation === 'FAIR' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {getRecommendationLabel(topsisResult.recommendation)}
                </div>
              </div>

              {/* 기준별 상세 점수 */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">기준별 상세 평가</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {criteriaWeights.map((criteria) => {
                    const score = topsisResult.criteriaScores[criteria.id] || 0;
                    return (
                      <div key={criteria.id} className="p-4 bg-background border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getCriteriaIcon(criteria.id)}
                            <span className="font-medium text-foreground">{criteria.name}</span>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            {Math.round(score * 100)}점
                          </span>
                        </div>

                        <div className="w-full bg-muted rounded-full h-3 mb-2">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              score >= 0.9 ? 'bg-green-500' :
                              score >= 0.8 ? 'bg-blue-500' :
                              score >= 0.7 ? 'bg-yellow-500' :
                              score >= 0.6 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">가중치: {Math.round(criteria.weight * 100)}%</span>
                          <span className={score >= 0.8 ? 'text-green-600 dark:text-green-400' :
                                        score >= 0.6 ? 'text-blue-600 dark:text-blue-400' :
                                        'text-orange-600 dark:text-orange-400'}>
                            {score >= 0.8 ? '우수' : score >= 0.6 ? '양호' : '개선 필요'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 강점/약점 분석 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    주요 강점
                  </h4>
                  <ul className="space-y-2">
                    {topsisResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    개선 포인트
                  </h4>
                  <ul className="space-y-2">
                    {topsisResult.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-orange-700 dark:text-orange-400">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 거리 지표 */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-3">TOPSIS 거리 지표</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">이상해(A+)까지 거리:</span>
                    <span className="ml-2 font-mono text-primary">{topsisResult.idealDistance.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">부정이상해(A-)까지 거리:</span>
                    <span className="ml-2 font-mono text-primary">{topsisResult.antiIdealDistance.toFixed(3)}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  근접계수 = {topsisResult.antiIdealDistance.toFixed(3)} / ({topsisResult.idealDistance.toFixed(3)} + {topsisResult.antiIdealDistance.toFixed(3)}) = {topsisResult.overallScore.toFixed(3)}
                </div>
              </div>
            </div>
          )}

          {/* 동급 비교 탭 */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">동급 차량 TOPSIS 순위</h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">순위</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">차량</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">연식</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">가격</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">TOPSIS 점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peerVehicles.map((peer, index) => {
                      const isCurrentVehicle = peer.manufacturer === vehicle.manufacturer && peer.model === vehicle.model;
                      return (
                        <tr
                          key={index}
                          className={`border-b border-border ${
                            isCurrentVehicle ? 'bg-primary/10' : 'hover:bg-muted/50'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">#{peer.rank}</span>
                              {peer.rank <= 3 && (
                                <span className="text-lg">
                                  {peer.rank === 1 ? '🥇' : peer.rank === 2 ? '🥈' : '🥉'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`font-medium ${isCurrentVehicle ? 'text-primary' : 'text-foreground'}`}>
                              {peer.manufacturer} {peer.model}
                              {isCurrentVehicle && <span className="ml-2 text-xs text-primary">현재 차량</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{peer.year}년</td>
                          <td className="py-3 px-4 text-muted-foreground">{peer.price.toLocaleString()}만원</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-primary">
                                {Math.round(peer.normalizedScore * 100)}점
                              </span>
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${peer.normalizedScore * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}