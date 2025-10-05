import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend?: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-card-border bg-card/50">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 2500만원 이하 가족용 SUV 추천해주세요"
          className="min-h-[60px] max-h-32 resize-none"
          data-testid="input-chat-message"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim()}
          className="h-[60px] w-[60px] shrink-0"
          data-testid="button-send-message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Enter로 전송 · Shift+Enter로 줄바꿈
      </p>
    </div>
  );
}
