import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  User,
  History,
  Settings,
  Filter,
  CarFront,
  Clock,
  Heart,
  TrendingUp,
  Trash2,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ChatSidebarProps {
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  onQuickAction?: (query: string) => void;
  currentSessionId?: string;
}

export default function ChatSidebar({
  onNewChat,
  onSelectConversation,
  onQuickAction,
  currentSessionId
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'profile' | 'filters'>('history');

  // 실제 데이터 훅 사용
  const { conversations, deleteConversation, clearAllHistory } = useConversationHistory();
  const {
    userProfile,
    getBudgetString,
    getUsageString,
    getTopPriorities,
    getProfileCompleteness
  } = useUserProfile();

  // 동적 빠른 액션 (사용자 프로필 기반)
  const quickActions = [
    { icon: CarFront, label: "가족용 SUV", query: "가족용 SUV 추천해주세요" },
    { icon: TrendingUp, label: "연비 좋은 차", query: "연비 좋은 차 추천해주세요" },
    { icon: Heart, label: "신혼부부용", query: "신혼부부용 차 추천해주세요" }
  ];

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  return (
    <div className="w-80 h-full bg-card/30 backdrop-blur-sm border-r border-border flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">CARFIN AI</h2>
            <p className="text-xs text-muted-foreground">차량 추천 상담</p>
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          새 상담 시작
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="px-4 pt-3">
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          {[
            { id: 'history', label: '히스토리', icon: History },
            { id: 'profile', label: '프로필', icon: User },
            { id: 'filters', label: '필터', icon: Filter }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">최근 상담 내역</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {conversations.length}
                </Badge>
                {conversations.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllHistory}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">아직 상담 내역이 없습니다</p>
                <p className="text-xs">새 상담을 시작해보세요</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-muted/50 transition-colors border-border",
                    currentSessionId === conversation.id && "ring-2 ring-primary/50 bg-primary/5"
                  )}
                  onClick={() => onSelectConversation?.(conversation.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium line-clamp-2 leading-tight">
                      {conversation.title}
                    </h4>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {conversation.vehicleCount}대
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(conversation.timestamp)}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {conversation.lastMessage}
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">사용자 프로필</h3>
              <Badge variant="outline" className="text-xs">
                {getProfileCompleteness()}% 완성
              </Badge>
            </div>

            {!userProfile ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">프로필이 설정되지 않았습니다</p>
                <p className="text-xs">프로필 설정 페이지에서 정보를 입력해주세요</p>
              </div>
            ) : (
              <Card className="p-3 border-border">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {userProfile.name || '게스트'}
                    </span>
                    {userProfile.age && (
                      <Badge variant="outline" className="text-xs">
                        {userProfile.age}
                      </Badge>
                    )}
                  </div>

                  {userProfile.location && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">거주지역</p>
                      <Badge variant="secondary" className="text-xs">
                        {userProfile.location}
                      </Badge>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">예산 범위</p>
                    <Badge variant="secondary" className="text-xs">
                      {getBudgetString()}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">사용 용도</p>
                    <Badge variant="secondary" className="text-xs">
                      {getUsageString()}
                    </Badge>
                  </div>

                  {getTopPriorities().length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">중요한 조건</p>
                      <div className="flex flex-wrap gap-1">
                        {getTopPriorities().map((priority, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {priority}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2">빠른 액션</h4>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-8"
                      onClick={() => onQuickAction?.(action.query)}
                    >
                      <Icon className="w-3.5 h-3.5 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">검색 필터</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">브랜드</label>
                <div className="mt-1 space-y-1">
                  {['현대', '기아', '제네시스', '쌍용', '르노코리아'].map(brand => (
                    <label key={brand} className="flex items-center gap-2">
                      <input type="checkbox" className="w-3 h-3" />
                      <span className="text-xs">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">연료</label>
                <div className="mt-1 space-y-1">
                  {['가솔린', '디젤', '하이브리드', '전기'].map(fuel => (
                    <label key={fuel} className="flex items-center gap-2">
                      <input type="checkbox" className="w-3 h-3" />
                      <span className="text-xs">{fuel}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 설정 */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
          <Settings className="w-4 h-4 mr-2" />
          설정
        </Button>
      </div>
    </div>
  );
}