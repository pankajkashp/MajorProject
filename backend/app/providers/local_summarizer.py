from typing import List
from app.providers.base import SummarizationProvider
from app.models.domain import SummaryResult, ConcernItem, SuggestionItem

class LocalSummarizationProvider(SummarizationProvider):
    """
    Structured rule-based summarizer distilling stakeholder sentiment,
    primary friction points, and proposed legislative modifications.
    """

    def summarize(
        self,
        text: str,
        concerns: List[ConcernItem],
        suggestions: List[SuggestionItem]
    ) -> SummaryResult:
        # Generate clean headline
        if suggestions and concerns:
            headline = f"Concerns on {concerns[0].category.lower()} with proposal for {suggestions[0].action_type.lower()}"
        elif concerns:
            headline = f"Stakeholder flags issues regarding {concerns[0].category.lower()}"
        elif suggestions:
            headline = f"Stakeholder recommends {suggestions[0].action_type.lower()} intervention"
        else:
            first_sentence = text.split(".")[0]
            headline = first_sentence[:90] + ("..." if len(first_sentence) > 90 else "")

        # Generate TL;DR
        tldr_parts = []
        if concerns:
            tldr_parts.append(f"Key friction: {concerns[0].text.strip()}")
        if suggestions:
            tldr_parts.append(f"Proposed remedy: {suggestions[0].text.strip()}")

        if not tldr_parts:
            tl_dr = text[:180] + ("..." if len(text) > 180 else "")
        else:
            tl_dr = " | ".join(tldr_parts)

        # Takeaways
        takeaways = []
        for c in concerns[:2]:
            takeaways.append(f"Concern: {c.text}")
        for s in suggestions[:2]:
            takeaways.append(f"Recommendation: {s.text}")

        if not takeaways:
            takeaways.append("General feedback submission for draft provisions.")

        return SummaryResult(
            headline=headline.capitalize(),
            tl_dr=tl_dr,
            key_takeaways=takeaways
        )
