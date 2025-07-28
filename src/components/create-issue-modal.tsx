"use client"

import type React from "react"

import { useState } from "react"
import type { Issue } from "@/types/issue"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateIssueModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (issue: Omit<Issue, "id" | "createdAt">) => void
}

export function CreateIssueModal({ isOpen, onClose, onSubmit }: CreateIssueModalProps) {
  const [formData, setFormData] = useState({
    ticketTitle: "",
    description: "",
    priority: "Medium" as Issue["priority"],
    requesterName: "",
    requesterContact: "",
    requesterDepartment: "",
    requesterUnit: "",
    sourceSystem: "",
    impactedArea: "",
  })

  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateIssueId, setDuplicateIssueId] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const checkForDuplicates = () => {
    // Mock duplicate detection - in real implementation, this would call AI API
    if (
      formData.description.toLowerCase().includes("customer") ||
      formData.description.toLowerCase().includes("data format")
    ) {
      setShowDuplicateWarning(true)
      setDuplicateIssueId("SR3349140")
    } else {
      setShowDuplicateWarning(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date()

    const newIssue: Omit<Issue, "id" | "createdAt"> = {
      ...formData,
      status: "new",
      createdByUid: "current-user",
      dqPicUid: "",
      itPicUid: "",
      assignedAt: now,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      mediaAttachments: [],
    }

    onSubmit(newIssue)

    // Reset form
    setFormData({
      ticketTitle: "",
      description: "",
      priority: "Medium",
      requesterName: "",
      requesterContact: "",
      requesterDepartment: "",
      requesterUnit: "",
      sourceSystem: "",
      impactedArea: "",
    })
    setShowDuplicateWarning(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-red-700">Report an Issue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                value={formData.ticketTitle}
                onChange={(e) => handleInputChange("ticketTitle", e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 bg-transparent"
                onClick={checkForDuplicates}
              >
                <Search className="w-4 h-4 mr-2" />
                Check for Duplicates
              </Button>
            </div>

            {showDuplicateWarning && (
              <div className="md:col-span-2">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    {"Heads up! A similar issue ["}
                    <span className="font-semibold">{duplicateIssueId}</span>
                    {"] already exists. Do you still want to proceed?"}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Issue["priority"]) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="requesterName">Requester Name *</Label>
              <Input
                id="requesterName"
                value={formData.requesterName}
                onChange={(e) => handleInputChange("requesterName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="requesterContact">Contact Number *</Label>
              <Input
                id="requesterContact"
                value={formData.requesterContact}
                onChange={(e) => handleInputChange("requesterContact", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.requesterDepartment}
                onChange={(e) => handleInputChange("requesterDepartment", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                value={formData.requesterUnit}
                onChange={(e) => handleInputChange("requesterUnit", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="sourceSystem">Source System *</Label>
              <Input
                id="sourceSystem"
                value={formData.sourceSystem}
                onChange={(e) => handleInputChange("sourceSystem", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="impactedArea">Impacted Area *</Label>
              <Input
                id="impactedArea"
                value={formData.impactedArea}
                onChange={(e) => handleInputChange("impactedArea", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Create Issue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
