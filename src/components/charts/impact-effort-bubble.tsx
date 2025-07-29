import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
         Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import type { Issue } from '@/types/issue';

type ImpactEffortProps = {
  issues: Issue[];
};

export const ImpactEffortBubble = ({ issues }: ImpactEffortProps) => {
  // Filter valid issues with both impacted records and working days
  const filteredIssues = issues.filter(
    issue => issue.impactedRecordTotal && issue.workingDays
  );
  
  // Transform data for the chart
  const chartData = filteredIssues.map(issue => ({
    id: issue.id,
    x: issue.workingDays || 0,  // Effort
    y: issue.impactedRecordTotal || 0,  // Impact
    z: (issue.impactedRecordTotal || 0) * (issue.workingDays || 0) / 100,  // Bubble size based on effort score
    priority: issue.priority,
    description: issue.description?.substring(0, 50) + (issue.description?.length > 50 ? '...' : '')
  }));
  
  // Priority to color mapping
  const priorityColors = {
    "Super High": "#ff0000",
    "High": "#ff8042",
    "Medium": "#ffbb28",
    "Low": "#82ca9d",
    "N/A": "#8884d8"
  };
  
  // Calculate average values for reference lines
  const avgEffort = chartData.reduce((sum, item) => sum + item.x, 0) / chartData.length || 0;
  const avgImpact = chartData.reduce((sum, item) => sum + item.y, 0) / chartData.length || 0;
  
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
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Working Days (Effort)" 
            label={{ value: 'Working Days (Effort)', position: 'bottom', offset: 0 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Impacted Records (Impact)" 
            label={{ value: 'Impacted Records (Impact)', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis type="number" dataKey="z" range={[100, 1000]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine x={avgEffort} stroke="gray" strokeDasharray="3 3" />
          <ReferenceLine y={avgImpact} stroke="gray" strokeDasharray="3 3" />
          
          {/* Add quadrant labels */}
          <text x="75%" y="25%" dy={-20} textAnchor="middle" fill="#666">
            Major Projects
          </text>
          <text x="25%" y="25%" dy={-20} textAnchor="middle" fill="#666">
            Quick Wins
          </text>
          <text x="75%" y="75%" dy={-20} textAnchor="middle" fill="#666">
            Fill-in Tasks
          </text>
          <text x="25%" y="75%" dy={-20} textAnchor="middle" fill="#666">
            Thankless Tasks
          </text>
          
          <Scatter
            name="Issues"
            data={chartData}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={priorityColors[entry.priority as keyof typeof priorityColors] || "#8884d8"}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
