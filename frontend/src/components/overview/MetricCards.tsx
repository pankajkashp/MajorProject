"use client";

import React from "react";
import { MessageSquareText, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";
import { DashboardSummaryResponse } from "@/lib/types";

interface MetricCardsProps {
  data: DashboardSummaryResponse | null;
  loading: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-lg border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  const avgPolarity = data.sentiment_distribution.average_polarity;
  const polarityLabel =
    avgPolarity > 0.15 ? "Positive Lean" : avgPolarity < -0.15 ? "Resistance/Negative Lean" : "Neutral/Balanced";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Submissions */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Submissions
          </span>
          <div className="p-2 bg-slate-100 rounded-md text-slate-600">
            <MessageSquareText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{data.total_comments}</span>
          <span className="text-xs text-slate-500">Across {data.total_stakeholder_groups} stakeholder groups</span>
        </div>
      </div>

      {/* Net Polarity Index */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Net Sentiment Polarity
          </span>
          <div className="p-2 bg-slate-100 rounded-md text-slate-600">
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${avgPolarity < 0 ? "text-rose-700" : "text-emerald-700"}`}>
            {avgPolarity > 0 ? `+${avgPolarity.toFixed(2)}` : avgPolarity.toFixed(2)}
          </span>
          <span className="text-xs font-medium text-slate-600">{polarityLabel}</span>
        </div>
      </div>

      {/* Critical Friction Points */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Critical Friction Points
          </span>
          <div className="p-2 bg-rose-50 rounded-md text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-700">{data.critical_friction_points}</span>
          <span className="text-xs text-slate-500">High regulatory exposure</span>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Actionable Proposals
          </span>
          <div className="p-2 bg-emerald-50 rounded-md text-emerald-600">
            <Lightbulb className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-700">{data.actionable_suggestions_count}</span>
          <span className="text-xs text-slate-500">Specific amendment proposals</span>
        </div>
      </div>
    </div>
  );
};
