import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  TrendingUp,
  Calendar,
  CreditCard,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { useState } from "react";

/**
 * 🆕 Phase 3-E: 금융 옵션 비교 카드
 *
 * FinancialAdvisorAgent가 생성한 금융 옵션을 시각화하는 컴포넌트
 * 일시불/할부/리스 옵션을 비교하여 사용자에게 제시
 */

interface FinancingOption {
  type: 'cash' | 'loan' | 'lease';
  term?: number;
  downPayment: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  tco5Year: number;
  recommendation: {
    score: number;
    reason: string;
    pros: string[];
    cons: string[];
  };
  financialDetails?: {
    interestRate: number;
    insuranceType: 'full' | 'liability';
    monthlyIncome?: number;
    paymentRatio?: number;
  };
}

interface FinancingRecommendation {
  vehicleSellType: '일반' | '리스' | '렌트';
  cashOption?: FinancingOption;
  loanOptions?: FinancingOption[];
  leaseOptions?: FinancingOption[];
  dedicatedOptions?: FinancingOption[];
  bestRecommendation: FinancingOption;
  comparison: {
    cheapest: FinancingOption;
    mostAffordable: FinancingOption;
    bestValue: FinancingOption;
    note?: string;
  };
}

interface FinancingComparisonCardProps {
  vehicleName: string;
  vehiclePrice: number;
  financingOptions: FinancingRecommendation;
}

export default function FinancingComparisonCard({
  vehicleName,
  vehiclePrice,
  financingOptions
}: FinancingComparisonCardProps) {
  const [expandedOptions, setExpandedOptions] = useState(false);

  // 🛡️ Phase 3-E: 금융 옵션 데이터 검증
  if (!financingOptions || !financingOptions.bestRecommendation) {
    return (
      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            금융 옵션 계산 불가
          </CardTitle>
          <CardDescription>
            {vehicleName} · {vehiclePrice.toLocaleString()}만원
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              이 차량의 금융 옵션 계산 중 일시적인 오류가 발생했습니다.
              차량 추천은 정상적으로 제공되며, 상세한 금융 상담은 딜러에게 문의해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 모든 옵션 수집
  const allOptions: FinancingOption[] = [
    ...(financingOptions.cashOption ? [financingOptions.cashOption] : []),
    ...(financingOptions.loanOptions || []),
    ...(financingOptions.leaseOptions || []),
    ...(financingOptions.dedicatedOptions || [])
  ];

  // 최고 점수 옵션
  const bestOption = financingOptions.bestRecommendation;

  // 타입별 레이블
  const getTypeLabel = (type: string, term?: number) => {
    if (type === 'cash') return '일시불';
    if (type === 'loan') return `할부 ${term}개월`;
    if (type === 'lease') return `리스 ${term}개월`;
    return type;
  };

  // 타입별 아이콘
  const getTypeIcon = (type: string) => {
    if (type === 'cash') return <DollarSign className="w-4 h-4" />;
    if (type === 'loan') return <CreditCard className="w-4 h-4" />;
    if (type === 'lease') return <Calendar className="w-4 h-4" />;
    return <Wallet className="w-4 h-4" />;
  };

  // 점수별 색상
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              금융 옵션 비교
            </CardTitle>
            <CardDescription className="mt-1">
              {vehicleName} · {vehiclePrice.toLocaleString()}만원
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {financingOptions.vehicleSellType} 매물
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 🏆 Best Recommendation */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border-2 border-primary/30">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {getTypeIcon(bestOption.type)}
                  {getTypeLabel(bestOption.type, bestOption.term)} 추천
                </h3>
                <Badge className={`${getScoreColor(bestOption.recommendation.score)} bg-background/50`}>
                  점수: {bestOption.recommendation.score}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {bestOption.recommendation.reason}
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">초기 비용</span>
                  <div className="font-semibold text-base">
                    {(bestOption.downPayment / 10000).toLocaleString()}만원
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">월 납부액</span>
                  <div className="font-semibold text-base">
                    {bestOption.monthlyPayment === 0
                      ? '-'
                      : `${(bestOption.monthlyPayment / 10000).toLocaleString()}만원`}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">총 납부 금액</span>
                  <div className="font-semibold text-base">
                    {(bestOption.totalPayment / 10000).toLocaleString()}만원
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">5년 TCO</span>
                  <div className="font-semibold text-base text-primary">
                    {(bestOption.tco5Year / 10000).toLocaleString()}만원
                  </div>
                </div>
              </div>

              {/* 장단점 */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    장점
                  </h4>
                  <ul className="space-y-0.5">
                    {bestOption.recommendation.pros.map((pro, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    주의사항
                  </h4>
                  <ul className="space-y-0.5">
                    {bestOption.recommendation.cons.map((con, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 금융 상세 정보 */}
              {bestOption.financialDetails && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {bestOption.financialDetails.interestRate > 0 && (
                      <div>
                        금리: <span className="font-medium">{bestOption.financialDetails.interestRate}%</span>
                      </div>
                    )}
                    <div>
                      보험: <span className="font-medium">
                        {bestOption.financialDetails.insuranceType === 'full' ? '종합' : '책임'}보험
                      </span>
                    </div>
                    {bestOption.financialDetails.paymentRatio && (
                      <div>
                        소득 대비: <span className="font-medium">
                          {(bestOption.financialDetails.paymentRatio * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* 📊 비교 요약 */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            옵션별 비교
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <div className="text-xs text-muted-foreground mb-1">💰 최저 비용</div>
              <div className="font-semibold text-sm">
                {getTypeLabel(financingOptions.comparison.cheapest.type, financingOptions.comparison.cheapest.term)}
              </div>
              <div className="text-xs text-primary">
                {(financingOptions.comparison.cheapest.tco5Year / 10000).toLocaleString()}만원
              </div>
            </Card>

            <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="text-xs text-muted-foreground mb-1">📅 월 부담 최소</div>
              <div className="font-semibold text-sm">
                {getTypeLabel(financingOptions.comparison.mostAffordable.type, financingOptions.comparison.mostAffordable.term)}
              </div>
              <div className="text-xs text-primary">
                월 {(financingOptions.comparison.mostAffordable.monthlyPayment / 10000).toLocaleString()}만원
              </div>
            </Card>

            <Card className="p-3 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <div className="text-xs text-muted-foreground mb-1">⭐ 최고 가성비</div>
              <div className="font-semibold text-sm">
                {getTypeLabel(financingOptions.comparison.bestValue.type, financingOptions.comparison.bestValue.term)}
              </div>
              <div className="text-xs text-primary">
                점수 {financingOptions.comparison.bestValue.recommendation.score}
              </div>
            </Card>
          </div>
        </div>

        {/* 🔍 전체 옵션 보기 */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedOptions(!expandedOptions)}
            className="w-full"
          >
            {expandedOptions ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                전체 옵션 접기
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                전체 옵션 보기 ({allOptions.length}개)
              </>
            )}
          </Button>

          {expandedOptions && (
            <div className="mt-4 space-y-3">
              {allOptions.map((option, idx) => (
                <Card key={idx} className="p-3 bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(option.type)}
                      <span className="font-medium text-sm">
                        {getTypeLabel(option.type, option.term)}
                      </span>
                    </div>
                    <Badge variant="outline" className={getScoreColor(option.recommendation.score)}>
                      {option.recommendation.score}점
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">초기</div>
                      <div className="font-medium">{(option.downPayment / 10000).toLocaleString()}만</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">월</div>
                      <div className="font-medium">
                        {option.monthlyPayment === 0 ? '-' : `${(option.monthlyPayment / 10000).toLocaleString()}만`}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">총액</div>
                      <div className="font-medium">{(option.totalPayment / 10000).toLocaleString()}만</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">5년TCO</div>
                      <div className="font-medium text-primary">{(option.tco5Year / 10000).toLocaleString()}만</div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {option.recommendation.reason}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 💡 참고사항 */}
        {financingOptions.comparison.note && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-medium">참고: </span>
                {financingOptions.comparison.note}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
