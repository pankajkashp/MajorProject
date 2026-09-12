"use client";

import React from "react";
import { PolicyInsight } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { Button } from "@/components/ui/Button";
import {
  FileCheck2,
  Users,
  AlertTriangle,
  Lightbulb,
  Calculator,
  Layers
} from "lucide-react";

interface InsightCardProps {
  insight: PolicyInsight;
  onViewEvidence: (insight: PolicyInsight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onViewEvidence,
}) => {
  const breakdown = insight.priority_breakdown;

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <PriorityBadge level={insight.priority_level} score={insight.priority_score} />
            <span className="text-xs font-mono text-slate-400 font-semibold">{insight.id}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{insight.frequency_count} Submissions</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {insight.title}
        </h3>

        {/* Section & Consensus Tag */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {insight.section && (
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {insight.section}
            </span>
          )}
          <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
            {insight.stakeholder_consensus}
          </span>
        </div>
      </div>

      {/* Concern vs Suggestion Comparison Boxes */}
      <div className="space-y-2.5 text-xs">
        {/* Extracted Concern Friction */}
        <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 text-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-rose-800 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Empirical Friction Identified</span>
          </div>
          <p className="leading-relaxed text-slate-700">{insight.concern_summary}</p>
        </div>

        {/* Actionable Suggestion */}
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-800 mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
            <span>Synthesized Recommendation</span>
          </div>
          <p className="leading-relaxed text-slate-700">{insight.suggestion_summary}</p>
        </div>

        {/* Explainable Priority Breakdown Bar */}
        {breakdown && (
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span className="flex items-center gap-1">
                <Calculator className="w-3 h-3 text-slate-500" />
                Explainable Priority Breakdown
              </span>
              <span className="font-mono text-emerald-800">{insight.priority_score} / 100</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500 font-mono">
              <div>Severity: +{breakdown.severity_component}</div>
              <div>Stakeholders: +{breakdown.stakeholder_diversity_component}</div>
              <div>Volume: +{breakdown.volume_component}</div>
              <div>Friction: +{breakdown.negative_friction_component}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Stakeholder list and Evidence Link */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Affected Groups:</span>
          {insight.affected_stakeholders.map((st) => (
            <span
              key={st}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
            >
              {st}
            </span>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewEvidence(insight)}
          icon={<FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />}
          className="hover:border-emerald-500 text-slate-900"
        >
          Inspect Evidence ({insight.evidence_quotes.length})
        </Button>
      </div>
    </div>
  );
};
