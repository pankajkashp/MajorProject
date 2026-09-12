from typing import List
from app.providers.base import SummarizationProvider
from app.models.domain import SummaryResult, ConcernItem, SuggestionItem

class LocalSummarizationProvider(SummarizationProvider):
    """
    Extractive, deterministic policy summarizer distilling:
    - Headline: policy friction vs proposed legislative remedy
    - TL;DR: concise synthesized core message
    - Key Takeaways: itemized actionable bullet points
    
    Avoids redundant summarization for short submissions.
    """

    def summarize(
        self,
        text: str,
        concerns: List[ConcernItem],
        suggestions: List[SuggestionItem]
    ) -> SummaryResult:
        clean_text = text.strip()

        # Handle very short comments (< 70 chars) without redundant bloating
        if len(clean_text) <= 70:
            return SummaryResult(
                headline=clean_text[:70],
                tl_dr=clean_text,
                key_takeaways=[clean_text]
            )

        # 1. Synthesize Headline
        if concerns and suggestions:
            headline = f"Friction regarding {concerns[0].category.lower()} with proposal for {suggestions[0].action_type.lower()}"
        elif concerns:
            headline = f"Stakeholder flags {concerns[0].category.lower()} in proposed provisions"
        elif suggestions:
            headline = f"Stakeholder recommends {suggestions[0].action_type.lower()} intervention"
        else:
            first_sentence = clean_text.split(".")[0].strip()
            headline = first_sentence[:80] + ("..." if len(first_sentence) > 80 else "")

        # 2. Synthesize TL;DR
        tldr_components = []
        if concerns:
            tldr_components.append(f"Issue: {concerns[0].text.strip()}")
        if suggestions:
            tldr_components.append(f"Proposed Remedy: {suggestions[0].text.strip()}")

        if tldr_components:
            tl_dr = " | ".join(tldr_components)
        else:
            tl_dr = clean_text[:160] + ("..." if len(clean_text) > 160 else "")

        # 3. Itemize Key Takeaways
        takeaways = []
        for c in concerns[:2]:
            takeaways.append(f"Concern ({c.category}): {c.text}")
        for s in suggestions[:2]:
            takeaways.append(f"Proposal ({s.action_type}): {s.text}")

        if not takeaways:
            takeaways.append(clean_text[:120])

        return SummaryResult(
            headline=headline.capitalize(),
            tl_dr=tl_dr,
            key_takeaways=takeaways
        )
