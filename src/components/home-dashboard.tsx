"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserCircle } from "lucide-react"
import type { Issue } from "@/types/issue"
import { ChartPieInteractive } from "@/components/ui/chart-pie-interactive"
import { ChartConfig } from "@/components/ui/chart"
import { Top5Table } from "@/components/top5-table"
import { AgingPriorityBubble } from "./charts/aging-priority-bubble"
import { RcaSystemBar } from "./charts/rca-system-bar"
import { ImpactEffortBubble } from "./charts/impact-effort-bubble"
import { RecurringResolutionChart } from "./charts/recurring-resolution-chart"
import { PriorityHeatmap } from "./charts/priority-heatmap"

interface HomeDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function HomeDashboard({ issues, onIssueClick }: HomeDashboardProps) {
  const statusCounts = issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1
    return acc
  }, {} as Record<Issue["status"], number>)

  const statusChartConfig: ChartConfig = {
    total: {
      label: "Total",
      color: "#000000",
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
  }

  const statusChartData = Object.entries(statusCounts).map(([status, total]) => ({
    status,
    total,
    fill: statusChartConfig[status as keyof typeof statusChartConfig]?.color || `var(--chart-1)`,
  }))

  const now = new Date();
  const urgentFollowUps = issues
    .filter(issue => issue.status !== 'closed' && issue.deadline && issue.deadline > now && issue.dsPicUid)
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1 */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of tickets by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPieInteractive
              id="issue-status"
              data={statusChartData}
              chartConfig={statusChartConfig}
              title=""
              description=""
              dataKey="total"
              nameKey="status"
              unitLabel="Tickets"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aging Days vs. Priority</CardTitle>
            <CardDescription>
              High-priority issues that have aged significantly need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgingPriorityBubble issues={issues} />
          </CardContent>
        </Card>
        
        {/* Row 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Root Cause Analysis by System</CardTitle>
            <CardDescription>
              Systems with recurring types of issues may need process improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RcaSystemBar issues={issues} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Impact vs. Effort Matrix</CardTitle>
            <CardDescription>
              Identifies quick wins (high impact, low effort) and major projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImpactEffortBubble issues={issues} />
          </CardContent>
        </Card>
        
        {/* Row 3 */}
        <Card>
          <CardHeader>
            <CardTitle>Recurring Issues Resolution</CardTitle>
            <CardDescription>
              How effectively we're addressing recurring vs. one-time issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecurringResolutionChart issues={issues} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI vs. Human Priority Comparison</CardTitle>
            <CardDescription>
              Highlights discrepancies between AI-suggested and human-assigned priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PriorityHeatmap issues={issues} />
          </CardContent>
        </Card>
      </div>

      {/* Near Deadline Follow-ups */}
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
              <p className="text-xs text-gray-500">Due: {item.deadline.toLocaleDateString("en-GB")}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top 5 Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="deadline" />
        <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="priority" />
        <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="createdAt" />
        <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="agingDays" />
      </div>
    </div>
  )
}