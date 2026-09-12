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
import { RefreshCw, Download, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OverviewPage() {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
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
              E-Consultation Analysis Report
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consultation Synthesis & Sentiment Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Automated linguistic extraction, sentiment evaluation, and evidence-linked policy recommendations.
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
          The figures below are generated from a synthetic demonstration dataset representing simulated public consultation comments on digital governance.
        </div>
      </div>

      {/* KPI Metric Cards */}
      <MetricCards data={data} loading={loading} />

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
            subtitle="Feedback distribution and sentiment intensity by clause"
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
