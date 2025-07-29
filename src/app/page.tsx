"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IssueTable } from "@/components/issue-table"
import { Button } from "@/components/ui/button"
import { Home, Plus, Users, Kanban, Search } from "lucide-react"
import { CreateIssueModal } from "@/components/create-issue-modal"
import { IssueModal } from "@/components/issue-modal"
import type { Issue } from "@/types/issue"
import { mockIssues } from "@/lib/mock-data"
import { db } from "@/lib/firebase"
import { collection, getDocs, Timestamp } from "firebase/firestore"
import { HomeDashboard } from "@/components/home-dashboard"
import { MergedDashboard } from "@/components/merged-dashboard"

export default function HomePage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const issuesCollection = collection(db, "issues");
        const issueSnapshot = await getDocs(issuesCollection);
        const issuesList = issueSnapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Firestore Timestamps to JS Date objects
          const convertTimestamp = (timestamp: any) => {
            if (timestamp instanceof Timestamp) {
              return timestamp.toDate();
            }
            // Handle date strings
            if (typeof timestamp === 'string') {
              return new Date(timestamp);
            }
            return new Date(); // Fallback for undefined or null dates
          };

          return {
            ...data,
            id: doc.id,
            createdAt: convertTimestamp(data.createdAt),
            pickedUpAt: convertTimestamp(data.pickedUpAt),
            updatedAt: convertTimestamp(data.updatedAt),
            deadline: convertTimestamp(data.deadline),
            assignedAt: data.assignedAt ? convertTimestamp(data.assignedAt) : new Date(),
          } as Issue;
        });
        setIssues(issuesList);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIssues();
  }, []);


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
      <Tabs defaultValue="Home" className="w-full">
        <header className="bg-white border-b border-red-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg"></div>
                <h1 className="text-2xl font-bold text-gray-900">AmBank</h1>
              </div>

              <TabsList className="gap-4">
                <TabsTrigger value="Home" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>All Issues</span>
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center space-x-2">
                  <Kanban className="w-4 h-4" />
                  <span>Workflow Board</span>
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Issue
              </Button>
            </div>
          </div>
        </header>

        <main className="py-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center pt-50">
              <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-red-600"></div>
              <p className="mt-4 text-lg text-gray-700">Loading Issues...</p>
            </div>
          ) : (
            <>
            <TabsContent value="Home" className="px-4 sm:px-6 lg:px-8">
              <HomeDashboard issues={issues} onIssueClick={handleIssueClick}/>
            </TabsContent>

          <TabsContent value="table">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <IssueTable issues={issues} onIssueClick={handleIssueClick} />
            </div>
          </TabsContent>

          <TabsContent value="workflow">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
              <MergedDashboard
                issues={issues}
                onIssueClick={handleIssueClick}
                onUpdateIssue={handleUpdateIssue}
              />
            </div>
          </TabsContent>
            </>
          )}
        </main>
      </Tabs>

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
