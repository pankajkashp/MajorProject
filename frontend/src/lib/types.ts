export type SentimentLabel = "Positive" | "Negative" | "Neutral" | "Mixed";
export type PriorityLevel = "HIGH" | "MEDIUM" | "LOW" | "Critical" | "High" | "Medium" | "Low";

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
  confidence: number;
  polarity_cues: string[];
}

export interface TopicResult {
  primary_topic: string;
  secondary_topics: string[];
  confidence: number;
  key_phrases: string[];
}

export interface ConcernItem {
  id: string;
  text: string;
  category: string;
  severity: string;
  text_span?: string | null;
}

export interface SuggestionItem {
  id: string;
  text: string;
  action_type: string;
  text_span?: string | null;
}

export interface SummaryResult {
  headline: string;
  tl_dr: string;
  key_takeaways: string[];
}

export interface AnalysisResult {
  comment_id: string;
  sentiment: SentimentResult;
  topic: TopicResult;
  concerns: ConcernItem[];
  suggestions: SuggestionItem[];
  summary: SummaryResult;
  processed_at: string;
}

export interface ConsultationComment {
  id: string;
  comment: string;
  consultation_id?: string | null;
  section?: string | null;
  stakeholder_type?: string | null;
  organization_or_individual?: string | null;
  source: string;
  language?: string | null;
  metadata: Record<string, any>;
  analysis?: AnalysisResult | null;
}

export interface CommentListResponse {
  total: number;
  page: number;
  page_size: number;
  items: ConsultationComment[];
}

export interface EvidenceQuote {
  comment_id: string;
  stakeholder_type: string;
  organization_or_individual?: string | null;
  section?: string | null;
  verbatim_text: string;
  sentiment_label: string;
  extracted_concerns: string[];
  extracted_suggestions: string[];
}

export interface PriorityFactors {
  frequency_score: number;
  sentiment_intensity_score: number;
  stakeholder_diversity_score: number;
  severity_score: number;
  raw_score: number;
}

export interface PolicyInsight {
  id: string;
  title: string;
  topic: string;
  section?: string | null;
  concern: string;
  suggestion: string;
  frequency: number;
  frequency_percentage: number;
  sentiment_distribution: Record<string, number>;
  dominant_sentiment: string;
  average_sentiment_score: number;
  stakeholder_groups: string[];
  stakeholder_count: number;
  stakeholder_breakdown: Record<string, number>;
  stakeholder_consensus: string;
  priority_score: number;
  priority_level: string;
  priority_factors: PriorityFactors;
  priority_explanation: string;
  supporting_comment_ids: string[];
  supporting_evidence: EvidenceQuote[];
}

export interface PolicyInsightListResponse {
  total: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  items: PolicyInsight[];
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
  average_polarity: number;
}

export interface StakeholderMetric {
  stakeholder_type: string;
  count: number;
  percentage: number;
  predominant_sentiment: string;
}

export interface TopicMetric {
  topic: string;
  count: number;
  percentage: number;
  sentiment_score: number;
  critical_concerns_count: number;
  top_concerns: string[];
  top_suggestions: string[];
}

export interface PriorityAlert {
  id: string;
  headline: string;
  topic: string;
  priority_level: string;
  priority_score: number;
  affected_stakeholders: string[];
  suggested_action: string;
  frequency?: number;
  dominant_sentiment?: string;
}

export interface DashboardSummaryResponse {
  total_comments: number;
  total_stakeholder_groups: number;
  sentiment_distribution: SentimentDistribution;
  top_topics: TopicMetric[];
  stakeholder_breakdown: StakeholderMetric[];
  priority_alerts: PriorityAlert[];
  total_insights_generated: number;
  actionable_suggestions_count: number;
  critical_friction_points: number;
  top_concerns_summary: string[];
  top_suggestions_summary: string[];
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
  dataset_loaded: boolean;
  total_records: number;
  providers: Record<string, string>;
}

export interface IngestionValidationError {
  row_index: number;
  field: string;
  error_type: string;
  message: string;
}

export interface DatasetUploadResponse {
  filename: string;
  rows_received: number;
  rows_accepted: number;
  rows_rejected: number;
  validation_errors: IngestionValidationError[];
  preview: ConsultationComment[];
}
