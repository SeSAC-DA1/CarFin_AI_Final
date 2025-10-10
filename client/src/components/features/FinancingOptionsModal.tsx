import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
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
  Sparkles,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 🆕 Phase 6-4: 금융 옵션 모달 Dialog
 *
 * 사용자 요청: "금융 옵션 비교는 차량 카드에서 모달창으로 버튼 대시보드로 보여주면 되잖아"
 *
 * FinancingComparisonCard를 모달 다이얼로그로 변환하여
 * 차량 카드의 버튼에서 열 수 있도록 함
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

interface FinancingOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleName: string;
  vehiclePrice: number;
  financingOptions: FinancingRecommendation;
}

export default function FinancingOptionsModal({
  isOpen,
  onClose,
  vehicleName,
  vehiclePrice,
  financingOptions
}: FinancingOptionsModalProps) {
  const [expandedOptions, setExpandedOptions] = useState(false);

  // 🛡️ 금융 옵션 데이터 검증
  if (!financingOptions || !financingOptions.bestRecommendation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              금융 옵션 계산 불가
            </DialogTitle>
            <DialogDescription>
              {vehicleName} · {vehiclePrice.toLocaleString()}만원
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              이 차량의 금융 옵션 계산 중 일시적인 오류가 발생했습니다.
              차량 추천은 정상적으로 제공되며, 상세한 금융 상담은 딜러에게 문의해주세요.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const best = financingOptions.bestRecommendation;
  const comparison = financingOptions.comparison;

  // 옵션 타입별 라벨
  const getTypeLabel = (type: 'cash' | 'loan' | 'lease') => {
    switch (type) {
      case 'cash': return '일시불';
      case 'loan': return '할부';
      case 'lease': return '리스';
    }
  };

  // 모든 옵션 수집
  const allOptions: FinancingOption[] = [];
  if (financingOptions.cashOption) allOptions.push(financingOptions.cashOption);
  if (financingOptions.loanOptions) allOptions.push(...financingOptions.loanOptions);
  if (financingOptions.leaseOptions) allOptions.push(...financingOptions.leaseOptions);
  if (financingOptions.dedicatedOptions) allOptions.push(...financingOptions.dedicatedOptions);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Wallet className="w-6 h-6 text-primary" />
            맞춤 금융 옵션
          </DialogTitle>
          <DialogDescription className="text-base">
            {vehicleName} · {vehiclePrice.toLocaleString()}만원
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 🆕 Phase 3-E: AI 추천 옵션 하이라이트 */}
          <Card className="border-2 border-primary shadow-lg shadow-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">AI 추천</h3>
                    <Badge className="bg-primary text-primary-foreground">
                      {getTypeLabel(best.type)}
                      {best.term && ` ${best.term}개월`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{best.recommendation.reason}</p>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  점수 {best.recommendation.score}
                </Badge>
              </div>

              <Separator />

              {/* 금액 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    초기 납부
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {(best.downPayment / 10000).toFixed(0)}만원
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    월 납부
                  </p>
                  <p className="text-lg font-bold">
                    {(best.monthlyPayment / 10000).toFixed(1)}만원
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    총 납부
                  </p>
                  <p className="text-lg font-bold">
                    {(best.totalPayment / 10000).toFixed(0)}만원
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    5년 TCO
                  </p>
                  <p className="text-lg font-bold">
                    {(best.tco5Year / 10000).toFixed(0)}만원
                  </p>
                </div>
              </div>

              {/* 장단점 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    장점
                  </p>
                  <ul className="space-y-1">
                    {best.recommendation.pros.map((pro, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    주의사항
                  </p>
                  <ul className="space-y-1">
                    {best.recommendation.cons.map((con, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🆕 Phase 3-E: 비교 분석 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 총액 최소 */}
            <Card className={cn(
              "border",
              comparison.cheapest.type === best.type && comparison.cheapest.term === best.term
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-border"
            )}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">💰 총액 최소</p>
                  {comparison.cheapest.type === best.type && comparison.cheapest.term === best.term && (
                    <Badge className="text-xs bg-green-500 text-white">추천</Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {getTypeLabel(comparison.cheapest.type)}
                    {comparison.cheapest.term && ` ${comparison.cheapest.term}개월`}
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {(comparison.cheapest.totalPayment / 10000).toFixed(0)}만원
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 월 부담 최소 */}
            <Card className={cn(
              "border",
              comparison.mostAffordable.type === best.type && comparison.mostAffordable.term === best.term
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-border"
            )}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">📅 월 부담 최소</p>
                  {comparison.mostAffordable.type === best.type && comparison.mostAffordable.term === best.term && (
                    <Badge className="text-xs bg-blue-500 text-white">추천</Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {getTypeLabel(comparison.mostAffordable.type)}
                    {comparison.mostAffordable.term && ` ${comparison.mostAffordable.term}개월`}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {(comparison.mostAffordable.monthlyPayment / 10000).toFixed(1)}만원/월
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 종합 점수 최고 */}
            <Card className={cn(
              "border",
              comparison.bestValue.type === best.type && comparison.bestValue.term === best.term
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                : "border-border"
            )}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">⭐ 종합 최고</p>
                  {comparison.bestValue.type === best.type && comparison.bestValue.term === best.term && (
                    <Badge className="text-xs bg-purple-500 text-white">추천</Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {getTypeLabel(comparison.bestValue.type)}
                    {comparison.bestValue.term && ` ${comparison.bestValue.term}개월`}
                  </p>
                  <p className="text-xl font-bold text-purple-600">
                    점수 {comparison.bestValue.recommendation.score}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 🆕 Phase 3-E: 모든 옵션 보기 (확장 가능) */}
          {allOptions.length > 1 && (
            <>
              <Button
                variant="outline"
                onClick={() => setExpandedOptions(!expandedOptions)}
                className="w-full"
              >
                {expandedOptions ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    간단히 보기
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    전체 옵션 비교 ({allOptions.length}개)
                  </>
                )}
              </Button>

              {expandedOptions && (
                <div className="space-y-3">
                  {allOptions.map((option, idx) => (
                    <Card
                      key={idx}
                      className={cn(
                        "border",
                        option.type === best.type && option.term === best.term
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {getTypeLabel(option.type)}
                              {option.term && ` ${option.term}개월`}
                              {option.type === best.type && option.term === best.term && (
                                <Badge className="text-xs bg-primary">AI 추천</Badge>
                              )}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {option.recommendation.reason}
                            </p>
                          </div>
                          <Badge variant="outline">점수 {option.recommendation.score}</Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">초기</p>
                            <p className="font-semibold">{(option.downPayment / 10000).toFixed(0)}만원</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">월</p>
                            <p className="font-semibold">{(option.monthlyPayment / 10000).toFixed(1)}만원</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">총 납부</p>
                            <p className="font-semibold">{(option.totalPayment / 10000).toFixed(0)}만원</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">5년 TCO</p>
                            <p className="font-semibold">{(option.tco5Year / 10000).toFixed(0)}만원</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 특이사항 안내 */}
          {comparison.note && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>참고:</strong> {comparison.note}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
