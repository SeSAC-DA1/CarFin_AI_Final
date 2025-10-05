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
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  userProfile?: {
    name?: string;
    budget?: number[];
    preferences?: string[];
  };
  conversations?: Array<{
    id: string;
    title: string;
    timestamp: Date;
    vehicleCount: number;
  }>;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
}

export default function ChatSidebar({
  userProfile,
  conversations = [],
  onNewChat,
  onSelectConversation
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'profile' | 'filters'>('history');

  // 모킹 대화 히스토리
  const mockConversations = conversations.length > 0 ? conversations : [
    {
      id: '1',
      title: '3000만원 이하 가족용 SUV',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
      vehicleCount: 3
    },
    {
      id: '2',
      title: '출퇴근용 연비 좋은 세단',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
      vehicleCount: 3
    },
    {
      id: '3',
      title: '신혼부부용 차량 추천',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
      vehicleCount: 2
    }
  ];

  const quickActions = [
    { icon: CarFront, label: "가족용 SUV", query: "3000만원 이하 가족용 SUV 추천해주세요" },
    { icon: TrendingUp, label: "연비 좋은 차", query: "연비 좋은 출퇴근용 세단 추천해주세요" },
    { icon: Heart, label: "신혼부부용", query: "신혼부부에게 적합한 차량 추천해주세요" }
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
              <Badge variant="secondary" className="text-xs">
                {mockConversations.length}
              </Badge>
            </div>

            {mockConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors border-border"
                onClick={() => onSelectConversation?.(conversation.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium line-clamp-2 leading-tight">
                    {conversation.title}
                  </h4>
                  <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                    {conversation.vehicleCount}대
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(conversation.timestamp)}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">사용자 프로필</h3>

            <Card className="p-3 border-border">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {userProfile?.name || '게스트'}
                  </span>
                </div>

                {userProfile?.budget && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">예산 범위</p>
                    <Badge variant="secondary">
                      {userProfile.budget[0]}만원 - {userProfile.budget[1]}만원
                    </Badge>
                  </div>
                )}

                {userProfile?.preferences && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">선호 조건</p>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.preferences.map((pref, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

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
                      onClick={() => {
                        // 빠른 액션 메시지 전송 로직
                        console.log('Quick action:', action.query);
                      }}
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