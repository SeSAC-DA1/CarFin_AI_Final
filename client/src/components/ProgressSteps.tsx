import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  status: "completed" | "active" | "pending";
}

interface ProgressStepsProps {
  steps: Step[];
}

export default function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 bg-card/50 border-y border-border">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  step.status === "completed" && "bg-primary text-primary-foreground",
                  step.status === "active" && "bg-primary/20 text-primary border-2 border-primary",
                  step.status === "pending" && "bg-muted text-muted-foreground"
                )}
                data-testid={`step-indicator-${step.id}`}
              >
                {step.status === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  step.status === "active" && "text-primary",
                  step.status === "pending" && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 transition-all",
                  step.status === "completed" ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
