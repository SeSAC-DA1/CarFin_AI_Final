import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  Shield,
  Fuel,
  Zap,
  Heart,
  Award,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Star
} from "lucide-react";

interface FeedbackOption {
  id: string;
  label: string;
  icon: typeof DollarSign;
  color: string;
  bgColor: string;
  detail: string;
}

interface FeedbackSectionProps {
  vehicles: any[];
  onRecommend: (feedback: string) => void;
  onSatisfied: () => void;
}

const feedbackOptions: FeedbackOption[] = [
  {
    id: "price",
    label: "가격이 너무 비싸요",
    icon: DollarSign,
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50",
    detail: "더 저렴한 예산으로 다시 찾아드릴게요"
  },
  {
    id: "safety",
    label: "더 안전한 차가 좋겠어요",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50",
    detail: "안전 등급이 높은 차량으로 재검색할게요"
  },
  {
    id: "fuel",
    label: "연비가 더 중요해요",
    icon: Fuel,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50",
    detail: "연비 효율성을 최우선으로 다시 분석할게요"
  },
  {
    id: "performance",
    label: "성능이 부족해요",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50",
    detail: "더 높은 성능의 차량으로 재추천할게요"
  },
  {
    id: "features",
    label: "편의 기능이 부족해요",
    icon: Heart,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50",
    detail: "편의성과 옵션이 풍부한 차량으로 찾아볼게요"
  },
  {
    id: "different",
    label: "다른 조건으로 다시 찾아주세요",
    icon: RefreshCw,
    color: "text-gray-600",
    bgColor: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/30 dark:hover:bg-gray-950/50",
    detail: "처음부터 새로운 조건으로 다시 검색할게요"
  }
];

export default function FeedbackSection({ vehicles, onRecommend, onSatisfied }: FeedbackSectionProps) {
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string>("");
  const [satisfaction, setSatisfaction] = useState<'satisfied' | 'unsatisfied' | null>(null);

  const handleSatisfactionClick = (type: 'satisfied' | 'unsatisfied') => {
    setSatisfaction(type);
    if (type === 'satisfied') {
      onSatisfied();
    } else {
      setShowDetailedFeedback(true);
    }
  };

  const handleFeedbackSelect = (feedback: FeedbackOption) => {
    setSelectedFeedback(feedback.id);
    // 백엔드 MACRec Reflector + Alibaba Re-ranking에 맞는 피드백 형식
    const feedbackMessage = `이전 추천에 대한 피드백: ${feedback.label}. ${feedback.detail} 이를 반영해서 다시 추천해주세요.`;
    onRecommend(feedbackMessage);
  };

  if (vehicles.length === 0) return null;

  return (
    <Card className="p-6 mt-6 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm border-card-border">
      <div className="space-y-4">
        {/* 첫 번째 단계: 만족도 확인 */}
        {satisfaction === null && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">추천 결과는 어떠셨나요?</h3>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleSatisfactionClick('satisfied')}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <ThumbsUp className="w-5 h-5" />
                만족해요!
              </Button>

              <Button
                onClick={() => handleSatisfactionClick('unsatisfied')}
                variant="outline"
                className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                size="lg"
              >
                <ThumbsDown className="w-5 h-5" />
                다시 찾아주세요
              </Button>
            </div>
          </div>
        )}

        {/* 만족한 경우 */}
        {satisfaction === 'satisfied' && (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
              감사합니다! 🎉
            </h3>
            <p className="text-sm text-muted-foreground">
              AI 3명의 협업으로 만족스러운 추천을 드릴 수 있어서 기쁩니다
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 mt-3">
              <Award className="w-4 h-4" />
              <span>멀티에이전트 추천 시스템 성공!</span>
            </div>
          </div>
        )}

        {/* 불만족한 경우 - 상세 피드백 */}
        {satisfaction === 'unsatisfied' && showDetailedFeedback && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">어떤 부분을 개선해드릴까요?</h3>
              <p className="text-sm text-muted-foreground">
                선택해주시면 AI 3명이 즉시 재분석해드립니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {feedbackOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFeedbackSelect(option)}
                    className={`p-4 rounded-xl border border-dashed transition-all duration-200 text-left ${option.bgColor}
                      hover:border-solid hover:shadow-md group`}
                    disabled={selectedFeedback !== ""}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow`}>
                        <IconComponent className={`w-5 h-5 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{option.label}</h4>
                        <p className="text-xs text-muted-foreground">{option.detail}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedFeedback && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm font-medium text-primary">
                    AI 3명이 피드백을 반영해서 재분석 중입니다...
                  </span>
                </div>
                <p className="text-xs text-primary/80 mt-1">
                  선호도를 업데이트하고 새로운 추천을 준비하고 있어요
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => {
                  setSelectedFeedback("");
                  onRecommend("직접 대화로 새로운 조건을 말씀해주세요");
                }}
                className="w-full p-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    직접 대화로 새로운 조건 말하기
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}