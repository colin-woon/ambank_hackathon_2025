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
