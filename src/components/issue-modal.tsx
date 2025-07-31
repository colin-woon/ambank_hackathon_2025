"use client"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
import { AlertCircle, Bot, Calendar, CheckCircle, Clock, Cpu, GitBranch, GitBranchIcon, GitCommit, GitCommitHorizontalIcon, GitMerge, GitPullRequest, GitPullRequestArrowIcon, HardDrive, HelpCircle, Target, XCircle } from "lucide-react"
import { getWorkingDaysBetween, getAgingBucket } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import DetectDuplicateButton from '@/components/duplicate-detection-button';
import ResultsModal from '@/components/duplicate-result-modal';
import { DuplicateDetectionResponse } from '@/types/duplicate-detection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import PriorityScoreCard from "./priority-score-card"
import { UploadButton } from "../lib/uploadthing"
import SendEmailButton from "./send-email-button"

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
  const [agingDays, setAgingDays] = useState<number | null>(null);
  const [agingMonths, setAgingMonths] = useState<number | null>(null);
  const [agingBucket, setAgingBucket] = useState<string | null>(null);
  const [result, setResult] = useState<DuplicateDetectionResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!editedIssue?.assignedAt) {
      setAgingDays(null);
      setAgingMonths(null);
      setAgingBucket(null);
      return;
    }

    const now = new Date();
    const assigned = new Date(editedIssue.assignedAt);

    const days = getWorkingDaysBetween(assigned, now);
    const months = Math.max(
      0,
      (now.getFullYear() - assigned.getFullYear()) * 12 +
      now.getMonth() - assigned.getMonth()
    );

    setAgingDays(days);
    setAgingMonths(months);
    setAgingBucket(getAgingBucket(months));
  }, [editedIssue?.assignedAt]);

  const handleResult = (newResult: DuplicateDetectionResponse) => {
    setResult(newResult);
    setShowModal(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    setEditedIssue(issue)
  }, [issue])

    useEffect(() => {
    if (!isOpen && issue) {
      setEditedIssue(issue)
    }
  }, [isOpen, issue])

  const handleChange = (field: keyof Issue, value: any) => {
    if (!editedIssue) return
    let updates: Partial<Issue> = { [field]: value }
    if (field === "status") {
      const now = new Date()

      switch (value) {
        case "investigating":
          updates.pickedUpAt = editedIssue.pickedUpAt ?? now
          break
        case "resolving":
          updates.assignedAt = editedIssue.assignedAt ?? now
          break
          case "monitoring":
            updates.resolvedAt = editedIssue.resolvedAt ?? now
            break
        case "closed":
          updates.closedAt = editedIssue.closedAt ?? now
          break
      }
    }

    setEditedIssue({ ...editedIssue, ...updates })
  }


  const handleSaveChanges = async () => {
    if (!editedIssue) return;

    const updatedAt = new Date();

    const impacted = Number(editedIssue.impactedRecordTotal) || 0;
    let cleansed = Number(editedIssue.cleansedRecordTotal) || 0;
    let excluded = Number(editedIssue.excludedRecordTotal) || 0;

    // ✅ Clamp to not exceed impacted
    const maxAllowed = impacted;
    if (cleansed + excluded > maxAllowed) {
      const ratio = maxAllowed / (cleansed + excluded);
      cleansed = Math.floor(cleansed * ratio);
      excluded = Math.floor(excluded * ratio);
    }

    let percentCleansed = impacted > 0
      ? ((cleansed + excluded) / impacted) * 100
      : 0;

    percentCleansed = percentCleansed === 100 ? 100 : Math.min(percentCleansed, 99);



    try {
      const issueRef = doc(db, "issues", editedIssue.id);

      await updateDoc(issueRef, {
        ...editedIssue,
        cleansedRecordTotal: cleansed,
        excludedRecordTotal: excluded,
        percentCleansed,
        updatedAt,
      });


      const updatedIssue = {
        ...editedIssue,
        percentCleansed,
        updatedAt,
      };

      onUpdate(updatedIssue); // Pass the enriched object to local state
      onClose();
    } catch (error) {
      console.error("Error saving issue:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const { outstanding, percentCleansed, percentCleansedValue } = useMemo(() => {
    if (!editedIssue)
      return {
        outstanding: 0,
        percentCleansed: "0%",
        percentCleansedValue: 0,
      }

    const outstanding = (editedIssue?.impactedRecordTotal || 0) -
                    (editedIssue?.cleansedRecordTotal || 0) -
                    (editedIssue?.excludedRecordTotal || 0);

    const percentCleansedValue = Math.min(
      Number(editedIssue.percentCleansed || 0),
      100
    );

    const roundedValue =
      percentCleansedValue === 100 ? 100 : Math.floor(percentCleansedValue);
    const percentCleansed = `${roundedValue}%`;

    return {
      outstanding,
      percentCleansed,
      percentCleansedValue,
    }
  }, [
    editedIssue?.impactedRecordTotal,
    editedIssue?.cleansedRecordTotal,
    editedIssue?.excludedRecordTotal,
  ])

  if (!isOpen || !editedIssue) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-3 text-xl">
              <span className="text-red-600">{editedIssue.id}</span>
              <span className="text-gray-700 font-medium line-clamp-1">{editedIssue.description}</span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full text-white transition-colors duration-500
                  ${
                    editedIssue.priority === "Super High"
                      ? "bg-red-600 hover:bg-red-700"
                      : editedIssue.priority === "High"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : editedIssue.priority === "Medium"
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : editedIssue.priority === "Low"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-400 hover:bg-gray-500"
                  }
                `}
              >
                {editedIssue.priority}
              </span>

              <Badge variant="outline" className="border-blue-400 text-blue-600">{editedIssue.status.toUpperCase()}</Badge>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Deadline: {new Date(editedIssue.deadline).toLocaleDateString("en-GB")}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 overflow-y-auto p-2 flex-grow">
          {/* Left Column */}
          <div className="col-span-2 space-y-4">
            <Section title="Core Details">
              <div className="grid grid-cols-2 gap-2">

                <div className="grid grid-cols-2 gap-0">
                  <Field label="Status">
                    <Select value={editedIssue.status} onValueChange={(v) => handleChange("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolving">Resolving</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                    <div className="flex items-center gap-6 mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="systemEnhancement"
                          checked={editedIssue.systemEnhancement === "yes"}
                          onChange={(e) =>
                            handleChange("systemEnhancement", e.target.checked ? "yes" : "no")
                          }
                          className="accent-red-600"
                        />
                        <Label htmlFor="systemEnhancement">System Enhancement</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="processImprovement"
                          checked={editedIssue.processImprovement === "yes"}
                          onChange={(e) =>
                            handleChange("processImprovement", e.target.checked ? "yes" : "no")
                          }
                          className="accent-red-600"
                        />
                        <Label htmlFor="processImprovement">Process Improvement</Label>
                      </div>
                    </div>
                </div>

                <div className="flex justify-end items-end gap-3">
                  <Field label="Priority">
                    <Select value={editedIssue.priority || "N/A"} onValueChange={(v) => handleChange("priority", v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super High">Super High</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
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
                <div className="col-span-2">
                  <Field label="RCA Details"><Textarea value={editedIssue.rcaDetails || ""} onChange={(e) => handleChange("rcaDetails", e.target.value)} /></Field>
                </div>
                <div className="col-span-2">
                  <Field label="Impact Analysis"><Textarea value={editedIssue.impactAnalysis || ""} onChange={(e) => handleChange("impactAnalysis", e.target.value)} /></Field>
                </div>
              </div>
            </Section>

            <Section title="Extra Remarks">
                <Textarea value={editedIssue.extraRemarks || ""} onChange={(e) => handleChange("extraRemarks", e.target.value)} rows={4} />
            </Section>

            {editedIssue.systemEnhancement === "yes" && (
              <Section title="System Enhancement Notes">
                <Textarea
                  value={editedIssue.systemEnhancementNotes || ""}
                  onChange={(e) => handleChange("systemEnhancementNotes", e.target.value)}
                  rows={4}
                />
              </Section>
            )}

            {editedIssue.processImprovement === "yes" && (
              <Section title="Process Improvement Notes">
                <Textarea
                  value={editedIssue.processImprovementNotes || ""}
                  onChange={(e) => handleChange("processImprovementNotes", e.target.value)}
                  rows={4}
                />
              </Section>
            )}
            <Section title="Media Attachments 📎">
              <div className="space-y-4">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    const urls = res.map((f) => f.url)
                    setEditedIssue((prev) =>
                      prev ? { ...prev, mediaUrls: [...(prev.mediaUrls || []), ...urls] } : prev
                    )
                  }}
                  onUploadError={(error) => {
                    console.error("Upload error", error)
                  }}
                  appearance={{
                    container: "!mt-2 !w-full !flex !justify-start",
                    button:
                      "!px-4 !py-2 !border !border-red-600 !text-red-600 !bg-white !hover:bg-red-50 !rounded !text-sm !shadow-none !font-medium",
                  }}
                />

                {editedIssue.mediaUrls && editedIssue.mediaUrls.length > 0 && (
                  <div className="space-y-4 mt-4">
                    {editedIssue.mediaUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center space-x-4 border p-2 rounded">
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-100 border rounded text-xs text-gray-700">
                          {url.match(/\.(jpe?g|png|gif|webp)$/i) ? (
                            <img
                              src={url}
                              alt={`Attachment ${idx + 1}`}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : url.endsWith(".pdf") ? (
                            "PDF"
                          ) : (
                            "FILE"
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm truncate">{url.split("/").pop()?.split("?")[0]}</div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 underline"
                          >
                            Open
                          </a>
                        </div>
                        <button
                          onClick={() => {
                            const updated = editedIssue.mediaUrls!.filter((_, i) => i !== idx)
                            setEditedIssue({ ...editedIssue, mediaUrls: updated })
                          }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>


          </div>

          {/* Right Column */}
          <div className="col-span-1 space-y-4">
            <Section title="AI Co-Pilot" icon={<Bot className="text-red-600" />}>

              <PriorityScoreCard editedIssue={editedIssue} setEditedIssue={setEditedIssue} />

              <DetectDuplicateButton
                issueId={editedIssue.id}
                issueDescription={editedIssue.description}
                onResult={handleResult}
                onError={handleError}
              />
              {/* Error Display */}
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <ResultsModal
                isOpen={showModal}
                onClose={closeModal}
                result={result}
              />

              <SendEmailButton issue={editedIssue} onSuccess={() => alert("Email sent successfully!")} onError={(err) => setError(err)} />

            </Section>

            <Section title="Assignment & Timeline" icon={<Clock className="text-red-600" />}>
              <Field label="Data Quality PIC">
                <Input
                  value={editedIssue.dqPicUid || ""}
                  onChange={(e) => handleChange("dqPicUid", e.target.value)}
                  placeholder="Assign DQ PIC"
                />
              </Field>

              <Field label="Data Steward PIC">
                <Input
                  value={editedIssue.dsPicUid || ""}
                  onChange={(e) => handleChange("dsPicUid", e.target.value)}
                  placeholder="Assign Data Steward PIC"
                />
              </Field>

              <div className="space-y-2 pt-2 border-t mt-4">
                {/* Created - set once when created */}
                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <GitCommit className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Created:</span>
                  <span>{new Date(editedIssue.createdAt).toLocaleDateString("en-GB")}</span>
                </div>

                {/* Picked Up - set when status changes from 'new' to 'investigating' */}
                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <GitMerge className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Picked Up:</span>
                  <span>
                    {editedIssue.pickedUpAt
                      ? new Date(editedIssue.pickedUpAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </span>
                </div>

                {/* Assigned - set when status changes from 'investigating' to 'resolving' */}
                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <GitPullRequestArrowIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Assigned:</span>
                  <span>
                    {editedIssue.assignedAt
                      ? new Date(editedIssue.assignedAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </span>
                </div>

                {/* Resolved - set when status changes to 'monitoring' */}
                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Resolved:</span>
                  <span>
                    {editedIssue.resolvedAt
                      ? new Date(editedIssue.resolvedAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </span>
                </div>

                {/* Closed - set when status changes to 'closed' */}
                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <XCircle className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Closed:</span>
                  <span>
                    {editedIssue.closedAt
                      ? new Date(editedIssue.closedAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </span>
                </div>

                {/* Aging Info - derived from assignedAt */}
                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Aging Days:</span>
                  <span>{agingDays ?? "N/A"}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Aging Months:</span>
                  <span>{agingMonths ?? "N/A"}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Aging Bucket:</span>
                  <span>{agingBucket ?? "N/A"}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 gap-x-2">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Updated At:</span>
                  <span>
                    {editedIssue.updatedAt
                      ? new Date(editedIssue.updatedAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </Section>


            <Section title="Cleansing Statistics" icon={<HardDrive className="text-red-600" />}>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Reported"><Input type="number" value={editedIssue.reportedRecordTotal || ""} onChange={(e) => handleChange("reportedRecordTotal", parseInt(e.target.value))} /></Field>
                    <Field label="Impacted"><Input type="number" value={editedIssue.impactedRecordTotal || ""} onChange={(e) => handleChange("impactedRecordTotal", parseInt(e.target.value))} /></Field>
                    <Field label="Cleansed">
                      <Input
                        type="number"
                        value={editedIssue.cleansedRecordTotal || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value)
                          const max = editedIssue.impactedRecordTotal || 0
                          handleChange("cleansedRecordTotal", Math.min(val, max))
                        }}
                      />
                    </Field>
                    <Field label="Excluded"><Input type="number" value={editedIssue.excludedRecordTotal || ""} onChange={(e) => handleChange("excludedRecordTotal", parseInt(e.target.value))} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Field label="Outstanding"><Input readOnly value={outstanding} /></Field>
                    <Field label="% Cleansed"><Input readOnly value={percentCleansed} /></Field>
                </div>
                <div className="mt-4">
                  <Progress value={percentCleansedValue} className="h-3 [&>*]:bg-green-500" />
                </div>
            </Section>

          {(editedIssue.systemEnhancement === "yes" || editedIssue.processImprovement === "yes") && (
            <Section title="Enhancement & Improvement Scores">
              {editedIssue.systemEnhancement === "yes" && (
                <Field label="System Enhancement Score">
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[editedIssue.systemEnhancementScore ?? 0]}
                      onValueChange={([val]) => handleChange("systemEnhancementScore", val)}
                      max={100}
                      step={1}
                      className="
                        h-2
                        [&_[data-slot='slider-track']]:bg-gray-200
                        [&_[data-slot='slider-range']]:bg-blue-500
                      "
                    />
                    <span className="w-10 text-right text-sm text-gray-700">
                      {editedIssue.systemEnhancementScore ?? 0}
                    </span>
                  </div>
                </Field>
              )}
                {editedIssue.processImprovement === "yes" && (
                  <Field label="Process Improvement Score">
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[editedIssue.processImprovementScore ?? 0]}
                        onValueChange={([val]) => handleChange("processImprovementScore", val)}
                        max={100}
                        step={1}
                        className="
                        h-2
                        [&_[data-slot='slider-track']]:bg-gray-200
                        [&_[data-slot='slider-range']]:bg-yellow-500
                      "
                      />
                      <span className="w-10 text-right text-sm text-gray-700">
                        {editedIssue.processImprovementScore ?? 0}
                      </span>
                    </div>
                  </Field>
                )}
            </Section>
          )}


          </div>
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
