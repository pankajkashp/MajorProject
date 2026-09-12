export type SentimentLabel = "Positive" | "Negative" | "Neutral" | "Mixed";
export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

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
  severity: PriorityLevel;
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
}

export interface PriorityBreakdown {
  severity_component: number;
  stakeholder_diversity_component: number;
  volume_component: number;
  negative_friction_component: number;
  raw_score: number;
}

export interface PolicyInsight {
  id: string;
  title: string;
  topic: string;
  section?: string | null;
  priority_level: PriorityLevel;
  priority_score: number;
  priority_breakdown: PriorityBreakdown;
  priority_explanation: string;
  frequency_count: number;
  stakeholder_consensus: string;
  affected_stakeholders: string[];
  sentiment_distribution: Record<string, number>;
  concern_summary: string;
  suggestion_summary: string;
  evidence_quotes: EvidenceQuote[];
  supporting_comment_ids: string[];
}

export interface PolicyInsightListResponse {
  total: number;
  critical_count: number;
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
}

export interface PriorityAlert {
  id: string;
  headline: string;
  topic: string;
  priority_level: PriorityLevel;
  priority_score: number;
  affected_stakeholders: string[];
  suggested_action: string;
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
