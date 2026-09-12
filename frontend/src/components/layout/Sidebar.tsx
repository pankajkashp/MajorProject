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
    },
    {
      name: "Comments",
      href: "/comments",
      icon: MessageSquareText,
    },
    {
      name: "Insights",
      href: "/insights",
      icon: Lightbulb,
    },
    {
      name: "Topics",
      href: "/topics",
      icon: FolderTree,
    },
    {
      name: "Analyze",
      href: "/analyze",
      icon: FlaskConical,
    },
  ];

  return (
    <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-semibold shadow-xs">
          <Scale className="w-4 h-4 text-slate-200" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">PolicyLens</h1>
          </div>
          <p className="text-[11px] text-slate-400">Consultation Analysis</p>
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

      {/* Dataset & Consultation Info */}
      <div className="p-3.5 m-3 rounded bg-slate-950/80 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
          <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Consultation Context</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Draft Digital Platform Guidelines (Simulated Corpus).
        </p>
      </div>
    </aside>
  );
};
