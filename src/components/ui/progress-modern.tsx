import React from "react";
import { cn } from "@/lib/utils";

interface ProgressModernProps {
  value: number;
  className?: string;
  variant?: "default" | "critical" | "performance";
  showAnimation?: boolean;
}

export const ProgressModern = React.forwardRef<
  HTMLDivElement,
  ProgressModernProps
>(({ value, className, variant = "default", showAnimation = true, ...props }, ref) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  const getVariantClass = () => {
    switch (variant) {
      case "critical":
        return "from-red-500 to-orange-500";
      case "performance":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-emerald-500 to-blue-500";
    }
  };

  return (
    <div
      ref={ref}
      className={cn("relative h-2 overflow-hidden rounded-full bg-secondary/50", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-500 ease-out rounded-full relative",
          "bg-gradient-to-r",
          getVariantClass()
        )}
        style={{ width: `${clampedValue}%` }}
      >
        {showAnimation && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-data-flow" />
        )}
      </div>
    </div>
  );
});

ProgressModern.displayName = "ProgressModern";