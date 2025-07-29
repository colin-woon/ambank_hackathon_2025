export interface Issue {
  // Core Details
  id: string
  description: string
  priority: "Super High" | "High" | "Medium" | "Low" | "N/A"
  mediaFiles?: File[] // for frontend only (temporary)
  mediaUrls?: string[] // for uploaded file URLs (after backend or Firebase upload)

  // Requester & Source Info
  requesterName: string
  requesterContact: string
  requesterDepartment: string
  requesterUnit: string
  requesterCostCenter?: string
  requesterTeamLeader?: string
  sourceSystem: string
  impactedArea: string
  otherPIC?: string
  suggestedResolution?: string

  // Status & Assignment
  status: "new" | "monitoring" | "closed" | "rejected" | "resolving" | "investigating" | "resolved"
  createdByUid: string
  dqPicUid?: string
  dsPicUid?: string

  // Timestamps
  createdAt: Date
  pickedUpAt?: Date
  assignedAt?: Date
  resolvedAt?: Date
  completedAt?: Date
  deadline: Date

  // Aging Info
  agingDays?: number
  agingMonths?: number
  agingBucket?: "0-6 months" | "7-18 months" | ">18 months"

  // Issue Classification
  dataClass?: string
  criticalDataElement?: "Yes" | "No"
  dqIssueCategory?: string
  issueField?: string
  isRecurring?: string

  // RCA & Impact
  rcaCategory?: string
  rcaDetails?: string
  impactAnalysis?: string

  // Resolution Summary & Metrics
  reportedRecordTotal?: number
  impactedRecordTotal?: number
  cleansedRecordTotal?: number
  excludedRecordTotal?: number
  outstandingRecordTotal?: number // Should be derived (reported - cleansed - excluded)
  percentTotal?: string            // e.g. "25%"

  systemEnhancement?: "yes" | "no"
  processImprovement?: "yes" | "no"

  // Notes & Remarks
  extraRemarks?: string
  systemEnhancementNotes?: string

  // AI Co-Pilot
  aiSuggestions?: {
    impactScore: number
    complexityScore: number
    totalScore: number
    suggestedPriority: "High" | "Medium" | "Low"
  }

  // Working days calculation (based on totalScore)
  workingDays?: number
}
