import re
from typing import List, Tuple
from app.providers.base import ExtractionProvider
from app.models.domain import ConcernItem, SuggestionItem

class LocalExtractionProvider(ExtractionProvider):
    """
    Explainable linguistic extractor for:
    1. Explicit Policy Concerns (compliance burden, timeline friction, IP risk, ambiguity, cost inflation, penalties)
    2. Actionable Policy Suggestions (timeline extension, threshold exemption, safe harbor, certified audit, toolkit)
    
    Preserves exact matched text spans as evidence.
    Strictly avoids fabricating items when no signals are present.
    """

    CONCERN_CUES = [
        (r"(severely burdensome|burdensome|heavy burden|undue compliance|excessive reporting)", "Compliance Burden", "High"),
        (r"(30-day compliance window|sudden regulatory|rushed timeline|unrealistic timeline|short transition)", "Implementation Timeline", "High"),
        (r"(small startups|seed-stage startups|msme|msmes|crush innovation|small business)", "MSME & Startup Impact", "High"),
        (r"(leakage of proprietary|intellectual property|trade secrets|code disclosure|source code surrender)", "IP & Confidentiality Risk", "Critical"),
        (r"(disproportionately punitive|excessive penalties|bankrupt early-stage|4% of global turnover|harsh fine)", "Proportionality & Penalties", "Critical"),
        (r"(escalate infrastructure costs|costly|infrastructure costs|huge expense|financial burden)", "Cost Inflation", "High"),
        (r"(lacks precise technical definitions|ambiguity|unclear|regulatory uncertainty|vague)", "Legal & Technical Ambiguity", "Medium"),
        (r"(technically infeasible|impractical|infeasible|deep neural networks explainability)", "Technical Feasibility", "High"),
        (r"(isolate domestic|lose global competitiveness|trade friction|export barriers)", "Market & Trade Friction", "High"),
        (r"(vulnerable honey-pots|cybersecurity risk|data breach risks)", "Cybersecurity Risk", "High"),
        (r"(too long for unauthorized|urgent consumer fraud|delay in resolution)", "Consumer Protection Gap", "Medium"),
        (r"(strict local storage|localization without|mirror cloud routing)", "Data Localization Friction", "High")
    ]

    SUGGESTION_CUES = [
        (r"(strongly suggest extending|extend the transition|suggest a \d+-day transition|grace period|phase-in approach|minimum 90-day grace|12-month grace|extension period|suggest extending)", "Timeline Extension", "Extension"),
        (r"(total exemption for entities earning under|exemption for msme|carve-out for startups|deemed approval|total exemption)", "Threshold Exemption", "Exemption"),
        (r"(statutory cure notice period|cure notice of \d+ days|grace notice|cure notice)", "Statutory Cure Notice", "Clarification"),
        (r"(recommend adopting a risk-based|adopt a risk-based|categorization framework|risk-based framework)", "Risk-Based Framework", "Amendment"),
        (r"(establishing independent certified audit|certified audit frameworks|third-party audit|black-box statistical auditing|certified audit)", "Certified Audit Mechanism", "New Provision"),
        (r"(tax credits or infrastructure subsidies|subsidies for domestic data|tax credits)", "Fiscal Incentive", "New Provision"),
        (r"(aligning cross-border adequacy rules|harmonizing.*with oecd|align with iso|aligning.*with recognized international)", "International Harmonization", "Amendment"),
        (r"(regional language support|vernacular languages|multi-lingual voice helpline)", "Multilingual Accessibility", "New Provision"),
        (r"(tiered warning system|proportional graded penalties|capped relative to indian operating)", "Graded Sanctions", "Amendment"),
        (r"(centralized free compliance toolkit|model policy templates)", "Compliance Enablement Toolkit", "New Provision"),
        (r"(drafting explicit negative lists|negative lists rather than broad)", "Negative List Carve-Out", "Clarification"),
        (r"(pooled industry ombudsman|industry ombudsman services)", "Pooled Ombudsman Framework", "New Provision"),
        (r"(dedicated digital appellate tribunal|appellate tribunal)", "Appellate Tribunal", "New Provision"),
        (r"(post-hoc explainability standards|open sandbox environments)", "Technical Standard Definition", "Amendment")
    ]

    def extract(self, text: str, comment_id: str = "item") -> Tuple[List[ConcernItem], List[SuggestionItem]]:
        if not text or len(text.strip()) == 0:
            return [], []

        concerns: List[ConcernItem] = []
        suggestions: List[SuggestionItem] = []

        # Sentence-level tokenization
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 8]

        # Extract Concerns with exact span
        concern_idx = 1
        for pattern, category, severity in self.CONCERN_CUES:
            for s in sentences:
                match = re.search(pattern, s, re.IGNORECASE)
                if match:
                    if not any(c.text == s for c in concerns):
                        concerns.append(ConcernItem(
                            id=f"{comment_id}-CON-{concern_idx}",
                            text=s,
                            category=category,
                            severity=severity,
                            text_span=match.group(0)
                        ))
                        concern_idx += 1

        # Extract Suggestions with exact span
        sugg_idx = 1
        for pattern, action_type, category in self.SUGGESTION_CUES:
            for s in sentences:
                match = re.search(pattern, s, re.IGNORECASE)
                if match:
                    if not any(sg.text == s for sg in suggestions):
                        suggestions.append(SuggestionItem(
                            id=f"{comment_id}-SUG-{sugg_idx}",
                            text=s,
                            action_type=action_type,
                            text_span=match.group(0)
                        ))
                        sugg_idx += 1

        return concerns, suggestions
