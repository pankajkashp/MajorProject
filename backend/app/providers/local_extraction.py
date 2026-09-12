import re
from typing import List, Tuple
from app.providers.base import ExtractionProvider
from app.models.domain import ConcernItem, SuggestionItem

class LocalExtractionProvider(ExtractionProvider):
    """
    Heuristic linguistic extractor identifying:
    1. Regulatory/Operational Concerns (compliance burden, IP risk, cost inflation, ambiguity, friction)
    2. Actionable Policy Suggestions (phase-in extensions, turnover exemptions, safe harbors, toolkits)
    """

    CONCERN_CUES = [
        (r"(severely burdensome|burdensome|heavy burden|undue compliance)", "Compliance Burden", "High"),
        (r"(leakage of proprietary|intellectual property|trade secrets|code disclosure)", "IP & Confidentiality Risk", "Critical"),
        (r"(disproportionately punitive|excessive penalties|bankrupt early-stage|harsh penalty)", "Proportionality & Penalties", "Critical"),
        (r"(escalate infrastructure costs|costly|infrastructure costs|financial burden)", "Cost Inflation", "High"),
        (r"(lacks precise technical definitions|ambiguity|unclear|regulatory uncertainty)", "Legal & Technical Ambiguity", "Medium"),
        (r"(technically infeasible|impractical|infeasible)", "Technical Feasibility", "High"),
        (r"(crushed|isolate domestic|lose global competitiveness|trade friction)", "Market & Innovation Impact", "High"),
        (r"(vulnerable honey-pots|cybersecurity|security risks)", "Cybersecurity Risk", "High"),
        (r"(too long for unauthorized|urgent consumer fraud|delay)", "Consumer Protection Gap", "Medium")
    ]

    SUGGESTION_CUES = [
        (r"(strongly suggest extending|extend the transition|grace period|phase-in approach)", "Timeline Extension", "Extension"),
        (r"(recommend adopting a risk-based|adopt a risk-based|categorization framework)", "Risk-Based Framework", "Amendment"),
        (r"(establishing independent certified audit|certified audit frameworks|third-party audit)", "Certified Audit Mechanism", "New Provision"),
        (r"(statutory cure notice period|cure notice of \d+ days|grace notice)", "Statutory Cure Notice", "Clarification"),
        (r"(total exemption for entities earning under|exemption for msme|carve-out for startups)", "Threshold Exemption", "Exemption"),
        (r"(tax credits or infrastructure subsidies|subsidies for domestic)", "Fiscal Incentive", "New Provision"),
        (r"(aligning cross-border adequacy rules|harmonizing.*with oecd|align with iso)", "International Harmonization", "Amendment"),
        (r"(regional language support|vernacular languages|multi-lingual voice helpline)", "Multilingual Accessibility", "New Provision"),
        (r"(tiered warning system|proportional graded penalties|warning before fine)", "Graded Sanctions", "Amendment"),
        (r"(centralized free compliance toolkit|model policy templates)", "Compliance Enablement Toolkit", "New Provision"),
        (r"(drafting explicit negative lists|negative lists rather than)", "Negative List Carve-Out", "Clarification"),
        (r"(pooled industry ombudsman|industry ombudsman services)", "Pooled Ombudsman Framework", "New Provision"),
        (r"(dedicated digital appellate tribunal|appellate tribunal)", "Appellate Tribunal", "New Provision")
    ]

    def extract(self, text: str, comment_id: str = "item") -> Tuple[List[ConcernItem], List[SuggestionItem]]:
        concerns: List[ConcernItem] = []
        suggestions: List[SuggestionItem] = []

        # Sentence-level breakdown
        sentences = [s.strip() for s in re.split(r"[.!?]\s+", text) if len(s.strip()) > 10]

        # Extract Concerns
        concern_idx = 1
        for pattern, category, severity in self.CONCERN_CUES:
            for s in sentences:
                match = re.search(pattern, s, re.IGNORECASE)
                if match:
                    # Avoid exact duplicates
                    if not any(c.text == s for c in concerns):
                        concerns.append(ConcernItem(
                            id=f"{comment_id}-CON-{concern_idx}",
                            text=s,
                            category=category,
                            severity=severity,
                            text_span=match.group(0)
                        ))
                        concern_idx += 1

        # Fallback generic concern extraction if none matched by specific regex
        if not concerns:
            for s in sentences:
                if any(w in s.lower() for w in ["concern", "risk", "burden", "issue", "problem", "difficult", "dispute", "penal"]):
                    concerns.append(ConcernItem(
                        id=f"{comment_id}-CON-1",
                        text=s,
                        category="General Policy Friction",
                        severity="Medium",
                        text_span=None
                    ))
                    break

        # Extract Suggestions
        sugg_idx = 1
        for pattern, desc, action_type in self.SUGGESTION_CUES:
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

        # Fallback generic suggestion extraction
        if not suggestions:
            for s in sentences:
                if any(w in s.lower() for w in ["suggest", "recommend", "propose", "urge", "advise", "request", "please consider"]):
                    suggestions.append(SuggestionItem(
                        id=f"{comment_id}-SUG-1",
                        text=s,
                        action_type="Proposal",
                        text_span=None
                    ))
                    break

        return concerns, suggestions
