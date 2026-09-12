"use client";

import React, { useEffect, useState } from "react";
import { Activity, Database, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { HealthResponse } from "@/lib/types";

export const Header: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
        setIsLive(true);
      } catch (err) {
        setIsLive(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Draft Digital Platform Accountability Guidelines, 2026
          </h2>
          <p className="text-xs text-slate-500">
            Reference: <span className="font-mono text-slate-700">DPA-CONS-2026</span> • Consultation Window: Open
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        {/* Backend & Provider Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium text-slate-700">Backend Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="font-medium text-rose-700">Backend Disconnected</span>
              </>
            )}
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-600">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{health?.total_records || 25} submissions</span>
          </div>
        </div>

        {/* Local Provider Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50/70 border border-emerald-200/80 text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Local NLP Pipeline Active</span>
        </div>
      </div>
    </header>
  );
};
