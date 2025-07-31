"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { Issue } from "@/types/issue";

type ImpactEffortProps = {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
};

export const ImpactEffortBubble = ({ issues, onIssueClick }: ImpactEffortProps) => {
  // Filter valid issues with both impacted records and working days
  const filteredIssues = issues.filter(
    (issue) =>
      issue.impactedRecordTotal !== undefined &&
      issue.workingDays !== undefined &&
      issue.impactedRecordTotal !== null &&
      issue.workingDays !== null
  );

const getEnhancementSize = (issue: Issue) => {
  const cleaned = Number(issue.percentTotal) || 0;
  const process = issue.processImprovement === "yes" ? 100 : 0;
  const system = issue.systemEnhancement === "yes" ? 100 : 0;

  const totalPossible = 100 + (process ? 100 : 0) + (system ? 100 : 0);
  const actualTotal = cleaned + process + system;

  const percentScore = (actualTotal / totalPossible) * 100;

  // Convert percentage to visual size between 150–800
  const minSize = 150;
  const maxSize = 800;
  return minSize + (percentScore / 100) * (maxSize - minSize);
};


  // Transform data for the chart
  const chartData = filteredIssues.map((issue) => ({
    id: issue.id,
    x: Number(issue.workingDays) || 0,
    y: Number(issue.impactedRecordTotal) || 0,
    z: getEnhancementSize(issue), // Use enhancement score for bubble size
    priority: issue.priority,
    description:
      issue.description?.substring(0, 50) +
      (issue.description?.length > 50 ? "..." : ""),
    percentTotal: issue.percentTotal || 0,
    processImprovement: issue.processImprovement,
    systemEnhancement: issue.systemEnhancement,
  }));

  // Priority to color mapping
  const priorityColors = {
    "Super High": "#ff0000",
    High: "#ff8042",
    Medium: "#ffbb28",
    Low: "#82ca9d",
    "N/A": "#8884d8",
  };

  // Calculate average values for reference lines
  const avgEffort =
    chartData.reduce((sum, item) => sum + item.x, 0) / chartData.length || 0;
  const avgImpact =
    chartData.reduce((sum, item) => sum + item.y, 0) / chartData.length || 0;

  // Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    const cleaned = Number(data.percentageTotal) || 0;
    const process = data.processImprovement === "yes" ? 100 : 0;
    const system = data.systemEnhancement === "yes" ? 100 : 0;

    const totalPossible = 100 + (process ? 100 : 0) + (system ? 100 : 0);
    const actualTotal = cleaned + process + system;
    const enhancementPercentage = Math.round((actualTotal / totalPossible) * 100);

    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md max-w-xs text-sm space-y-1">
        <p className="font-medium text-base text-gray-900">ID: {data.id}</p>
        <p><strong>Priority:</strong> {data.priority}</p>
        <p><strong>Effort (Working Days):</strong> {data.x}</p>
        <p><strong>Impact (Records Affected):</strong> {data.y}</p>
        <p><strong>Cleaned Data:</strong> {cleaned}%</p>
        <p><strong>Process Improvement:</strong> {process ? "Yes" : "No"}</p>
        <p><strong>System Enhancement:</strong> {system ? "Yes" : "No"}</p>
        <p className="pt-1 text-gray-700"><strong>Description:</strong> {data.description}</p>
      </div>
    );
  }
  return null;
};

  return (
    <div className="w-full h-[400px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 70, left: 20 }}>
          <CartesianGrid stroke="#ccc" strokeWidth={2} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Working Days (Effort)"
            label={{
              value: "Working Days (Effort)",
              position: "bottom",
              offset: 30,
              dy: 0,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Impacted Records (Impact)"
            label={{
              value: "Impacted Records (Impact)",
              angle: -90,
              position: "middle",
              dx: -30,
              dy: 0,
            }}
          />
          <ZAxis type="number" dataKey="z" range={[150, 800]} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={avgEffort}
            stroke="blue"
            strokeDasharray="5 7"
            strokeWidth={3}
            strokeOpacity={0.6}
          />
          <ReferenceLine
            y={avgImpact}
            stroke="blue"
            strokeDasharray="5 7"
            strokeWidth={3}
            strokeOpacity={0.6}
          />

          {/* Quadrant labels */}
          <text x="75%" y="10%" dy={-20} textAnchor="middle" fill="blue">
            Major Projects
          </text>
          <text x="30%" y="10%" dy={-20} textAnchor="middle" fill="blue">
            Quick Wins
          </text>
          <text x="75%" y="90%" dy={-20} textAnchor="middle" fill="blue">
            Fill-in Tasks
          </text>
          <text x="30%" y="90%" dy={-20} textAnchor="middle" fill="blue">
            Thankless Tasks
          </text>

          <Scatter name="Issues" data={chartData} fill="#8884d8">
            {chartData.map((entry, index) => {
              const fullIssue = issues.find((i) => i.id === entry.id);
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    priorityColors[
                      entry.priority as keyof typeof priorityColors
                    ] || "#8884d8"
                  }
                  onClick={() => fullIssue && onIssueClick(fullIssue)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
