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
Impacted Field: {request.impacted_field}
Root Cause Category: {request.rca_category}
Root Cause Details: {request.rca_details}
Impacted Record Total: {request.impacted_record_total}

Calculate the total Complexity Score and total Impact Score based on the following additive rules:

Complexity Score Factors (add points for each applicable factor):
- System Affected: 1 system (1 point), 2 systems (2 points), 3+ systems (3 points)
- People Involvement: 1 party (1 point), 2 parties (2 points), 3+ parties (3 points)
- Data Validation Effort: No/minimal effort (1 point), Simple data validation (2 points), Complicated validation process (3 points)
- Cleansing Method: Batch Update/Manual Update <100 records (1 point), Manual Update <500 records (2 points), Manual Update >=500 records (3 points)

Impact Score Factors (add points for each applicable factor):
- Field Criticality: Non-CDE field (1 point), CDE & optional field (2 points), CDE & mandatory field (3 points)
- Data Volume: <5% of the base (1 point), >=5% of the base (2 points), >=20% of the base (3 points)

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
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0)
            )
            raw_text = response.text.strip()

            logger.info(f"Raw response text: {raw_text}")

            import json
            import re
            # Remove markdown formatting
            cleaned = re.sub(r"^```json|^```|```$", "", raw_text, flags=re.MULTILINE).strip()

            try:
                parsed = json.loads(cleaned)
                # print(parsed)
            except Exception as e:
                logger.error(f"JSON parsing failed. Cleaned text: {cleaned}")
                raise e

            impact = int(parsed["impact_score"])
            complexity = int(parsed["complexity_score"])
            total = impact + complexity

            sla = self.map_score_to_sla(total)
            priority = self.map_impact_to_priority(impact)

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

    def map_impact_to_priority(self, impact: int) -> str:
        if impact >= 5:
            return "High"
        elif impact >= 3:
            return "Medium"
        else:
            return "Low"

    def map_score_to_sla(self, total: int) -> int:
        if total <= 4:
            return 15
        elif total <= 8:
            return 30
        elif total <= 12:
            return 60
        elif total <= 15:
            return 90
        else:
            return 120

