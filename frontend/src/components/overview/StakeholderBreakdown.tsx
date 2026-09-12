"use client";

import React from "react";
import { StakeholderMetric } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface StakeholderBreakdownProps {
  stakeholders?: StakeholderMetric[];
}

export const StakeholderBreakdown: React.FC<StakeholderBreakdownProps> = ({
  stakeholders = [],
}) => {
  if (!stakeholders || stakeholders.length === 0) {
    return <div className="h-48 bg-slate-50 animate-pulse rounded" />;
  }

  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "positive";
      case "negative":
        return "negative";
      case "mixed":
        return "mixed";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-3">
      {stakeholders.map((st) => (
        <div
          key={st.stakeholder_type}
          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
        >
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900 truncate">
                {st.stakeholder_type}
              </span>
              <span className="text-xs text-slate-400 font-mono">({st.count})</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full transition-all duration-300"
                style={{ width: `${st.percentage}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={getSentimentVariant(st.predominant_sentiment)} size="sm">
              {st.predominant_sentiment}
            </Badge>
            <span className="text-xs font-semibold text-slate-700 w-10 text-right">
              {st.percentage}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
