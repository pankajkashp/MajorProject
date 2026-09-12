from collections import defaultdict, Counter
from typing import List, Dict, Tuple
from app.providers.base import InsightProvider
from app.models.domain import (
    ConsultationComment,
    AnalysisResult,
    PolicyInsight,
    EvidenceQuote,
    PriorityBreakdown
)

class EvidenceLinkedInsightEngine(InsightProvider):
    """
    Research prototype engine synthesizing Evidence-Linked Policy Insights.
    Aggregates granular extractions (concerns, suggestions, sentiments) across topics,
    calculates empirical priority scores, and pairs them with verifiable quote citations.
    """

    def synthesize_insights(
        self,
        comments: List[ConsultationComment],
        analyses: Dict[str, AnalysisResult]
    ) -> List[PolicyInsight]:
        topic_groups: Dict[str, List[Tuple[ConsultationComment, AnalysisResult]]] = defaultdict(list)
        comment_dict = {c.id: c for c in comments}

        for c_id, analysis in analyses.items():
            comment = comment_dict.get(c_id)
            if comment:
                topic = analysis.topic.primary_topic
                topic_groups[topic].append((comment, analysis))

        insights: List[PolicyInsight] = []
        insight_counter = 1

        for topic, group in topic_groups.items():
            freq = len(group)
            if freq == 0:
                continue

            stakeholders = list({item[0].stakeholder_type for item in group if item[0].stakeholder_type})
            section_set = list({item[0].section for item in group if item[0].section})
            primary_section = section_set[0] if section_set else "Multiple Sections"

            all_concerns = []
            all_suggestions = []
            sentiment_scores = []
            sentiment_labels = []
            evidence_quotes: List[EvidenceQuote] = []
            supporting_ids: List[str] = []

            critical_count = 0
            high_count = 0

            for comment, analysis in group:
                supporting_ids.append(comment.id)
                sentiment_scores.append(analysis.sentiment.score)
                sentiment_labels.append(analysis.sentiment.label)

                for con in analysis.concerns:
                    all_concerns.append(con)
                    if con.severity == "Critical":
                        critical_count += 1
                    elif con.severity == "High":
                        high_count += 1

                for sug in analysis.suggestions:
                    all_suggestions.append(sug)

                evidence_quotes.append(EvidenceQuote(
                    comment_id=comment.id,
                    stakeholder_type=comment.stakeholder_type or "General Stakeholder",
                    organization_or_individual=comment.metadata.get("organization_or_individual") or comment.metadata.get("org"),
                    section=comment.section,
                    verbatim_text=comment.comment,
                    sentiment_label=analysis.sentiment.label
                ))

            # Sentiment distribution
            sent_dist = dict(Counter(sentiment_labels))

            # Explainable Priority Score Calculation
            avg_sentiment = sum(sentiment_scores) / max(len(sentiment_scores), 1)
            negative_friction_factor = max(0.0, -avg_sentiment)

            severity_comp = round((critical_count * 3.5) + (high_count * 2.0), 2)
            stakeholder_comp = round(len(stakeholders) * 4.0, 2)
            volume_comp = round(freq * 3.0, 2)
            friction_comp = round(negative_friction_factor * 25.0, 2)

            raw_score = severity_comp + stakeholder_comp + volume_comp + friction_comp
            priority_score = min(99.0, max(15.0, round(raw_score, 1)))

            breakdown = PriorityBreakdown(
                severity_component=severity_comp,
                stakeholder_diversity_component=stakeholder_comp,
                volume_component=volume_comp,
                negative_friction_component=friction_comp,
                raw_score=round(raw_score, 1)
            )

            explanation = (
                f"Priority score {priority_score}/100 computed from: "
                f"Severity ({critical_count} critical, {high_count} high = +{severity_comp}), "
                f"Stakeholder Diversity ({len(stakeholders)} groups = +{stakeholder_comp}), "
                f"Submission Volume ({freq} comments = +{volume_comp}), and "
                f"Negative Sentiment Friction (polarity {avg_sentiment:+.2f} = +{friction_comp})."
            )

            # Priority Level categorization
            if priority_score >= 70.0 or critical_count >= 2:
                priority_level = "Critical"
            elif priority_score >= 50.0:
                priority_level = "High"
            elif priority_score >= 30.0:
                priority_level = "Medium"
            else:
                priority_level = "Low"

            # Stakeholder consensus determination
            if avg_sentiment < -0.3 and len(stakeholders) >= 2:
                consensus = "Broad Industry/Stakeholder Resistance"
            elif avg_sentiment > 0.3:
                consensus = "General Positive Alignment"
            elif any(s == "Positive" for s in sentiment_labels) and any(s == "Negative" for s in sentiment_labels):
                consensus = "Polarized Stakeholder Feedback"
            else:
                consensus = "Substantive Technical Concerns"

            concern_cats = [c.category for c in all_concerns]
            top_concern_theme = max(set(concern_cats), key=concern_cats.count) if concern_cats else "Operational Compliance"
            
            sug_actions = [s.action_type for s in all_suggestions]
            top_sug_theme = max(set(sug_actions), key=sug_actions.count) if sug_actions else "Regulatory Guidance"

            title = f"{topic}: Stakeholder Demand for {top_sug_theme} due to {top_concern_theme}"

            concern_summary = f"Key friction centered on {top_concern_theme.lower()} raised across {len(stakeholders)} stakeholder categories ({', '.join(stakeholders[:3])}). Identified {critical_count} critical risks and {high_count} operational challenges."
            suggestion_summary = f"Stakeholders overwhelmingly recommend {top_sug_theme.lower()} solutions with {len(all_suggestions)} concrete legislative/procedural remedies proposed."

            insights.append(PolicyInsight(
                id=f"INS-2026-{insight_counter:03d}",
                title=title,
                topic=topic,
                section=primary_section,
                priority_level=priority_level,
                priority_score=priority_score,
                priority_breakdown=breakdown,
                priority_explanation=explanation,
                frequency_count=freq,
                stakeholder_consensus=consensus,
                affected_stakeholders=stakeholders,
                sentiment_distribution=sent_dist,
                concern_summary=concern_summary,
                suggestion_summary=suggestion_summary,
                evidence_quotes=evidence_quotes[:6],
                supporting_comment_ids=supporting_ids
            ))
            insight_counter += 1

        insights.sort(key=lambda x: x.priority_score, reverse=True)
        return insights
