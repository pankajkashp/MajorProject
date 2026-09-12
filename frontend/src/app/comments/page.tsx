"use client";

import React, { useState, useEffect } from "react";
import { CommentFilters } from "@/components/comments/CommentFilters";
import { CommentList } from "@/components/comments/CommentList";
import { CommentDetailModal } from "@/components/comments/CommentDetailModal";
import { api } from "@/lib/api";
import { ConsultationComment } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { PlusCircle, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";

export default function CommentsPage() {
  const [comments, setComments] = useState<ConsultationComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedComment, setSelectedComment] = useState<ConsultationComment | null>(null);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [sentiment, setSentiment] = useState<string>("All");
  const [stakeholder, setStakeholder] = useState<string>("All");
  const [section, setSection] = useState<string>("All");

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await api.getComments({
        search: search || undefined,
        sentiment: sentiment !== "All" ? sentiment : undefined,
        stakeholderType: stakeholder !== "All" ? stakeholder : undefined,
        section: section !== "All" ? section : undefined,
      });
      setComments(res.items);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadComments();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, sentiment, stakeholder, section]);

  const handleResetFilters = () => {
    setSearch("");
    setSentiment("All");
    setStakeholder("All");
    setSection("All");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consultation Comments Explorer
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore granular submissions, extracted operational concerns, and stakeholder legislative recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/analyze">
            <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              Test New Comment
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <CommentFilters
        search={search}
        onSearchChange={setSearch}
        sentiment={sentiment}
        onSentimentChange={setSentiment}
        stakeholder={stakeholder}
        onStakeholderChange={setStakeholder}
        section={section}
        onSectionChange={setSection}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900">{comments.length}</strong> consultation submissions
        </span>
      </div>

      {/* Comment List */}
      <CommentList
        comments={comments}
        loading={loading}
        onSelectComment={(c) => setSelectedComment(c)}
      />

      {/* Detail Modal */}
      <CommentDetailModal
        comment={selectedComment}
        isOpen={!!selectedComment}
        onClose={() => setSelectedComment(null)}
      />
    </div>
  );
}
