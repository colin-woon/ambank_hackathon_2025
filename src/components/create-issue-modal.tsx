"use client"

import type React from "react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
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
import { UploadButton } from "../lib/uploadthing";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
      />
    </main>
  );
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

  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateIssueId, setDuplicateIssueId] = useState("")
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const checkForDuplicates = () => {
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

  const newIssue: Omit<Issue, "id"> = {
  // core fields
  description: formData.description,
  requesterName: formData.requesterName,
  requesterContact: formData.requesterContact,
  requesterDepartment: formData.requesterDepartment,
  requesterUnit: formData.requesterUnit,
  sourceSystem: formData.sourceSystem,
  impactedArea: formData.impactedArea,
  priority: "N/A",
  status: "new",
  createdByUid: "current-user",
  createdAt: new Date(),
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now,
  mediaUrls,

  // optional timestamp fields
  pickedUpAt: undefined,
  assignedAt: undefined,
  resolvedAt: undefined,
  completedAt: undefined,

  // aging fields
  agingDays: undefined,
  agingMonths: undefined,
  agingBucket: undefined,
}

    onSubmit(newIssue)

    setFormData({
      description: "",
      requesterName: "",
      requesterContact: "",
      requesterDepartment: "",
      requesterUnit: "",
      sourceSystem: "",
      impactedArea: "",
    })
    setMediaUrls([])
    setShowDuplicateWarning(false)
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
                container: "mt-2 !w-full !flex !flex-start", // force full width + left-align
                button:
                  "!px-4 !py-2 !border !border-red-600 !text-red-600 !bg-white !hover:bg-red-50 !rounded !text-sm !shadow-none !font-medium",
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
