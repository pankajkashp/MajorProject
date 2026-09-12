"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareText,
  Lightbulb,
  FolderTree,
  FlaskConical,
  Scale,
  FileCheck2,
  Layers
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: "/",
      icon: LayoutDashboard,
      description: "Consultation Analytics & Metrics",
    },
    {
      name: "Comments",
      href: "/comments",
      icon: MessageSquareText,
      description: "Exploration & Granular Extractions",
    },
    {
      name: "Insights",
      href: "/insights",
      icon: Lightbulb,
      description: "Evidence-Linked Policy Synthesis",
    },
    {
      name: "Topics",
      href: "/topics",
      icon: FolderTree,
      description: "Clause & Thematic Breakdown",
    },
    {
      name: "Analyze Playground",
      href: "/analyze",
      icon: FlaskConical,
      description: "Ad-hoc / Batch Comment Analysis",
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-semibold">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">PolicyLens</h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
              v0.1 Prototype
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">E-Consultation Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Consultation Modules
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors group ${
                isActive
                  ? "bg-slate-800 text-white font-medium border-l-4 border-emerald-500 rounded-l-none pl-2.5"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <div>
                <div>{item.name}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dataset & Research Scope Notice */}
      <div className="p-4 m-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1.5">
          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Dataset</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Draft Digital Platform Guidelines (Synthetic Demo Corpus).
        </p>
        <div className="mt-2 text-[10px] text-slate-400">
          Research Milestone: 40% Core
        </div>
      </div>
    </aside>
  );
};
