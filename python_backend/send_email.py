import os
import ssl
import smtplib
import logging
from email.message import EmailMessage
from dotenv import load_dotenv
from fastapi import HTTPException
from models import EmailSendRequest
from google import genai
from google.genai import types
import re

load_dotenv()
logger = logging.getLogger(__name__)

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_RECEIVER = os.getenv("EMAIL_RECEIVER")

class EmailSender:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        self.client = genai.Client(api_key=self.api_key)

    def send_email(self, issue: EmailSendRequest):
        try:
            email_body = self.generate_ai_email_body(issue)
            html_body = self.clean_email_spacing(email_body, True)

            em = EmailMessage()
            em["Subject"] = f"Issue Alert: {issue.id} - {issue.priority} Priority"
            em["From"] = EMAIL_ADDRESS
            em["To"] = EMAIL_RECEIVER
            em.set_content(email_body)
            em.add_alternative(f"""\
            <html>
            <body>
                {html_body}
            </body>
            </html>
            """, subtype="html")

            logger.info("📧 Sending email...")
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
                smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                smtp.sendmail(EMAIL_ADDRESS, EMAIL_RECEIVER, em.as_string())
                logger.info("✅ Email sent successfully!")

        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            raise HTTPException(status_code=500, detail=f"Email sending failed: {e}")

    def clean_email_spacing(self, text: str, html: bool = False) -> str:
        # Step 1: Normalize spacing (remove excessive blank lines)
        text = re.sub(r'\n\s*\n+', '\n', text)

        # Step 2: Remove unnecessary blank line after headers (e.g., "Key Identifiers\n\nIssue ID")
        text = re.sub(r'(?<=\n)([A-Z][^\n:]+)\n+', r'\1\n', text)

        # Step 3: Optionally convert to HTML
        if html:
            text = text.replace("**", "<b>")
            text = text.replace("\n", "<br>")

        return text.strip()



    def generate_ai_email_body(self, issue: EmailSendRequest) -> str:
        prompt = self.build_prompt(issue)

        try:
            logger.info("Calling Gemini to generate issue email...")
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.4)
            )
            body = response.text.strip()

            logger.info("✅ AI email body generated")
            return body

        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            raise

    def build_prompt(self, issue: EmailSendRequest) -> str:
        return f"""
You are an AI assistant helping a data governance team craft professional notification emails to data stewards.

Write a clear, well-structured, and concise email informing the data steward about a data quality issue. Use a formal tone appropriate for corporate communication.

Please follow this structure:
0. Include a greeting at the start of the email.
1. **A 1-2 sentence summary at the top** explaining the issue and why it matters.
2. A section for key identifiers: Issue ID, Description, Priority, Deadline, Requester.
3. A section for details: Source System, Impacted Area, Data Class, CDE, DQ Category, Impacted Field, Recurring.
4. A section for metrics: Reported, Impacted, Cleansed, Excluded, Outstanding.
5. A section for root cause and impact analysis.
6. A section for improvements (system and process).
7. A final remarks section.
8. A polite closing requesting prompt attention (from "Data Quality Team").

Formatting guidelines:
- Use only single line breaks** between sections or items (no excessive spacing).
- Do not use Markdown (e.g. no `**bold**` or `*`).
- Use plain, clean formatting with readable labels.
- Keep bullet points or numbered sections minimal and aligned.
- Keep it under 300 words total.
- add a line break spacing before each section(Key Identifiers, Details, Metrics, etc), other than don't add line breaks any where else

Wrap your response in `<html><body> ... </body></html>` and use basic HTML formatting such as `<b>`, `<br>`, <p> for structure and readability.
Do NOT include `<head>`, `<title>`, or CSS.

Here are the issue details:

Issue ID: {issue.id}
Description: {issue.description}
Priority: {issue.priority}
Deadline: {issue.deadline}
Requester: {issue.requesterDepartment} / {issue.requesterUnit} ({issue.requesterCostCenter or "N/A"})
Source System: {issue.sourceSystem}
Impacted Area: {issue.impactedArea}
Data Class: {issue.dataClass or "N/A"}
CDE: {issue.criticalDataElement or "N/A"}
DQ Issue Category: {issue.dqIssueCategory or "N/A"}
Impacted Field: {issue.issueField or "N/A"}
Recurring: {issue.isRecurring or "N/A"}

Reported Records: {issue.reportedRecordTotal or 0}
Impacted Records: {issue.impactedRecordTotal or 0}
Cleansed Records: {issue.cleansedRecordTotal or 0}
Excluded Records: {issue.excludedRecordTotal or 0}
Outstanding Records: {issue.outstandingRecordTotal or 0}
% Total Impact: {issue.percentTotal or "N/A"}

Root Cause Category: {issue.rcaCategory or "N/A"}
Root Cause Details: {issue.rcaDetails or "N/A"}
Impact Analysis: {issue.impactAnalysis or "N/A"}

System Enhancement: {issue.systemEnhancement or "N/A"} - {issue.systemEnhancementNotes or ""}
Process Improvement: {issue.processImprovement or "N/A"} - {issue.processImprovementNotes or ""}
Remarks: {issue.extraRemarks or "N/A"}

AI Suggestions:
Impact Score: {issue.aiSuggestions.impactScore if issue.aiSuggestions else "N/A"}
Complexity Score: {issue.aiSuggestions.complexityScore if issue.aiSuggestions else "N/A"}
Total Score: {issue.aiSuggestions.totalScore if issue.aiSuggestions else "N/A"}
Suggested Priority: {issue.aiSuggestions.suggestedPriority if issue.aiSuggestions else "N/A"}
Working Days Estimate: {issue.workingDays or "N/A"}
"""




