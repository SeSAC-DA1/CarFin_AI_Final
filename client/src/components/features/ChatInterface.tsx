import { useState, useMemo } from "react";
import { useWebSocketChat } from "@/hooks/useWebSocketChat";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import VehicleRecommendations from "./VehicleRecommendations";
import QuickReplyButtons from "./QuickReplyButtons";
import MACRecProgressPanel from "@/components/ai/MACRecProgressPanel";
import MACRecCollaborationViewer from "@/components/ai/MACRecCollaborationViewer";
import WelcomeFlow from "@/components/layout/WelcomeFlow";
import FeedbackSection from "@/components/layout/FeedbackSection";
import LoadingSpinner from "@/components/ai/LoadingSpinner";
import ChatSidebar from "@/components/layout/ChatSidebar";
import { Car, Wifi, WifiOff, Users, Heart, Fuel, Sparkles, HelpCircle, GraduationCap, Mountain, Star } from "lucide-react";

const quickReplies = [
  { label: "3000만원 이하 가족용 SUV", value: "3000만원 이하로 가족용 SUV 찾아요", icon: Users },
  { label: "출퇴근용 세단, 연비 좋은 걸로", value: "출퇴근용 세단, 연비 좋은 걸로요", icon: Fuel },
  { label: "신혼부부용 차", value: "신혼부부용 차, 안전하고 예쁜 걸로", icon: Heart },
  { label: "첫차 구입, 도움 주세요", value: "처음 차 사는데 뭘 골라야 할지 모르겠어요", icon: HelpCircle },
  { label: "대학생 아들용 경차", value: "대학생 아들이 쓸 경차나 소형차 추천해주세요", icon: GraduationCap },
  { label: "주말 캠핑용 차량", value: "주말에 캠핑 다니기 좋은 차 찾아요", icon: Mountain },
  { label: "1500만원 이하 실속형", value: "1500만원 이하로 실속 있는 차 추천해주세요", icon: Star },
  { label: "AI에게 맡길게요", value: "제 상황에 맞는 차를 AI가 알아서 찾아주세요", icon: Sparkles }
];

export default function ChatInterface() {
  const { messages, vehicles, progress, isConnected, sendMessage } = useWebSocketChat();
  const { startNewConversation, updateConversation } = useConversationHistory();
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showMACRecCollaboration, setShowMACRecCollaboration] = useState(false);
  const [currentUserQuery, setCurrentUserQuery] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(messages.length === 0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isMACRecPanelOpen, setIsMACRecPanelOpen] = useState(false);

  // 🎯 사용자 친화적 진행 단계 (간소화)
  const steps = useMemo(() => {
    if (!progress) {
      return [
        {
          id: "greeting",
          label: "대화 시작",
          status: "completed" as const,
          detail: "요청을 받았어요"
        },
        {
          id: "analyzing",
          label: "분석 중",
          status: "pending" as const,
          detail: "조건을 분석하고 있어요"
        },
        {
          id: "searching",
          label: "검색 중",
          status: "pending" as const,
          detail: "적합한 차량을 찾고 있어요"
        },
        {
          id: "recommending",
          label: "추천 준비",
          status: "pending" as const,
          detail: "최적의 차량을 선별하고 있어요"
        }
      ];
    }

    // 실제 백엔드 step과 간소화된 단계 매핑
    const stepMap: Record<string, number> = {
      analyzing_needs: 1,    // 분석 중
      user_analyst: 1,
      needs_analyst: 1,
      searching_vehicles: 2, // 검색 중
      searcher: 2,
      data_analyst: 2,
      final_recommendation: 3, // 추천 준비
      manager: 3,
      concierge: 3,
      completed: 4,
    };

    const currentStepIndex = stepMap[progress.step] || 0;

    return [
      {
        id: "greeting",
        label: "대화 시작",
        status: currentStepIndex > 0 ? "completed" as const : "active" as const,
        detail: "요청을 받았어요"
      },
      {
        id: "analyzing",
        label: "분석 중",
        status: currentStepIndex > 1 ? "completed" as const : currentStepIndex === 1 ? "active" as const : "pending" as const,
        detail: currentStepIndex === 1 ? "조건을 분석하고 있어요" : "분석 완료!"
      },
      {
        id: "searching",
        label: "검색 중",
        status: currentStepIndex > 2 ? "completed" as const : currentStepIndex === 2 ? "active" as const : "pending" as const,
        detail: currentStepIndex === 2 ? "적합한 차량을 찾고 있어요" : "검색 완료!"
      },
      {
        id: "recommending",
        label: "추천 준비",
        status: currentStepIndex >= 4 ? "completed" as const : currentStepIndex === 3 ? "active" as const : "pending" as const,
        detail: currentStepIndex >= 3 ? "최적의 차량을 선별하고 있어요" : "추천 완료!"
      }
    ];
  }, [progress]);

  const handleQuickReply = (value: string) => {
    sendMessage(value);
    setShowQuickReplies(false);
    setCurrentUserQuery(value);
    setShowWelcome(false);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message);
    setShowQuickReplies(false);
    setCurrentUserQuery(message);
    setShowWelcome(false);

    // 새 세션 시작 또는 기존 세션 업데이트
    if (!currentSessionId) {
      const newSessionId = startNewConversation(message);
      setCurrentSessionId(newSessionId);
    } else {
      updateConversation(currentSessionId, {
        lastMessage: message,
        vehicleCount: vehicles.length
      });
    }
  };

  const handleWelcomeStart = () => {
    setShowWelcome(false);
  };

  const handleWelcomeQuickStart = (message: string) => {
    handleSendMessage(message);
  };

  const handleMACRecComplete = () => {
    setShowMACRecCollaboration(false);
    console.log('🎉 MACRec 협업 완료');
  };

  const handleFeedbackRecommend = (feedback: string) => {
    console.log('🔄 재추천 요청:', feedback);
    // 피드백을 포함한 새로운 메시지 전송
    const feedbackMessage = `이전 추천에 대한 피드백: ${feedback}. 이를 반영해서 다시 추천해주세요.`;
    handleSendMessage(feedbackMessage);
  };

  const handleFeedbackSatisfied = () => {
    console.log('😊 사용자 만족');
    // 만족도 로깅 또는 분석을 위한 추가 처리
  };


  return (
    <div className="h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      {/* ✅ Phase 1.5: 토글 가능한 MACRec 프로토콜 사이드바 */}
      <MACRecProgressPanel
        steps={steps}
        isOpen={isMACRecPanelOpen}
        onToggle={() => setIsMACRecPanelOpen(!isMACRecPanelOpen)}
      />

      {/* 2컬럼 레이아웃: 왼쪽 사이드바 + 메인 채팅 영역 */}
      <div className="flex-1 flex h-[calc(100vh-4rem)]">
        {/* 왼쪽 사이드바 */}
        <ChatSidebar
          currentSessionId={currentSessionId}
          onNewChat={() => {
            setShowWelcome(true);
            setCurrentUserQuery('');
            setCurrentSessionId(null);
          }}
          onSelectConversation={(id) => {
            console.log('Selected conversation:', id);
            setCurrentSessionId(id);
          }}
          onQuickAction={(query) => {
            handleSendMessage(query);
          }}
        />

        {/* 메인 채팅 영역 - 우측 패널 제거로 100% 활용 */}
        <div className="flex-1 flex flex-col bg-background/50">
          <div className="p-4 bg-card/80 backdrop-blur-sm rounded-t-2xl border border-b-0 border-card-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    AI 차량 추천
                    {showMACRecCollaboration && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {showMACRecCollaboration ? 'MACRec 멀티에이전트 협업 중...' : '12만대 이상 실시간 분석'}
                  </p>
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
            {/* Welcome Flow - 처음 진입 시에만 표시 */}
            {showWelcome && (
              <div className="animate-fade-in">
                <WelcomeFlow
                  onStart={handleWelcomeStart}
                  onQuickStart={handleWelcomeQuickStart}
                />
              </div>
            )}

            {!showWelcome && (
              <>
                {messages.map((message, index) => (
                  <MessageBubble key={index} {...message} />
                ))}

                {/* MACRec 멀티에이전트 협업 뷰어 */}
                {showMACRecCollaboration && currentUserQuery && (
                  <div className="animate-slide-up" data-testid="macrec-collaboration">
                    <MACRecCollaborationViewer
                      query={currentUserQuery}
                      isActive={showMACRecCollaboration}
                      onComplete={handleMACRecComplete}
                      className="mb-4"
                    />
                  </div>
                )}

                {progress && progress.step !== 'completed' && !showMACRecCollaboration && (
                  <div className="animate-fade-in">
                    <LoadingSpinner
                      message={progress.message}
                      step={progress.step}
                      className="bg-card/50 backdrop-blur-sm rounded-xl border border-card-border"
                    />
                  </div>
                )}

                {vehicles.length > 0 && (
                  <div className="animate-slide-up space-y-6" data-testid="vehicles-container">
                    {/* 💬 AI 메시지 */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-card-border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">AI</span>
                        </div>
                        <span className="text-sm font-medium">CarFin AI</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        🎉 <strong>{currentUserQuery}</strong>에 맞는 최고의 차량 {vehicles.length}대를 찾았어요!
                      </p>
                    </div>

                    {/* 🚗 차량 추천 카드 */}
                    <VehicleRecommendations
                      vehicles={vehicles}
                      userQuery={currentUserQuery}
                      showPersonalization={true}
                    />

                    {/* 피드백 섹션 */}
                    <FeedbackSection
                      vehicles={vehicles}
                      onRecommend={handleFeedbackRecommend}
                      onSatisfied={handleFeedbackSatisfied}
                    />
                  </div>
                )}

                {showQuickReplies && messages.length > 0 && vehicles.length === 0 && (
                  <div className="animate-fade-in">
                    <p className="text-xs text-muted-foreground mb-2 px-2">빠른 선택</p>
                    <QuickReplyButtons options={quickReplies} onSelect={handleQuickReply} />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-card/80 backdrop-blur-sm rounded-b-2xl border border-t-0 border-card-border">
            <ChatInput onSend={handleSendMessage} />
          </div>
        </div>
        {/* ✅ Phase 1-1: 우측 에이전트 패널 제거 - 채팅창 확대 및 정보 과부화 해소 */}
      </div>
    </div>
  );
}
