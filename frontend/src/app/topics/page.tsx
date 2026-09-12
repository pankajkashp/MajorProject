"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardSummaryResponse } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FolderTree, AlertCircle, MessageSquareText, TrendingUp, TrendingDown, ArrowRight, Lightbulb, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function TopicsPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary();
      setSummary(res);
    } catch (err: any) {
      console.error("Failed to fetch topics:", err);
      setError(err.message || "Failed to load topic analysis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consultation topics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Where stakeholder feedback is concentrated across the consultation.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTopics}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh topics
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <strong>API Error: </strong> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : !summary || summary.top_topics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500">
          No topic data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {summary.top_topics.map((t) => {
            const isNegative = t.sentiment_score < -0.15;
            const isPositive = t.sentiment_score > 0.15;

            return (
              <div
                key={t.topic}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all flex flex-col justify-between space-y-4"
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
                        {t.critical_concerns_count} risk flags
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    Accounted for <strong className="text-slate-800">{t.count}</strong> submissions (<strong>{t.percentage}%</strong> of consultation volume).
                  </p>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs mb-3">
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

                  {/* Top Concerns & Suggestions Pills */}
                  <div className="space-y-2 text-xs">
                    {t.top_concerns?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-rose-700 font-semibold flex items-center gap-1 flex-shrink-0 text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Concerns:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {t.top_concerns.map((con) => (
                            <span key={con} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-medium border border-rose-100">
                              {con}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {t.top_suggestions?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1 flex-shrink-0 text-[11px]">
                          <Lightbulb className="w-3 h-3 text-emerald-600" /> Proposals:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {t.top_suggestions.map((sug) => (
                            <span key={sug} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-100">
                              {sug}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/comments?search=${encodeURIComponent(t.topic.split("&")[0].trim())}`}
                    className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                  >
                    View Related Comments <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/insights?topic=${encodeURIComponent(t.topic.split("&")[0].trim())}`}
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
