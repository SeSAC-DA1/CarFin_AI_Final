import { cn } from "@/lib/utils";
import { MessageCircle, Search, BarChart3, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MessageBubbleProps {
  type: "user" | "ai" | "user_message" | "agent_message" | "error";
  agent?: "concierge" | "needs" | "data" | "needs_analyst" | "data_analyst" | string;
  content: string;
  timestamp: Date;
}

const agentConfig: Record<string, { icon: LucideIcon; name: string; color: string; dotColor: string }> = {
  concierge: { icon: MessageCircle, name: "컨시어지", color: "bg-primary/10 text-primary", dotColor: "bg-primary" },
  needs: { icon: Search, name: "니즈 분석", color: "bg-chart-2/10 text-chart-2", dotColor: "bg-chart-2" },
  needs_analyst: { icon: Search, name: "니즈 분석", color: "bg-chart-2/10 text-chart-2", dotColor: "bg-chart-2" },
  data: { icon: BarChart3, name: "데이터 분석", color: "bg-chart-1/10 text-chart-1", dotColor: "bg-chart-1" },
  data_analyst: { icon: BarChart3, name: "데이터 분석", color: "bg-chart-1/10 text-chart-1", dotColor: "bg-chart-1" }
};

export default function MessageBubble({ type, agent, content, timestamp }: MessageBubbleProps) {
  const isUser = type === "user" || type === "user_message";
  const isError = type === "error";
  const agentInfo = agent ? agentConfig[agent] : null;

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${type}`}
    >
      {!isUser && agentInfo && (
        <div className="flex-shrink-0 relative">
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shadow-sm",
            agentInfo.color
          )}>
            <agentInfo.icon className="w-5 h-5" />
          </div>
          <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background", agentInfo.dotColor)} />
        </div>
      )}

      <div className={cn("max-w-[75%] space-y-1", isUser && "flex flex-col items-end")}>
        {!isUser && agentInfo && (
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-semibold">{agentInfo.name}</span>
          </div>
        )}

        <div
          className={cn(
            "rounded-3xl px-4 py-3 break-words shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : isError
              ? "bg-destructive/10 border border-destructive/20 text-destructive"
              : "bg-card border border-card-border"
          )}
          data-testid={`bubble-${type}`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-line">{content}</p>
        </div>

        <div className="px-2">
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
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
