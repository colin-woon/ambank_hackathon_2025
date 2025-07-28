"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IssueTable } from "@/components/issue-table"
import { Button } from "@/components/ui/button"
import { Plus, Users, Kanban, Search } from "lucide-react"
import { CreateIssueModal } from "@/components/create-issue-modal"
import { IssueModal } from "@/components/issue-modal"
import type { Issue } from "@/types/issue"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { ResolutionDashboard } from "@/components/resolution-dashboard"
import { mockIssues } from "@/lib/mock-data"

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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="table" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Data Quality & IT View</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Analysis Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="resolution" className="flex items-center space-x-2">
              <Kanban className="w-4 h-4" />
              <span>Resolution Dashboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <IssueTable issues={issues} onIssueClick={handleIssueClick} />
          </TabsContent>

          <TabsContent value="analysis">
            <AnalysisDashboard issues={issues} onIssueClick={handleIssueClick} onUpdateIssue={handleUpdateIssue} />
          </TabsContent>

          <TabsContent value="resolution">
            <ResolutionDashboard issues={issues} onIssueClick={handleIssueClick} onUpdateIssue={handleUpdateIssue} />
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
