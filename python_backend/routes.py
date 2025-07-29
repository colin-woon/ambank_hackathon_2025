import logging
from fastapi import APIRouter, HTTPException
from models import IssueRequest, DuplicateDetectionResponse, HealthResponse #, AddIssueResponse
from detector import DuplicateDetector

from models import PriorityScoreRequest, PriorityScoreResponse
from priority_score import PriorityScorer

logger = logging.getLogger(__name__)

# ========== DUPLICATE DETECTION ==========

# Global detector instance
detector: DuplicateDetector = None

def set_detector(detector_instance: DuplicateDetector):
    """Set the global detector instance"""
    global detector
    detector = detector_instance

# Create router
router = APIRouter()

@router.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(status="healthy", message="API is running")

@router.get("/chromadb", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    try:
        count = detector.get_collection_count() if detector else 0
        return HealthResponse(
            status="healthy",
            message=f"API is running. ChromaDB collection has {count} embeddings."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.post("/detect-duplicates", response_model=DuplicateDetectionResponse)
async def detect_duplicates(request: IssueRequest):
    """Detect duplicate issues for a given issue description"""
    if not detector:
        raise HTTPException(status_code=500, detail="Duplicate detector not initialized")

    try:
        result = detector.detect_duplicates(request.id, request.description)
        logger.info(f"Duplicate detection completed for issue: {request.id}")
        return result
    except Exception as e:
        logger.error(f"Error processing duplicate detection request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/add-issue", response_model=AddIssueResponse)
# async def add_issue(request: IssueRequest):
#     """Add a new issue to the knowledge base (for future duplicate detection)"""
#     if not detector:
#         raise HTTPException(status_code=500, detail="Duplicate detector not initialized")

#     try:
#         message = detector.add_issue(request.id, request.description)
#         return AddIssueResponse(message=message)
#     except Exception as e:
#         logger.error(f"Error adding issue to knowledge base: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# ========== DUPLICATE DETECTION ==========

scorer = PriorityScorer()

@router.post("/suggest-priority-score", response_model=PriorityScoreResponse)
async def suggest_priority_score(request: PriorityScoreRequest):
    """Suggest priority score for a data quality issue"""
    try:
        result = scorer.get_priority_score(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
