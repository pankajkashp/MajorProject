import {
  DashboardSummaryResponse,
  CommentListResponse,
  ConsultationComment,
  PolicyInsightListResponse,
  PolicyInsight,
  HealthResponse,
  AnalysisResult,
  DatasetUploadResponse
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error [${res.status}] ${res.statusText}: ${errorText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`Failed to fetch from ${url}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: async (): Promise<HealthResponse> => {
    return fetchJSON<HealthResponse>("/health");
  },

  getDashboardSummary: async (): Promise<DashboardSummaryResponse> => {
    return fetchJSON<DashboardSummaryResponse>("/dashboard/summary");
  },

  getComments: async (params?: {
    page?: number;
    pageSize?: number;
    stakeholderType?: string;
    section?: string;
    sentiment?: string;
    search?: string;
  }): Promise<CommentListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("page_size", params.pageSize.toString());
    if (params?.stakeholderType && params.stakeholderType !== "All") query.append("stakeholder_type", params.stakeholderType);
    if (params?.section && params.section !== "All") query.append("section", params.section);
    if (params?.sentiment && params.sentiment !== "All") query.append("sentiment", params.sentiment);
    if (params?.search) query.append("search", params.search);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return fetchJSON<CommentListResponse>(`/comments${qs}`);
  },

  getCommentById: async (id: string): Promise<ConsultationComment> => {
    return fetchJSON<ConsultationComment>(`/comments/${id}`);
  },

  getInsights: async (params?: {
    priorityLevel?: string;
    topic?: string;
  }): Promise<PolicyInsightListResponse> => {
    const query = new URLSearchParams();
    if (params?.priorityLevel && params.priorityLevel !== "All") query.append("priority_level", params.priorityLevel);
    if (params?.topic && params.topic !== "All") query.append("topic", params.topic);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return fetchJSON<PolicyInsightListResponse>(`/insights${qs}`);
  },

  getInsightById: async (id: string): Promise<PolicyInsight> => {
    return fetchJSON<PolicyInsight>(`/insights/${id}`);
  },

  analyzeComment: async (payload: {
    comment: string;
    section?: string;
    stakeholder_type?: string;
    organization_or_individual?: string;
  }): Promise<AnalysisResult> => {
    const response = await fetchJSON<{
      success: boolean;
      comment_id: string;
      sentiment: any;
      topic: any;
      concerns: any[];
      suggestions: any[];
      summary: any;
      processed_at: string;
    }>("/analyze/comment", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      comment_id: response.comment_id,
      sentiment: response.sentiment,
      topic: response.topic,
      concerns: response.concerns,
      suggestions: response.suggestions,
      summary: response.summary,
      processed_at: response.processed_at,
    };
  },

  analyzeBatch: async (comments: Array<{
    comment: string;
    section?: string;
    stakeholder_type?: string;
  }>): Promise<AnalysisResult[]> => {
    const response = await fetchJSON<{
      success: boolean;
      total_processed: number;
      results: any[];
    }>("/analyze/batch", {
      method: "POST",
      body: JSON.stringify({ comments }),
    });

    return response.results.map((r) => ({
      comment_id: r.comment_id,
      sentiment: r.sentiment,
      topic: r.topic,
      concerns: r.concerns,
      suggestions: r.suggestions,
      summary: r.summary,
      processed_at: r.processed_at,
    }));
  },

  uploadDataset: async (file: File): Promise<DatasetUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE_URL}/datasets/upload`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload Error [${res.status}]: ${errorText}`);
    }

    return await res.json();
  },
};
