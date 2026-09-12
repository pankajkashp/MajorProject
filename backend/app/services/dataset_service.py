import os
import io
import pandas as pd
from typing import List, Optional, Dict, Any, Tuple
from app.models.domain import ConsultationComment
from app.schemas.dataset import IngestionValidationError, DatasetUploadResponse
from app.schemas.comment import CommentResponse
from app.core.config import settings
from app.core.logging import logger

class DatasetAdapter:
    """
    Dataset Normalization Adapter.
    Maps heterogeneous column aliases from various consultation formats into canonical domain fields.
    """

    ID_ALIASES = [
        "submission_id", "id", "comment_id", "response_id", "ref_no", "reference_no", "feedback_id", "record_id"
    ]
    COMMENT_ALIASES = [
        "comment_text", "comment", "feedback", "text", "response", "submission_text", "remarks", "suggestion_text"
    ]
    CONSULTATION_ALIASES = [
        "consultation_ref", "consultation_id", "consultation", "bill_id", "policy_ref", "docket_id"
    ]
    SECTION_ALIASES = [
        "section_clause", "section", "clause", "provision", "chapter", "target_clause", "topic_section"
    ]
    STAKEHOLDER_ALIASES = [
        "stakeholder_category", "stakeholder_type", "stakeholder", "respondent_type", "category", "organization_type"
    ]
    SOURCE_ALIASES = [
        "channel", "source", "submission_channel", "portal", "medium"
    ]
    LANGUAGE_ALIASES = [
        "language", "lang", "submission_language"
    ]
    ENTITY_ALIASES = [
        "organization_or_individual", "organization", "company", "respondent_name", "author", "entity_name"
    ]

    @classmethod
    def _find_column_value(cls, row: Dict[str, Any], aliases: List[str]) -> Optional[Any]:
        row_keys_lower = {str(k).lower().strip(): k for k in row.keys()}
        for alias in aliases:
            if alias.lower() in row_keys_lower:
                actual_key = row_keys_lower[alias.lower()]
                val = row[actual_key]
                if pd.notna(val) and str(val).strip() != "" and str(val).lower() != "nan":
                    return val
        return None

    @classmethod
    def normalize_record(
        cls,
        row: Dict[str, Any],
        row_index: int,
        seen_ids: set,
        default_id_prefix: str = "COM"
    ) -> Tuple[Optional[ConsultationComment], List[IngestionValidationError]]:
        """
        Normalizes a single record and validates required constraints.
        """
        errors: List[IngestionValidationError] = []

        # 1. Extract and Validate Comment Text (Mandatory)
        comment_val = cls._find_column_value(row, cls.COMMENT_ALIASES)
        if not comment_val or not str(comment_val).strip():
            errors.append(IngestionValidationError(
                row_index=row_index,
                field="comment",
                error_type="missing_required_field",
                message="Comment text is required and cannot be empty."
            ))
            return None, errors

        comment_text = str(comment_val).strip()
        if len(comment_text) < 3:
            errors.append(IngestionValidationError(
                row_index=row_index,
                field="comment",
                error_type="invalid_length",
                message=f"Comment text too short ({len(comment_text)} chars). Minimum is 3 characters."
            ))
            return None, errors

        # 2. Extract and Validate ID
        id_val = cls._find_column_value(row, cls.ID_ALIASES)
        if id_val:
            comment_id = str(id_val).strip()
        else:
            comment_id = f"{default_id_prefix}-{row_index:04d}"

        if comment_id in seen_ids:
            errors.append(IngestionValidationError(
                row_index=row_index,
                field="id",
                error_type="duplicate_id",
                message=f"Duplicate ID '{comment_id}' detected. A unique suffix was assigned."
            ))
            comment_id = f"{comment_id}_dup_{row_index}"

        seen_ids.add(comment_id)

        # 3. Extract Optional Fields with Graceful Defaults
        consultation_id = str(cls._find_column_value(row, cls.CONSULTATION_ALIASES) or "DPA-CONS-2026").strip()
        
        section_val = cls._find_column_value(row, cls.SECTION_ALIASES)
        section = str(section_val).strip() if section_val else None

        stakeholder_val = cls._find_column_value(row, cls.STAKEHOLDER_ALIASES)
        stakeholder_type = str(stakeholder_val).strip() if stakeholder_val else "General Public"

        source_val = cls._find_column_value(row, cls.SOURCE_ALIASES)
        source = str(source_val).strip() if source_val else "e-consultation-portal"

        lang_val = cls._find_column_value(row, cls.LANGUAGE_ALIASES)
        language = str(lang_val).strip() if lang_val else "en"

        # 4. Extract Entity Name & Metadata
        entity_val = cls._find_column_value(row, cls.ENTITY_ALIASES)
        metadata: Dict[str, Any] = {}
        if entity_val:
            metadata["organization_or_individual"] = str(entity_val).strip()

        # Capture any unmapped custom columns in metadata
        standard_aliases = set(
            cls.ID_ALIASES + cls.COMMENT_ALIASES + cls.CONSULTATION_ALIASES +
            cls.SECTION_ALIASES + cls.STAKEHOLDER_ALIASES + cls.SOURCE_ALIASES +
            cls.LANGUAGE_ALIASES + cls.ENTITY_ALIASES
        )
        for k, v in row.items():
            if str(k).lower().strip() not in standard_aliases:
                if pd.notna(v) and str(v).lower() != "nan":
                    metadata[str(k)] = v

        comment = ConsultationComment(
            id=comment_id,
            comment=comment_text,
            consultation_id=consultation_id,
            section=section,
            stakeholder_type=stakeholder_type,
            source=source,
            language=language,
            metadata=metadata
        )

        return comment, errors


class DatasetService:
    """
    Dataset Service Boundary.
    Manages consultation comment ingestion, normalization, filtering, and isolation.
    """

    def __init__(self, dataset_path: Optional[str] = None):
        self.dataset_path = dataset_path or settings.DEFAULT_DATASET_PATH
        self._comments: Dict[str, ConsultationComment] = {}
        self._is_loaded = False

    def load_dataset(self, file_path: Optional[str] = None) -> int:
        """Loads and normalizes baseline consultation dataset from CSV file."""
        target_path = file_path or self.dataset_path
        if not os.path.exists(target_path):
            logger.warning(f"Dataset path does not exist: {target_path}. Initializing empty dataset.")
            self._comments = {}
            self._is_loaded = True
            return 0

        try:
            df = pd.read_csv(target_path, encoding=settings.DATASET_ENCODING)
            self._comments.clear()
            seen_ids = set()

            for idx, row in df.iterrows():
                row_dict = row.to_dict()
                comment, _ = DatasetAdapter.normalize_record(row_dict, idx + 1, seen_ids)
                if comment:
                    self._comments[comment.id] = comment

            self._is_loaded = True
            logger.info(f"Loaded {len(self._comments)} consultation comments from {target_path}")
            return len(self._comments)
        except Exception as e:
            logger.error(f"Failed to load dataset from {target_path}: {e}")
            raise e

    def ingest_csv_bytes(self, content: bytes, filename: str) -> DatasetUploadResponse:
        """
        Ingests and validates an uploaded CSV file without overwriting the default dataset.
        Returns detailed validation errors, ingestion counts, and normalized previews.
        """
        if not content or len(content.strip()) == 0:
            return DatasetUploadResponse(
                filename=filename,
                rows_received=0,
                rows_accepted=0,
                rows_rejected=0,
                validation_errors=[
                    IngestionValidationError(
                        row_index=0,
                        field="file",
                        error_type="empty_file",
                        message="Uploaded CSV file contains no data."
                    )
                ],
                preview=[]
            )

        try:
            df = pd.read_csv(io.BytesIO(content), encoding="utf-8")
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.BytesIO(content), encoding="latin1")
            except Exception as e:
                return DatasetUploadResponse(
                    filename=filename,
                    rows_received=0,
                    rows_accepted=0,
                    rows_rejected=0,
                    validation_errors=[
                        IngestionValidationError(
                            row_index=0,
                            field="file",
                            error_type="encoding_error",
                            message=f"Could not parse CSV encoding: {str(e)}"
                        )
                    ],
                    preview=[]
                )
        except Exception as e:
            return DatasetUploadResponse(
                filename=filename,
                rows_received=0,
                rows_accepted=0,
                rows_rejected=0,
                validation_errors=[
                    IngestionValidationError(
                        row_index=0,
                        field="file",
                        error_type="csv_parse_error",
                        message=f"Malformed CSV file: {str(e)}"
                    )
                ],
                preview=[]
            )

        rows_received = len(df)
        if rows_received == 0:
            return DatasetUploadResponse(
                filename=filename,
                rows_received=0,
                rows_accepted=0,
                rows_rejected=0,
                validation_errors=[
                    IngestionValidationError(
                        row_index=0,
                        field="file",
                        error_type="no_data_rows",
                        message="CSV contains headers but zero data rows."
                    )
                ],
                preview=[]
            )

        accepted_comments: List[ConsultationComment] = []
        all_errors: List[IngestionValidationError] = []
        seen_ids = set()

        for idx, row in df.iterrows():
            row_dict = row.to_dict()
            comment, errors = DatasetAdapter.normalize_record(row_dict, idx + 1, seen_ids, default_id_prefix="UP")
            if errors:
                all_errors.extend(errors)
            if comment:
                accepted_comments.append(comment)

        rows_accepted = len(accepted_comments)
        rows_rejected = rows_received - rows_accepted

        # If 0 rows were accepted and there were binary or corrupted rows
        if rows_accepted == 0 and not all_errors:
            all_errors.append(IngestionValidationError(
                row_index=0,
                field="file",
                error_type="unusable_data",
                message="No valid consultation comments could be extracted from this CSV."
            ))

        preview_responses = [
            CommentResponse(
                id=c.id,
                comment=c.comment,
                consultation_id=c.consultation_id,
                section=c.section,
                stakeholder_type=c.stakeholder_type,
                organization_or_individual=c.metadata.get("organization_or_individual"),
                source=c.source,
                language=c.language,
                metadata=c.metadata,
                analysis=None
            )
            for c in accepted_comments[:10]
        ]

        return DatasetUploadResponse(
            filename=filename,
            rows_received=rows_received,
            rows_accepted=rows_accepted,
            rows_rejected=rows_rejected,
            validation_errors=all_errors,
            preview=preview_responses
        )

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
