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

  // Transform data for the chart
  const chartData = filteredIssues.map((issue) => ({
    id: issue.id,
    x: Number(issue.workingDays) || 0,
    y: Number(issue.impactedRecordTotal) || 0,
    z:
      ((Number(issue.impactedRecordTotal) || 0) *
        (Number(issue.workingDays) || 0)) /
      100,
    priority: issue.priority,
    description:
      issue.description?.substring(0, 50) +
      (issue.description?.length > 50 ? "..." : ""),
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
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">ID: {data.id}</p>
          <p>Priority: {data.priority}</p>
          <p>Working Days: {data.x}</p>
          <p>Impacted Records: {data.y}</p>
          <p>Description: {data.description}</p>
          <p>Effort Score: {(data.x * data.y).toLocaleString()}</p>
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
          <ZAxis type="number" dataKey="z" range={[100, 1000]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{
              top: -30,
              left: 0,
              position: "absolute",
            }}
          />
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
