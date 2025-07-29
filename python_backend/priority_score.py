import os
import logging
from fastapi import HTTPException
from google import genai
from google.genai import types
from models import PriorityScoreRequest, PriorityScoreResponse

logger = logging.getLogger(__name__)

class PriorityScorer:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        self.client = genai.Client(api_key=self.api_key)

    def build_prompt(self, request: PriorityScoreRequest) -> str:
        return f"""
You are a data quality assistant helping assign a priority score to a data quality issue.

Issue Description: {request.description}
Impacted Report/Area: {request.impacted_report_area}
Critical Field (CDE): {"Yes" if request.is_critical_cde else "No"}
DQ Issue Category: {request.dq_issue_category}
Problem Category: {request.problem_category}
Impacted Field: {request.impacted_field}
Root Cause Category: {request.rca_category}
Root Cause Details: {request.rca_details}
Resolution Category: {request.resolution_category}
Impacted Record Total: {request.impacted_record_total}

Based on the following rules:
- Complexity Score (1–3): based on number of systems affected, number of parties involved, validation effort, cleansing method.
- Impact Score (1–3): based on field criticality and affected data volume.

Return only this JSON:
{{
  "impact_score": x,
  "complexity_score": y
}}
"""

    def get_priority_score(self, request: PriorityScoreRequest) -> PriorityScoreResponse:
        try:
            prompt = self.build_prompt(request)

            logger.info("Calling Gemini to score issue priority...")
            response = self.client.generate_content(
                contents=[{"role": "user", "parts": [prompt]}],
                generation_config=types.GenerationConfig(temperature=0.2)
            )
            raw_text = response.text.strip()

            # Parse response JSON manually
            import json
            parsed = json.loads(raw_text)
            impact = int(parsed["impact_score"])
            complexity = int(parsed["complexity_score"])
            total = impact + complexity

            sla, priority = self.map_score_to_priority(total)

            return PriorityScoreResponse(
                impact_score=impact,
                complexity_score=complexity,
                total_score=total,
                sla=sla,
                priority=priority
            )

        except Exception as e:
            logger.error(f"Error getting priority score: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Priority scoring failed: {str(e)}")

    def map_score_to_priority(self, total: int):
        if total <= 4:
            return "15WD", "Low"
        elif total <= 8:
            return "30WD", "Low-Medium"
        elif total <= 12:
            return "60WD", "Medium"
        elif total <= 15:
            return "90WD", "High"
        else:
            return "120WD", "Very High"
