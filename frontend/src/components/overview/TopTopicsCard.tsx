"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import { TopicMetric } from "@/lib/types";

interface TopTopicsCardProps {
  topics?: TopicMetric[];
}

export const TopTopicsCard: React.FC<TopTopicsCardProps> = ({ topics = [] }) => {
  if (!topics || topics.length === 0) {
    return <div className="h-48 bg-slate-50 animate-pulse rounded" />;
  }

  const maxCount = Math.max(...topics.map((t) => t.count), 1);

  return (
    <div className="space-y-4">
      {topics.map((t) => {
        const barWidth = Math.round((t.count / maxCount) * 100);
        return (
          <div key={t.topic} className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 truncate max-w-[280px]">
                {t.topic}
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-900">{t.count} comments</span>
                <span className="text-slate-500">({t.percentage}%)</span>
              </div>
            </div>

            {/* Horizontal Bar */}
            <div className="h-2.5 w-full rounded bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${barWidth}%` }}
                className="h-full bg-slate-700 rounded"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>
                Net sentiment:{" "}
                <strong className={t.sentiment_score < 0 ? "text-red-700" : "text-emerald-700"}>
                  {t.sentiment_score > 0 ? `+${t.sentiment_score}` : t.sentiment_score}
                </strong>
              </span>
              {t.critical_concerns_count > 0 && (
                <span className="text-red-800 font-medium">
                  {t.critical_concerns_count} high-priority concerns
                </span>
              )}
            </div>
          </div>
        );
      })}

      <div className="pt-2 border-t border-slate-100 text-right">
        <Link
          href="/topics"
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
        >
          View all consultation topics <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
