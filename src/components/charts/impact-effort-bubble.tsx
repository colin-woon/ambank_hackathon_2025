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
  const filteredIssues = issues.filter(
    (issue) =>
      issue.impactedRecordTotal !== undefined &&
      issue.workingDays !== undefined &&
      issue.impactedRecordTotal !== null &&
      issue.workingDays !== null
  );

  const getEnhancementSize = (issue: Issue) => {
    const cleansed = Number(issue.percentCleansed) || 0;
    const system = issue.systemEnhancement === "yes" ? Number(issue.systemEnhancementScore) || 0 : 0;
    const process = issue.processImprovement === "yes" ? Number(issue.processImprovementScore) || 0 : 0;

    const actualTotal = cleansed + system + process;
    const totalPossible = 100 +
      (issue.systemEnhancement === "yes" ? 100 : 0) +
      (issue.processImprovement === "yes" ? 100 : 0);

    const ratio = totalPossible > 0 ? actualTotal / totalPossible : 0;

    const minSize = 100;
    const maxSize = 600;
    const size = minSize + ratio * (maxSize - minSize);

    return Math.max(minSize, Math.min(size, maxSize));
  };

  const chartData = filteredIssues.map((issue) => ({
    id: issue.id,
    x: Number(issue.workingDays) || 0,
    y: Number(issue.impactedRecordTotal) || 0,
    z: getEnhancementSize(issue),
    priority: issue.priority,
    description:
      issue.description?.substring(0, 50) +
      (issue.description?.length > 50 ? "..." : ""),
    percentCleansed: issue.percentCleansed ?? 0,
    processImprovementScore: issue.processImprovementScore || 0,
    systemEnhancementScore: issue.systemEnhancementScore || 0,
  }));

  const priorityColors = {
    "Super High": "#ff0000",
    High: "#ff8042",
    Medium: "#ffbb28",
    Low: "#82ca9d",
    "N/A": "#8884d8",
  };

  const avgEffort = chartData.reduce((sum, item) => sum + item.x, 0) / chartData.length || 0;
  const avgImpact = chartData.reduce((sum, item) => sum + item.y, 0) / chartData.length || 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      const process = Number(data.processImprovementScore) || 0;
      const system = Number(data.systemEnhancementScore) || 0;
      const cleansed = Number(data.percentCleansed) ?? 0;

      const actualTotal = cleansed + process + system;
      const totalPossible = 100 +
        (data.systemEnhancementScore ? 100 : 0) +
        (data.processImprovementScore ? 100 : 0);

      const rawPercentage = (actualTotal / totalPossible) * 100;
      const displayPercentage = rawPercentage === 100 ? 100 : Math.floor(rawPercentage);

      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md max-w-xs text-sm space-y-1">
          <p className="font-medium text-base text-gray-900">🆔 ID: <span className="font-mono">{data.id}</span></p>
          <p><strong>Priority:</strong> {data.priority}</p>
          <p><strong>Effort:</strong> {data.x} working days</p>
          <p><strong>Impact:</strong> {data.y.toLocaleString()} records</p>
          <p><strong>Work Done:</strong> {displayPercentage}%</p>
          <p><strong>Breakdown:</strong></p>

          <ul className="pl-4 list-disc text-gray-600">
            <li>Cleansed: {Math.floor(cleansed)}%</li>
            <li>System Enhancement: {Math.floor(system)}%</li>
            <li>Process Improvement: {Math.floor(process)}%</li>
          </ul>
          <p className="text-gray-500 italic">
            Bubble size ∝ (Work Done)
          </p>
          <div className="border-t pt-2 mt-2 text-gray-700">
            <p><strong>Description:</strong></p>
            <p className="text-gray-600 italic">{data.description}</p>
          </div>
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
          <ZAxis type="number" dataKey="z" range={[100, 600]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ top: -30, left: 0, position: "absolute" }} />
          <ReferenceLine x={avgEffort} stroke="blue" strokeDasharray="5 7" strokeWidth={3} strokeOpacity={0.6} />
          <ReferenceLine y={avgImpact} stroke="blue" strokeDasharray="5 7" strokeWidth={3} strokeOpacity={0.6} />

          {/* Quadrant labels */}
          <text x="75%" y="10%" dy={-20} textAnchor="middle" fill="blue">Major Projects</text>
          <text x="30%" y="10%" dy={-20} textAnchor="middle" fill="blue">Quick Wins</text>
          <text x="75%" y="90%" dy={-20} textAnchor="middle" fill="blue">Fill-in Tasks</text>
          <text x="30%" y="90%" dy={-20} textAnchor="middle" fill="blue">Thankless Tasks</text>

          <Scatter name="Issues" data={chartData} fill="#8884d8">
            {chartData.map((entry, index) => {
              const fullIssue = issues.find((i) => i.id === entry.id);
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={priorityColors[entry.priority as keyof typeof priorityColors] || "#8884d8"}
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
