export interface Issue {
  // Core Details
  id: string
  description: string
  priority: "Super High" | "High" | "Medium" | "Low" | "N/A"
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
  // Status Dictinary:
  // New: new MS form submission
  // Investigating: ticket pickup
  // Resolving: in progress of resolving (cleansing, system enhancement, process improvement)
  // Monitoring: after resolving, monitor 3 months
  // Closed: after monitoring period
  status: "new" | "monitoring" | "closed" | "resolving" | "investigating"
  createdByUid: string
  dqPicUid?: string
  dsPicUid?: string

  // Timestamps
  // Timestamp Dictionary
  // Created At: new ticket creation date
  // Picked Up At: ticket picked up and being investigated date
  // Assigned At: Date that ticket is sent to Data Steward to resolve
  // Completed At: Date that data is completely cleansed and sent to monitor
  // Resolved At: 3 months after monitoring and no change nor similar issue and considered closed
  // Deadline: deadline
  // Updated At: date that ticket is updated or changes status
  createdAt: Date
  pickedUpAt?: Date
  assignedAt?: Date
  completedAt?: Date
  resolvedAt?: Date
  deadline: Date
  updatedAt?: Date

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
  systemEnhancementScore?: number
  processImprovement?: "yes" | "no"
  processImprovementScore?: number

  // Notes & Remarks
  extraRemarks?: string
  systemEnhancementNotes?: string
  processImprovementNotes?: string

  // AI Co-Pilot
  aiSuggestions?: {
    impactScore: number
    complexityScore: number
    totalScore: number
    suggestedPriority: "Super High" | "High" | "Medium" | "Low"
  }

  // Working days calculation (based on totalScore)
  workingDays?: number

  // Uploaded Media from UploadThing
  mediaUrls?: string[]
}