import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Car,
  DollarSign,
  Clock,
  Zap,
  Eye,
  Brain,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface VehicleAnalysisDashboardProps {
  vehicle: any;
  analysisData: {
    floodHistory: any;
    fraudDetection: any;
    comprehensiveRisk: any;
    marketComparison: any;
    hiddenCosts: any;
  };
  onClose: () => void;
}

export default function VehicleAnalysisDashboard({
  vehicle,
  analysisData,
  onClose
}: VehicleAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrustBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 헤더 */}
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-chart-2/5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                🛡️ AI 차량 신뢰성 분석 대시보드
              </h2>
              <div className="flex items-center gap-4">
                <h3 className="text-lg text-muted-foreground">
                  {vehicle.manufacturer} {vehicle.model} ({vehicle.modelYear})
                </h3>
                <Badge className={`px-3 py-1 font-semibold text-white ${getTrustBadgeColor(analysisData.fraudDetection.overallTrustScore)}`}>
                  신뢰도 {analysisData.fraudDetection.overallTrustScore}점
                </Badge>
              </div>
            </div>
            <Button onClick={onClose} variant="outline" size="sm" className="hover-elevate">
              ✕ 닫기
            </Button>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                종합 현황
              </TabsTrigger>
              <TabsTrigger value="verification" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                신뢰성 검증
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                시장 분석
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                비용 분석
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI 인사이트
              </TabsTrigger>
            </TabsList>

            {/* 종합 현황 탭 */}
            <TabsContent value="overview" className="space-y-6">
              {/* 신뢰도 점수 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={`border-2 ${getRiskColor(analysisData.comprehensiveRisk.totalRiskScore)}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold mb-2">
                      {analysisData.comprehensiveRisk.totalRiskScore}
                    </div>
                    <div className="text-sm font-medium">종합 안전도</div>
                    <Progress value={analysisData.comprehensiveRisk.totalRiskScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className={`border-2 ${getRiskColor(analysisData.floodHistory.riskScore)}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold mb-2">
                      {analysisData.floodHistory.riskScore}
                    </div>
                    <div className="text-sm font-medium">침수 안전도</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {analysisData.floodHistory.isFloodDamaged ? '침수 의심' : '침수 없음'}
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-2 ${getRiskColor(analysisData.fraudDetection.overallTrustScore)}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold mb-2">
                      {analysisData.fraudDetection.overallTrustScore}
                    </div>
                    <div className="text-sm font-medium">매물 신뢰도</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {analysisData.fraudDetection.priceAnomaly.verdict === 'reasonable' ? '정상 가격' : '가격 이상'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold mb-2 text-primary">
                      {analysisData.marketComparison.percentile}%
                    </div>
                    <div className="text-sm font-medium">시장 순위</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      상위 {100 - analysisData.marketComparison.percentile}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 리스크 요인 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    주요 리스크 요인
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData.comprehensiveRisk.riskFactors.length === 0 ? (
                    <div className="text-center py-8 text-green-600">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                      <div className="font-semibold">발견된 리스크 없음</div>
                      <div className="text-sm text-muted-foreground">안전한 차량으로 판단됩니다</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysisData.comprehensiveRisk.riskFactors.map((factor: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {factor.severity === 'high' ? (
                              <XCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            )}
                            <div>
                              <div className="font-medium">{factor.category}</div>
                              <div className="text-sm text-muted-foreground">{factor.description}</div>
                            </div>
                          </div>
                          <Badge variant={factor.severity === 'high' ? 'destructive' : 'secondary'}>
                            영향도 {factor.impact}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 추천 결론 */}
              <Card className="bg-gradient-to-r from-primary/5 to-chart-2/5">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {analysisData.comprehensiveRisk.recommendation === 'highly_recommended' && '🌟 강력 추천'}
                      {analysisData.comprehensiveRisk.recommendation === 'recommended' && '👍 추천'}
                      {analysisData.comprehensiveRisk.recommendation === 'caution' && '⚠️ 주의 필요'}
                      {analysisData.comprehensiveRisk.recommendation === 'avoid' && '❌ 구매 비추천'}
                    </div>
                    <div className="text-muted-foreground">
                      {analysisData.comprehensiveRisk.recommendation === 'highly_recommended' &&
                        'AI 분석 결과 매우 안전하고 합리적인 차량으로 판단됩니다.'}
                      {analysisData.comprehensiveRisk.recommendation === 'recommended' &&
                        '전반적으로 양호한 상태의 차량입니다.'}
                      {analysisData.comprehensiveRisk.recommendation === 'caution' &&
                        '일부 위험 요인이 발견되었습니다. 신중한 검토 후 구매하세요.'}
                      {analysisData.comprehensiveRisk.recommendation === 'avoid' &&
                        '다수의 위험 요인이 발견되었습니다. 다른 차량을 찾아보시기 권합니다.'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 신뢰성 검증 탭 */}
            <TabsContent value="verification" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 침수이력 분석 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🌊 침수이력 분석
                      <Badge variant={analysisData.floodHistory.isFloodDamaged ? 'destructive' : 'default'}>
                        {analysisData.floodHistory.isFloodDamaged ? '위험' : '안전'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {analysisData.floodHistory.riskScore}점
                      </div>
                      <Progress value={analysisData.floodHistory.riskScore} className="mb-4" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>침수 레벨:</span>
                        <span className="font-medium">{
                          analysisData.floodHistory.floodLevel === 'none' ? '없음' :
                          analysisData.floodHistory.floodLevel === 'light' ? '경미' :
                          analysisData.floodHistory.floodLevel === 'moderate' ? '보통' : '심각'
                        }</span>
                      </div>
                      <div className="flex justify-between">
                        <span>검증 신뢰도:</span>
                        <span className="font-medium">{analysisData.floodHistory.confidence}%</span>
                      </div>
                    </div>

                    {analysisData.floodHistory.detectionMethod.length > 0 && (
                      <div>
                        <div className="font-medium mb-2">검출 근거:</div>
                        <ul className="text-sm space-y-1">
                          {analysisData.floodHistory.detectionMethod.map((method: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              {method}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 허위매물 분석 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🕵️ 허위매물 분석
                      <Badge variant={analysisData.fraudDetection.overallTrustScore >= 70 ? 'default' : 'destructive'}>
                        신뢰도 {analysisData.fraudDetection.overallTrustScore}점
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 가격 분석 */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">💰 가격 분석</span>
                        <Badge variant={analysisData.fraudDetection.priceAnomaly.isAnomalous ? 'destructive' : 'default'}>
                          {analysisData.fraudDetection.priceAnomaly.verdict === 'reasonable' ? '정상' : '이상'}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>현재 가격: {vehicle.price}만원</div>
                        <div>시세 범위: {analysisData.fraudDetection.priceAnomaly.marketPriceRange[0]}~{analysisData.fraudDetection.priceAnomaly.marketPriceRange[1]}만원</div>
                        <div>편차: {analysisData.fraudDetection.priceAnomaly.deviationPercent.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* 주행거리 분석 */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">📏 주행거리 분석</span>
                        <Badge variant={analysisData.fraudDetection.mileageManipulation.isSuspicious ? 'destructive' : 'default'}>
                          {analysisData.fraudDetection.mileageManipulation.suspicionLevel === 'none' ? '정상' : '의심'}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>현재 주행거리: {vehicle.distance.toLocaleString()}km</div>
                        <div>예상 범위: {analysisData.fraudDetection.mileageManipulation.expectedMileage[0].toLocaleString()}~{analysisData.fraudDetection.mileageManipulation.expectedMileage[1].toLocaleString()}km</div>
                        {analysisData.fraudDetection.mileageManipulation.reasons.length > 0 && (
                          <div className="text-red-600">
                            의심 사유: {analysisData.fraudDetection.mileageManipulation.reasons.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 시장 분석 탭 */}
            <TabsContent value="market" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      시장 포지션
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div>
                        <div className="text-4xl font-bold text-primary mb-2">
                          상위 {100 - analysisData.marketComparison.percentile}%
                        </div>
                        <div className="text-muted-foreground">
                          유사 차량 {analysisData.marketComparison.similarVehiclesCount}대 중
                        </div>
                      </div>
                      <Progress value={analysisData.marketComparison.percentile} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-chart-2" />
                      대안 차량
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-chart-2 mb-2">
                        {analysisData.marketComparison.betterAlternatives}대
                      </div>
                      <div className="text-muted-foreground">
                        더 나은 조건의 차량 발견
                      </div>
                      {analysisData.marketComparison.betterAlternatives > 0 && (
                        <div className="mt-3 text-sm text-yellow-600">
                          💡 더 좋은 조건의 차량들을 확인해보세요
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 비용 분석 탭 */}
            <TabsContent value="costs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    숨겨진 비용 분석 (3년 기준)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {analysisData.hiddenCosts.expectedMaintenanceCost.toLocaleString()}만원
                      </div>
                      <div className="text-sm">연간 정비비</div>
                    </div>

                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-chart-2 mb-1">
                        {Math.round((analysisData.hiddenCosts.insurancePremiumRange[0] + analysisData.hiddenCosts.insurancePremiumRange[1]) / 2).toLocaleString()}만원
                      </div>
                      <div className="text-sm">연간 보험료</div>
                    </div>

                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-chart-3 mb-1">
                        {analysisData.hiddenCosts.depreciationRate}%
                      </div>
                      <div className="text-sm">연간 감가상각률</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-chart-2/10 rounded-lg border-2 border-primary/20">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {analysisData.hiddenCosts.totalOwnershipCost.toLocaleString()}만원
                      </div>
                      <div className="text-sm font-medium">3년 총 소유비용</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">💡 비용 절약 팁</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 정기 점검으로 큰 수리비 예방 가능</li>
                      <li>• 보험 비교견적으로 연간 20-30만원 절약 가능</li>
                      <li>• 연식 {vehicle.modelYear}년 차량은 {analysisData.hiddenCosts.depreciationRate}% 감가상각률 예상</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI 인사이트 탭 */}
            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    🤖 AI 전문가 종합 분석
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-chart-2/5 rounded-lg">
                    <h4 className="font-semibold mb-2">📊 데이터 기반 평가</h4>
                    <p className="text-sm text-muted-foreground">
                      이 차량은 15만대 매물 분석을 통해 도출된 결과입니다.
                      논문 3개 기반 AI 시스템(MACRec + Alibaba + AHP-TOPSIS)을 활용하여
                      객관적이고 정밀한 분석을 제공합니다.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold mb-2">⚠️ 주의사항</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 실제 차량 상태는 직접 확인이 필요합니다</li>
                      <li>• 시세는 시장 상황에 따라 변동될 수 있습니다</li>
                      <li>• 최종 구매 결정 전 전문가 점검을 권장합니다</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2">✅ 구매 체크리스트</h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        실제 차량 외관 및 내부 상태 확인
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        시승을 통한 주행 성능 확인
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        정비 이력 및 사고 이력 서류 확인
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        보험료 및 세금 예상 비용 확인
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        중고차 성능·상태 점검 실시
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}