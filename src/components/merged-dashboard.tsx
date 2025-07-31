"use client"

import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Issue } from "@/types/issue"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  rectIntersection
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Clock, FileSearch, Wrench, Eye, CheckCircle } from "lucide-react"
import {getClampedCleansingPercent} from "../lib/utils"

interface MergedDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onUpdateIssue: (issue: Issue) => void
}

function DraggableIssue({ issue, children }: { issue: Issue; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: issue.id })

  return (
    <div ref={setNodeRef} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-grab z-10"
      >
        :::
      </div>
      {children}
    </div>
  )
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case "new": return "bg-blue-50 border-blue-200"
      case "investigating": return "bg-green-50 border-green-200"
      case "resolving": return "bg-orange-50 border-orange-200"
      case "monitoring": return "bg-purple-50 border-purple-200"
      default: return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-96 p-4 rounded-lg border-2 transition-colors space-y-2 ${
        isOver ? "bg-yellow-100 border-yellow-400" : getColumnColor(id)
      }`}
    >
      {children}
    </div>
  )
}

export function MergedDashboard({ issues, onIssueClick, onUpdateIssue }: MergedDashboardProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)

  const filteredIssues = issues.filter((i) => i.status !== "closed")
  const grouped = {
    new: filteredIssues.filter((i) => i.status === "new"),
    investigating: filteredIssues.filter((i) => i.status === "investigating"),
    resolving: filteredIssues.filter((i) => i.status === "resolving"),
    monitoring: filteredIssues.filter((i) => i.status === "monitoring"),
  }

  Object.keys(grouped).forEach((key) => {
    grouped[key as keyof typeof grouped].sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return aTime - bTime // oldest on top, newest on bottom
    })
  })

  const statusDetails: Record<string, { label: string; icon: React.ReactNode }> = {
    new: { label: "New", icon: <Clock className="w-5 h-5 mr-2 text-blue-600" /> },
    investigating: { label: "Investigating", icon: <FileSearch className="w-5 h-5 mr-2 text-green-600" /> },
    resolving: { label: "Resolving", icon: <Wrench className="w-5 h-5 mr-2 text-orange-600" /> },
    monitoring: { label: "Monitoring", icon: <Eye className="w-5 h-5 mr-2 text-purple-600" /> },
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Super High": return "border-l-red-500 bg-red-200"
      case "High": return "border-l-orange-500 bg-orange-200"
      case "Medium": return "border-l-yellow-500 bg-yellow-200"
      default: return "border-l-gray-500 bg-gray-200"
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveIssue(null)
    if (!over || active.id === over.id) return

    const draggedIssue = issues.find((i) => i.id === active.id)
    if (!draggedIssue) return

    const newStatus = over.id as Issue["status"]
    if (draggedIssue.status === newStatus) return

    const updated: Issue = {
      ...draggedIssue,
      status: newStatus,
      updatedAt: new Date(),
      ...(newStatus === "investigating" ? { pickedUpAt: new Date() } : {}),
      ...(newStatus === "resolving" ? { assignedAt: new Date() } : {}),
      ...(newStatus === "monitoring" ? { resolvedAt: new Date() } : {}),
      ...(newStatus === "closed" ? { closedAt: new Date() } : {}),
    }

    // Local state update
    onUpdateIssue(updated)

    // Firestore update
    try {
      const ref = doc(db, "issues", draggedIssue.id)
      await updateDoc(ref, {
        status: newStatus,
        updatedAt: updated.updatedAt,
        ...(updated.pickedUpAt && { pickedUpAt: updated.pickedUpAt }),
        ...(updated.assignedAt && { assignedAt: updated.assignedAt }),
        ...(updated.resolvedAt && { resolvedAt: updated.resolvedAt }),
        ...(updated.closedAt && { closedAt: updated.closedAt }),
      })
    } catch (err) {
      console.error("Failed to update status:", err)
    }
  }

  const IssueCard = ({ issue }: { issue: Issue }) => (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow border-l-4`}
      onClick={() => onIssueClick(issue)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-red-700">{issue.id}</CardTitle>
          <Badge variant="outline" className={`text-xs ${getPriorityColor(issue.priority)}`} >{issue.priority}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{issue.description}</p>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>{issue.dsPicUid ?? issue.dqPicUid}</span>
          <span>{issue.updatedAt?.toLocaleDateString("en-GB") ?? "N/A"}</span>
        </div>

        {(issue.status === "resolving" || issue.status === "monitoring") && issue.impactedRecordTotal && (
          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-1">
              Cleansing Progress: {getClampedCleansingPercent(issue)}%
            </div>
            <Progress
              value={Math.min(100, ((issue.cleansedRecordTotal || 0) / issue.impactedRecordTotal) * 100)}
              className="h-2 [&>*]:bg-green-600"
            />
          </div>
        )}

        {issue.systemEnhancement === "yes" && typeof issue.systemEnhancementScore === "number" && (issue.status === "resolving" || issue.status == "monitoring") && (
          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-1">System Enhancement Score: {issue.systemEnhancementScore}%</div>
            <Progress value={Math.min(100, issue.systemEnhancementScore)} className="h-2 [&>*]:bg-blue-500" />
          </div>
        )}

        {issue.processImprovement === "yes" && typeof issue.processImprovementScore === "number" && (issue.status === "resolving" || issue.status == "monitoring") && (
          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-1">Process Improvement Score: {issue.processImprovementScore}%</div>
            <Progress value={Math.min(100, issue.processImprovementScore)} className="h-2 [&>*]:bg-yellow-500" />
          </div>
        )}
        {issue.status == "monitoring" && (
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" className="flex-1 text-green-700 border-green-300 hover:bg-green-50 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateIssue({ ...issue, status: "closed", resolvedAt: new Date() })
              }}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection}
      onDragStart={({ active }) => {
        const dragged = issues.find(i => i.id === active.id)
        if (dragged) setActiveIssue(dragged)
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(grouped).map((status) => (
          <div key={status}>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
              {statusDetails[status].icon}
              {statusDetails[status].label} ({grouped[status].length})
            </h2>
            <DroppableColumn id={status}>
              {grouped[status].map((issue) => (
                <DraggableIssue key={issue.id} issue={issue}>
                  <IssueCard issue={issue} />
                </DraggableIssue>
              ))}
            </DroppableColumn>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeIssue && <IssueCard issue={activeIssue} />}
      </DragOverlay>
    </DndContext>
  )
}
