"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserCircle } from "lucide-react"
import type { Issue } from "@/types/issue"
import { ChartPieInteractive } from "@/components/ui/chart-pie-interactive"
import { ChartConfig } from "@/components/ui/chart"
import { Top5Table } from "@/components/top5-table"
import { AgingPriorityBubble } from "./charts/aging-priority-bubble"
import { RcaSystemBar } from "./charts/rca-system-bar"
import { ImpactEffortBubble } from "./charts/impact-effort-bubble"
import { RecurringResolutionChart } from "./charts/recurring-resolution-chart"
import { PriorityHeatmap } from "./charts/priority-heatmap"

interface HomeDashboardProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function HomeDashboard({ issues, onIssueClick }: HomeDashboardProps) {
  const statusCounts = issues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1
    return acc
  }, {} as Record<Issue["status"], number>)

  const statusChartConfig: ChartConfig = {
    total: {
      label: "Total",
      color: "#000000",
    },
    new: {
      label: "New",
      color: "#3b82f6",
    },
    investigating: {
      label: "Investigating",
      color: "#3a7d1e",
    },
    resolving: {
      label: "Resolving",
      color: "#ed8f02",
    },
    monitoring: {
      label: "Monitoring",
      color: "#8728b0",
    },
    closed: {
      label: "Closed",
      color: "#b8b8b8",
    },
  }

  const statusChartData = Object.entries(statusCounts).map(([status, total]) => ({
    status,
    total,
    fill: statusChartConfig[status as keyof typeof statusChartConfig]?.color || `var(--chart-1)`,
  }))

  const now = new Date();
  const urgentFollowUps = issues
    .filter(issue => issue.status !== 'closed' && issue.deadline && issue.deadline > now && issue.dsPicUid)
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 9);

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

        {/* Follow-ups Sidebar */}
        <div className="xl:col-span-3">
          <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    Near Deadline Follow-ups
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    {urgentFollowUps.length} urgent items
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 lg:h-full overflow-y-auto">
              {urgentFollowUps.length > 0 ? (
                urgentFollowUps.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-xl p-4 border border-slate-100 cursor-pointer hover:border-red-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                    onClick={() => onIssueClick(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserCircle className="w-12 h-12 text-slate-400 group-hover:text-red-500 transition-colors" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {item.dsPicUid || 'N/A'}
                        </p>
                        <p className="text-sm text-slate-500 font-mono truncate">
                          {item.id}
                        </p>
                        <p className="text-xs text-red-600 font-medium">
                          Due: {item.deadline.toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <UserCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No urgent follow-ups</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-9 space-y-6 lg:space-y-8">

          {/* Top Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* Status Distribution */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-800">
                      Ticket Status Distribution
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Breakdown of tickets by current status
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartPieInteractive
                  id="issue-status"
                  data={statusChartData}
                  chartConfig={statusChartConfig}
                  title=""
                  description=""
                  dataKey="total"
                  nameKey="status"
                  unitLabel="Tickets"
                />
              </CardContent>
            </Card>

            {/* RCA by System */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-800">
                      Root Cause Analysis by System
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Systems with recurring types of issues may need process improvements
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <RcaSystemBar issues={issues} />
              </CardContent>
            </Card>
          </div>

          {/* Impact vs Effort Matrix */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    Impact vs. Effort Matrix
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Identifies quick wins (high impact, low effort) and major projects
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ImpactEffortBubble issues={issues} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top 5 Tables Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Priority Lists</h2>
          <p className="text-slate-600">Quick access to your most important issues</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="transform hover:scale-105 transition-transform duration-200">
            <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="deadline" />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-200">
            <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="priority" />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-200">
            <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="createdAt" />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-200">
            <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="agingDays" />
          </div>
        </div>
      </div>
    </div>
  )
}


// "use client"

// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { UserCircle } from "lucide-react"
// import type { Issue } from "@/types/issue"
// import { ChartPieInteractive } from "@/components/ui/chart-pie-interactive"
// import { ChartConfig } from "@/components/ui/chart"
// import { Top5Table } from "@/components/top5-table"
// import { AgingPriorityBubble } from "./charts/aging-priority-bubble"
// import { RcaSystemBar } from "./charts/rca-system-bar"
// import { ImpactEffortBubble } from "./charts/impact-effort-bubble"
// import { RecurringResolutionChart } from "./charts/recurring-resolution-chart"
// import { PriorityHeatmap } from "./charts/priority-heatmap"

// interface HomeDashboardProps {
//   issues: Issue[]
//   onIssueClick: (issue: Issue) => void
// }

// export function HomeDashboard({ issues, onIssueClick }: HomeDashboardProps) {
//   const statusCounts = issues.reduce((acc, issue) => {
//     acc[issue.status] = (acc[issue.status] || 0) + 1
//     return acc
//   }, {} as Record<Issue["status"], number>)

//   const statusChartConfig: ChartConfig = {
//     total: {
//       label: "Total",
//       color: "#000000",
//     },
//     new: {
//       label: "New",
//       color: "#3b82f6",
//     },
//     investigating: {
//       label: "Investigating",
//       color: "#3a7d1e",
//     },
//     resolving: {
//       label: "Resolving",
//       color: "#ed8f02",
//     },
//     monitoring: {
//       label: "Monitoring",
//       color: "#8728b0",
//     },
//     closed: {
//       label: "Closed",
//       color: "#b8b8b8",
//     },
//   }

//   const statusChartData = Object.entries(statusCounts).map(([status, total]) => ({
//     status,
//     total,
//     fill: statusChartConfig[status as keyof typeof statusChartConfig]?.color || `var(--chart-1)`,
//   }))

//   const now = new Date();
//   const urgentFollowUps = issues
//     .filter(issue => issue.status !== 'closed' && issue.deadline && issue.deadline > now && issue.dsPicUid)
//     .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
//     .slice(0, 6);

//   return (
//     <div className="grid grid-cols-1 gap-8">

//       <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,_250px)_1fr_1fr] gap-6">
//         {/* Left column (1 of 3 columns on md and above) */}
//         <div className="md:col-span-1 flex flex-col">
//           <Card className="flex-1">
//             <CardHeader>
//               <CardTitle className="lg:text-2xl">Near Deadline Follow-ups</CardTitle>
//             </CardHeader>
//             <CardContent className="flex flex-col justify-start items-center gap-4 pt-4 overflow-y-auto">
//               {urgentFollowUps.map((item) => (
//                 <div
//                   key={item.id}
//                   className="text-center cursor-pointer hover:bg-red-50 rounded-lg p-2 transition-colors w-full"
//                   onClick={() => onIssueClick(item)}
//                 >
//                   <UserCircle className="w-16 h-16 mx-auto text-gray-400" />
//                   <p className="font-semibold mt-2">{item.dsPicUid || 'N/A'}</p>
//                   <p className="text-sm text-red-600 font-mono">{item.id}</p>
//                   <p className="text-xs text-gray-500">
//                     Due: {item.deadline.toLocaleDateString("en-GB")}
//                   </p>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right column (2 of 3 columns on md and above) */}
//         <div className="md:col-span-2 flex flex-col gap-6">
//           {/* Top row with 2 cards side by side */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Ticket Status Distribution</CardTitle>
//                 <CardDescription>
//                   Breakdown of tickets by current status
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ChartPieInteractive
//                   id="issue-status"
//                   data={statusChartData}
//                   chartConfig={statusChartConfig}
//                   title=""
//                   description=""
//                   dataKey="total"
//                   nameKey="status"
//                   unitLabel="Tickets"
//                 />
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Root Cause Analysis by System</CardTitle>
//                 <CardDescription>
//                   Systems with recurring types of issues may need process improvements
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <RcaSystemBar issues={issues} />
//               </CardContent>
//             </Card>
//           </div>

//           {/* Bottom row full width */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Impact vs. Effort Matrix</CardTitle>
//               <CardDescription>
//                 Identifies quick wins (high impact, low effort) and major projects
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ImpactEffortBubble issues={issues} />
//             </CardContent>
//           </Card>
//         </div>
//       </div>


//       {/* Top 5 Tables */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="deadline" />
//         <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="priority" />
//         <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="createdAt" />
//         <Top5Table issues={issues} onIssueClick={onIssueClick} sortKey="agingDays" />
//       </div>
//     </div>
//   )
// }


