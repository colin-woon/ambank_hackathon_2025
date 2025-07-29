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

type Top5Category = "issueField" | "sourceSystem" | "dqPicUid" | "dqIssueCategory"

const categoryLabels: Record<Top5Category, string> = {
  issueField: "Data Fields with Issues",
  sourceSystem: "Source Systems",
  dqPicUid: "Data Owners (DQ)",
  dqIssueCategory: "Issue Types",
}

const Top5Table = ({ issues, onIssueClick }: { issues: Issue[], onIssueClick: (issue: Issue) => void }) => {
  const [category, setCategory] = useState<Top5Category>("issueField")

  const top5Issues = useMemo(() => {
    if (!issues || issues.length === 0) return []

    // 1. Find the most frequent value for the selected category
    const counts = issues.reduce((acc, issue) => {
      const key = issue[category]
      if (key) {
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topCategoryValue = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0]

    if (!topCategoryValue) return []

    // 2. Filter issues that match the top category value
    return issues
      .filter(issue => issue[category] === topCategoryValue)
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime()) // Sort by deadline
      .slice(0, 5) // Get top 5
  }, [issues, category])

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">Top 5 Tickets by {categoryLabels[category]}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Ticket ID</TableHead>
              <TableHead className="text-right">Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {top5Issues.map((item, index) => (
              <TableRow key={item.id} onClick={() => onIssueClick(item)} className="cursor-pointer">
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell className="text-right">{item.deadline.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="p-2">
        <Select value={category} onValueChange={(value) => setCategory(value as Top5Category)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="issueField">By Data Field</SelectItem>
            <SelectItem value="sourceSystem">By Source System</SelectItem>
            <SelectItem value="dqPicUid">By Data Owner</SelectItem>
            <SelectItem value="dqIssueCategory">By Issue Type</SelectItem>
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