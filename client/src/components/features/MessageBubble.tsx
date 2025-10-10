import { cn } from "@/lib/utils";
import { MessageCircle, User, Brain, Database, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

export interface MessageBubbleProps {
  type: "user" | "ai" | "user_message" | "agent_message" | "error";
  agent?: "concierge" | "needs" | "data" | "needs_analyst" | "data_analyst" | string;
  content: string;
  timestamp: Date | string | number;
}

const agentConfig: Record<string, {
  icon: LucideIcon;
  name: string;
  role: string;
  color: string;
  bgGradient: string;
  dotColor: string;
  ringColor: string;
}> = {
  concierge: {
    icon: MessageCircle,
    name: "CarFin AI",
    role: "종합 상담",
    color: "text-primary",
    bgGradient: "bg-gradient-to-br from-primary/10 to-primary/5",
    dotColor: "bg-primary",
    ringColor: "ring-primary/20"
  },
  needs: {
    icon: Brain,
    name: "니즈 분석 에이전트",
    role: "사용자 요구사항 분석",
    color: "text-blue-600",
    bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
    dotColor: "bg-blue-500",
    ringColor: "ring-blue-500/20"
  },
  needs_analyst: {
    icon: Brain,
    name: "니즈 분석 에이전트",
    role: "사용자 요구사항 분석",
    color: "text-blue-600",
    bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
    dotColor: "bg-blue-500",
    ringColor: "ring-blue-500/20"
  },
  user_analyst: {
    icon: Brain,
    name: "사용자 분석가",
    role: "프로필 & 니즈 분석",
    color: "text-blue-600",
    bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
    dotColor: "bg-blue-500",
    ringColor: "ring-blue-500/20"
  },
  data: {
    icon: Database,
    name: "데이터 분석 에이전트",
    role: "15만대 매물 검색",
    color: "text-green-600",
    bgGradient: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
    dotColor: "bg-green-500",
    ringColor: "ring-green-500/20"
  },
  searcher: {
    icon: Database,
    name: "검색 에이전트",
    role: "차량 검색 & 필터링",
    color: "text-green-600",
    bgGradient: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
    dotColor: "bg-green-500",
    ringColor: "ring-green-500/20"
  },
  evaluator: {
    icon: Award,
    name: "평가 에이전트",
    role: "TOPSIS 다기준 평가",
    color: "text-orange-600",
    bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20",
    dotColor: "bg-orange-500",
    ringColor: "ring-orange-500/20"
  },
  data_analyst: {
    icon: Database,
    name: "데이터 분석 에이전트",
    role: "15만대 매물 검색",
    color: "text-green-600",
    bgGradient: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
    dotColor: "bg-green-500",
    ringColor: "ring-green-500/20"
  },
  manager: {
    icon: Award,
    name: "매니저 에이전트",
    role: "최종 추천 및 평가",
    color: "text-purple-600",
    bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20",
    dotColor: "bg-purple-500",
    ringColor: "ring-purple-500/20"
  },
  financial_advisor: {
    icon: Award,
    name: "금융 자문가",
    role: "일시불/할부/리스 분석",
    color: "text-emerald-600",
    bgGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20",
    dotColor: "bg-emerald-500",
    ringColor: "ring-emerald-500/20"
  },
  concierge: {
    icon: Award,
    name: "종합 추천",
    role: "최종 추천 생성",
    color: "text-indigo-600",
    bgGradient: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20",
    dotColor: "bg-indigo-500",
    ringColor: "ring-indigo-500/20"
  }
};

// 타이핑 애니메이션 컴포넌트
function TypingAnimation({ text, delay = 20 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [text, delay]);

  return (
    <>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-2 h-5 bg-current opacity-80 animate-pulse ml-1" />
      )}
    </>
  );
}

export default function MessageBubble({ type, agent, content, timestamp }: MessageBubbleProps) {
  const isUser = type === "user" || type === "user_message";
  const isError = type === "error";
  const agentInfo = agent ? agentConfig[agent] : null;
  const isAgentMessage = type === "agent_message" && agentInfo;

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${type}`}
    >
      {!isUser && agentInfo && (
        <div className="flex-shrink-0 relative group">
          <div className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center shadow-sm",
            agentInfo.bgGradient
          )}>
            <agentInfo.icon className={cn("w-6 h-6", agentInfo.color)} />
          </div>

          {/* 활성 상태 인디케이터 */}
          <div className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
            agentInfo.dotColor
          )} />

          {/* 호버 시 역할 표시 툴팁 */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
              {agentInfo.role}
            </div>
          </div>
        </div>
      )}

      <div className={cn("max-w-[75%] space-y-1", isUser && "flex flex-col items-end")}>
        {!isUser && agentInfo && (
          <div className="flex items-center gap-2 px-2 mb-1">
            <span className="text-sm font-bold text-foreground">{agentInfo.name}</span>
            <div className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              agentInfo.bgGradient,
              agentInfo.color
            )}>
              {agentInfo.role}
            </div>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-3 break-words shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : isError
              ? "bg-destructive/10 border border-destructive/20 text-destructive"
              : "bg-card border border-card-border"
          )}
          data-testid={`bubble-${type}`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-line">
            {isAgentMessage ? (
              <TypingAnimation text={content} delay={30} />
            ) : (
              content
            )}
          </p>
        </div>

        <div className="px-2">
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shadow-sm">
            <User className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  );
}
