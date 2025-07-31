"use client"

import { createIssueInFirestore } from "@/lib/firestore"
import type React from "react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { useState } from "react"
import type { Issue } from "@/types/issue"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UploadButton } from "../lib/uploadthing"
import { AlertTriangle, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res)
          alert("Upload Completed")
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`)
        }}
      />
    </main>
  )
}

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.requesterName.trim()) newErrors.requesterName = "Requester Name is required"
    if (!formData.requesterContact.match(/^\+?6?01[0-46-9]-?[0-9]{7,8}$/))
      newErrors.requesterContact = "Invalid Malaysian contact number"
    if (!formData.requesterDepartment.trim()) newErrors.requesterDepartment = "Department is required"
    if (!formData.requesterUnit.trim()) newErrors.requesterUnit = "Unit is required"
    if (!formData.sourceSystem.trim()) newErrors.sourceSystem = "Source system is required"
    if (!formData.impactedArea.trim()) newErrors.impactedArea = "Impacted area is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const now = new Date()
    const newIssue: Omit<Issue, "id"> = {
      ...formData,
      priority: "N/A",
      status: "new",
      createdByUid: "current-user",
      createdAt: now,
      updatedAt: now,
      deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      mediaUrls,
      pickedUpAt: undefined,
      assignedAt: undefined,
      resolvedAt: undefined,
      closedAt: undefined,
      agingDays: undefined,
      agingMonths: undefined,
      agingBucket: undefined,
    }

    try {
      const createdIssue = await createIssueInFirestore(newIssue)
      onSubmit(createdIssue)
    } catch (err) {
      console.error("Failed to create issue in Firestore:", err)
      alert("Failed to save issue. Please try again.")
      return
    }

    setFormData({
      description: "",
      requesterName: "",
      requesterContact: "",
      requesterDepartment: "",
      requesterUnit: "",
      sourceSystem: "",
      impactedArea: "",
    })
    setErrors({})
    setMediaUrls([])
    onClose()
  }

  const confirmCancel = () => {
    if (mediaUrls.length > 0 || uploading) {
      const confirm = window.confirm("You have uploaded media. Are you sure you want to cancel?")
      if (!confirm) return
    }
    onClose()
  }

  const handleRemoveMedia = (idx: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <Dialog open={isOpen} onOpenChange={confirmCancel}>
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
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>
            <div>
              <Label htmlFor="requesterName">Requester Name *</Label>
              <Input
                id="requesterName"
                value={formData.requesterName}
                onChange={(e) => handleInputChange("requesterName", e.target.value)}
                required
              />
              {errors.requesterName && <p className="text-sm text-red-600">{errors.requesterName}</p>}
            </div>

            <div>
              <Label htmlFor="requesterContact">Contact Number *</Label>
              <Input
                id="requesterContact"
                value={formData.requesterContact}
                onChange={(e) => handleInputChange("requesterContact", e.target.value)}
                required
              />
              {errors.requesterContact && <p className="text-sm text-red-600">{errors.requesterContact}</p>}
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.requesterDepartment}
                onChange={(e) => handleInputChange("requesterDepartment", e.target.value)}
                required
              />
              {errors.requesterDepartment && <p className="text-sm text-red-600">{errors.requesterDepartment}</p>}
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                value={formData.requesterUnit}
                onChange={(e) => handleInputChange("requesterUnit", e.target.value)}
                required
              />
              {errors.requesterUnit && <p className="text-sm text-red-600">{errors.requesterUnit}</p>}
            </div>

            <div>
              <Label htmlFor="sourceSystem">Source System *</Label>
              <Input
                id="sourceSystem"
                value={formData.sourceSystem}
                onChange={(e) => handleInputChange("sourceSystem", e.target.value)}
                required
              />
              {errors.sourceSystem && <p className="text-sm text-red-600">{errors.sourceSystem}</p>}
            </div>

            <div>
              <Label htmlFor="impactedArea">Impacted Area *</Label>
              <Input
                id="impactedArea"
                value={formData.impactedArea}
                onChange={(e) => handleInputChange("impactedArea", e.target.value)}
                required
              />
              {errors.impactedArea && <p className="text-sm text-red-600">{errors.impactedArea}</p>}
            </div>
          </div>

          <div>
            <Label className="font-semibold">Upload Media</Label>
            <UploadButton<OurFileRouter>
              endpoint="imageUploader"
              onUploadBegin={() => setUploading(true)}
              onClientUploadComplete={(res) => {
                const urls = res.map(f => f.url)
                setMediaUrls(prev => [...prev, ...urls])
                setUploading(false)
              }}
              onUploadError={(err) => {
                console.error("Upload error", err)
                setUploading(false)
              }}
              appearance={{
                container: "mt-2 !w-full !flex !flex-start",
                button: "!px-4 !py-2 !border !border-red-600 !text-red-600 !bg-white !hover:bg-red-50 !rounded !text-sm !shadow-none !font-medium",
              }}
            />

            {mediaUrls.length > 0 && (
              <div className="mt-2 space-y-1 text-sm">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {url.split("/").pop()}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={confirmCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={uploading}>
              {uploading ? "Uploading..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
