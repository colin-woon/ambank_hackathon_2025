"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle } from "lucide-react"
import type { Issue } from "@/types/issue"
import { ChartPieInteractive } from "@/components/ui/chart-pie-interactive"
import { ChartConfig } from "@/components/ui/chart"
import { Top5Table } from "@/components/top5-table"

interface HomeDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function HomeDashboard({ issues, onIssueClick }: HomeDashboardProps) {
  const statusCounts = issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1
    return acc
  }, {} as Record<Issue["status"], number>)

  const statusChartData = Object.entries(statusCounts).map(([status, total], index) => ({
    status,
    total,
    fill: `var(--chart-${index + 1})`,
  }))

  const statusChartConfig = {
    total: {
      label: "Total",
    },
    new: {
      label: "New",
      color: "#3b82f6",
    },
    investigating: {
      label: "Investigating",
      color: "#3a7d1e",
    },
    resolving: {
      label: "Resolving",
      color: "#ed8f02",
    },
    monitoring: {
      label: "Monitoring",
      color: "#8728b0",
    },
    closed: {
      label: "Closed",
      color: "#b8b8b8",
    },
  } satisfies ChartConfig

  const now = new Date();
  const urgentFollowUps = issues
    .filter(issue => issue.status !== 'closed' && issue.deadline && issue.deadline > now && issue.dsPicUid)
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2">
        <ChartPieInteractive
          id="issue-status"
          data={statusChartData}
          chartConfig={statusChartConfig}
          title="Ticket Status Distribution"
          description="Breakdown of tickets by current status"
          dataKey="total"
          nameKey="status"
          unitLabel="Tickets"
        />
      </div>
      {/* Right Column */}
      <div className="lg:col-span-2 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="lg:text-4xl">Near Deadline Follow-ups</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around items-center pt-4">
                {urgentFollowUps.map((item) => (
                <div 
                  key={item.id} 
                  className="text-center cursor-pointer hover:bg-red-50 rounded-lg p-2 transition-colors"
                  onClick={() => onIssueClick(item)}
                >
                    <UserCircle className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="font-semibold mt-2">{item.dsPicUid || 'N/A'}</p>
                    <p className="text-sm text-red-600 font-mono">{item.id}</p>
                    <p className="text-xs text-gray-500">Due: {item.deadline.toLocaleDateString()}</p>
                </div>
                ))}
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="deadline" />
          <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="priority" />
          <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="createdAt" />
          <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="agingDays" />
        </div>
      </div>
    </div>
  )
}