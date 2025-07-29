import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Issue } from '@/types/issue';

type RecurringResolutionProps = {
  issues: Issue[];
};

export const RecurringResolutionChart = ({ issues }: RecurringResolutionProps) => {
  // Filter and categorize issues
  const recurringIssues = issues.filter(issue => issue.isRecurring === "Yes");
  const nonRecurringIssues = issues.filter(issue => issue.isRecurring === "No");
  
  // Helper function to categorize resolution type
  const categorizeResolution = (issue: Issue) => {
    if (issue.systemEnhancement === "yes") return "System Enhancement";
    if (issue.processImprovement === "yes") return "Process Improvement";
    return "No Action";
  };
  
  // Count types for recurring issues
  const recurringData = [
    { name: 'System Enhancement', value: recurringIssues.filter(i => i.systemEnhancement === "yes").length },
    { name: 'Process Improvement', value: recurringIssues.filter(i => i.processImprovement === "yes").length },
    { name: 'No Action', value: recurringIssues.filter(i => i.systemEnhancement !== "yes" && i.processImprovement !== "yes").length }
  ].filter(item => item.value > 0);
  
  // Count types for non-recurring issues
  const nonRecurringData = [
    { name: 'System Enhancement', value: nonRecurringIssues.filter(i => i.systemEnhancement === "yes").length },
    { name: 'Process Improvement', value: nonRecurringIssues.filter(i => i.processImprovement === "yes").length },
    { name: 'No Action', value: nonRecurringIssues.filter(i => i.systemEnhancement !== "yes" && i.processImprovement !== "yes").length }
  ].filter(item => item.value > 0);
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p>{`Percentage: ${((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Add total to each dataset for percentage calculation in tooltip
  recurringData.forEach(item => {
    (item as any).total = recurringData.reduce((sum, entry) => sum + entry.value, 0);
  });
  
  nonRecurringData.forEach(item => {
    (item as any).total = nonRecurringData.reduce((sum, entry) => sum + entry.value, 0);
  });

  return (
    <div className="w-full h-[450px] flex flex-col">
      <div className="flex justify-between w-full h-[400px]">
        <div className="w-1/2 h-full">
          <h3 className="text-center font-medium mb-2">Recurring Issues</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={recurringData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {recurringData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-1/2 h-full">
          <h3 className="text-center font-medium mb-2">Non-Recurring Issues</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={nonRecurringData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {nonRecurringData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <div className="flex items-center mr-6">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: COLORS[0] }}></div>
          <span>System Enhancement</span>
        </div>
        <div className="flex items-center mr-6">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: COLORS[1] }}></div>
          <span>Process Improvement</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: COLORS[2] }}></div>
          <span>No Action</span>
        </div>
      </div>
    </div>
  );
};
