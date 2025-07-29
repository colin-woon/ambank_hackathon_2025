"use client"

import type { Issue } from "@/types/issue"
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
  useDroppable,
  useDraggable,
} from "@dnd-kit/core"
import {
  Clock,
  FileSearch,
  Wrench,
  Eye,
  CheckCircle,
} from "lucide-react"

interface MergedDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onUpdateIssue: (issue: Issue) => void
}

function DraggableIssue({ issue, children }: { issue: Issue; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: issue.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
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
        isOver ? "bg-yellow-100 border-yellow-400" : "bg-gray-50 border-gray-200"
      }`}
    >
      {children}
    </div>
  )
}

export function MergedDashboard({ issues, onIssueClick, onUpdateIssue }: MergedDashboardProps) {
  const sensors = useSensors(useSensor(PointerSensor))

  const filteredIssues = issues.filter((i) => i.status !== "closed")
  const grouped = {
    new: filteredIssues.filter((i) => i.status === "new"),
    investigating: filteredIssues.filter((i) => i.status === "investigating"),
    resolving: filteredIssues.filter((i) => i.status === "resolving"),
    monitoring: filteredIssues.filter((i) => i.status === "monitoring"),
  }

  const statusDetails: Record<string, { label: string; icon: React.ReactNode }> = {
    new: { label: "New", icon: <Clock className="w-5 h-5 mr-2 text-blue-600" /> },
    investigating: { label: "Investigating", icon: <FileSearch className="w-5 h-5 mr-2 text-purple-600" /> },
    resolving: { label: "Resolving", icon: <Wrench className="w-5 h-5 mr-2 text-green-600" /> },
    monitoring: { label: "Monitoring", icon: <Eye className="w-5 h-5 mr-2 text-gray-600" /> },
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Super High": return "border-l-red-500 bg-red-50"
      case "High": return "border-l-orange-500 bg-orange-50"
      case "Medium": return "border-l-yellow-500 bg-yellow-50"
      default: return "border-l-gray-500 bg-gray-50"
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedIssue = issues.find((i) => i.id === active.id)
    if (!draggedIssue) return

    const newStatus = over.id as Issue["status"]
    if (draggedIssue.status !== newStatus) {
      const updated = { ...draggedIssue, status: newStatus }
      if (newStatus === "monitoring") updated.completedAt = new Date()
      if (newStatus === "resolved") updated.resolvedAt = new Date()
      onUpdateIssue(updated)
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
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">{issue.description}</p>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{issue.dsPicUid ?? issue.requesterName}</span>
            <span>{issue.createdAt?.toLocaleDateString?.() ?? issue.assignedAt?.toLocaleDateString?.() ?? "N/A"}</span>
          </div>

          {issue.impactedRecordTotal && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">
                Cleansing Progress: {Math.round(((issue.cleansedRecordTotal || 0) / issue.impactedRecordTotal) * 100)}%
              </div>
              <Progress
                value={Math.min(100, ((issue.cleansedRecordTotal || 0) / issue.impactedRecordTotal) * 100)}
                className="h-2 [&>*]:bg-green-600"
              />
            </div>
          )}

          {issue.systemEnhancement === "yes" && typeof issue.systemEnhancementScore === "number" && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">System Enhancement Score: {issue.systemEnhancementScore}%</div>
              <Progress value={Math.min(100, issue.systemEnhancementScore)} className="h-2 [&>*]:bg-blue-500" />
            </div>
          )}

          {issue.processImprovement === "yes" && typeof issue.processImprovementScore === "number" && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">Process Improvement Score: {issue.processImprovementScore}%</div>
              <Progress value={Math.min(100, issue.processImprovementScore)} className="h-2 [&>*]:bg-yellow-500" />
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" className="flex-1 text-green-700 border-green-300 hover:bg-green-50 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateIssue({ ...issue, status: "closed", completedAt: new Date() })
              }}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Close
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-blue-700 border-blue-300 hover:bg-blue-50 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateIssue({ ...issue, status: "resolved", resolvedAt: new Date() })
              }}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Resolve
            </Button>
          </div>
        </CardContent>
      </Card>
    </DraggableIssue>
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {["new", "investigating", "resolving", "monitoring"].map((status) => (
          <div key={status}>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
              {statusDetails[status].icon}
              {statusDetails[status].label} ({grouped[status].length})
            </h2>
            <DroppableColumn id={status}>
              {grouped[status].map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </DroppableColumn>
          </div>
        ))}
      </div>
    </DndContext>
  )
}
