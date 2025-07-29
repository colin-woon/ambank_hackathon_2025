"use client"

import type { Issue } from "@/types/issue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSearch, ArrowRight, Clock } from "lucide-react"

interface AnalysisDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onUpdateIssue: (issue: Issue) => void
}

export function AnalysisDashboard({ issues, onIssueClick, onUpdateIssue }: AnalysisDashboardProps) {
  // Filter issues for analysis stage
  const newIssues = issues.filter((issue) => issue.status === "new")
  const investigationIssues = issues.filter((issue) => issue.status === "investigating")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Super High":
        return "border-l-red-500 bg-red-50"
      case "High":
        return "border-l-orange-500 bg-orange-50"
      case "Medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "Low":
        return "border-l-gray-500 bg-gray-50"
      case "N/A":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const handleMoveToInvestigation = (issue: Issue) => {
    onUpdateIssue({ ...issue, status: "investigating" })
  }

  const IssueCard = ({ issue, showMoveButton = false }: { issue: Issue; showMoveButton?: boolean }) => (
    <Card
      className={`mb-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(issue.priority)}`}
      onClick={() => onIssueClick(issue)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-red-700">{issue.id}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {issue.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 mb-2 line-clamp-1">{issue.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>{issue.requesterName}</span>
          <span>{issue.createdAt.toLocaleDateString()}</span>
        </div>
        {showMoveButton && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-blue-700 border-blue-300 hover:bg-blue-50 bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              handleMoveToInvestigation(issue)
            }}
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            Move to Investigation
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* New Issues Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            New Issues ({newIssues.length})
          </h2>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 min-h-96 border-2 border-blue-200">
          <div className="mb-4 text-sm text-blue-700 font-medium">Issues awaiting initial analysis and triage</div>
          {newIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} showMoveButton={true} />
          ))}
          {newIssues.length === 0 && (
            <div className="text-center text-gray-500 py-8">No new issues awaiting analysis</div>
          )}
        </div>
      </div>

      {/* Investigation Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileSearch className="w-5 h-5 mr-2 text-purple-600" />
            Investigation ({investigationIssues.length})
          </h2>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 min-h-96 border-2 border-purple-200">
          <div className="mb-4 text-sm text-purple-700 font-medium">
            Issues under active investigation and root cause analysis
          </div>
          {investigationIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          {investigationIssues.length === 0 && (
            <div className="text-center text-gray-500 py-8">No issues under investigation</div>
          )}
        </div>
      </div>
    </div>
  )
}
