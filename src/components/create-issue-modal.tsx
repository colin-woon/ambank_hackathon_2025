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
    description: "",
    requesterName: "",
    requesterContact: "",
    requesterDepartment: "",
    requesterUnit: "",
    sourceSystem: "",
    impactedArea: "",
  })

  const [mediaFiles, setMediaFiles] = useState<File[]>([])
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
      priority: "N/A",
      status: "new",
      createdByUid: "current-user",
      dqPicUid: "",
      assignedAt: now,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      mediaFiles,
      mediaUrls: uploadedUrls,
    }

    onSubmit(newIssue)

    // Reset form
    setFormData({
      description: "",
      requesterName: "",
      requesterContact: "",
      requesterDepartment: "",
      requesterUnit: "",
      sourceSystem: "",
      impactedArea: "",
    })
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                required
              />
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
            <div>
              <Label className="font-semibold">Media Attachment</Label>
              <Input
                type="file"
                multiple
                className="mt-1"
                onChange={(e) => {
                  if (e.target.files) {
                    const filesArray = Array.from(e.target.files)
                    setMediaFiles(filesArray)
                    console.log("Selected files:", filesArray)
                  }
                }}
              />
               {mediaFiles.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {mediaFiles.map((file, idx) => (
                      <div key={idx} className="truncate">{file.name}</div>
                    ))}
                  </div>
                )}
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
