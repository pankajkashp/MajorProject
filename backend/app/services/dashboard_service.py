from collections import Counter, defaultdict
from typing import List, Dict
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    SentimentDistribution,
    StakeholderMetric,
    TopicMetric,
    PriorityAlert
)
from app.services.dataset_service import dataset_service
from app.services.analysis_service import analysis_service
from app.services.insight_service import insight_service

class DashboardService:
    """
    Dashboard Aggregate Metrics & Visual Analytics Service.
    Derives all statistics dynamically from the underlying analysis and insight pipeline.
    """

    def get_summary(self) -> DashboardSummaryResponse:
        comments = dataset_service.get_all()
        total_comments = len(comments)

        if total_comments == 0:
            return DashboardSummaryResponse(
                total_comments=0,
                total_stakeholder_groups=0,
                sentiment_distribution=SentimentDistribution(
                    positive=0, negative=0, neutral=0, mixed=0, average_polarity=0.0
                ),
                top_topics=[],
                stakeholder_breakdown=[],
                priority_alerts=[],
                total_insights_generated=0,
                actionable_suggestions_count=0,
                critical_friction_points=0,
                top_concerns_summary=[],
                top_suggestions_summary=[]
            )

        analyses = analysis_service.get_all_analyses()
        if len(analyses) < total_comments:
            for c in comments:
                if c.id not in analyses:
                    analysis_service.analyze_comment(c)
            analyses = analysis_service.get_all_analyses()

        # 1. Sentiment Distribution Calculation
        pos_cnt = sum(1 for a in analyses.values() if a.sentiment.label == "Positive")
        neg_cnt = sum(1 for a in analyses.values() if a.sentiment.label == "Negative")
        neu_cnt = sum(1 for a in analyses.values() if a.sentiment.label == "Neutral")
        mix_cnt = sum(1 for a in analyses.values() if a.sentiment.label == "Mixed")
        avg_pol = sum(a.sentiment.score for a in analyses.values()) / total_comments

        sentiment_dist = SentimentDistribution(
            positive=pos_cnt,
            negative=neg_cnt,
            neutral=neu_cnt,
            mixed=mix_cnt,
            average_polarity=round(avg_pol, 3)
        )

        # 2. Topic Metrics with Top Concerns and Suggestions
        topic_counts = Counter(a.topic.primary_topic for a in analyses.values())
        topic_sentiments: Dict[str, List[float]] = defaultdict(list)
        topic_critical_concerns: Dict[str, int] = defaultdict(int)
        topic_concerns: Dict[str, List[str]] = defaultdict(list)
        topic_suggestions: Dict[str, List[str]] = defaultdict(list)

        for a in analyses.values():
            t = a.topic.primary_topic
            topic_sentiments[t].append(a.sentiment.score)
            for c in a.concerns:
                topic_concerns[t].append(c.category)
                if c.severity in ["Critical", "CRITICAL", "High", "HIGH"]:
                    topic_critical_concerns[t] += 1
            for s in a.suggestions:
                topic_suggestions[t].append(s.action_type)

        top_topics: List[TopicMetric] = []
        for topic, count in topic_counts.most_common():
            sents = topic_sentiments[topic]
            avg_t_sent = sum(sents) / len(sents) if sents else 0.0
            top_c = [c for c, _ in Counter(topic_concerns[topic]).most_common(3)]
            top_s = [s for s, _ in Counter(topic_suggestions[topic]).most_common(3)]
            top_topics.append(TopicMetric(
                topic=topic,
                count=count,
                percentage=round((count / total_comments) * 100, 1),
                sentiment_score=round(avg_t_sent, 2),
                critical_concerns_count=topic_critical_concerns[topic],
                top_concerns=top_c,
                top_suggestions=top_s
            ))

        # 3. Stakeholder Breakdown
        comment_dict = {c.id: c for c in comments}
        stakeholder_counts = Counter(c.stakeholder_type for c in comments if c.stakeholder_type)
        stakeholder_sentiments: Dict[str, List[str]] = defaultdict(list)

        for c_id, a in analyses.items():
            c = comment_dict.get(c_id)
            if c and c.stakeholder_type:
                stakeholder_sentiments[c.stakeholder_type].append(a.sentiment.label)

        stakeholder_breakdown: List[StakeholderMetric] = []
        for stype, count in stakeholder_counts.most_common():
            labels = stakeholder_sentiments[stype]
            predominant = Counter(labels).most_common(1)[0][0] if labels else "Neutral"
            stakeholder_breakdown.append(StakeholderMetric(
                stakeholder_type=stype,
                count=count,
                percentage=round((count / total_comments) * 100, 1),
                predominant_sentiment=predominant
            ))

        # 4. Insights & Priority Alerts
        insights = insight_service.get_all()
        priority_alerts: List[PriorityAlert] = []

        for ins in insights[:4]:
            priority_alerts.append(PriorityAlert(
                id=ins.id,
                headline=ins.title,
                topic=ins.topic,
                priority_level=ins.priority_level,
                priority_score=ins.priority_score,
                affected_stakeholders=ins.stakeholder_groups,
                suggested_action=ins.suggestion
            ))

        # 5. Global Top Concerns & Suggestions Summary
        all_concern_categories = [c.category for a in analyses.values() for c in a.concerns]
        all_suggestion_actions = [s.action_type for a in analyses.values() for s in a.suggestions]

        top_concerns_summary = [cat for cat, _ in Counter(all_concern_categories).most_common(5)]
        top_suggestions_summary = [act for act, _ in Counter(all_suggestion_actions).most_common(5)]

        total_suggestions = len(all_suggestion_actions)
        critical_frictions = sum(1 for a in analyses.values() for c in a.concerns if c.severity in ["Critical", "CRITICAL"])

        return DashboardSummaryResponse(
            total_comments=total_comments,
            total_stakeholder_groups=len(stakeholder_counts),
            sentiment_distribution=sentiment_dist,
            top_topics=top_topics,
            stakeholder_breakdown=stakeholder_breakdown,
            priority_alerts=priority_alerts,
            total_insights_generated=len(insights),
            actionable_suggestions_count=total_suggestions,
            critical_friction_points=critical_frictions,
            top_concerns_summary=top_concerns_summary,
            top_suggestions_summary=top_suggestions_summary
        )

dashboard_service = DashboardService()
