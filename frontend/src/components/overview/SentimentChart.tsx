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
      color: "bg-red-700",
      textColor: "text-red-800",
      bgColor: "bg-red-50/70 border-red-200",
      description: "Submissions raising concerns, compliance burden, or pushback",
    },
    {
      label: "Mixed",
      count: distribution.mixed,
      color: "bg-amber-600",
      textColor: "text-amber-800",
      bgColor: "bg-amber-50/70 border-amber-200",
      description: "Submissions supporting intent while proposing modifications",
    },
    {
      label: "Neutral",
      count: distribution.neutral,
      color: "bg-slate-500",
      textColor: "text-slate-800",
      bgColor: "bg-slate-50 border-slate-200",
      description: "Factual inquiries or procedural submissions",
    },
    {
      label: "Positive",
      count: distribution.positive,
      color: "bg-emerald-700",
      textColor: "text-emerald-800",
      bgColor: "bg-emerald-50/70 border-emerald-200",
      description: "Unqualified support and endorsements",
    },
  ];

  // Plain-language interpretation
  const dominant = items.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), items[0]);
  let interpretation = `Stakeholder sentiment is predominantly ${dominant.label.toLowerCase()} (${Math.round((dominant.count / total) * 100)}% of total responses).`;
  if (dominant.label === "Negative" || dominant.label === "Mixed") {
    interpretation += " Most feedback highlights operational friction, transition timelines, and penalty concerns rather than outright rejection of regulatory intent.";
  } else if (dominant.label === "Positive") {
    interpretation += " High general agreement across the drafted provisions.";
  }

  return (
    <div className="space-y-4">
      {/* Visual Stack Bar */}
      <div className="h-4 w-full rounded overflow-hidden flex bg-slate-100 border border-slate-200">
        {items.map((item) => {
          const pct = (item.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={item.label}
              style={{ width: `${pct}%` }}
              className={`${item.color} h-full`}
              title={`${item.label}: ${item.count} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Grid breakdown with counts & percentages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {items.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div
              key={item.label}
              className={`p-2.5 rounded border text-xs ${item.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{item.label}</span>
                <span className={`font-bold ${item.textColor}`}>{pct}%</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600 font-mono">
                {item.count} submissions
              </div>
            </div>
          );
        })}
      </div>

      {/* Plain Language Interpretation */}
      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed">
        <strong className="text-slate-900">Interpretation: </strong>
        {interpretation}
      </div>
    </div>
  );
};
