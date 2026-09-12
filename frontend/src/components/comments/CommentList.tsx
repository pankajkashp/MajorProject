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
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded p-12 text-center">
        <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-900">No matching consultation comments</h3>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your keyword search or active filters.</p>
      </div>
    );
  }

  const getSentimentBadge = (label?: string) => {
    switch (label?.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "negative":
        return "bg-red-50 text-red-800 border-red-200";
      case "mixed":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-semibold">
              <th className="py-2.5 px-3 whitespace-nowrap">ID</th>
              <th className="py-2.5 px-3">Stakeholder</th>
              <th className="py-2.5 px-3">Section</th>
              <th className="py-2.5 px-3">Topic</th>
              <th className="py-2.5 px-3">Sentiment</th>
              <th className="py-2.5 px-3">Submission Summary / Snippet</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comments.map((c) => {
              const analysis = c.analysis;
              const orgName = c.organization_or_individual || c.metadata?.organization_or_individual;

              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectComment(c)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 align-top font-mono font-bold text-slate-800 whitespace-nowrap">
                    {c.id}
                  </td>

                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{c.stakeholder_type}</div>
                    {orgName && <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{orgName}</div>}
                  </td>

                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                      {c.section || "General"}
                    </span>
                  </td>

                  <td className="py-3 px-3 align-top">
                    <div className="font-medium text-slate-800 truncate max-w-[180px]">
                      {analysis?.topic?.primary_topic || "General Governance"}
                    </div>
                  </td>

                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    {analysis && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSentimentBadge(analysis.sentiment.label)}`}>
                        {analysis.sentiment.label}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 align-top">
                    <p className="text-slate-700 line-clamp-2 leading-relaxed">
                      "{c.comment}"
                    </p>
                    {analysis && (
                      <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                        {analysis.concerns.length > 0 && (
                          <span className="text-red-700 font-medium">
                            • {analysis.concerns.length} concern flagged
                          </span>
                        )}
                        {analysis.suggestions.length > 0 && (
                          <span className="text-emerald-700 font-medium">
                            • {analysis.suggestions.length} proposal
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-0.5">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
