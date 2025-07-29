import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Issue } from '@/types/issue';

type RcaSystemProps = {
  issues: Issue[];
};

export const RcaSystemBar = ({ issues }: RcaSystemProps) => {
  // Get unique RCA categories
  const rcaCategories = Array.from(new Set(issues
    .filter(issue => issue.rcaCategory)
    .map(issue => issue.rcaCategory))) as string[];
  
  // Get unique source systems
  const sourceSystems = Array.from(new Set(issues
    .filter(issue => issue.sourceSystem)
    .map(issue => issue.sourceSystem)));
  
  // Prepare data for chart
  const data = sourceSystems.map(system => {
    const systemIssues = issues.filter(issue => issue.sourceSystem === system);
    
    const result: Record<string, any> = {
      sourceSystem: system
    };
    
    // Count occurrences of each RCA category for this system
    rcaCategories.forEach(category => {
      result[category] = systemIssues.filter(issue => issue.rcaCategory === category).length;
    });
    
    return result;
  });
  
  // Define colors for RCA categories
  const colors = {
    'System': '#8884d8',
    'Process': '#82ca9d',
    'People': '#ffc658',
    'Unknown': '#ff8042'
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`Source System: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} issues`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="sourceSystem" 
            label={{ value: 'Source System', position: 'bottom', offset: 0 }} 
          />
          <YAxis label={{ value: 'Issue Count', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 10 }} />
          {rcaCategories.map((category, index) => (
            <Bar 
              key={index} 
              dataKey={category} 
              stackId="a"
              fill={colors[category as keyof typeof colors] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
