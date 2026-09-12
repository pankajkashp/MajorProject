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
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consultation overview
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Analysis of stakeholder feedback across the current consultation dataset.
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
            Refresh data
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded bg-red-50 border border-red-200 text-red-800 text-xs">
          <strong>Error loading consultation metrics: </strong> {error}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={loadData}>
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <MetricCards data={data} loading={loading} />

      {/* Section: Overall Sentiment */}
      <Card>
        <CardHeader
          title="Overall sentiment"
          subtitle="Distribution of positive, negative, mixed, and neutral stances across submissions"
        />
        <SentimentChart
          distribution={data?.sentiment_distribution}
          total={data?.total_comments || 0}
        />
      </Card>

      {/* Section: Priority Concerns */}
      <Card>
        <CardHeader
          title="Priority concerns"
          subtitle="Critical policy issues ranked by severity, stakeholder consensus, and submission frequency"
        />
        <PriorityAlertsCard alerts={data?.priority_alerts} />
      </Card>

      {/* Section: Where feedback is concentrated & Stakeholder breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Where feedback is concentrated"
            subtitle="Feedback density, submission counts, and net sentiment by legislative topic"
          />
          <TopTopicsCard topics={data?.top_topics} />
        </Card>

        <Card>
          <CardHeader
            title="Stakeholder representation"
            subtitle="Volume and predominant stance across organization categories"
          />
          <StakeholderBreakdown stakeholders={data?.stakeholder_breakdown} />
        </Card>
      </div>
    </div>
  );
}
