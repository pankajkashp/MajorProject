import os
import pandas as pd
from typing import List, Optional, Dict, Any
from app.models.domain import ConsultationComment
from app.core.config import settings
from app.core.logging import logger

class DatasetService:
    """
    Dataset Adapter & Repository Layer.
    Normalizes heterogeneous CSV/database columns into the uniform ConsultationComment domain model.
    Designed so PostgreSQL/SQLAlchemy or external APIs can replace the in-memory/CSV storage
    without changing any business logic.
    """

    def __init__(self, dataset_path: Optional[str] = None):
        self.dataset_path = dataset_path or settings.DEFAULT_DATASET_PATH
        self._comments: Dict[str, ConsultationComment] = {}
        self._is_loaded = False

    def normalize_row_to_comment(self, row: pd.Series, default_id_prefix: str = "COM") -> ConsultationComment:
        """Flexible column adapter handling various CSV schema conventions."""
        # 1. Resolve ID
        comment_id = (
            str(row.get("submission_id") or row.get("id") or row.get("comment_id") or row.get("ref_no") or "")
        ).strip()
        if not comment_id or comment_id == "nan":
            comment_id = f"{default_id_prefix}-{len(self._comments) + 1:04d}"

        # 2. Resolve Comment Text
        comment_text = (
            str(row.get("comment_text") or row.get("comment") or row.get("feedback") or row.get("text") or "")
        ).strip()

        # 3. Resolve Consultation ID
        consultation_id = str(row.get("consultation_ref") or row.get("consultation_id") or "DPA-CONS-2026").strip()

        # 4. Resolve Section / Clause
        section = row.get("section_clause") or row.get("section") or row.get("clause") or None
        if pd.isna(section) or section == "nan":
            section = None
        else:
            section = str(section).strip()

        # 5. Resolve Stakeholder Category
        stakeholder_type = row.get("stakeholder_category") or row.get("stakeholder_type") or row.get("category") or "General Public"
        if pd.isna(stakeholder_type) or stakeholder_type == "nan":
            stakeholder_type = "General Public"
        else:
            stakeholder_type = str(stakeholder_type).strip()

        # 6. Resolve Source / Channel
        source = str(row.get("channel") or row.get("source") or "e-consultation-portal").strip()

        # 7. Resolve Language
        language = str(row.get("language") or "en").strip()

        # 8. Extra Metadata
        metadata: Dict[str, Any] = {}
        for col in row.index:
            if col not in ["submission_id", "id", "comment_id", "comment_text", "comment", "feedback", "section_clause", "section", "stakeholder_category", "stakeholder_type"]:
                val = row[col]
                if pd.notna(val) and val != "nan":
                    metadata[col] = val

        return ConsultationComment(
            id=comment_id,
            comment=comment_text,
            consultation_id=consultation_id,
            section=section,
            stakeholder_type=stakeholder_type,
            source=source,
            language=language,
            metadata=metadata
        )

    def load_dataset(self, file_path: Optional[str] = None) -> int:
        target_path = file_path or self.dataset_path
        if not os.path.exists(target_path):
            logger.warning(f"Dataset path does not exist: {target_path}. Initializing empty dataset.")
            self._comments = {}
            self._is_loaded = True
            return 0

        try:
            df = pd.read_csv(target_path, encoding=settings.DATASET_ENCODING)
            self._comments.clear()
            for _, row in df.iterrows():
                comment = self.normalize_row_to_comment(row)
                if comment.comment:
                    self._comments[comment.id] = comment
            self._is_loaded = True
            logger.info(f"Loaded {len(self._comments)} consultation comments from {target_path}")
            return len(self._comments)
        except Exception as e:
            logger.error(f"Failed to load dataset: {e}")
            raise e

    def get_all(self) -> List[ConsultationComment]:
        if not self._is_loaded:
            self.load_dataset()
        return list(self._comments.values())

    def get_by_id(self, comment_id: str) -> Optional[ConsultationComment]:
        if not self._is_loaded:
            self.load_dataset()
        return self._comments.get(comment_id)

    def add_comment(self, comment: ConsultationComment) -> ConsultationComment:
        if not self._is_loaded:
            self.load_dataset()
        self._comments[comment.id] = comment
        return comment

    def filter_comments(
        self,
        stakeholder_type: Optional[str] = None,
        section: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[ConsultationComment]:
        comments = self.get_all()
        filtered = comments

        if stakeholder_type and stakeholder_type.lower() != "all":
            filtered = [c for c in filtered if c.stakeholder_type and c.stakeholder_type.lower() == stakeholder_type.lower()]

        if section and section.lower() != "all":
            filtered = [c for c in filtered if c.section and section.lower() in c.section.lower()]

        if search_query:
            query = search_query.lower()
            filtered = [
                c for c in filtered
                if query in c.comment.lower()
                or (c.section and query in c.section.lower())
                or (c.stakeholder_type and query in c.stakeholder_type.lower())
                or (c.metadata.get("organization_or_individual") and query in str(c.metadata.get("organization_or_individual")).lower())
            ]

        return filtered

dataset_service = DatasetService()
