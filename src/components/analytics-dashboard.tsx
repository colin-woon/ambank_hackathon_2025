import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Issue } from "@/types/issue"
import { AgingPriorityBubble } from "./charts/aging-priority-bubble"
import { RcaSystemBar } from "./charts/rca-system-bar"
import { ImpactEffortBubble } from "./charts/impact-effort-bubble"
import { RecurringResolutionChart } from "./charts/recurring-resolution-chart"
import { PriorityHeatmap } from "./charts/priority-heatmap"

type AnalyticsDashboardProps = {
  issues: Issue[]
}

export function AnalyticsDashboard({ issues }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aging Days vs. Priority</CardTitle>
            <CardDescription>
              High-priority issues that have aged significantly need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgingPriorityBubble issues={issues} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Root Cause Analysis by System</CardTitle>
            <CardDescription>
              Systems with recurring types of issues may need process improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RcaSystemBar issues={issues} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Impact vs. Effort Matrix</CardTitle>
            <CardDescription>
              Identifies quick wins (high impact, low effort) and major projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImpactEffortBubble issues={issues} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recurring Issues Resolution</CardTitle>
            <CardDescription>
              How effectively we're addressing recurring vs. one-time issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecurringResolutionChart issues={issues} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI vs. Human Priority Comparison</CardTitle>
            <CardDescription>
              Highlights discrepancies between AI-suggested and human-assigned priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PriorityHeatmap issues={issues} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
