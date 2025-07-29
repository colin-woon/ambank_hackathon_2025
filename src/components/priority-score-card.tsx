"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Issue } from "@/types/issue" // Adjust this import based on your file structure

interface PriorityScoreCardProps {
  editedIssue: Issue
  setEditedIssue: (updated: Issue) => void
}

export default function PriorityScoreCard({ editedIssue, setEditedIssue }: PriorityScoreCardProps) {
  const [loading, setLoading] = useState(false)

  const handleCalculatePriority = async () => {
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/suggest-priority-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editedIssue.description,
          impacted_report_area: editedIssue.impactedArea,
          is_critical_cde: editedIssue.criticalDataElement === "Yes",
          dq_issue_category: editedIssue.dqIssueCategory || "",
          problem_category: editedIssue.problemCategory || "",
          impacted_field: editedIssue.issueField || "",
          rca_category: editedIssue.rcaCategory || "",
          rca_details: editedIssue.rcaDetails || "",
          resolution_category: editedIssue.resolutionCategory || "",
          impacted_record_total: editedIssue.impactedRecordTotal || 0
        })
      })

      if (!response.ok) throw new Error("Failed to calculate priority score")

      const data = await response.json()

      setEditedIssue({
        ...editedIssue,
        aiSuggestions: {
          impactScore: data.impact_score,
          complexityScore: data.complexity_score,
          totalScore: data.total_score,
          suggestedPriority: data.priority
        }
      })

    } catch (error) {
      console.error("Error calculating priority score:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        className="w-full bg-red-600 hover:bg-red-700"
        onClick={handleCalculatePriority}
        disabled={loading}
      >
        {loading ? "Calculating..." : "Calculate Priority Score"}
      </Button>

      <div className="flex justify-around text-center p-2 bg-white rounded-lg">
        <div>
          <div className="text-2xl font-bold text-blue-600">{editedIssue.aiSuggestions?.impactScore ?? 0}</div>
          <div className="text-xs text-gray-500">Impact Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{editedIssue.aiSuggestions?.complexityScore ?? 0}</div>
          <div className="text-xs text-gray-500">Complexity Score</div>
        </div>
      </div>

      <div className="text-center p-2 bg-white rounded-lg">
        <div className="text-3xl font-bold text-gray-800">{editedIssue.aiSuggestions?.totalScore ?? 0}</div>
        <div className="text-xs text-gray-500">Total Score</div>
      </div>

      <div className="text-center p-3 bg-orange-100 text-orange-700 rounded-lg font-semibold">
        {editedIssue.aiSuggestions?.suggestedPriority || "N/A"}
        <div className="text-xs font-normal">Suggested Priority</div>
      </div>

      <div className="flex items-center text-sm text-yellow-600 p-2 bg-yellow-50 rounded-md">
        <AlertCircle className="w-4 h-4 mr-2" />
        Priority score calculation might take a few moments.
      </div>
    </div>
  )
}
