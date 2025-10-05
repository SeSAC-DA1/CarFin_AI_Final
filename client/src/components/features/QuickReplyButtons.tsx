import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuickReply {
  label: string;
  value: string;
  icon?: LucideIcon;
}

interface QuickReplyButtonsProps {
  options: QuickReply[];
  onSelect: (value: string) => void;
  className?: string;
}

export default function QuickReplyButtons({ options, onSelect, className }: QuickReplyButtonsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} data-testid="quick-replies">
      {options.map((option, index) => {
        const Icon = option.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(option.value)}
            className="gap-2 rounded-full hover-elevate shadow-sm"
            data-testid={`quick-reply-${index}`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
