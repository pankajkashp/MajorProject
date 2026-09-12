"use client";

import React from "react";
import Link from "next/link";
import { AlertOctagon, ArrowRight, CheckCircle2 } from "lucide-react";
import { PriorityAlert } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface PriorityAlertsCardProps {
  alerts?: PriorityAlert[];
}

export const PriorityAlertsCard: React.FC<PriorityAlertsCardProps> = ({
  alerts = [],
}) => {
  if (!alerts || alerts.length === 0) {
    return <div className="h-48 bg-slate-50 animate-pulse rounded" />;
  }

  const getPriorityVariant = (level: string) => {
    switch (level.toLowerCase()) {
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
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="p-4 rounded-lg border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant={getPriorityVariant(alert.priority_level)} size="sm">
                  <AlertOctagon className="w-3 h-3" />
                  {alert.priority_level} Priority (Score: {alert.priority_score})
                </Badge>
                <span className="text-xs text-slate-400 font-mono">{alert.id}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {alert.headline}
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="font-semibold text-slate-700">Action: </span>
                {alert.suggested_action}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400">Affected:</span>
              {alert.affected_stakeholders.slice(0, 2).map((s) => (
                <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  {s}
                </span>
              ))}
              {alert.affected_stakeholders.length > 2 && (
                <span className="text-[11px] text-slate-400">+{alert.affected_stakeholders.length - 2} more</span>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="pt-2 text-right">
        <Link
          href="/insights"
          className="text-xs font-semibold text-slate-900 hover:text-emerald-700 inline-flex items-center gap-1"
        >
          View Evidence-Linked Policy Insights <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
