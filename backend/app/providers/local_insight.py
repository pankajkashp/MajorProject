from collections import defaultdict, Counter
from typing import List, Dict, Tuple
from app.providers.base import InsightProvider
from app.models.domain import (
    ConsultationComment,
    AnalysisResult,
    PolicyInsight,
    EvidenceQuote,
    PriorityFactors
)

class EvidenceLinkedInsightEngine(InsightProvider):
    """
    Evidence-Linked Policy Insight Aggregation Engine.
    Transforms granular NLP extractions across the consultation dataset into
    structured, explainable policy recommendations backed by verifiable comment citations.
    """

    def synthesize_insights(
        self,
        comments: List[ConsultationComment],
        analyses: Dict[str, AnalysisResult]
    ) -> List[PolicyInsight]:
        total_comments_count = max(len(comments), 1)
        comment_dict = {c.id: c for c in comments}

        # 1. Group by Primary Topic / Clause Area
        topic_groups: Dict[str, List[Tuple[ConsultationComment, AnalysisResult]]] = defaultdict(list)

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

            # 2. Calculate Frequency & Frequency Percentage
            freq_percentage = round((freq / total_comments_count) * 100, 1)

            # 3. Stakeholder Analysis
            stakeholder_list = [item[0].stakeholder_type or "General Public" for item in group]
            stakeholder_breakdown = dict(Counter(stakeholder_list))
            stakeholder_groups = sorted(list(stakeholder_breakdown.keys()))
            stakeholder_count = len(stakeholder_groups)

            # Resolve Primary Section
            section_set = list({item[0].section for item in group if item[0].section})
            primary_section = section_set[0] if section_set else None

            # 4. Sentiment Aggregation
            sentiment_labels = [analysis.sentiment.label for _, analysis in group]
            sentiment_scores = [analysis.sentiment.score for _, analysis in group]
            sentiment_dist = dict(Counter(sentiment_labels))
            dominant_sentiment = Counter(sentiment_labels).most_common(1)[0][0] if sentiment_labels else "Neutral"
            avg_sentiment_score = round(sum(sentiment_scores) / max(len(sentiment_scores), 1), 3)

            # 5. Concern & Suggestion Aggregation
            all_concerns = []
            all_suggestions = []
            critical_count = 0
            high_count = 0

            supporting_evidence: List[EvidenceQuote] = []
            supporting_ids: List[str] = []

            for comment, analysis in group:
                supporting_ids.append(comment.id)

                extracted_concern_texts = [c.text for c in analysis.concerns]
                extracted_suggestion_texts = [s.text for s in analysis.suggestions]

                for con in analysis.concerns:
                    all_concerns.append(con)
                    if con.severity in ["Critical", "CRITICAL"]:
                        critical_count += 1
                    elif con.severity in ["High", "HIGH"]:
                        high_count += 1

                for sug in analysis.suggestions:
                    all_suggestions.append(sug)

                supporting_evidence.append(EvidenceQuote(
                    comment_id=comment.id,
                    stakeholder_type=comment.stakeholder_type or "General Public",
                    organization_or_individual=comment.metadata.get("organization_or_individual") or comment.metadata.get("org"),
                    section=comment.section,
                    verbatim_text=comment.comment,
                    sentiment_label=analysis.sentiment.label,
                    extracted_concerns=extracted_concern_texts,
                    extracted_suggestions=extracted_suggestion_texts
                ))

            # 6. Transparent Priority Scoring Calculation
            # Factor 1: Concern Severity (Critical: 5.0 pts each, High: 3.0 pts each)
            severity_factor = round((critical_count * 5.0) + (high_count * 3.0), 2)

            # Factor 2: Stakeholder Diversity (5.0 pts per distinct stakeholder group)
            diversity_factor = round(stakeholder_count * 5.0, 2)

            # Factor 3: Submission Volume / Frequency Percentage
            volume_factor = round((freq / total_comments_count) * 100 * 0.4, 2)

            # Factor 4: Negative Sentiment Friction Intensity
            negative_intensity = max(0.0, -avg_sentiment_score)
            friction_factor = round(negative_intensity * 30.0, 2)

            raw_score = severity_factor + diversity_factor + volume_factor + friction_factor
            priority_score = min(99.0, max(15.0, round(raw_score, 1)))

            factors = PriorityFactors(
                frequency_score=volume_factor,
                sentiment_intensity_score=friction_factor,
                stakeholder_diversity_score=diversity_factor,
                severity_score=severity_factor,
                raw_score=round(raw_score, 1)
            )

            # Map Priority Level (HIGH, MEDIUM, LOW)
            if priority_score >= 60.0 or critical_count >= 1:
                priority_level = "HIGH"
            elif priority_score >= 35.0:
                priority_level = "MEDIUM"
            else:
                priority_level = "LOW"

            # 7. Stakeholder Consensus
            if avg_sentiment_score < -0.25 and stakeholder_count >= 2:
                consensus = "Broad Resistance"
            elif avg_sentiment_score > 0.25:
                consensus = "General Positive Alignment"
            elif "Positive" in sentiment_labels and "Negative" in sentiment_labels:
                consensus = "Polarized Feedback"
            else:
                consensus = "Substantive Technical Concerns"

            # 8. Consolidate Primary Concern and Suggestion Labels
            concern_cats = [c.category for c in all_concerns]
            top_concern_cat = max(set(concern_cats), key=concern_cats.count) if concern_cats else "General Operational Complexity"
            
            sug_actions = [s.action_type for s in all_suggestions]
            top_sug_action = max(set(sug_actions), key=sug_actions.count) if sug_actions else "Regulatory Guidance"

            title = f"{topic}: Stakeholders Demand {top_sug_action} to Address {top_concern_cat}"
            concern_summary = f"Friction centered on {top_concern_cat.lower()} raised across {stakeholder_count} stakeholder groups ({', '.join(stakeholder_groups[:3])}). Identified {critical_count} critical risks and {high_count} operational challenges."
            suggestion_summary = f"Stakeholders recommend {top_sug_action.lower()} interventions with {len(all_suggestions)} concrete legislative remedies proposed."

            explanation = (
                f"Priority score {priority_score}/100 [{priority_level}] derived from: "
                f"Severity ({critical_count} critical, {high_count} high = +{severity_factor} pts), "
                f"Stakeholder Diversity ({stakeholder_count} groups = +{diversity_factor} pts), "
                f"Frequency ({freq} comments / {freq_percentage}% = +{volume_factor} pts), and "
                f"Sentiment Intensity (avg score {avg_sentiment_score:+.2f} = +{friction_factor} pts)."
            )

            insights.append(PolicyInsight(
                id=f"INS-2026-{insight_counter:03d}",
                title=title,
                topic=topic,
                section=primary_section,
                concern=concern_summary,
                suggestion=suggestion_summary,
                frequency=freq,
                frequency_percentage=freq_percentage,
                sentiment_distribution=sentiment_dist,
                dominant_sentiment=dominant_sentiment,
                average_sentiment_score=avg_sentiment_score,
                stakeholder_groups=stakeholder_groups,
                stakeholder_count=stakeholder_count,
                stakeholder_breakdown=stakeholder_breakdown,
                stakeholder_consensus=consensus,
                priority_score=priority_score,
                priority_level=priority_level,
                priority_factors=factors,
                priority_explanation=explanation,
                supporting_comment_ids=supporting_ids,
                supporting_evidence=supporting_evidence
            ))
            insight_counter += 1

        # Sort insights by priority score descending
        insights.sort(key=lambda x: x.priority_score, reverse=True)
        return insights
