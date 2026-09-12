"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ConsultationComment } from "@/lib/types";
import {
  FileText,
  AlertTriangle,
  Lightbulb,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Quote
} from "lucide-react";

interface CommentDetailModalProps {
  comment: ConsultationComment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentDetailModal: React.FC<CommentDetailModalProps> = ({
  comment,
  isOpen,
  onClose,
}) => {
  if (!comment) return null;

  const analysis = comment.analysis;

  const getSentimentVariant = (label?: string) => {
    switch (label?.toLowerCase()) {
      case "positive":
        return "positive";
      case "negative":
        return "negative";
      case "mixed":
        return "mixed";
      default:
        return "neutral";
    }
  };

  const getSeverityVariant = (sev?: string) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
        return "medium";
      default:
        return "low";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submission Details: ${comment.id}`}
      subtitle={`${comment.stakeholder_type || "Stakeholder"} • ${comment.section || "General Submission"}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs text-slate-800">
        {/* Top Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Stakeholder</span>
            <span className="font-semibold text-slate-900">{comment.stakeholder_type || "General"}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Organization / Submitter</span>
            <span className="font-medium text-slate-900 truncate block">
              {comment.organization_or_individual || comment.metadata?.organization_or_individual || "Not specified"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Section</span>
            <span className="font-medium text-slate-900 truncate block">{comment.section || "General"}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Submission ID</span>
            <span className="font-mono text-slate-700">{comment.id}</span>
          </div>
        </div>

        {/* Original Submission Prominently */}
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-900 uppercase text-[11px] tracking-wide">
            Original submission
          </div>
          <div className="p-4 rounded bg-slate-900 text-slate-100 text-sm leading-relaxed font-serif">
            "{comment.comment}"
          </div>
        </div>

        {/* Analysis Breakdown */}
        {analysis && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            {/* Sentiment & Topic Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Sentiment</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getSentimentVariant(analysis.sentiment.label)}`}>
                    {analysis.sentiment.label} ({analysis.sentiment.score > 0 ? `+${analysis.sentiment.score}` : analysis.sentiment.score})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Confidence: {Math.round(analysis.sentiment.confidence * 100)}%
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">Topic</span>
                  <span className="font-medium text-slate-900">{analysis.topic.primary_topic}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Match confidence: {Math.round(analysis.topic.confidence * 100)}%
                </div>
              </div>
            </div>

            {/* Concern */}
            <div className="p-3 bg-red-50/70 border border-red-200 rounded space-y-1.5">
              <div className="font-bold text-red-900 uppercase text-[11px]">
                Concern ({analysis.concerns.length})
              </div>
              {analysis.concerns.length === 0 ? (
                <p className="text-slate-500 italic">No specific operational friction point raised.</p>
              ) : (
                <div className="space-y-1.5">
                  {analysis.concerns.map((c) => (
                    <div key={c.id} className="text-slate-800 leading-relaxed">
                      • <strong className="text-red-950">[{c.category}]</strong> {c.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestion */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded space-y-1.5">
              <div className="font-bold text-emerald-900 uppercase text-[11px]">
                Suggestion ({analysis.suggestions.length})
              </div>
              {analysis.suggestions.length === 0 ? (
                <p className="text-slate-500 italic">No specific amendment proposed.</p>
              ) : (
                <div className="space-y-1.5">
                  {analysis.suggestions.map((s) => (
                    <div key={s.id} className="text-slate-800 leading-relaxed">
                      • <strong className="text-emerald-950">[{s.action_type}]</strong> {s.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="font-bold text-slate-900 uppercase text-[11px]">
                Summary
              </div>
              <p className="text-slate-700 leading-relaxed">
                {analysis.summary.tl_dr}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
