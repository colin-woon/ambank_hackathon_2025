"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IssueTable } from "@/components/issue-table"
import { StewardDashboard } from "@/components/steward-dashboard"
import { Button } from "@/components/ui/button"
import { Plus, Users, Kanban } from "lucide-react"
import { CreateIssueModal } from "@/components/create-issue-modal"
import { IssueModal } from "@/components/issue-modal"
import type { Issue } from "@/types/issue"

// Mock data for demonstration
const mockIssues: Issue[] = [
  {
    id: "SR3349140",
    ticketTitle: "Inconsistent Customer Data Format",
    description: "Customer names appearing in different formats across systems",
    priority: "High",
    status: "new",
    requesterName: "John Doe",
    requesterContact: "+60123456789",
    requesterDepartment: "IT",
    requesterUnit: "Data Management",
    sourceSystem: "Core Banking",
    impactedArea: "Customer Database",
    createdAt: new Date("2024-01-15"),
    deadline: new Date("2024-02-15"),
    createdByUid: "user1",
    dqPicUid: "",
    itPicUid: "",
    mediaAttachments: [],
    dqIssueCategory: "Inconsistent value",
    problemCategory: "Data Format Issues",
    isRecurring: true,
    reportedRecordTotal: 1500,
    impactedRecordTotal: 1200,
    cleansedRecordTotal: 800,
    aiSuggestions: {
      impactScore: 4,
      complexityScore: 3,
      totalScore: 7,
      suggestedPriority: "High",
    },
  },
  {
    id: "SR3349141",
    ticketTitle: "Missing Transaction Records",
    description: "Some transaction records are not appearing in daily reports",
    priority: "Medium",
    status: "in_progress",
    requesterName: "Jane Smith",
    requesterContact: "+60123456788",
    requesterDepartment: "Operations",
    requesterUnit: "Transaction Processing",
    sourceSystem: "Payment Gateway",
    impactedArea: "Transaction Reports",
    createdAt: new Date("2024-01-10"),
    deadline: new Date("2024-02-10"),
    createdByUid: "user2",
    dqPicUid: "steward1",
    itPicUid: "it1",
    mediaAttachments: [],
    dqIssueCategory: "Blank value",
    problemCategory: "Data Completeness",
    isRecurring: false,
    reportedRecordTotal: 500,
    impactedRecordTotal: 50,
    cleansedRecordTotal: 0,
    aiSuggestions: {
      impactScore: 3,
      complexityScore: 2,
      totalScore: 5,
      suggestedPriority: "Medium",
    },
  },
  {
    id: "SR3349142",
    ticketTitle: "Duplicate Account Entries",
    description: "Multiple account entries found for the same customer",
    priority: "Low",
    status: "monitoring",
    requesterName: "Mike Johnson",
    requesterContact: "+60123456787",
    requesterDepartment: "Customer Service",
    requesterUnit: "Account Management",
    sourceSystem: "CRM System",
    impactedArea: "Customer Accounts",
    createdAt: new Date("2024-01-05"),
    deadline: new Date("2024-02-05"),
    createdByUid: "user3",
    dqPicUid: "steward1",
    itPicUid: "it2",
    mediaAttachments: [],
    dqIssueCategory: "Duplicate value",
    problemCategory: "Data Duplication",
    isRecurring: true,
    reportedRecordTotal: 200,
    impactedRecordTotal: 100,
    cleansedRecordTotal: 90,
    aiSuggestions: {
      impactScore: 2,
      complexityScore: 2,
      totalScore: 4,
      suggestedPriority: "Low",
    },
  },
]

export default function HomePage() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)

  const handleCreateIssue = (newIssue: Omit<Issue, "id" | "createdAt">) => {
    const issue: Issue = {
      ...newIssue,
      id: `SR${Date.now()}`,
      createdAt: new Date(),
    }
    setIssues([...issues, issue])
    setIsCreateModalOpen(false)
  }

  const handleUpdateIssue = (updatedIssue: Issue) => {
    setIssues(issues.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)))
    setSelectedIssue(updatedIssue)
  }

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue)
    setIsIssueModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <header className="bg-white border-b border-red-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-gray-900">AmBank Data Quality Platform</h1>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Issue
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="table" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Data Quality & IT View</span>
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center space-x-2">
              <Kanban className="w-4 h-4" />
              <span>Data Steward Dashboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <IssueTable issues={issues} onIssueClick={handleIssueClick} />
          </TabsContent>

          <TabsContent value="kanban">
            <StewardDashboard issues={issues} onIssueClick={handleIssueClick} onUpdateIssue={handleUpdateIssue} />
          </TabsContent>
        </Tabs>
      </main>

      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateIssue}
      />

      <IssueModal
        issue={selectedIssue}
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onUpdate={handleUpdateIssue}
      />
    </div>
  )
}
