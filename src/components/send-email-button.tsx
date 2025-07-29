"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import type { Issue } from "@/types/issue"

interface SendEmailButtonProps {
  issue: Issue
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function SendEmailButton({
  issue,
  onSuccess,
  onError
}: SendEmailButtonProps) {
  const [loading, setLoading] = useState(false)

  // const handleSendEmail = async () => {
  //   setLoading(true)
  //   onError?.("") // clear errors

  //   try {
  //     const response = await fetch("http://localhost:8000/send-summary-email", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(issue)
  //     })

  //     if (!response.ok) {
  //       const errorData = await response.json()
  //       throw new Error(errorData.detail || "Failed to send email")
  //     }

  //     onSuccess?.()
  //     alert("Email sent to Data Steward successfully.")
  //   } catch (err) {
  //     onError?.(err instanceof Error ? err.message : "Unexpected error occurred")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleSendEmail = async () => {

    const payloadToSend = {
      id: issue.id,
      description: issue.description,
      priority: issue.priority,

      requesterDepartment: issue.requesterDepartment,
      requesterUnit: issue.requesterUnit,
      requesterCostCenter: issue.requesterCostCenter ?? null,
      sourceSystem: issue.sourceSystem,
      impactedArea: issue.impactedArea,

      status: issue.status,
      deadline: issue.deadline?.toISOString(),

      dataClass: issue.dataClass ?? null,
      criticalDataElement: issue.criticalDataElement ?? null,
      dqIssueCategory: issue.dqIssueCategory ?? null,
      issueField: issue.issueField ?? null,
      isRecurring: issue.isRecurring ?? null,

      rcaCategory: issue.rcaCategory ?? null,
      rcaDetails: issue.rcaDetails ?? null,
      impactAnalysis: issue.impactAnalysis ?? null,

      reportedRecordTotal: issue.reportedRecordTotal ?? null,
      impactedRecordTotal: issue.impactedRecordTotal ?? null,
      cleansedRecordTotal: issue.cleansedRecordTotal ?? null,
      excludedRecordTotal: issue.excludedRecordTotal ?? null,
      outstandingRecordTotal: issue.outstandingRecordTotal ?? null,
      percentTotal: issue.percentTotal ?? null,

      systemEnhancement: issue.systemEnhancement ?? null,
      processImprovement: issue.processImprovement ?? null,

      extraRemarks: issue.extraRemarks ?? null,
      systemEnhancementNotes: issue.systemEnhancementNotes ?? null,
      processImprovementNotes: issue.processImprovementNotes ?? null,

      aiSuggestions: issue.aiSuggestions
        ? {
            impactScore: issue.aiSuggestions.impactScore,
            complexityScore: issue.aiSuggestions.complexityScore,
            totalScore: issue.aiSuggestions.totalScore,
            suggestedPriority: issue.aiSuggestions.suggestedPriority
          }
        : null,

      workingDays: issue.workingDays ?? null
    }

    console.log("Payload to send:", payloadToSend)


    try {
      const response = await fetch("http://localhost:8000/send-summary-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to send email")
      }

      alert("Email sent successfully")
    } catch (err) {
      console.error("Send email error:", err)
      alert("Failed to send email")
    }
  }


  return (
    <Button
      onClick={handleSendEmail}
      disabled={loading}
      className="w-full flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending Email...
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Notify Data Steward
        </>
      )}
    </Button>
  )
}
