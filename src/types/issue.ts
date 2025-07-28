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
  sourceSystem: string
  impactedArea: string

  // Status & Assignment
  status: "new" | "in_progress" | "monitoring" | "closed" | "rejected"
  createdByUid: string
  dqPicUid: string
  itPicUid: string

  // Timestamps
  createdAt: Date
  assignedAt: Date
  deadline: Date

  // Key Issue Classification (Optional)
  dqIssueCategory?: string
  problemCategory?: string
  isRecurring?: boolean

  // Resolution Summary & Metrics (Optional)
  rcaCategory?: string
  resolutionCategory?: string
  reportedRecordTotal?: number
  impactedRecordTotal?: number
  cleansedRecordTotal?: number

  // AI Co-Pilot Generated Fields
  aiSuggestions?: {
    impactScore: number
    complexityScore: number
    totalScore: number
    suggestedPriority: string
  }
}
