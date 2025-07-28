"use client"

import { useState, useEffect } from "react"
import type { Issue } from "@/types/issue"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Bot, Calendar, Clock, Target, Zap } from "lucide-react"
import { calculateDeadlineFromScore } from "@/lib/utils"
import { addWorkingDays } from "@/lib/utils"

interface IssueModalProps {
  issue: Issue | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (issue: Issue) => void
}

function getWorkingDaysFromScore(score: number): number {
	if (score <= 4) return 15
	if (score <= 8) return 30
	if (score <= 12) return 60
	if (score <= 15) return 90
	return 120
}


export function IssueModal({ issue, isOpen, onClose, onUpdate }: IssueModalProps) {
  const [formData, setFormData] = useState<Issue | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (issue) {
      setFormData({ ...issue })
    } else {
      setFormData(null)
    }
  }, [issue])

  // Reset form data when modal is closed
  useEffect(() => {
    if (!isOpen && issue) {
      setFormData({ ...issue })
    }
  }, [isOpen, issue])

  useEffect(() => {
    if (!formData) return

    const { aiSuggestions, assignedAt } = formData

    if (aiSuggestions?.impactScore && aiSuggestions?.complexityScore) {
      const totalScore = aiSuggestions.impactScore + aiSuggestions.complexityScore
      const updatedDeadline = calculateDeadlineFromScore(totalScore, assignedAt || new Date())

      setFormData((prev) =>
        prev ? { ...prev, deadline: updatedDeadline } : null
      )
    }
  }, [formData?.aiSuggestions?.impactScore, formData?.aiSuggestions?.complexityScore, formData?.assignedAt])


  if (!issue || !formData) return null

  const handleInputChange = (field: keyof Issue, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true)

    // Mock AI analysis - in real implementation, this would call Gemini API
    setTimeout(() => {
      const mockAIResults = {
        impactScore: Math.floor(Math.random() * 5) + 1,
        complexityScore: Math.floor(Math.random() * 5) + 1,
        totalScore: 0,
        suggestedPriority: "Medium",
      }

      mockAIResults.totalScore = mockAIResults.impactScore + mockAIResults.complexityScore

      if (mockAIResults.totalScore >= 8) mockAIResults.suggestedPriority = "High"
      else if (mockAIResults.totalScore >= 5) mockAIResults.suggestedPriority = "Medium"
      else mockAIResults.suggestedPriority = "Low"

      // Calculate deadline based on score
      let daysToAdd = 15
      const score = mockAIResults.totalScore
      if (score >= 5 && score <= 8) daysToAdd = 30
      else if (score >= 9 && score <= 12) daysToAdd = 60
      else if (score >= 13 && score <= 15) daysToAdd = 90
      else if (score > 15) daysToAdd = 120

const newDeadline = addWorkingDays(new Date(), daysToAdd)


      setFormData((prev) =>
        prev
          ? {
              ...prev,
              aiSuggestions: mockAIResults,
              deadline: newDeadline,
              priority: mockAIResults.suggestedPriority as Issue["priority"],
            }
          : null,
      )

      setIsAnalyzing(false)
    }, 2000)
  }

  const handleSave = () => {
    if (formData) {
      if (formData.assignedAt < formData.createdAt) {
        alert("Assigned date cannot be before Created date.")
        return
      }
      onUpdate(formData)
      onClose()
    }
  }

  const calculateAgingDays = () => {
    const today = new Date()
    const created = new Date(formData.createdAt)
    const diffTime = Math.abs(today.getTime() - created.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateCleansingProgress = () => {
    if (!formData.impactedRecordTotal || formData.impactedRecordTotal === 0) return 0
    return Math.round(((formData.cleansedRecordTotal || 0) / formData.impactedRecordTotal) * 100)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-full !max-w-[70vw] px-8 py-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-red-700">
              [{formData.id}] {formData.ticketTitle}
            </span>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(formData.priority)}>{formData.priority}</Badge>
              <Badge variant="outline">Deadline: {formData.deadline.toLocaleDateString()}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Issue Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Core Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Core Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Issue["status"]) => {
                        if (formData.status === "new" && value === "in_progress" && !formData.assignedAt) {
                          const today = new Date()
                          handleInputChange("assignedAt", today)
                        }
                        handleInputChange("status", value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                  <div>
                    <Label>Priority</Label>
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
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Requester Name</Label>
                    <Input
                      value={formData.requesterName}
                      onChange={(e) => handleInputChange("requesterName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <Input
                      value={formData.requesterContact}
                      onChange={(e) => handleInputChange("requesterContact", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={formData.requesterDepartment}
                      onChange={(e) => handleInputChange("requesterDepartment", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={formData.requesterUnit}
                      onChange={(e) => handleInputChange("requesterUnit", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Source System</Label>
                    <Input
                      value={formData.sourceSystem}
                      onChange={(e) => handleInputChange("sourceSystem", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Impacted Area</Label>
                    <Input
                      value={formData.impactedArea}
                      onChange={(e) => handleInputChange("impactedArea", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Issue Classification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issue Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Aging Days</Label>
                    <Input value={calculateAgingDays()} disabled />
                  </div>
                  <div>
                    <Label>DQ Issue Category</Label>
                    <Select
                      value={formData.dqIssueCategory || ""}
                      onValueChange={(value) => handleInputChange("dqIssueCategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inconsistent value">Inconsistent value</SelectItem>
                        <SelectItem value="Duplicate value">Duplicate value</SelectItem>
                        <SelectItem value="Invalid value">Invalid value</SelectItem>
                        <SelectItem value="Blank value">Blank value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Problem Category</Label>
                    <Input
                      value={formData.problemCategory || ""}
                      onChange={(e) => handleInputChange("problemCategory", e.target.value)}
                      placeholder="e.g., Inconsistent Staff Tagging"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={formData.isRecurring || false}
                      onCheckedChange={(checked) => handleInputChange("isRecurring", checked)}
                    />
                    <Label htmlFor="recurring">Recurring Issue</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Resolution Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resolution Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>RCA Category</Label>
                    <Select
                      value={formData.rcaCategory || ""}
                      onValueChange={(value) => handleInputChange("rcaCategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select RCA category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="People">People</SelectItem>
                        <SelectItem value="Processes">Processes</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Non DQ Issue">Non DQ Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Resolution Category</Label>
                    <Select
                      value={formData.resolutionCategory || ""}
                      onValueChange={(value) => handleInputChange("resolutionCategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual Data Cleansing">Manual Data Cleansing</SelectItem>
                        <SelectItem value="System Enhancement">System Enhancement</SelectItem>
                        <SelectItem value="Process Improvement">Process Improvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reported Record (Total)</Label>
                    <Input
                      type="number"
                      value={formData.reportedRecordTotal || ""}
                      onChange={(e) => handleInputChange("reportedRecordTotal", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Impacted Record (Total)</Label>
                    <Input
                      type="number"
                      value={formData.impactedRecordTotal || ""}
                      onChange={(e) => handleInputChange("impactedRecordTotal", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Impacted Record (Cleansed)</Label>
                    <Input
                      type="number"
                      value={formData.cleansedRecordTotal || ""}
                      onChange={(e) => handleInputChange("cleansedRecordTotal", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Cleansing Progress (%)</Label>
                    <Input value={`${calculateCleansingProgress()}%`} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Co-Pilot */}
          <div className="space-y-6">
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-lg flex items-center text-red-700">
                  <Bot className="w-5 h-5 mr-2" />
                  AI Co-Pilot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Button
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
                  {formData.aiSuggestions && (
                    <div className="space-y-3">
                      <Separator />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Input
                            type="number"
                            min={4}
                            max={12}
                            value={formData.aiSuggestions.impactScore}
                            onChange={(e) => {
                              const newScore = parseInt(e.target.value) || 0
                              const newTotal = newScore + (formData.aiSuggestions?.complexityScore || 0)
                              handleInputChange("aiSuggestions", {
                                ...formData.aiSuggestions,
                                impactScore: newScore,
                                totalScore: newTotal,
                              })
                            }}
                            className="text-center text-2xl font-bold text-blue-600"
                          />
                          <div className="text-xs text-blue-700">Impact Score</div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Input
                            type="number"
                            min={2}
                            max={6}
                            value={formData.aiSuggestions.complexityScore}
                            onChange={(e) => {
                              const newScore = parseInt(e.target.value) || 0
                              const newTotal = newScore + (formData.aiSuggestions?.impactScore || 0)
                              handleInputChange("aiSuggestions", {
                                ...formData.aiSuggestions,
                                complexityScore: newScore,
                                totalScore: newTotal,
                              })
                            }}
                            className="text-center text-2xl font-bold text-purple-600"
                          />
                          <div className="text-xs text-purple-700">Complexity Score</div>
                        </div>
                      </div>

                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                          {formData.aiSuggestions.totalScore}
                        </div>
                        <div className="text-sm text-red-700">
                          Total Score ({getWorkingDaysFromScore(formData.aiSuggestions.totalScore)} WD)
                          </div>
                      </div>

                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-semibold text-orange-600">
                          {formData.aiSuggestions.suggestedPriority}
                        </div>
                        <div className="text-xs text-orange-700">Suggested Priority</div>
                      </div>
                    </div>
                  )}

              </CardContent>
            </Card>

            {/* Assignment & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Assignment & Timeline
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>DQ PIC</Label>
                    <Input
                      value={formData.dqPicUid}
                      onChange={(e) => handleInputChange("dqPicUid", e.target.value)}
                      placeholder="Assign Data Steward"
                    />
                  </div>

                  <div>
                    <Label>IT PIC</Label>
                    <Input
                      value={formData.itPicUid}
                      onChange={(e) => handleInputChange("itPicUid", e.target.value)}
                      placeholder="Assign IT Personnel"
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formData.createdAt.toLocaleDateString("en-GB")}</span>
                  </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Assigned: {formData.assignedAt.toLocaleDateString("en-GB")}</span>
                    </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {formData.deadline.toLocaleDateString("en-GB")}</span>
                  </div>
                </CardContent>

            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
