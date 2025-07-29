import { useState, useEffect } from 'react';
import type { Issue } from '@/types/issue';

type PriorityHeatmapProps = {
  issues: Issue[];
};

export const PriorityHeatmap = ({ issues }: PriorityHeatmapProps) => {
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const priorities = ["Super High", "High", "Medium", "Low", "N/A"];
  
  useEffect(() => {
    // Filter issues that have AI suggestions
    const issuesWithAI = issues.filter(issue => 
      issue.aiSuggestions?.suggestedPriority && issue.priority
    );
    
    // Initialize matrix with zeros
    const matrix: number[][] = Array(5).fill(0).map(() => Array(5).fill(0));
    
    // Count occurrences for each combination
    issuesWithAI.forEach(issue => {
      const humanIndex = priorities.indexOf(issue.priority);
      const aiIndex = priorities.indexOf(issue.aiSuggestions?.suggestedPriority || "N/A");
      
      if (humanIndex !== -1 && aiIndex !== -1) {
        matrix[humanIndex][aiIndex]++;
      }
    });
    
    setHeatmapData(matrix);
  }, [issues]);

  // Find max value for color scaling
  const maxValue = Math.max(...heatmapData.flat());
  
  // Color scale function
  const getColor = (value: number) => {
    const intensity = maxValue > 0 ? value / maxValue : 0;
    return `rgba(255, 0, 0, ${intensity * 0.8})`;
  };

  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <div className="font-medium mb-1">Human vs. AI Priority Comparison</div>
        <div className="text-sm text-gray-500">The diagonal shows agreement between human and AI</div>
      </div>
      
      <div className="grid grid-cols-6 w-full max-w-md">
        {/* Header row */}
        <div className="col-span-1"></div>
        {priorities.map((priority, index) => (
          <div key={`header-${index}`} className="font-medium text-center text-xs">
            {priority}
          </div>
        ))}
        
        {/* Data rows */}
        {heatmapData.map((row, rowIndex) => (
          <>
            {/* Row label */}
            <div key={`label-${rowIndex}`} className="font-medium text-right pr-2 text-xs">
              {priorities[rowIndex]}
            </div>
            
            {/* Data cells */}
            {row.map((value, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="border border-gray-200 flex items-center justify-center h-12"
                style={{ 
                  backgroundColor: getColor(value),
                  outline: rowIndex === colIndex ? '2px solid blue' : 'none'
                }}
              >
                {value}
              </div>
            ))}
          </>
        ))}
      </div>
      
      <div className="mt-4 text-sm">
        <div>Rows: Human-assigned priority</div>
        <div>Columns: AI-suggested priority</div>
      </div>
    </div>
  );
};
