"use client";

import React, { useState, useEffect } from "react";
import { InsightCard } from "@/components/insights/InsightCard";
import { InsightEvidenceViewer } from "@/components/insights/InsightEvidenceViewer";
import { api } from "@/lib/api";
import { PolicyInsight, PolicyInsightListResponse } from "@/lib/types";
import { Lightbulb, Filter, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InsightsPage() {
  const [data, setData] = useState<PolicyInsightListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [selectedInsight, setSelectedInsight] = useState<PolicyInsight | null>(null);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getInsights({
        priorityLevel: priorityFilter !== "All" ? priorityFilter : undefined,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to load policy insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [priorityFilter]);

  const priorityTabs = [
    { label: "All Priorities", value: "All", count: data?.total },
    { label: "Critical", value: "Critical", count: data?.critical_count },
    { label: "High", value: "High", count: data?.high_count },
    { label: "Medium", value: "Medium", count: data?.medium_count },
    { label: "Low", value: "Low", count: data?.low_count },
  ];

  return (
    <div className="space-y-6">
      {/* Editorial Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold uppercase">
              Research Core Feature
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Evidence-Linked Policy Insights
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Synthesized policy recommendations integrating multi-stakeholder sentiment, operational concerns, and actionable proposals with verifiable quotation traceability.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadInsights}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Synthesis
        </Button>
      </div>

      {/* Priority Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        {priorityTabs.map((tab) => {
          const isActive = priorityFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setPriorityFilter(tab.value)}
              className={`px-3.5 py-2 rounded-t-md font-medium transition-colors flex items-center gap-2 border-b-2 -mb-[2px] ${
                isActive
                  ? "border-emerald-600 text-emerald-950 font-bold bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Insight Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No policy insights found</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching to another priority filter tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.items.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onViewEvidence={(ins) => setSelectedInsight(ins)}
            />
          ))}
        </div>
      )}

      {/* Evidence Viewer Drawer Modal */}
      <InsightEvidenceViewer
        insight={selectedInsight}
        isOpen={!!selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />
    </div>
  );
}
