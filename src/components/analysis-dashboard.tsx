"use client"

import type { Issue } from "@/types/issue"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSearch, Clock } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core"
import { useState } from "react"

interface AnalysisDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onUpdateIssue: (issue: Issue) => void
}

function DraggableIssue({ issue, children }: { issue: Issue; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: issue.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-96 p-4 rounded-lg border-2 transition-colors space-y-2 ${
        isOver ? "bg-blue-100 border-blue-400" : "bg-gray-50 border-gray-200"
      }`}
    >
      {children}
    </div>
  )
}

export function AnalysisDashboard({ issues, onIssueClick, onUpdateIssue }: AnalysisDashboardProps) {
  const sensors = useSensors(useSensor(PointerSensor))

  const newIssues = issues.filter((issue) => issue.status === "new")
  const investigationIssues = issues.filter((issue) => issue.status === "investigating")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Super High":
        return "border-l-red-500 bg-red-50"
      case "High":
        return "border-l-orange-500 bg-orange-50"
      case "Medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "Low":
        return "border-l-gray-500 bg-gray-50"
      case "N/A":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedIssue = issues.find((i) => i.id === active.id)
    if (!draggedIssue) return

    const newStatus = over.id as Issue["status"]
    if (draggedIssue.status !== newStatus) {
      onUpdateIssue({ ...draggedIssue, status: newStatus })
    }
  }

  const IssueCard = ({ issue }: { issue: Issue }) => (
    <DraggableIssue issue={issue}>
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(issue.priority)}`}
        onClick={() => onIssueClick(issue)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-medium text-red-700">{issue.id}</CardTitle>
            <Badge variant="outline" className="text-xs">{issue.priority}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 mb-2 line-clamp-1">{issue.description}</p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{issue.requesterName}</span>
            <span>{issue.createdAt.toLocaleDateString("en-GB")}</span>
          </div>
        </CardContent>
      </Card>
    </DraggableIssue>
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Column */}
        <div>
          <h2 className="text-lg font-semibold text-blue-700 flex items-center mb-2">
            <Clock className="w-5 h-5 mr-2" />
            New Issues ({newIssues.length})
          </h2>
          <DroppableColumn id="new">
            {newIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </DroppableColumn>
        </div>

        {/* Investigating Column */}
        <div>
          <h2 className="text-lg font-semibold text-purple-700 flex items-center mb-2">
            <FileSearch className="w-5 h-5 mr-2" />
            Investigation ({investigationIssues.length})
          </h2>
          <DroppableColumn id="investigating">
            {investigationIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </DroppableColumn>
        </div>
      </div>
    </DndContext>
  )
}
