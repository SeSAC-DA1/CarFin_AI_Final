import { useState, useMemo } from "react";
import { useWebSocketChat } from "@/hooks/useWebSocketChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import VehicleRecommendations from "./VehicleRecommendations";
import QuickReplyButtons from "./QuickReplyButtons";
import ProgressSteps from "./ProgressSteps";
import MACRecCollaborationViewer from "./MACRecCollaborationViewer";
import WelcomeFlow from "./WelcomeFlow";
import AgentStatusPanel from "./AgentStatusPanel";
import FeedbackSection from "./FeedbackSection";
import { DollarSign, Car, Truck, Wifi, WifiOff, Users, Heart, Fuel, Sparkles } from "lucide-react";

const quickReplies = [
  { label: "3000만원 이하 가족용 SUV", value: "3000만원 이하로 가족용 SUV 찾아요", icon: Users },
  { label: "출퇴근용 세단, 연비 좋은 걸로", value: "출퇴근용 세단, 연비 좋은 걸로요", icon: Fuel },
  { label: "신혼부부용 차", value: "신혼부부용 차, 안전하고 예쁜 걸로", icon: Heart },
  { label: "2500만원 이하 SUV", value: "2500만원 이하 SUV 추천해주세요", icon: Truck }
];

export default function ChatInterface() {
  const { messages, vehicles, progress, isConnected, sendMessage } = useWebSocketChat();
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showMACRecCollaboration, setShowMACRecCollaboration] = useState(false);
  const [currentUserQuery, setCurrentUserQuery] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(messages.length === 0);
  const [showAgentPanel, setShowAgentPanel] = useState(true);

  const steps = useMemo(() => {
    if (!progress) {
      return [
        {
          id: "greeting",
          label: "대화 시작",
          status: "completed" as const,
          detail: "사용자 요청 접수 완료",
          agent: ""
        },
        {
          id: "analyzing",
          label: "니즈 분석",
          status: "pending" as const,
          detail: "대화에서 요구사항 추출",
          agent: "니즈 분석 AI"
        },
        {
          id: "searching",
          label: "빅데이터 검색",
          status: "pending" as const,
          detail: "15만대 중 조건 맞는 차량 검색",
          agent: "검색 AI"
        },
        {
          id: "recommendation",
          label: "정밀 평가",
          status: "pending" as const,
          detail: "6가지 기준 TOPSIS 분석",
          agent: "평가 AI"
        }
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
      {
        id: "greeting",
        label: "대화 시작",
        status: currentStepIndex > 0 ? "completed" as const : "active" as const,
        detail: "사용자 요청 접수 완료",
        agent: ""
      },
      {
        id: "analyzing",
        label: "니즈 분석",
        status: currentStepIndex > 1 ? "completed" as const : currentStepIndex === 1 ? "active" as const : "pending" as const,
        detail: currentStepIndex === 1 ? "대화 내용에서 선호도 파악 중" : "요구사항 분석 완료",
        agent: "니즈 분석 AI"
      },
      {
        id: "searching",
        label: "빅데이터 검색",
        status: currentStepIndex > 2 ? "completed" as const : currentStepIndex === 2 ? "active" as const : "pending" as const,
        detail: currentStepIndex === 2 ? "15만대 중 조건 맞는 차량 검색 중" : "후보 차량 선별 완료",
        agent: "검색 AI"
      },
      {
        id: "recommendation",
        label: "정밀 평가",
        status: currentStepIndex >= 4 ? "completed" as const : currentStepIndex === 3 ? "active" as const : "pending" as const,
        detail: currentStepIndex >= 3 ? "TOPSIS 알고리즘 분석 중" : "Top 3 추천 완성",
        agent: "평가 AI"
      }
    ];
  }, [progress]);

  const handleQuickReply = (value: string) => {
    sendMessage(value);
    setShowQuickReplies(false);
    setCurrentUserQuery(value);
    setShowWelcome(false);
    // MACRec 협업 시뮬레이션 시작
    setShowMACRecCollaboration(true);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message);
    setShowQuickReplies(false);
    setCurrentUserQuery(message);
    setShowWelcome(false);
    // MACRec 협업 시뮬레이션 시작
    setShowMACRecCollaboration(true);
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

  const handleAgentPanelComplete = () => {
    console.log('🎉 에이전트 패널 협업 완료');
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <ProgressSteps steps={steps} />

      {/* 멀티에이전트 상태 패널 - 항상 보임 */}
      <AgentStatusPanel
        isActive={showMACRecCollaboration}
        currentStep={progress?.step}
        userQuery={currentUserQuery}
        onComplete={handleAgentPanelComplete}
      />

      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="flex flex-col h-[calc(100vh-8rem)]">
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
                    {showMACRecCollaboration ? 'MACRec 멀티에이전트 협업 중...' : '15만대 매물 실시간 분석'}
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
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20 animate-pulse">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    <p className="text-sm text-muted-foreground">{progress.message}</p>
                  </div>
                )}

                {vehicles.length > 0 && (
                  <div className="animate-slide-up" data-testid="vehicles-container">
                    <VehicleRecommendations vehicles={vehicles} />

                    {/* 피드백 섹션 - 추천 결과 후에 표시 */}
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
      </div>
    </div>
  );
}
