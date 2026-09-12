"use client";

import React from "react";
import { ConsultationComment } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { ChevronRight, MessageSquare, AlertCircle, Lightbulb } from "lucide-react";

interface CommentListProps {
  comments: ConsultationComment[];
  loading: boolean;
  onSelectComment: (comment: ConsultationComment) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  loading,
  onSelectComment,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-white rounded-lg border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">No matching consultation comments</h3>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your keyword search or category filters.</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-3">
      {comments.map((c) => {
        const analysis = c.analysis;
        const orgName = c.organization_or_individual || c.metadata?.organization_or_individual;

        return (
          <div
            key={c.id}
            onClick={() => onSelectComment(c)}
            className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-sm rounded-lg p-4 transition-all cursor-pointer group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {c.id}
                </span>
                <span className="text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {c.stakeholder_type || "Stakeholder"}
                </span>
                {orgName && (
                  <span className="text-xs text-slate-500 truncate max-w-[200px]">
                    • {orgName}
                  </span>
                )}
                {c.section && (
                  <span className="text-xs text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/80 font-medium">
                    {c.section}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {analysis && (
                  <Badge variant={getSentimentVariant(analysis.sentiment.label)} size="sm">
                    {analysis.sentiment.label} ({analysis.sentiment.score > 0 ? `+${analysis.sentiment.score}` : analysis.sentiment.score})
                  </Badge>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Comment Text Snippet */}
            <p className="text-xs sm:text-sm text-slate-700 line-clamp-2 leading-relaxed font-normal">
              "{c.comment}"
            </p>

            {/* Micro Extractions Pill bar */}
            {analysis && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {analysis.concerns.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50/80 px-1.5 py-0.5 rounded border border-rose-200/60 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {analysis.concerns.length} concern{analysis.concerns.length > 1 ? "s" : ""} flagged
                    </span>
                  )}
                  {analysis.suggestions.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium">
                      <Lightbulb className="w-3 h-3" />
                      {analysis.suggestions.length} proposal{analysis.suggestions.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Topic: {analysis.topic.primary_topic}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
