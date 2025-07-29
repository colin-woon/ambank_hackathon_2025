"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCircle } from "lucide-react"
import type { Issue } from "@/types/issue"
import { ChartPieInteractive } from "@/components/ui/chart-pie-interactive"
import { ChartConfig } from "@/components/ui/chart"
import { useState, useMemo } from "react"

interface HomeDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

type Top5SortKey = "deadline" | "priority" | "createdAt" | "agingDays"

const sortKeyLabels: Record<Top5SortKey, string> = {
  deadline: "Upcoming Deadlines",
  priority: "Highest Priority",
  createdAt: "Newest Tickets",
  agingDays: "Oldest Tickets",
}

const priorityOrder: Record<string, number> = {
  "Super High": 5,
  High: 4,
  Medium: 3,
  Low: 2,
  "N/A": 1,
}

const Top5Table = ({ issues, onIssueClick }: { issues: Issue[], onIssueClick: (issue: Issue) => void }) => {
  const [sortKey, setSortKey] = useState<Top5SortKey>("deadline")

  const top5Issues = useMemo(() => {
    if (!issues || issues.length === 0) return []

    const sortableIssues = issues.filter(issue => issue.status !== 'closed');

    sortableIssues.sort((a, b) => {
      switch (sortKey) {
        case "deadline":
          return a.deadline.getTime() - b.deadline.getTime() // Ascending for nearest deadline
        case "priority":
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0) // Descending for highest priority
        case "createdAt":
            return b.createdAt.getTime() - a.createdAt.getTime() // Descending for newest
        case "agingDays":
            return (b.agingDays || 0) - (a.agingDays || 0) // Descending for oldest
        default:
          return 0
      }
    })

    return sortableIssues.slice(0, 5)
  }, [issues, sortKey])

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">{sortKeyLabels[sortKey]}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead className="text-right">Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {top5Issues.map((item) => (
              <TableRow key={item.id} onClick={() => onIssueClick(item)} className="cursor-pointer hover:bg-red-50">
                <TableCell className="font-medium text-red-600">{item.id}</TableCell>
                <TableCell className="text-right">{item.deadline.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="p-2">
        <Select value={sortKey} onValueChange={(value) => setSortKey(value as Top5SortKey)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">By Deadline</SelectItem>
            <SelectItem value="priority">By Priority</SelectItem>
            <SelectItem value="createdAt">By Newest</SelectItem>
            <SelectItem value="agingDays">By Oldest</SelectItem>
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  )
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
      color: "hsl(var(--chart-1))",
    },
    investigating: {
      label: "Investigating",
      color: "hsl(var(--chart-2))",
    },
    resolving: {
      label: "Resolving",
      color: "hsl(var(--chart-3))",
    },
    monitoring: {
      label: "Monitoring",
      color: "hsl(var(--chart-4))",
    },
    closed: {
      label: "Closed",
      color: "hsl(var(--chart-5))",
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
                <CardTitle>Near Deadline Follow-ups</CardTitle>
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
          <Top5Table issues={issues} onIssueClick={onIssueClick} />
          <Top5Table issues={issues} onIssueClick={onIssueClick} />
          <Top5Table issues={issues} onIssueClick={onIssueClick} />
          <Top5Table issues={issues} onIssueClick={onIssueClick} />
        </div>
      </div>
    </div>
  )
}