"use client";

import { cn } from "../../lib/utils";

interface ProgressBarProps {
  percentage: number;
  variant: "correct" | "incorrect" | "unanswered";
}

export function ProgressBar({ percentage, variant }: ProgressBarProps) {
  const variantClasses = {
    correct: "bg-green-600",
    incorrect: "bg-red-600",
    unanswered: "bg-yellow-600"
  };

  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full transition-all duration-300",
          variantClasses[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}