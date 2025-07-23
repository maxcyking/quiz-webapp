"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  score: number;
  className?: string;
}

export function ScoreBar({ score, className }: ScoreBarProps) {
  // Calculate the appropriate width class based on score
  const widthClass = useMemo(() => {
    // Tailwind only allows predefined classes, so we map score ranges to specific width classes
    if (score <= 0) return "w-0";
    if (score <= 5) return "w-[5%]";
    if (score <= 10) return "w-[10%]";
    if (score <= 15) return "w-[15%]";
    if (score <= 20) return "w-[20%]";
    if (score <= 25) return "w-[25%]";
    if (score <= 30) return "w-[30%]";
    if (score <= 35) return "w-[35%]";
    if (score <= 40) return "w-[40%]";
    if (score <= 45) return "w-[45%]";
    if (score <= 50) return "w-[50%]";
    if (score <= 55) return "w-[55%]";
    if (score <= 60) return "w-[60%]";
    if (score <= 65) return "w-[65%]";
    if (score <= 70) return "w-[70%]";
    if (score <= 75) return "w-[75%]";
    if (score <= 80) return "w-[80%]";
    if (score <= 85) return "w-[85%]";
    if (score <= 90) return "w-[90%]";
    if (score <= 95) return "w-[95%]";
    return "w-full";
  }, [score]);

  return (
    <div className={cn("h-2 w-24 bg-muted rounded-full overflow-hidden", className)}>
      <div className={cn("h-full bg-primary transition-all duration-300", widthClass)} />
    </div>
  );
}