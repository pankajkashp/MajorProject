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

  return (
    <div className="space-y-3">
      {topics.map((t) => (
        <div
          key={t.topic}
          className="p-3.5 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 transition-colors flex items-center justify-between"
        >
          <div className="flex-1 min-w-0 mr-4">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{t.topic}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span>{t.count} submissions ({t.percentage}%)</span>
              <span>•</span>
              <span
                className={`font-medium ${
                  t.sentiment_score < -0.2
                    ? "text-rose-600"
                    : t.sentiment_score > 0.2
                    ? "text-emerald-600"
                    : "text-slate-600"
                }`}
              >
                Sentiment: {t.sentiment_score > 0 ? `+${t.sentiment_score}` : t.sentiment_score}
              </span>
            </div>
          </div>
          {t.critical_concerns_count > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" />
              {t.critical_concerns_count} flags
            </span>
          )}
        </div>
      ))}
      <div className="pt-2 text-right">
        <Link
          href="/topics"
          className="text-xs font-semibold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1"
        >
          Explore All Topics <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
