from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

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
    # problem_category: str
    impacted_field: str
    rca_category: str
    rca_details: str
    # resolution_category: str
    impacted_record_total: int

class PriorityScoreResponse(BaseModel):
    impact_score: int
    complexity_score: int
    total_score: int
    sla: str
    priority: str


class AISuggestions(BaseModel):
    impactScore: int
    complexityScore: int
    totalScore: int
    suggestedPriority: Literal["Super High", "High", "Medium", "Low"]

class EmailSendRequest(BaseModel):
    id: str
    description: str
    priority: Literal["Super High", "High", "Medium", "Low", "N/A"]

    requesterDepartment: str
    requesterUnit: str
    requesterCostCenter: Optional[str]
    sourceSystem: str
    impactedArea: str

    status: Literal["new", "monitoring", "closed", "resolving", "investigating"]
    deadline: datetime

    dataClass: Optional[str]
    criticalDataElement: Optional[Literal["Yes", "No"]]
    dqIssueCategory: Optional[str]
    issueField: Optional[str]
    isRecurring: Optional[str]

    rcaCategory: Optional[str]
    rcaDetails: Optional[str]
    impactAnalysis: Optional[str]

    reportedRecordTotal: Optional[int]
    impactedRecordTotal: Optional[int]
    cleansedRecordTotal: Optional[int]
    excludedRecordTotal: Optional[int]
    outstandingRecordTotal: Optional[int]
    percentTotal: Optional[str]

    systemEnhancement: Optional[Literal["yes", "no"]]
    processImprovement: Optional[Literal["yes", "no"]]

    extraRemarks: Optional[str]
    systemEnhancementNotes: Optional[str]
    processImprovementNotes: Optional[str]

    aiSuggestions: Optional[AISuggestions]
    workingDays: Optional[int]

class EmailSendResponse(BaseModel):
    status: str
    message: str
