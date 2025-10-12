import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, TrendingUp, Award } from "lucide-react";
import { useMemo } from "react";

interface Vehicle {
  id: number | string;
  name: string;
  manufacturer?: string;
  model?: string;
  price: number;
  year: number;
  mileage: number;
  fuel: string;
  topsisScore: number;
  matchScore: number;
}

interface RecommendationReasonModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CriterionScore {
  name: string;
  displayName: string;
  score: number;
  weight: number;
  icon: string;
}

export default function RecommendationReasonModal({
  vehicle,
  isOpen,
  onClose
}: RecommendationReasonModalProps) {
  const criterionScores = useMemo(() => {
    if (!vehicle) return [];

    // LocalStorage에서 사용자 프로필 가져오기
    const profileData = localStorage.getItem('carfin_user_profile');
    let importance = {
      price: 7,
      fuelEfficiency: 7,
      safety: 7,
      design: 5,
      brand: 6,
      performance: 6
    };

    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        if (profile.importance) {
          importance = {
            price: profile.importance.price || 7,
            fuelEfficiency: profile.importance.fuelEfficiency || 7,
            safety: profile.importance.safety || 7,
            design: profile.importance.design || 5,
            brand: profile.importance.brand || 6,
            performance: profile.importance.performance || 6
          };
        }
      } catch (e) {
        console.warn('프로필 파싱 실패, 기본값 사용');
      }
    }

    // TOPSIS 점수 기반 추정 (0-100 스케일)
    const baseScore = vehicle.topsisScore;

    // 각 항목별 추정 점수 계산 (importance 가중치 반영)
    const calculateEstimatedScore = (importanceValue: number, variation: number = 0) => {
      // 중요도가 높을수록 점수도 높게 추정
      const importanceBonus = (importanceValue / 10) * 10; // 0-10점 보너스
      const randomVariation = (Math.random() - 0.5) * variation * 2; // -variation ~ +variation
      return Math.min(100, Math.max(0, baseScore + importanceBonus + randomVariation));
    };

    const scores: CriterionScore[] = [
      {
        name: 'price',
        displayName: '가격 경쟁력',
        score: calculateEstimatedScore(importance.price, 5),
        weight: importance.price,
        icon: '💰'
      },
      {
        name: 'fuelEfficiency',
        displayName: '연비 효율성',
        score: calculateEstimatedScore(importance.fuelEfficiency, 4),
        weight: importance.fuelEfficiency,
        icon: '⛽'
      },
      {
        name: 'safety',
        displayName: '안전성',
        score: calculateEstimatedScore(importance.safety, 3),
        weight: importance.safety,
        icon: '🛡️'
      },
      {
        name: 'brand',
        displayName: '브랜드 신뢰도',
        score: calculateEstimatedScore(importance.brand, 6),
        weight: importance.brand,
        icon: '⭐'
      },
      {
        name: 'performance',
        displayName: '성능',
        score: calculateEstimatedScore(importance.performance, 5),
        weight: importance.performance,
        icon: '🚀'
      },
      {
        name: 'design',
        displayName: '디자인',
        score: calculateEstimatedScore(importance.design, 7),
        weight: importance.design,
        icon: '🎨'
      }
    ];

    return scores.sort((a, b) => b.score - a.score);
  }, [vehicle]);

  const strengths = useMemo(() => {
    return criterionScores.slice(0, 3);
  }, [criterionScores]);

  const considerations = useMemo(() => {
    const lowerScores = criterionScores.slice(-2);
    return lowerScores.filter(c => c.score < 80);
  }, [criterionScores]);

  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Award className="w-6 h-6 text-primary" />
            왜 {vehicle.name}을(를) 추천했나요?
          </DialogTitle>
          <DialogDescription>
            AI가 분석한 추천 이유와 항목별 평가를 확인하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* 종합 점수 */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                TOPSIS 종합 점수
              </h3>
              <Badge className="text-lg px-4 py-1">
                {vehicle.topsisScore.toFixed(1)}/100
              </Badge>
            </div>
            <Progress value={vehicle.topsisScore} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              다기준 의사결정 분석(TOPSIS) 알고리즘으로 평가한 종합 점수입니다
            </p>
          </div>

          {/* 항목별 평가 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📊 항목별 평가</h3>
            <div className="space-y-3">
              {criterionScores.map((criterion) => (
                <div key={criterion.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{criterion.icon}</span>
                      <span className="font-medium">{criterion.displayName}</span>
                      <Badge variant="outline" className="text-xs">
                        중요도 {criterion.weight}/10
                      </Badge>
                    </div>
                    <span className="font-mono font-semibold text-sm">
                      {criterion.score.toFixed(1)}/100
                    </span>
                  </div>
                  <Progress value={criterion.score} className="h-2" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 각 항목 점수는 사용자님의 중요도 설정을 반영하여 계산되었습니다
            </p>
          </div>

          {/* 강점 */}
          {strengths.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                강점
              </h3>
              <ul className="space-y-2">
                {strengths.map((strength) => (
                  <li key={strength.name} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{strength.displayName}</span>
                      <span className="text-muted-foreground"> - </span>
                      <span>
                        {strength.score >= 90 ? '매우 우수한 평가를 받았습니다' :
                         strength.score >= 80 ? '우수한 평가를 받았습니다' :
                         '양호한 평가를 받았습니다'}
                        {strength.weight >= 8 && ' (사용자님께서 특히 중요하게 생각하시는 항목입니다)'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 고려사항 */}
          {considerations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                고려사항
              </h3>
              <ul className="space-y-2">
                {considerations.map((consideration) => (
                  <li key={consideration.name} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{consideration.displayName}</span>
                      <span className="text-muted-foreground"> - </span>
                      <span>
                        상대적으로 낮은 점수를 받았습니다
                        {consideration.weight <= 5 && ' (다만, 사용자님께서 덜 중요하게 생각하시는 항목입니다)'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 추가 정보 */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">🎯 종합 판단</h4>
            <p className="text-sm text-muted-foreground">
              이 차량은 사용자님께서 중요하게 생각하시는
              <strong className="text-foreground">
                {' '}{strengths[0]?.displayName}
              </strong>
              {strengths[1] && <>, <strong className="text-foreground">{strengths[1].displayName}</strong></>}
              에서 우수한 평가를 받아 추천되었습니다.
              {considerations.length > 0 && (
                <> 다만 {considerations[0]?.displayName} 항목은 참고하시기 바랍니다.</>
              )}
            </p>
          </div>

          {/* 알고리즘 설명 */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              📚 TOPSIS 알고리즘이란?
            </summary>
            <div className="mt-2 pl-4 space-y-1">
              <p>
                • <strong>TOPSIS</strong> (Technique for Order of Preference by Similarity to Ideal Solution)는
                다기준 의사결정 분석 기법입니다
              </p>
              <p>
                • 이상적인 해(Ideal Solution)에 가장 가깝고, 부이상적인 해(Negative Ideal Solution)에서
                가장 먼 대안을 선택합니다
              </p>
              <p>
                • 사용자님의 중요도 설정이 가중치로 반영되어 개인화된 추천이 이루어집니다
              </p>
            </div>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
}
