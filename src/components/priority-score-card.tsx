"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Issue } from "@/types/issue"

interface PriorityScoreCardProps {
  editedIssue: Issue
  setEditedIssue: (updated: Issue) => void
}

export default function PriorityScoreCard({ editedIssue, setEditedIssue }: PriorityScoreCardProps) {
  const [loading, setLoading] = useState(false)

  const addWorkingDays = (startDate: Date, workingDays: number): Date => {
    const result = new Date(startDate)
    let added = 0
    while (added < workingDays) {
      result.setDate(result.getDate() + 1)
      // Skip weekends
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        added++
      }
    }
    return result
  }

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
          impacted_field: editedIssue.issueField || "",
          rca_category: editedIssue.rcaCategory || "",
          rca_details: editedIssue.rcaDetails || "",
          impacted_record_total: editedIssue.impactedRecordTotal || 0
        })
      })

      if (!response.ok) throw new Error("Failed to calculate priority score")

      const data = await response.json()
      console.log("AI response data:", data)

      console.log("working days", data.workingDays)

      const pickedUp = editedIssue.pickedUpAt ? new Date(editedIssue.pickedUpAt) : new Date()

      setEditedIssue({
        ...editedIssue,
        aiSuggestions: {
          impactScore: data.impact_score,
          complexityScore: data.complexity_score,
          totalScore: data.total_score,
          suggestedPriority: data.priority
        },
        workingDays: data.sla,
        deadline: addWorkingDays(pickedUp, parseInt(data.sla))  // <--- add this
      })

    } catch (error) {
      console.error("Error calculating priority score:", error)
    } finally {
      setLoading(false)
    }
  }

  // const handleScoreChange = (field: "impactScore" | "complexityScore", value: number) => {
  //   const otherField = field === "impactScore" ? "complexityScore" : "impactScore"
  //   const otherValue = editedIssue.aiSuggestions?.[otherField] ?? 0
  //   const newTotal = value + otherValue

  //   const calculateWorkingDays = (total: number): number => {
  //     if (total <= 4) return 15
  //     if (total <= 8) return 30
  //     if (total <= 12) return 60
  //     if (total <= 15) return 90
  //     return 120
  //   }

  //   setEditedIssue({
  //     ...editedIssue,
  //     aiSuggestions: {
  //       ...editedIssue.aiSuggestions,
  //       [field]: value,
  //       totalScore: newTotal
  //     },
  //     workingDays: calculateWorkingDays(newTotal),
  //   })
  // }

  const handleScoreChange = (field: "impactScore" | "complexityScore", value: number) => {
    const otherField = field === "impactScore" ? "complexityScore" : "impactScore"
    const otherValue = editedIssue.aiSuggestions?.[otherField] ?? 0
    const newTotal = value + otherValue

    const calculateWorkingDays = (total: number): number => {
      if (total <= 4) return 15
      if (total <= 8) return 30
      if (total <= 12) return 60
      if (total <= 15) return 90
      return 120
    }

    const workingDays = calculateWorkingDays(newTotal)
    const pickedUp = editedIssue.pickedUpAt ? new Date(editedIssue.pickedUpAt) : new Date()
    const newDeadline = addWorkingDays(pickedUp, workingDays)

    setEditedIssue({
      ...editedIssue,
      aiSuggestions: {
        ...editedIssue.aiSuggestions,
        [field]: value,
        totalScore: newTotal
      },
      workingDays,
      deadline: newDeadline
    })
  }

  const getSuggestedPriority = (impact: number | undefined): string => {
    if (impact === undefined) return "N/A"
    if (impact >= 5) return "High"
    if (impact >= 3) return "Medium"
    return "Low"
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
          <input
            type="number"
            min="0"
            max="6"
            value={editedIssue.aiSuggestions?.impactScore ?? 0}
            onChange={(e) =>
              handleScoreChange("impactScore", Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))
            }
            className="text-3xl font-bold text-blue-600 w-20 text-center bg-transparent border-none outline-none"
          />
          <div className="text-xs text-gray-500">Impact Score</div>
        </div>
        <div>
          <input
            type="number"
            min="0"
            max="12"
            value={editedIssue.aiSuggestions?.complexityScore ?? 0}
            onChange={(e) =>
              handleScoreChange("complexityScore", Math.min(12, Math.max(0, parseInt(e.target.value) || 0)))
            }
            className="text-3xl font-bold text-purple-600 w-20 text-center bg-transparent border-none outline-none"
          />
          <div className="text-xs text-gray-500">Complexity Score</div>
        </div>
      </div>

      <div className="text-center p-2 bg-white rounded-lg">
        <div className="text-3xl font-bold text-gray-800">{editedIssue.aiSuggestions?.totalScore ?? 0}</div>
        <div className="text-xs text-gray-500">Total Score</div>
        <div className="text-m text-gray-500">({editedIssue.workingDays} WD)</div>

      </div>

      <div className="text-center p-3 bg-orange-100 text-orange-700 rounded-lg font-semibold">
        {/* {editedIssue.aiSuggestions?.suggestedPriority || "N/A"} */}
        {getSuggestedPriority(editedIssue.aiSuggestions?.impactScore)}
        <div className="text-xs font-normal">Suggested Priority</div>
      </div>

      <div className="flex items-center text-sm text-yellow-600 p-2 bg-yellow-50 rounded-md">
        <AlertCircle className="w-4 h-4 mr-2" />
        You can edit the scores after AI analysis.
      </div>
    </div>
  )
}
