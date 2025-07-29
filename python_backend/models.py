from pydantic import BaseModel
from typing import List

class IssueRequest(BaseModel):
    id: str
    description: str

class SimilarIssue(BaseModel):
    ticket_id: str
    description: str
    similarity_score: float

class DuplicateDetectionResponse(BaseModel):
    new_issue_id: str
    new_issue_description: str
    similar_issues: List[SimilarIssue]
    is_duplicate: bool
    duplicate_threshold: float = 0.8

class HealthResponse(BaseModel):
    status: str
    message: str

# class AddIssueResponse(BaseModel):
#     message: str

class PriorityScoreRequest(BaseModel):
    description: str
    impacted_report_area: str
    is_critical_cde: bool
    dq_issue_category: str
    problem_category: str
    impacted_field: str
    rca_category: str
    rca_details: str
    resolution_category: str
    impacted_record_total: int

class PriorityScoreResponse(BaseModel):
    impact_score: int
    complexity_score: int
    total_score: int
    sla: str
    priority: str
