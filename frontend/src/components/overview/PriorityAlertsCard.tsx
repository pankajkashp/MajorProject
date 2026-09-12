"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertOctagon, ArrowRight, FileCheck2, Users, TrendingDown, ShieldAlert } from "lucide-react";
import { PriorityAlert, PolicyInsight } from "@/lib/types";
import { PriorityBadge } from "@/components/insights/PriorityBadge";
import { Button } from "@/components/ui/Button";
import { InsightEvidenceViewer } from "@/components/insights/InsightEvidenceViewer";
import { api } from "@/lib/api";

interface PriorityAlertsCardProps {
  alerts?: PriorityAlert[];
}

export const PriorityAlertsCard: React.FC<PriorityAlertsCardProps> = ({
  alerts = [],
}) => {
  const [selectedInsight, setSelectedInsight] = useState<PolicyInsight | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState<boolean>(false);

  const handleOpenEvidence = async (alertId: string) => {
    try {
      setLoadingEvidence(true);
      const fullInsight = await api.getInsightById(alertId);
      setSelectedInsight(fullInsight);
    } catch (err) {
      console.error("Failed to load full insight evidence:", err);
    } finally {
      setLoadingEvidence(false);
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded p-8 text-center text-xs text-slate-500">
        No high-priority concerns flagged in the current dataset.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Issue</th>
              <th className="py-2.5 px-3 text-right">Mentions</th>
              <th className="py-2.5 px-3">Stakeholder groups</th>
              <th className="py-2.5 px-3">Sentiment</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                onClick={() => handleOpenEvidence(alert.id)}
              >
                <td className="py-3 px-3 align-top whitespace-nowrap">
                  <PriorityBadge level={alert.priority_level} score={alert.priority_score} />
                </td>

                <td className="py-3 px-3 align-top">
                  <div className="font-bold text-slate-900 leading-snug">{alert.headline}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{alert.topic}</div>
                </td>

                <td className="py-3 px-3 align-top text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                  {alert.frequency}
                </td>

                <td className="py-3 px-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {alert.affected_stakeholders.slice(0, 2).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                    {alert.affected_stakeholders.length > 2 && (
                      <span className="text-[10px] text-slate-400">+{alert.affected_stakeholders.length - 2}</span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-3 align-top whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-800 border border-red-200">
                    {alert.dominant_sentiment}
                  </span>
                </td>

                <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEvidence(alert.id);
                    }}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    View evidence
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Showing top high-priority policy issues</span>
          <Link
            href="/insights"
            className="font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
          >
            All policy insights <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <InsightEvidenceViewer
        insight={selectedInsight}
        isOpen={!!selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />
    </>
  );
};
