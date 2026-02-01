// EmissionsChart.tsx - Bar chart visualization for monthly carbon emissions data
import React from 'react';

interface EmissionData {
  month: string;
  emissions: number;
}

interface EmissionsChartProps {
  data: EmissionData[];
  title?: string;
}

const EmissionsChart: React.FC<EmissionsChartProps> = ({ data, title = "Monthly Carbon Emissions" }) => {
  const maxEmission = Math.max(...data.map(d => d.emissions));
  const chartHeight = 300;
  const barWidth = 40;
  const spacing = 20;

  return (
    <div className="emissions-chart">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-container" style={{ height: chartHeight + 60, overflowX: 'auto' }}>
        <svg 
          width={data.length * (barWidth + spacing) + spacing} 
          height={chartHeight + 60}
          style={{ minWidth: '100%' }}
        >
          {data.map((item, index) => {
            const barHeight = (item.emissions / maxEmission) * chartHeight;
            const x = index * (barWidth + spacing) + spacing;
            const y = chartHeight - barHeight + 20;

            return (
              <g key={item.month}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#4CAF50"
                  stroke="#45a049"
                  strokeWidth="1"
                />
                
                {/* Value label on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#333"
                  fontWeight="bold"
                >
                  {item.emissions.toFixed(1)}
                </text>
                
                {/* Month label below bar */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#666"
                  transform={`rotate(-45, ${x + barWidth / 2}, ${chartHeight + 35})`}
                >
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      <style jsx>{`
        .emissions-chart {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .chart-title {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }
        
        .chart-container {
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 10px;
          background: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default EmissionsChart;