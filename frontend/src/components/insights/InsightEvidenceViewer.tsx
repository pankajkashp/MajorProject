"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { PolicyInsight } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { CheckCircle2, Calculator, Users, Quote, AlertTriangle, Lightbulb } from "lucide-react";

interface InsightEvidenceViewerProps {
  insight: PolicyInsight | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InsightEvidenceViewer: React.FC<InsightEvidenceViewerProps> = ({
  insight,
  isOpen,
  onClose,
}) => {
  if (!insight) return null;

  const factors = insight.priority_factors;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Policy Insight: ${insight.id}`}
      subtitle={`${insight.topic} • ${insight.frequency} Submissions (${insight.frequency_percentage}%)`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs text-slate-800">
        {/* Header Summary Banner */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
              Research Finding & Issue
            </span>
            <PriorityBadge level={insight.priority_level} score={insight.priority_score} />
          </div>
          <h4 className="text-base font-bold leading-snug">{insight.title}</h4>
        </div>

        {/* Section 1: Finding & What stakeholders are proposing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-red-50/70 border border-red-200 rounded space-y-1.5">
            <div className="font-bold text-red-900 uppercase text-[11px] tracking-wide">
              Finding (Recurring Concern)
            </div>
            <p className="text-slate-800 leading-relaxed">{insight.concern}</p>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded space-y-1.5">
            <div className="font-bold text-emerald-900 uppercase text-[11px] tracking-wide">
              What stakeholders are proposing
            </div>
            <p className="text-slate-800 leading-relaxed">{insight.suggestion}</p>
          </div>
        </div>

        {/* Section 2: Why this is prioritized & Factor Breakdown */}
        {factors && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-xs">
                Why this is prioritized
              </div>
              <span className="font-mono text-slate-700 font-semibold">
                Priority score: {insight.priority_score} / 100 [{insight.priority_level}]
              </span>
            </div>

            <p className="text-slate-700 leading-relaxed">
              {insight.priority_explanation}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[11px]">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Severity factor</span>
                <span className="font-bold text-slate-900">+{factors.severity_score} pts</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Stakeholder diversity</span>
                <span className="font-bold text-slate-900">+{factors.stakeholder_diversity_score} pts</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Frequency share</span>
                <span className="font-bold text-slate-900">+{factors.frequency_score} pts</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Sentiment intensity</span>
                <span className="font-bold text-slate-900">+{factors.sentiment_intensity_score} pts</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Supporting Evidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
            <span>Supporting evidence ({insight.supporting_evidence.length} submissions)</span>
            <span className="font-mono text-[11px] text-slate-500 font-normal">
              Direct consultation citations
            </span>
          </div>

          <div className="space-y-3">
            {insight.supporting_evidence.map((eq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded p-4 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {eq.comment_id}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {eq.organization_or_individual || eq.stakeholder_type}
                    </span>
                    <span className="text-slate-500">({eq.stakeholder_type})</span>
                  </div>
                  {eq.section && (
                    <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                      {eq.section}
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed italic bg-slate-50/70 p-3 rounded border border-slate-100">
                  "{eq.verbatim_text}"
                </div>

                {/* Granular Extractions */}
                {(eq.extracted_concerns?.length > 0 || eq.extracted_suggestions?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    {eq.extracted_concerns?.length > 0 && (
                      <div className="p-2 bg-red-50/60 rounded border border-red-100 text-red-900">
                        <span className="font-semibold block mb-0.5">Identified concern:</span>
                        <span>{eq.extracted_concerns[0]}</span>
                      </div>
                    )}
                    {eq.extracted_suggestions?.length > 0 && (
                      <div className="p-2 bg-emerald-50/60 rounded border border-emerald-100 text-emerald-900">
                        <span className="font-semibold block mb-0.5">Suggested response:</span>
                        <span>{eq.extracted_suggestions[0]}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
