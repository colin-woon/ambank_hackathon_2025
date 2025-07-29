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

const followUpData = [
  { id: "SR20250729001", assignee: "John Doe" },
  { id: "SR20250729002", assignee: "Jane Smith" },
  { id: "SR20250729003", assignee: "Peter Jones" },
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

export function HomeDashboard({ issues }: HomeDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2 grid grid-row-2 gap-10 space-y-10">
        <ChartPieInteractive
          id="issue-categories"
          data={pieChartData}
          chartConfig={chartConfig}
          title="Issue Distribution"
          description="Breakdown of issues by category"
          dataKey="total"
          nameKey="category"
          unitLabel="Issues"
        />
        <Card>
          <CardHeader>
            <CardTitle>Urgent Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around items-center pt-4">
            {followUpData.map((item) => (
              <div key={item.id} className="text-center">
                <UserCircle className="w-16 h-16 mx-auto text-gray-400" />
                <p className="font-semibold mt-2">{item.assignee}</p>
                <p className="text-sm text-red-600 font-mono">{item.id}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Top5Table title="Top 5 Data Fields with Issues" />
        <Top5Table title="Top 5 Source Systems" />
        <Top5Table title="Top 5 Data Owners" />
        <Top5Table title="Top 5 Issue Types" />
      </div>
    </div>
  )
}