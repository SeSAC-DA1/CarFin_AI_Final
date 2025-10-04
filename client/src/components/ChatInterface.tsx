import { useState, useMemo } from "react";
import { useWebSocketChat } from "@/hooks/useWebSocketChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import VehicleRecommendations from "./VehicleRecommendations";
import QuickReplyButtons from "./QuickReplyButtons";
import ProgressSteps from "./ProgressSteps";
import { DollarSign, Car, Truck, Wifi, WifiOff, Users, Heart, Fuel } from "lucide-react";

const quickReplies = [
  { label: "3000만원 이하 가족용 SUV", value: "3000만원 이하로 가족용 SUV 찾아요", icon: Users },
  { label: "출퇴근용 세단, 연비 좋은 걸로", value: "출퇴근용 세단, 연비 좋은 걸로요", icon: Fuel },
  { label: "신혼부부용 차", value: "신혼부부용 차, 안전하고 예쁜 걸로", icon: Heart },
  { label: "2500만원 이하 SUV", value: "2500만원 이하 SUV 추천해주세요", icon: Truck }
];

export default function ChatInterface() {
  const { messages, vehicles, progress, isConnected, sendMessage } = useWebSocketChat();
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const steps = useMemo(() => {
    if (!progress) {
      return [
        { id: "greeting", label: "인사", status: "completed" as const },
        { id: "analyzing", label: "분석 대기", status: "pending" as const },
        { id: "searching", label: "검색 대기", status: "pending" as const },
        { id: "recommendation", label: "추천 대기", status: "pending" as const }
      ];
    }

    const stepMap: Record<string, number> = {
      analyzing_needs: 1,
      extracting_profile: 1,
      searching_vehicles: 2,
      ranking_topsis: 2,
      final_recommendation: 3,
      completed: 4,
    };

    const currentStepIndex = stepMap[progress.step] || 0;

    return [
      { id: "greeting", label: "인사", status: currentStepIndex > 0 ? "completed" as const : "active" as const },
      { id: "analyzing", label: "니즈 분석", status: currentStepIndex > 1 ? "completed" as const : currentStepIndex === 1 ? "active" as const : "pending" as const },
      { id: "searching", label: "차량 검색", status: currentStepIndex > 2 ? "completed" as const : currentStepIndex === 2 ? "active" as const : "pending" as const },
      { id: "recommendation", label: "추천 완료", status: currentStepIndex >= 4 ? "completed" as const : currentStepIndex === 3 ? "active" as const : "pending" as const }
    ];
  }, [progress]);

  const handleQuickReply = (value: string) => {
    sendMessage(value);
    setShowQuickReplies(false);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message);
    setShowQuickReplies(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <ProgressSteps steps={steps} />
      
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          <div className="p-4 bg-card/80 backdrop-blur-sm rounded-t-2xl border border-b-0 border-card-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">AI 차량 추천</h2>
                  <p className="text-xs text-muted-foreground">15만대 매물 실시간 분석</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span>연결됨</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <WifiOff className="w-4 h-4" />
                    <span>연결 끊김</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-background/50 backdrop-blur-sm space-y-4">
            {messages.map((message, index) => (
              <MessageBubble key={index} {...message} />
            ))}

            {progress && progress.step !== 'completed' && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20 animate-pulse">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                <p className="text-sm text-muted-foreground">{progress.message}</p>
              </div>
            )}

            {vehicles.length > 0 && (
              <div className="animate-slide-up" data-testid="vehicles-container">
                <VehicleRecommendations vehicles={vehicles} />
              </div>
            )}

            {showQuickReplies && messages.length > 0 && (
              <div className="animate-fade-in">
                <p className="text-xs text-muted-foreground mb-2 px-2">빠른 선택</p>
                <QuickReplyButtons options={quickReplies} onSelect={handleQuickReply} />
              </div>
            )}
          </div>

          <div className="bg-card/80 backdrop-blur-sm rounded-b-2xl border border-t-0 border-card-border">
            <ChatInput onSend={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
