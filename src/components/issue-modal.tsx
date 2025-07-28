"use client"

import { useState, useEffect, useMemo } from "react"
import type { Issue } from "@/types/issue"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Bot, Calendar, CheckCircle, Clock, Cpu, GitCommit, GitMerge, HardDrive, HelpCircle, Target, XCircle } from "lucide-react"

interface IssueModalProps {
  issue: Issue | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (issue: Issue) => void
}

const Section = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </h3>
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">{children}</div>
  </div>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-sm font-medium text-gray-600">{label}</Label>
    {children}
  </div>
)

const InfoField = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-600 flex items-center">
      {icon && <span className="mr-2 w-4 h-4">{icon}</span>}
      {label}
    </span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
)

export function IssueModal({ issue, isOpen, onClose, onUpdate }: IssueModalProps) {
  const [editedIssue, setEditedIssue] = useState<Issue | null>(issue)

  useEffect(() => {
    setEditedIssue(issue)
  }, [issue])

    useEffect(() => {
    if (!isOpen && issue) {
      setEditedIssue(issue)
    }
  }, [isOpen, issue])

  const handleChange = (field: keyof Issue, value: any) => {
    if (editedIssue) {
      setEditedIssue({ ...editedIssue, [field]: value })
    }
  }

  const handleSaveChanges = () => {
    if (editedIssue) {
      onUpdate(editedIssue)
      onClose()
    }
  }

  const { agingDays, agingMonths, agingBucket, outstanding, percentCleansed, percentCleansedValue } = useMemo(() => {
    if (!issue)
      return {
        agingDays: 0,
        agingMonths: 0,
        agingBucket: "N/A",
        outstanding: 0,
        percentCleansed: "0.00%",
        percentCleansedValue: 0,
      }

    const now = new Date()
    const created = new Date(issue.createdAt)
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    const months = Math.floor(days / 30)
    let bucket = "0-30 days"
    if (days > 90) bucket = "90+ days"
    else if (days > 60) bucket = "61-90 days"
    else if (days > 30) bucket = "31-60 days"

    const impacted = issue.impactedRecordTotal || 0
    const cleansed = issue.cleansedRecordTotal || 0
    const excluded = issue.excludedRecordTotal || 0
    const out = impacted - cleansed - excluded
    const percentValue = impacted > 0 ? (cleansed / impacted) * 100 : 0
    const perc = percentValue.toFixed(0) + "%"

    return { agingDays: days, agingMonths: months, agingBucket: bucket, outstanding: out, percentCleansed: perc, percentCleansedValue: percentValue }
  }, [issue])

  if (!isOpen || !editedIssue) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-3 text-xl">
              <span className="text-red-600">{editedIssue.id}</span>
              <span className="text-gray-700 font-medium">{editedIssue.description}</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={editedIssue.priority === "High" ? "destructive" : "secondary"}>{editedIssue.priority}</Badge>
              <Badge variant="outline" className="border-blue-400 text-blue-600">{editedIssue.status.toUpperCase()}</Badge>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Deadline: {new Date(editedIssue.deadline).toLocaleDateString()}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 overflow-y-auto p-2 flex-grow">
          {/* Left Column */}
          <div className="col-span-2 space-y-4">
            <Section title="Core Details">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <Select value={editedIssue.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="cleansing">Cleansing</SelectItem>
                      <SelectItem value="enhancing">Enhancing</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="flex justify-end items-end gap-3">
                <Field label="Priority">
                  <Select value={editedIssue.priority} onValueChange={(v) => handleChange("priority", v)}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Recurring">
                  <Select value={editedIssue.isRecurring || "No"} onValueChange={(v) => handleChange("isRecurring", v)}>                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                </div>
              </div>
              <Field label="Description">
                <Textarea value={editedIssue.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Requester Name"><Input value={editedIssue.requesterName} onChange={(e) => handleChange("requesterName", e.target.value)} /></Field>
                <Field label="Contact Number"><Input value={editedIssue.requesterContact} onChange={(e) => handleChange("requesterContact", e.target.value)} /></Field>
                <Field label="Department"><Input value={editedIssue.requesterDepartment} onChange={(e) => handleChange("requesterDepartment", e.target.value)} /></Field>
                <Field label="Unit"><Input value={editedIssue.requesterUnit} onChange={(e) => handleChange("requesterUnit", e.target.value)} /></Field>
                <Field label="Requester Cost Center"><Input value={editedIssue.requesterCostCenter || ""} onChange={(e) => handleChange("requesterCostCenter", e.target.value)} /></Field>
                <Field label="Requester Team Leader"><Input value={editedIssue.requesterTeamLeader || ""} onChange={(e) => handleChange("requesterTeamLeader", e.target.value)} /></Field>
                <Field label="Source System"><Input value={editedIssue.sourceSystem} onChange={(e) => handleChange("sourceSystem", e.target.value)} /></Field>
                <Field label="Impacted Area"><Input value={editedIssue.impactedArea} onChange={(e) => handleChange("impactedArea", e.target.value)} /></Field>
                <Field label="Other PIC"><Input value={editedIssue.otherPIC || ""} onChange={(e) => handleChange("otherPIC", e.target.value)} /></Field>
                <Field label="Suggested Resolution"><Input value={editedIssue.suggestedResolution || ""} onChange={(e) => handleChange("suggestedResolution", e.target.value)} /></Field>
              </div>
            </Section>

            <Section title="Issue Classification">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Data Class"><Input value={editedIssue.dataClass || ""} onChange={(e) => handleChange("dataClass", e.target.value)} /></Field>
                <Field label="Critical Data Element">
                  <Select value={editedIssue.criticalDataElement || ""} onValueChange={(v) => handleChange("criticalDataElement", v)}>
                    <SelectTrigger><SelectValue placeholder="Select Yes/No" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Issue Category"><Input value={editedIssue.dqIssueCategory || ""} onChange={(e) => handleChange("dqIssueCategory", e.target.value)} /></Field>
                <Field label="Issue Field"><Input value={editedIssue.issueField || ""} onChange={(e) => handleChange("issueField", e.target.value)} /></Field>
                <Field label="RCA Category"><Input value={editedIssue.rcaCategory || ""} onChange={(e) => handleChange("rcaCategory", e.target.value)} /></Field>
                <Field label="RCA Details"><Input value={editedIssue.rcaDetails || ""} onChange={(e) => handleChange("rcaDetails", e.target.value)} /></Field>
                <div className="col-span-2">
                  <Field label="Impact Analysis"><Textarea value={editedIssue.impactAnalysis || ""} onChange={(e) => handleChange("impactAnalysis", e.target.value)} /></Field>
                </div>
              </div>
            </Section>

            <Section title="Extra Remarks">
                <Textarea value={editedIssue.extraRemarks || ""} onChange={(e) => handleChange("extraRemarks", e.target.value)} rows={4} />
            </Section>

            <Section title="System Enhancement / Process Improvement Notes">
                <Textarea value={editedIssue.systemEnhancementNotes || ""} onChange={(e) => handleChange("systemEnhancementNotes", e.target.value)} rows={4} />
            </Section>
          </div>

          {/* Right Column */}
          <div className="col-span-1 space-y-4">
            <Section title="AI Co-Pilot" icon={<Bot className="text-red-600" />}>
              <Button className="w-full bg-red-600 hover:bg-red-700">Analyze with AI</Button>
              <div className="flex justify-around text-center p-2 bg-white rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{editedIssue.aiSuggestions?.impactScore || 0}</div>
                  <div className="text-xs text-gray-500">Impact Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{editedIssue.aiSuggestions?.complexityScore || 0}</div>
                  <div className="text-xs text-gray-500">Complexity Score</div>
                </div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="text-3xl font-bold text-gray-800">{editedIssue.aiSuggestions?.totalScore || 0}</div>
                <div className="text-xs text-gray-500">Total Score</div>
              </div>
              <div className="text-center p-3 bg-orange-100 text-orange-700 rounded-lg font-semibold">
                {editedIssue.aiSuggestions?.suggestedPriority || "N/A"}
                <div className="text-xs font-normal">Suggested Priority</div>
              </div>
              <Button variant="outline" className="w-full">Detect Duplicates</Button>
              <div className="flex items-center text-sm text-yellow-600 p-2 bg-yellow-50 rounded-md">
                <AlertCircle className="w-4 h-4 mr-2" />
                AI analysis might take a few moments.
              </div>
            </Section>

            <Section title="Assignment & Timeline" icon={<Clock className="text-red-600" />}>
                <Field label="Data Quality PIC"><Input value={editedIssue.dqPicUid || ""} onChange={(e) => handleChange("dqPicUid", e.target.value)} placeholder="Assign DQ PIC" /></Field>
                <Field label="Data Steward PIC"><Input value={editedIssue.dsPicUid || ""} onChange={(e) => handleChange("dsPicUid", e.target.value)} placeholder="Assign Data Steward PIC" /></Field>
                <Field label="IT PIC"><Input value={editedIssue.itPicUid || ""} onChange={(e) => handleChange("itPicUid", e.target.value)} placeholder="Assign IT PIC" /></Field>
                <div className="space-y-2 pt-2 border-t mt-4">
                    <InfoField label="Created" value={new Date(editedIssue.createdAt).toLocaleDateString()} icon={<GitCommit />} />
                    <InfoField label="Picked Up" value={editedIssue.pickedUpAt ? new Date(editedIssue.pickedUpAt).toLocaleDateString() : "N/A"} icon={<GitMerge />} />
                    <InfoField label="Resolved" value={editedIssue.resolvedAt ? new Date(editedIssue.resolvedAt).toLocaleDateString() : "N/A"} icon={<CheckCircle />} />
                    <InfoField label="Completed" value={editedIssue.completedAt ? new Date(editedIssue.completedAt).toLocaleDateString() : "N/A"} icon={<XCircle />} />
                    <InfoField label="Aging Days" value={agingDays} icon={<Calendar />} />
                    <InfoField label="Aging Months" value={agingMonths} icon={<Calendar />} />
                    <InfoField label="Aging Bucket" value={agingBucket} icon={<HelpCircle />} />
                </div>
            </Section>

            <Section title="Cleansing Statistics" icon={<HardDrive className="text-red-600" />}>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Reported"><Input type="number" value={editedIssue.reportedRecordTotal || ""} onChange={(e) => handleChange("reportedRecordTotal", parseInt(e.target.value))} /></Field>
                    <Field label="Impacted"><Input type="number" value={editedIssue.impactedRecordTotal || ""} onChange={(e) => handleChange("impactedRecordTotal", parseInt(e.target.value))} /></Field>
                    <Field label="Cleansed"><Input type="number" value={editedIssue.cleansedRecordTotal || ""} onChange={(e) => handleChange("cleansedRecordTotal", parseInt(e.target.value))} /></Field>
                    <Field label="Excluded"><Input type="number" value={editedIssue.excludedRecordTotal || ""} onChange={(e) => handleChange("excludedRecordTotal", parseInt(e.target.value))} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Field label="Outstanding"><Input readOnly value={outstanding} /></Field>
                    <Field label="% Cleansed"><Input readOnly value={percentCleansed} /></Field>
                </div>
                <div className="mt-4">
                  <Progress value={percentCleansedValue} className="h-3 [&>*]:bg-green-500" />
                </div>
            </Section>          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}