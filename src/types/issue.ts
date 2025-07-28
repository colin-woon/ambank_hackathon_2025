export interface Issue {
  // Core Details
  id: string
  ticketTitle: string
  description: string
  priority: "High" | "Medium" | "Low"
  mediaAttachments: string[]

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
  status: "new" | "in_progress" | "monitoring" | "closed" | "rejected" | "cleansing"
  createdByUid: string
  dqPicUid?: string
  dsPicUid?: string
  itPicUid?: string

  // Timestamps
  createdAt: Date
  assignedAt?: Date
  pickedUpAt?: Date
  resolvedAt?: Date
  completedAt?: Date
  deadline: Date

  // Key Issue Classification
  dataClass?: string
  criticalDataElement?: "Yes" | "No"
  dqIssueCategory?: string
  issueField?: string
  problemCategory?: string 
  isRecurring?: string

  // RCA & Impact
  rcaCategory?: string
  rcaDetails?: string
  impactAnalysis?: string

  // Resolution Summary & Metrics
  resolutionCategory?: string
  reportedRecordTotal?: number
  impactedRecordTotal?: number
  cleansedRecordTotal?: number
  excludedRecordTotal?: number
  outstandingRecordTotal?: number // This will be calculated

  // Notes & Remarks
  extraRemarks?: string
  systemEnhancementNotes?: string

  // AI Co-Pilot Generated Fields
  aiSuggestions?: {
    impactScore: number
    complexityScore: number
    totalScore: number
    suggestedPriority: string
  }
}