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
          <div key={i} className="h-24 bg-white rounded border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Submissions analyzed */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
          Submissions analyzed
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{data.total_comments}</span>
          <span className="text-xs text-slate-500">total submissions</span>
        </div>
      </div>

      {/* Stakeholder groups */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
          Stakeholder groups
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{data.total_stakeholder_groups}</span>
          <span className="text-xs text-slate-500">represented categories</span>
        </div>
      </div>

      {/* Recurring policy issues */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
          Recurring policy issues
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{data.total_insights_generated}</span>
          <span className="text-xs text-slate-500">synthesized issues</span>
        </div>
      </div>

      {/* High-priority concerns */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs border-l-4 border-l-red-600">
        <span className="text-xs font-semibold text-red-900 uppercase tracking-wide block">
          High-priority concerns
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-700">{data.critical_friction_points}</span>
          <span className="text-xs text-red-800">requiring review</span>
        </div>
      </div>
    </div>
  );
};
