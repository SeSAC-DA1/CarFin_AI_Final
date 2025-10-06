import { useState } from "react";
import { useWebSocketChat } from "@/hooks/useWebSocketChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import VehicleRecommendations from "./VehicleRecommendations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Send, Sparkles, Loader2 } from "lucide-react";

// 간단한 퀵 스타터 메시지들
const quickStarters = [
  "3000만원 이하 가족용 SUV 찾아요",
  "출퇴근용 세단, 연비 좋은 걸로요",
  "신혼부부용 차, 안전하고 예쁜 걸로",
  "처음 차 사는데 도움 주세요"
];

export default function SimpleChatInterface() {
  const { messages, vehicles, isConnected, sendMessage } = useWebSocketChat();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasMessages = messages.length > 0;

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    sendMessage(message);
    setInput("");

    // 로딩 상태를 3초 후 해제 (실제로는 메시지 응답에 따라)
    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleQuickStart = (message: string) => {
    handleSend(message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 간단한 헤더 */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">CARFIN AI</h1>
              <p className="text-xs text-muted-foreground">
                실시간 15만대 분석 • AI 추천
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 채팅 영역 */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* 첫 방문시 웰컴 메시지 */}
          {!hasMessages && (
            <div className="text-center py-12 space-y-6">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">어떤 차 찾으세요?</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  그냥 평소에 말하듯이 편하게 얘기해주세요!<br />
                  15만대 중에서 딱 맞는 차량 찾아드릴게요.
                </p>
              </div>

              {/* 퀵 스타터 버튼들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickStarters.map((message, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => handleQuickStart(message)}
                  >
                    <span className="truncate">{message}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 메시지들 */}
          {messages.map((message, index) => (
            <div key={index} className="animate-fade-in">
              <MessageBubble {...message} />
            </div>
          ))}

          {/* 차량 추천 결과 */}
          {vehicles && vehicles.length > 0 && (
            <div className="animate-slide-up">
              <VehicleRecommendations vehicles={vehicles} />
            </div>
          )}

          {/* 로딩 상태 - 매우 단순하게 */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Card className="p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  분석 중이에요...
                </span>
              </Card>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="border-t bg-card/50 backdrop-blur-sm p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <ChatInput
                onSendMessage={handleSend}
                placeholder="어떤 차 찾으세요? 편하게 말씀해주세요..."
                disabled={!isConnected}
              />
            </div>
          </div>

          {!isConnected && (
            <p className="text-xs text-red-500 mt-2 text-center">
              연결이 끊어졌습니다. 페이지를 새로고침해주세요.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}