"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCircle } from "lucide-react"
import type { Issue } from "@/types/issue"
import { ChartPieInteractive } from "@/components/ui/chart-pie-interactive"
import { ChartConfig } from "@/components/ui/chart"

interface HomeDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

// Mock Data
const pieChartData = [
  { category: "Data Entry Error", total: 400, fill: "var(--chart-1)" },
  { category: "System Error", total: 300, fill: "var(--chart-2)" },
  { category: "Validation Rule", total: 278, fill: "var(--chart-3)" },
  { category: "Duplicate Record", total: 189, fill: "var(--chart-4)" },
  { category: "Others", total: 50, fill: "var(--chart-5)" },
]

const chartConfig = {
  total: {
    label: "Total",
  },
  "Data Entry Error": {
    label: "Data Entry Error",
    color: "hsl(var(--chart-1))",
  },
  "System Error": {
    label: "System Error",
    color: "hsl(var(--chart-2))",
  },
  "Validation Rule": {
    label: "Validation Rule",
    color: "hsl(var(--chart-3))",
  },
  "Duplicate Record": {
    label: "Duplicate Record",
    color: "hsl(var(--chart-4))",
  },
  "Others": {
    label: "Others",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const top5MockData = [
  { rank: 1, name: "Customer Address", count: 120 },
  { rank: 2, name: "Account Balance", count: 98 },
  { rank: 3, name: "Transaction Date", count: 75 },
  { rank: 4, name: "Contact Number", count: 62 },
  { rank: 5, name: "CIF Number", count: 55 },
]

const Top5Table = ({ title }: { title: string }) => (
  <Card>
    <CardHeader className="p-4">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {top5MockData.map((item) => (
            <TableRow key={item.rank}>
              <TableCell>{item.rank}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-right">{item.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
    <CardFooter className="p-2">
       <Select defaultValue="category">
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category">By Category</SelectItem>
            <SelectItem value="source">By Source System</SelectItem>
            <SelectItem value="owner">By Data Owner</SelectItem>
          </SelectContent>
        </Select>
    </CardFooter>
  </Card>
)

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
          title="Issue Status Distribution"
          description="Breakdown of issues by current status"
          dataKey="total"
          nameKey="status"
          unitLabel="Issues"
        />
      </div>
      {/* Right Column */}
      <div className="lg:col-span-2 space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Urgent Follow-ups</CardTitle>
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
            <Top5Table title="Top 5 Data Fields with Issues" />
            <Top5Table title="Top 5 Source Systems" />
            <Top5Table title="Top 5 Data Owners" />
            <Top5Table title="Top 5 Issue Types" />
        </div>
      </div>
    </div>
  )
}