"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { AnalysisResult } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FlaskConical,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileText,
  Play,
  RotateCcw
} from "lucide-react";

export default function AnalyzePage() {
  const [commentText, setCommentText] = useState<string>(
    "The proposed 30-day compliance timeline in Clause 7 is severely burdensome for seed-stage startups and MSMEs with limited legal and compliance teams. We strongly suggest extending the transition period to at least 180 days with a tiered phase-in approach based on turnover, which will prevent disproportionate operational disruption."
  );
  const [section, setSection] = useState<string>("Clause 7 - Compliance Timelines for MSMEs");
  const [stakeholder, setStakeholder] = useState<string>("MSME & Startup Sector");
  const [org, setOrg] = useState<string>("Federation of Small Tech Enterprises");

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      label: "MSME Timeline Concern",
      section: "Clause 7 - Compliance Timelines for MSMEs",
      stakeholder: "MSME & Startup Sector",
      org: "Federation of Small Tech Enterprises",
      text: "The proposed 30-day compliance timeline in Clause 7 is severely burdensome for seed-stage startups and MSMEs with limited legal and compliance teams. We strongly suggest extending the transition period to at least 180 days with a tiered phase-in approach based on turnover, which will prevent disproportionate operational disruption.",
    },
    {
      label: "AI Audit IP Leakage Risk",
      section: "Clause 12 - Algorithmic Transparency & Audit",
      stakeholder: "Legal & Policy Think Tank",
      org: "Centre for Digital Rights",
      text: "While mandatory algorithmic audits are a commendable step towards accountability, Clause 12 lacks precise technical definitions of 'systemic algorithmic bias'. There is serious concern regarding the leakage of proprietary intellectual property during third-party code inspections. We recommend establishing independent certified audit frameworks with strict confidentiality safeguards and standardized fairness metrics.",
    },
    {
      label: "Consumer Redressal Endorsement",
      section: "Clause 15 - Grievance Redressal Mechanism",
      stakeholder: "Consumer Advocacy",
      org: "Citizen Consumer Forum",
      text: "We wholeheartedly welcome the requirement in Clause 15 for a 48-hour acknowledgment of consumer complaints. However, the 30-day resolution period is too long for urgent consumer fraud grievances. We propose reducing the resolution timeline to 7 working days for unauthorized financial deductions and establishing an automated escalation portal.",
    },
  ];

  const handleRunAnalysis = async () => {
    if (!commentText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.analyzeComment({
        comment: commentText,
        section: section || undefined,
        stakeholder_type: stakeholder || undefined,
        organization_or_individual: org || undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze comment.");
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: (typeof presets)[0]) => {
    setCommentText(preset.text);
    setSection(preset.section);
    setStakeholder(preset.stakeholder);
    setOrg(preset.org);
    setResult(null);
  };

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
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold uppercase">
            Interactive AI/NLP Evaluator
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Comment Analysis Playground
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Test real-time sentiment polarity calculation, topic classification, concern detection, and recommendation extraction.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="font-semibold text-slate-600">Sample Presets:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => loadPreset(p)}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader
          title="Submission Input"
          subtitle="Enter unstructured stakeholder consultation feedback"
        />

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Section / Clause
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Clause 7 - Compliance Timelines"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stakeholder Group
              </label>
              <input
                type="text"
                value={stakeholder}
                onChange={(e) => setStakeholder(e.target.value)}
                placeholder="e.g. MSME & Startup Sector"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / Name
              </label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="e.g. Small Business Association"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Consultation Comment Text
            </label>
            <textarea
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Paste public consultation submission here..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 font-serif leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCommentText("");
                setResult(null);
              }}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>

            <Button
              size="md"
              onClick={handleRunAnalysis}
              isLoading={loading}
              icon={<Play className="w-4 h-4 fill-current" />}
            >
              Run Pipeline Analysis
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Analysis Result Display */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Pipeline Analysis Results</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Completed in &lt;15ms (Local Heuristic NLP)
            </span>
          </div>

          {/* Sentiment & Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sentiment Polarity
                </span>
                <Badge variant={getSentimentVariant(result.sentiment.label)}>
                  {result.sentiment.label} ({result.sentiment.score > 0 ? `+${result.sentiment.score}` : result.sentiment.score})
                </Badge>
              </div>
              <p className="text-xs text-slate-600">
                Confidence: <strong className="text-slate-900">{Math.round(result.sentiment.confidence * 100)}%</strong>
              </p>
              {result.sentiment.polarity_cues.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Polarity Cues:</span>
                  {result.sentiment.polarity_cues.map((cue) => (
                    <span key={cue} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono">
                      {cue}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Topic Classification
                </span>
                <Badge variant="outline">{Math.round(result.topic.confidence * 100)}% Match</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{result.topic.primary_topic}</h4>
              {result.topic.key_phrases.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Keywords:</span>
                  {result.topic.key_phrases.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Concerns & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Extracted Concerns ({result.concerns.length})</span>
              </h4>
              {result.concerns.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No explicit friction points detected.</p>
              ) : (
                result.concerns.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-rose-50/60 border border-rose-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{c.category}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-semibold">
                        {c.severity} Severity
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                <span>Extracted Proposals ({result.suggestions.length})</span>
              </h4>
              {result.suggestions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No discrete proposals detected.</p>
              ) : (
                result.suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Action: {s.action_type}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold font-mono">
                        {s.action_type}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{s.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 space-y-2">
            <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
              Distilled Executive Takeaway
            </div>
            <h4 className="text-sm font-bold text-white">{result.summary.headline}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{result.summary.tl_dr}</p>
          </div>
        </div>
      )}
    </div>
  );
}
