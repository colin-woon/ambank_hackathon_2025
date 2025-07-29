from models import EmailSendRequest
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from email.message import EmailMessage
import ssl
import smtplib

# Load .env variables
load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_RECEIVER = os.getenv("EMAIL_RECEIVER")

class EmailSender:
    def send_email(self, issue: EmailSendRequest):

        subject = f"Issue Alert: {issue.id} - {issue.priority} Priority"
        summary = self._build_email_body(issue)
        print("Summary:\n", summary)


        # Create the email
        em = EmailMessage()
        em["Subject"] = "Issue Summary Notification"
        em["From"] = EMAIL_ADDRESS
        em["To"] = EMAIL_RECEIVER
        em.set_content(summary)
        print("📧 Sending email...")

        # Connect to Gmail SMTP server
        try:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
                smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                smtp.sendmail(EMAIL_ADDRESS, EMAIL_RECEIVER, em.as_string())
                print("✅ Email sent successfully!")
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            raise


    def _build_email_body(self, issue: EmailSendRequest) -> str:
        return f"""
Dear Data Steward,

The following issue is currently under investigation and requires your attention:

📌 Issue ID: {issue.id}
📄 Description: {issue.description}
🏷️ Priority: {issue.priority}
📆 Deadline: {issue.deadline}

Requester: {issue.requesterDepartment} / {issue.requesterUnit} ({issue.requesterCostCenter or "N/A"})
Source System: {issue.sourceSystem}
Impacted Area: {issue.impactedArea}

Classification:
- Data Class: {issue.dataClass or "N/A"}
- CDE: {issue.criticalDataElement or "N/A"}
- DQ Category: {issue.dqIssueCategory or "N/A"}
- Field: {issue.issueField or "N/A"}
- Recurring: {issue.isRecurring or "N/A"}

Root Cause:
- Category: {issue.rcaCategory or "N/A"}
- Details: {issue.rcaDetails or "N/A"}
- Analysis: {issue.impactAnalysis or "N/A"}

📊 Metrics:
- Reported: {issue.reportedRecordTotal or 0}
- Impacted: {issue.impactedRecordTotal or 0}
- Cleansed: {issue.cleansedRecordTotal or 0}
- Excluded: {issue.excludedRecordTotal or 0}
- Outstanding: {issue.outstandingRecordTotal or 0}
- % Total Impact: {issue.percentTotal or "N/A"}

🛠️ Improvements:
- System Enhancement: {issue.systemEnhancement or "N/A"} - {issue.systemEnhancementNotes or ""}
- Process Improvement: {issue.processImprovement or "N/A"} - {issue.processImprovementNotes or ""}

Remarks: {issue.extraRemarks or "N/A"}

🔎 AI Suggestions:
- Impact Score: {issue.aiSuggestions.impactScore if issue.aiSuggestions else "N/A"}
- Complexity Score: {issue.aiSuggestions.complexityScore if issue.aiSuggestions else "N/A"}
- Total Score: {issue.aiSuggestions.totalScore if issue.aiSuggestions else "N/A"}
- Suggested Priority: {issue.aiSuggestions.suggestedPriority if issue.aiSuggestions else "N/A"}
- Working Days Estimate: {issue.workingDays or "N/A"}

Regards,
AI Co-Pilot System
"""
