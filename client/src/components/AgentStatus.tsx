import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageCircle, Search, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const agents: Array<{
  id: string;
  icon: LucideIcon;
  name: string;
  role: string;
  status: "active" | "thinking" | "idle";
}> = [
  {
    id: "concierge",
    icon: MessageCircle,
    name: "Concierge",
    role: "상담 관리",
    status: "active" as const
  },
  {
    id: "needs",
    icon: Search,
    name: "Needs Analyst",
    role: "니즈 분석",
    status: "active" as const
  },
  {
    id: "data",
    icon: BarChart3,
    name: "Data Analyst",
    role: "데이터 분석",
    status: "thinking" as const
  }
];

export default function AgentStatus() {
  return (
    <Card className="p-4 border-card-border sticky top-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1">AI 에이전트</h3>
          <p className="text-xs text-muted-foreground">Multi-Agent Collaboration</p>
        </div>

        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-card-border hover-elevate"
              data-testid={`agent-${agent.id}`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <agent.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium truncate">{agent.name}</h4>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      agent.status === "active" && "bg-chart-1 animate-pulse",
                      agent.status === "thinking" && "bg-chart-2 animate-pulse-slow",
                      agent.status === "idle" && "bg-muted"
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">진행률</span>
              <span className="font-mono font-medium">75%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: "75%" }} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
