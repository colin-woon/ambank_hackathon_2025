"use client"

import type { Issue } from "@/types/issue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Wrench, Zap, Eye } from "lucide-react"

interface ResolutionDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onUpdateIssue: (issue: Issue) => void
}

export function ResolutionDashboard({ issues, onIssueClick, onUpdateIssue }: ResolutionDashboardProps) {
  // Filter issues for resolution stage based on resolution category
  const cleansingIssues = issues.filter(
    (issue) => issue.status === "in_progress" && issue.resolutionCategory === "Manual Data Cleansing",
  )

  const enhancingIssues = issues.filter(
    (issue) =>
      issue.status === "in_progress" &&
      (issue.resolutionCategory === "Software Improvement" || issue.resolutionCategory === "Process Improvement"),
  )

  const monitoringIssues = issues.filter((issue) => issue.status === "monitoring")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "border-l-red-500 bg-red-50"
      case "Medium":
        return "border-l-orange-500 bg-orange-50"
      case "Low":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const handleStatusChange = (issue: Issue, newStatus: Issue["status"]) => {
    onUpdateIssue({ ...issue, status: newStatus })
  }

  const handleMoveToMonitoring = (issue: Issue) => {
    onUpdateIssue({ ...issue, status: "monitoring" })
  }

  const IssueCard = ({
    issue,
    showMoveButton = false,
    showMonitoringActions = false,
  }: {
    issue: Issue
    showMoveButton?: boolean
    showMonitoringActions?: boolean
  }) => (
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
        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{issue.ticketTitle}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>{issue.requesterName}</span>
          <span>{issue.createdAt.toLocaleDateString()}</span>
        </div>

        {/* Show resolution category if available */}
        {issue.resolutionCategory && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs">
              {issue.resolutionCategory}
            </Badge>
          </div>
        )}

        {/* Show cleansing progress for cleansing issues */}
        {issue.resolutionCategory === "Manual Data Cleansing" && issue.impactedRecordTotal && (
          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-1">
              Progress: {Math.round(((issue.cleansedRecordTotal || 0) / issue.impactedRecordTotal) * 100)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${Math.round(((issue.cleansedRecordTotal || 0) / issue.impactedRecordTotal) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {showMoveButton && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-purple-700 border-purple-300 hover:bg-purple-50 bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              handleMoveToMonitoring(issue)
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Move to Monitoring
          </Button>
        )}

        {showMonitoringActions && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-green-700 border-green-300 hover:bg-green-50 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(issue, "closed")
              }}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Close
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-red-700 border-red-300 hover:bg-red-50 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(issue, "rejected")
              }}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cleansing Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-green-600" />
            Cleansing ({cleansingIssues.length})
          </h2>
        </div>
        <div className="bg-green-50 rounded-lg p-4 min-h-96 border-2 border-green-200">
          <div className="mb-4 text-sm text-green-700 font-medium">Manual data cleansing and correction activities</div>
          {cleansingIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} showMoveButton={true} />
          ))}
          {cleansingIssues.length === 0 && (
            <div className="text-center text-gray-500 py-8">No cleansing activities</div>
          )}
        </div>
      </div>

      {/* Enhancing Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Enhancing ({enhancingIssues.length})
          </h2>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 min-h-96 border-2 border-yellow-200">
          <div className="mb-4 text-sm text-yellow-700 font-medium">Software Improvements and process improvements</div>
          {enhancingIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} showMoveButton={true} />
          ))}
          {enhancingIssues.length === 0 && (
            <div className="text-center text-gray-500 py-8">No enhancement activities</div>
          )}
        </div>
      </div>

      {/* Monitoring Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-purple-600" />
            Monitoring ({monitoringIssues.length})
          </h2>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 min-h-96 border-2 border-purple-200">
          <div className="mb-4 text-sm text-purple-700 font-medium">Solutions under monitoring and validation</div>
          {monitoringIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} showMonitoringActions={true} />
          ))}
          {monitoringIssues.length === 0 && (
            <div className="text-center text-gray-500 py-8">No issues being monitored</div>
          )}
        </div>
      </div>
    </div>
  )
}
