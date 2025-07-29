"use client"

import { useMemo, useState } from "react"
import type { Issue } from "@/types/issue"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type Top5SortKey = "deadline" | "priority" | "createdAt" | "agingDays"

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

interface Top5TableProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  sortKey: Top5SortKey
}

export const Top5Table = ({ issues, onIssueClick, sortKey: initialSortKey }: Top5TableProps) => {
  const [sortKey, setSortKey] = useState<Top5SortKey>(initialSortKey)

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
