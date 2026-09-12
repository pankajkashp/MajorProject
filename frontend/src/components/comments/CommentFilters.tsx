"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";

interface CommentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  sentiment: string;
  onSentimentChange: (v: string) => void;
  stakeholder: string;
  onStakeholderChange: (v: string) => void;
  section: string;
  onSectionChange: (v: string) => void;
  onReset: () => void;
}

export const CommentFilters: React.FC<CommentFiltersProps> = ({
  search,
  onSearchChange,
  sentiment,
  onSentimentChange,
  stakeholder,
  onStakeholderChange,
  section,
  onSectionChange,
  onReset,
}) => {
  const hasActiveFilters =
    search !== "" || sentiment !== "All" || stakeholder !== "All" || section !== "All";

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search comment text, organization, or clause keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Sentiment Filter */}
        <div className="w-full md:w-44">
          <select
            value={sentiment}
            onChange={(e) => onSentimentChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900"
          >
            <option value="All">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
            <option value="Neutral">Neutral</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        {/* Stakeholder Category Filter */}
        <div className="w-full md:w-52">
          <select
            value={stakeholder}
            onChange={(e) => onStakeholderChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900"
          >
            <option value="All">All Stakeholders</option>
            <option value="MSME & Startup Sector">MSME & Startup Sector</option>
            <option value="Industry Association">Industry Association</option>
            <option value="Legal & Policy Think Tank">Legal & Policy Think Tank</option>
            <option value="Consumer Advocacy">Consumer Advocacy</option>
            <option value="Academic & Research">Academic & Research</option>
            <option value="Individual Citizen">Individual Citizen</option>
            <option value="Cloud Service Provider">Cloud Service Provider</option>
            <option value="Legal Expert">Legal Expert</option>
            <option value="Tech Startup">Tech Startup</option>
          </select>
        </div>

        {/* Section / Clause Filter */}
        <div className="w-full md:w-52">
          <select
            value={section}
            onChange={(e) => onSectionChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900"
          >
            <option value="All">All Clauses</option>
            <option value="Clause 3">Clause 3 (Data Localization)</option>
            <option value="Clause 7">Clause 7 (MSME Timelines)</option>
            <option value="Clause 12">Clause 12 (AI & Audit)</option>
            <option value="Clause 15">Clause 15 (Grievance)</option>
            <option value="Clause 19">Clause 19 (Cross-Border)</option>
            <option value="Clause 23">Clause 23 (Penalties)</option>
          </select>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
