"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardSummaryResponse, TopicMetric } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FolderTree, AlertCircle, MessageSquareText, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TopicsPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const res = await api.getDashboardSummary();
        setSummary(res);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Regulatory Topics & Clause Breakdown
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Detailed breakdown of feedback density, sentiment polarity, and risk exposure per legislative section.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-lg border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {summary?.top_topics.map((t) => {
            const isNegative = t.sentiment_score < -0.2;
            const isPositive = t.sentiment_score > 0.2;

            return (
              <div
                key={t.topic}
                className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{t.topic}</h3>
                    </div>
                    {t.critical_concerns_count > 0 && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex-shrink-0">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t.critical_concerns_count} flags
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-4">
                    Accounted for <strong className="text-slate-800">{t.count}</strong> submissions (<strong>{t.percentage}%</strong> of consultation volume).
                  </p>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Sentiment Polarity</span>
                      <span
                        className={`font-bold flex items-center gap-1 mt-0.5 ${
                          isNegative ? "text-rose-600" : isPositive ? "text-emerald-600" : "text-slate-700"
                        }`}
                      >
                        {isNegative ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        {t.sentiment_score > 0 ? `+${t.sentiment_score}` : t.sentiment_score}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Friction Intensity</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">
                        {t.critical_concerns_count >= 2 ? "High Regulatory Resistance" : "Moderate Friction"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/comments?search=${encodeURIComponent(t.topic.split("&")[0].trim())}`}
                    className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                  >
                    View Related Comments <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/insights"
                    className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                  >
                    Inspect Policy Insights
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
