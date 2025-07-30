import os
import logging
import re
import json
from fastapi import HTTPException
from google import genai
from google.genai import types
from models import RCAGenerationRequest, RCAGenerationResponse

logger = logging.getLogger(__name__)

class RCAGenerator:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        self.client = genai.Client(api_key=self.api_key)

    def build_prompt(self, request: RCAGenerationRequest) -> str:
        similar_text = "\n".join(
            f"- ID: {issue.id}\n  Description: {issue.description}\n  RCA Category: {issue.rca_category or 'N/A'}"
            for issue in request.similar_issues
        )

        return f"""
You are a data quality assistant. Analyze the current data issue and a list of similar past issues to suggest the most relevant root cause categories.

Return only this JSON format:
{{
  "suggested_rca_categories": ["category1", "category2"],
  "explanation": "A brief explanation of why you chose those categories"
}}

Current Issue Description:
{request.current_issue_description}

Similar Past Issues:
{similar_text}
"""

    def generate_rca(self, request: RCAGenerationRequest) -> RCAGenerationResponse:
        try:
            prompt = self.build_prompt(request)

            logger.info("Calling Gemini to generate potential RCA...")
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.3)
            )

            raw_text = response.text.strip()
            logger.info(f"Gemini raw response: {raw_text}")

            # Clean markdown or extra formatting
            cleaned = re.sub(r"^```json|^```|```$", "", raw_text, flags=re.MULTILINE).strip()

            try:
                parsed = json.loads(cleaned)
            except Exception as e:
                logger.error(f"Failed to parse RCA JSON. Cleaned text: {cleaned}")
                raise e

            return RCAGenerationResponse(
                suggested_rca_categories=parsed.get("suggested_rca_categories", []),
                explanation=parsed.get("explanation")
            )

        except Exception as e:
            logger.error(f"Error generating RCA: {str(e)}")
            raise HTTPException(status_code=500, detail=f"RCA generation failed: {str(e)}")
