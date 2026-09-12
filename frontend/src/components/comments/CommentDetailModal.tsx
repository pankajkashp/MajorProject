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
      title={`Submission Analysis: ${comment.id}`}
      subtitle={`${comment.stakeholder_type || "Stakeholder"} • ${comment.section || "General Feedback"}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block font-mono uppercase text-[10px]">Stakeholder</span>
            <span className="font-semibold text-slate-900">{comment.stakeholder_type || "General"}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono uppercase text-[10px]">Entity / Submitter</span>
            <span className="font-medium text-slate-900 truncate block">
              {comment.organization_or_individual || comment.metadata?.organization_or_individual || "Confidential"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono uppercase text-[10px]">Target Clause</span>
            <span className="font-medium text-slate-900 truncate block">{comment.section || "General"}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono uppercase text-[10px]">Submission ID</span>
            <span className="font-mono text-slate-700">{comment.id}</span>
          </div>
        </div>

        {/* Verbatim Text */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Quote className="w-3.5 h-3.5 text-slate-500" />
            <span>Verbatim Consultation Submission</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 text-slate-100 text-sm leading-relaxed font-serif border border-slate-800">
            "{comment.comment}"
          </div>
        </div>

        {/* AI/NLP Extraction Panel */}
        {analysis && (
          <div className="space-y-5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Extracted Policy Intelligence</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Pipeline v0.1 • Processed: {new Date(analysis.processed_at).toLocaleTimeString()}
              </span>
            </div>

            {/* Sentiment & Topic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sentiment Card */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">Sentiment Evaluation</span>
                  <Badge variant={getSentimentVariant(analysis.sentiment.label)}>
                    {analysis.sentiment.label} ({analysis.sentiment.score > 0 ? `+${analysis.sentiment.score}` : analysis.sentiment.score})
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Confidence: <span className="font-semibold">{Math.round(analysis.sentiment.confidence * 100)}%</span>
                </p>
                {analysis.sentiment.polarity_cues.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Detected Cues:</span>
                    {analysis.sentiment.polarity_cues.map((cue) => (
                      <span key={cue} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                        {cue}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Topic Card */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">Primary Classification</span>
                  <Badge variant="outline">{Math.round(analysis.topic.confidence * 100)}% Match</Badge>
                </div>
                <h5 className="text-sm font-semibold text-slate-900">{analysis.topic.primary_topic}</h5>
                {analysis.topic.key_phrases.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Keywords:</span>
                    {analysis.topic.key_phrases.map((kw) => (
                      <span key={kw} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Concerns */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Extracted Policy Concerns & Risks ({analysis.concerns.length})</span>
              </h5>
              {analysis.concerns.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No explicit friction points extracted.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.concerns.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">{c.category}</div>
                        <p className="text-slate-700 leading-relaxed">{c.text}</p>
                      </div>
                      <Badge variant={getSeverityVariant(c.severity)} size="sm">
                        {c.severity} Severity
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Extracted Actionable Suggestions */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                <span>Extracted Actionable Suggestions ({analysis.suggestions.length})</span>
              </h5>
              {analysis.suggestions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No discrete recommendations proposed.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-emerald-900 mb-1">
                          Proposed Action: {s.action_type}
                        </div>
                        <p className="text-slate-700 leading-relaxed">{s.text}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold">
                        {s.action_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary & Takeaways */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-semibold text-slate-800">Distilled Policy Takeaway</div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {analysis.summary.tl_dr}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
