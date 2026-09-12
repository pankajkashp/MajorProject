import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "critical" | "high" | "medium" | "low" | "positive" | "negative" | "neutral" | "mixed" | "outline" | "default";
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
  size = "md",
}) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  let variantClass = "bg-slate-100 text-slate-800 border border-slate-200";

  switch (variant) {
    case "critical":
      variantClass = "bg-rose-50 text-rose-800 border border-rose-200";
      break;
    case "high":
      variantClass = "bg-amber-50 text-amber-800 border border-amber-200";
      break;
    case "medium":
      variantClass = "bg-blue-50 text-blue-800 border border-blue-200";
      break;
    case "low":
      variantClass = "bg-slate-100 text-slate-700 border border-slate-200";
      break;
    case "positive":
      variantClass = "bg-emerald-50 text-emerald-800 border border-emerald-200";
      break;
    case "negative":
      variantClass = "bg-rose-50 text-rose-800 border border-rose-200";
      break;
    case "neutral":
      variantClass = "bg-slate-100 text-slate-700 border border-slate-200";
      break;
    case "mixed":
      variantClass = "bg-purple-50 text-purple-800 border border-purple-200";
      break;
    case "outline":
      variantClass = "bg-transparent text-slate-700 border border-slate-300";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md tracking-tight ${sizeClasses} ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};
