"use client";

import React from "react";
import { SentimentDistribution } from "@/lib/types";

interface SentimentChartProps {
  distribution?: SentimentDistribution;
  total: number;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({
  distribution,
  total,
}) => {
  if (!distribution || total === 0) {
    return <div className="h-48 bg-slate-50 animate-pulse rounded" />;
  }

  const items = [
    {
      label: "Negative",
      count: distribution.negative,
      color: "bg-rose-500",
      textColor: "text-rose-700",
      bgColor: "bg-rose-50",
      description: "Concerns, burden, ambiguity, pushback",
    },
    {
      label: "Positive",
      count: distribution.positive,
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      description: "Support, endorsement, progressive alignment",
    },
    {
      label: "Neutral",
      count: distribution.neutral,
      color: "bg-slate-400",
      textColor: "text-slate-700",
      bgColor: "bg-slate-100",
      description: "Factual clarifications, standard inquiries",
    },
    {
      label: "Mixed",
      count: distribution.mixed,
      color: "bg-purple-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
      description: "Nuanced submissions with both praise & caveats",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Visual Stack Bar */}
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
        {items.map((item) => {
          const pct = (item.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={item.label}
              style={{ width: `${pct}%` }}
              className={`${item.color} h-full transition-all duration-500`}
              title={`${item.label}: ${item.count} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Grid breakdown */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {items.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div
              key={item.label}
              className={`p-3 rounded-lg border border-slate-200/80 ${item.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                <span className={`text-sm font-bold ${item.textColor}`}>{pct}%</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-xs text-slate-500">
                <span>{item.count} comments</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
