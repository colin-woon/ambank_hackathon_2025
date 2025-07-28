"use client"

import { useState, useMemo } from "react"
import type { Issue } from "@/types/issue"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowUpDown } from "lucide-react"

interface IssueTableProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

type SortKey = keyof Issue

export function IssueTable({ issues, onIssueClick }: IssueTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>({
  key: "createdAt",
  direction: "desc",
})

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const matchesSearch =
          issue.ticketTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || issue.status === statusFilter
        const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter

        return matchesSearch && matchesStatus && matchesPriority
      }),
    [issues, searchTerm, statusFilter, priorityFilter]
  )

  const sortedIssues = useMemo(() => {
    let sortableIssues = [...filteredIssues]
    if (sortConfig !== null) {
      sortableIssues.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }
    return sortableIssues
  }, [filteredIssues, sortConfig])

  const handleSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "monitoring":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "closed":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const SortableHeader = ({ sortKey, children }: { sortKey: SortKey; children: React.ReactNode }) => (
    <TableHead
      className="font-semibold cursor-pointer hover:bg-red-100"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown
          className={`h-4 w-4 shrink-0 transition-all ${
            sortConfig?.key === sortKey ? "opacity-100" : "opacity-0"
          } ${sortConfig?.direction === "desc" ? "rotate-180" : ""}`}
        />
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-red-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="monitoring">Monitoring</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-red-50">
              <SortableHeader sortKey="id">Ticket ID</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <SortableHeader sortKey="priority">Priority</SortableHeader>
              <SortableHeader sortKey="ticketTitle">Title</SortableHeader>
              <SortableHeader sortKey="impactedArea">Area</SortableHeader>
              <SortableHeader sortKey="createdAt">Created Date</SortableHeader>
              <SortableHeader sortKey="deadline">Deadline</SortableHeader>
              <SortableHeader sortKey="requesterName">Aging Months</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedIssues.map((issue) => (
              <TableRow
                key={issue.id}
                className="cursor-pointer hover:bg-red-50 transition-colors"
                onClick={() => onIssueClick(issue)}
              >
                <TableCell className="font-medium text-red-600">{issue.id}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{issue.ticketTitle}</TableCell>
                <TableCell>{issue.impactedArea}</TableCell>
                <TableCell>{issue.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>{issue.deadline.toLocaleDateString()}</TableCell>
                <TableCell>{issue.requesterName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedIssues.length === 0 && (
        <div className="text-center py-8 text-gray-500">No issues found matching your criteria.</div>
      )}
    </div>
  )
}
