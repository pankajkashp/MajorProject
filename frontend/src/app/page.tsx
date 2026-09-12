"use client";

import React, { useEffect, useState } from "react";
import { MetricCards } from "@/components/overview/MetricCards";
import { SentimentChart } from "@/components/overview/SentimentChart";
import { StakeholderBreakdown } from "@/components/overview/StakeholderBreakdown";
import { TopTopicsCard } from "@/components/overview/TopTopicsCard";
import { PriorityAlertsCard } from "@/components/overview/PriorityAlertsCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { DashboardSummaryResponse } from "@/lib/types";
import { RefreshCw, Info, AlertTriangle, Lightbulb, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OverviewPage() {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load dashboard summary:", err);
      setError(err.message || "Could not connect to backend API server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Editorial Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold uppercase">
              E-Consultation Intelligence Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consultation Synthesis & Sentiment Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time linguistic extraction, sentiment evaluation, and evidence-linked policy recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Research Disclaimer Alert */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold">Research Prototype Notice: </span>
          The metrics and recommendations below are computed in real-time from a synthetic demonstration dataset representing simulated stakeholder consultation comments on digital governance.
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <strong>API Connection Error: </strong> {error}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={loadData}>
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <MetricCards data={data} loading={loading} />

      {/* Global Top Policy Themes Summary Banner */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-4 text-xs space-y-2">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Top Friction Themes Identified Across Corpus</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.top_concerns_summary.map((con) => (
                <span key={con} className="px-2 py-0.5 rounded bg-white text-rose-800 border border-rose-200 text-[11px] font-medium">
                  {con}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-4 text-xs space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>Top Actionable Proposals Extracted</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.top_suggestions_summary.map((sug) => (
                <span key={sug} className="px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                  {sug}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid Row 1: Sentiment & Stakeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Public Sentiment Distribution"
            subtitle="Polarity categorization of submitted consultation feedback"
          />
          <SentimentChart
            distribution={data?.sentiment_distribution}
            total={data?.total_comments || 0}
          />
        </Card>

        <Card>
          <CardHeader
            title="Stakeholder Representation & Stance"
            subtitle="Volume and predominant stance by organization type"
          />
          <StakeholderBreakdown stakeholders={data?.stakeholder_breakdown} />
        </Card>
      </div>

      {/* Grid Row 2: Top Topics & High Priority Policy Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Key Regulatory Clauses & Topics"
            subtitle="Feedback density, polarity index, and critical risk flags"
          />
          <TopTopicsCard topics={data?.top_topics} />
        </Card>

        <Card>
          <CardHeader
            title="High-Priority Policy Alerts"
            subtitle="Actionable friction items ranked by severity & stakeholder consensus"
          />
          <PriorityAlertsCard alerts={data?.priority_alerts} />
        </Card>
      </div>
    </div>
  );
}
