import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, 
         ResponsiveContainer, Cell } from 'recharts';
import type { Issue } from '@/types/issue';

type AgingPriorityProps = {
  issues: Issue[];
};

export const AgingPriorityBubble = ({ issues }: AgingPriorityProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  
  // Transform data for the chart
  const priorityValues = {
    "Super High": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1,
    "N/A": 0
  };
  
  // Group by DQ PIC
  const picGroups = issues
    .filter(issue => issue.agingDays && issue.priority)
    .reduce((acc, issue) => {
      const picId = issue.dqPicUid || 'Unassigned';
      if (!acc[picId]) {
        acc[picId] = [];
      }
      acc[picId].push({
        id: issue.id,
        x: issue.agingDays || 0,
        y: priorityValues[issue.priority] || 0,
        z: 1000, // Bubble size
        requesterName: issue.requesterName,
        priority: issue.priority
      });
      return acc;
    }, {} as Record<string, any[]>);
    
  // Colors for different PICs
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">ID: {data.id}</p>
          <p>Priority: {data.priority}</p>
          <p>Aging Days: {data.x}</p>
          <p>Requester: {data.requesterName}</p>
        </div>
      );
    }
    return null;
  };
  
  const renderScatters = () => {
    return Object.entries(picGroups).map(([picId, data], index) => {
      return (
        <Scatter
          key={picId}
          name={picId}
          data={data}
          fill={COLORS[index % COLORS.length]}
        />
      );
    });
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
        >
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Aging Days" 
            label={{ value: 'Aging Days', position: 'bottom', offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Priority"
            domain={[0, 4]}
            tickFormatter={(value) => {
              const priorityLabels = {
                0: 'N/A',
                1: 'Low',
                2: 'Medium',
                3: 'High',
                4: 'Super High'
              };
              return priorityLabels[value as keyof typeof priorityLabels] || '';
            }}
            label={{ value: 'Priority', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis range={[100, 400]} dataKey="z" />
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          {renderScatters()}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
