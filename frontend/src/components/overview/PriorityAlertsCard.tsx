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
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
        No critical priority alerts detected in the consultation corpus.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 rounded-lg border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <PriorityBadge level={alert.priority_level} score={alert.priority_score} />
                  <span className="text-xs font-mono text-slate-400 font-semibold">{alert.id}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {alert.topic}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {alert.headline}
              </h4>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="font-semibold text-slate-800">Action Recommended: </span>
                {alert.suggested_action}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Affected:</span>
                {alert.affected_stakeholders.slice(0, 3).map((s) => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                    {s}
                  </span>
                ))}
                {alert.affected_stakeholders.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{alert.affected_stakeholders.length - 3} more</span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEvidence(alert.id)}
                icon={<FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />}
                className="text-[11px] hover:border-emerald-500"
              >
                Inspect Evidence
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-2 text-right">
          <Link
            href="/insights"
            className="text-xs font-semibold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Explore All Synthesized Policy Insights <ArrowRight className="w-3.5 h-3.5" />
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
