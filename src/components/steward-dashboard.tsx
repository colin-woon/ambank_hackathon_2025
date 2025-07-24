"use client"

import type { Issue } from "@/types/issue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface StewardDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onUpdateIssue: (issue: Issue) => void
}

export function StewardDashboard({ issues, onIssueClick, onUpdateIssue }: StewardDashboardProps) {
  const newIssues = issues.filter((issue) => issue.status === "new")
  const inProgressIssues = issues.filter((issue) => issue.status === "in_progress" || issue.status === "rejected")
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

  const IssueCard = ({ issue }: { issue: Issue }) => (
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
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{issue.requesterName}</span>
          <span>{issue.createdAt.toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Issues Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Issues ({newIssues.length})
          </h2>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 min-h-96">
          {newIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          {newIssues.length === 0 && <div className="text-center text-gray-500 py-8">No new issues</div>}
        </div>
      </div>

      {/* In Progress Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
            In Progress ({inProgressIssues.length})
          </h2>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 min-h-96">
          {inProgressIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          {inProgressIssues.length === 0 && <div className="text-center text-gray-500 py-8">No issues in progress</div>}
        </div>
      </div>

      {/* Monitoring Column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
            Monitoring ({monitoringIssues.length})
          </h2>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 min-h-96">
          {monitoringIssues.map((issue) => (
            <div key={issue.id} className="mb-3">
              <IssueCard issue={issue} />
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
            </div>
          ))}
          {monitoringIssues.length === 0 && (
            <div className="text-center text-gray-500 py-8">No issues being monitored</div>
          )}
        </div>
      </div>
    </div>
  )
}
