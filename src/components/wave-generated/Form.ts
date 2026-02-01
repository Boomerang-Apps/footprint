// Dashboard.tsx - Main dashboard component displaying carbon emissions overview
import React, { useState, useEffect } from 'react';
import EmissionsChart from './EmissionsChart';

interface EmissionsData {
  total: number;
  transportation: number;
  food: number;
  energy: number;
  monthlyData: { month: string; emissions: number }[];
  reductionGoal: number;
  currentProgress: number;
}

const Dashboard: React.FC = () => {
  const [emissionsData, setEmissionsData] = useState<EmissionsData>({
    total: 0,
    transportation: 0,
    food: 0,
    energy: 0,
    monthlyData: [],
    reductionGoal: 20, // 20% reduction goal
    currentProgress: 0
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: EmissionsData = {
      total: 12.5,
      transportation: 5.2,
      food: 3.8,
      energy: 3.5,
      monthlyData: [
        { month: 'Jan', emissions: 13.2 },
        { month: 'Feb', emissions: 12.8 },
        { month: 'Mar', emissions: 12.5 },
        { month: 'Apr', emissions: 11.9 },
        { month: 'May', emissions: 12.1 },
        { month: 'Jun', emissions: 12.5 }
      ],
      reductionGoal: 20,
      currentProgress: 8.5
    };
    setEmissionsData(mockData);
  }, []);

  const progressPercentage = (emissionsData.currentProgress / emissionsData.reductionGoal) * 100;

  return (
    <div className="dashboard">
      <h1>Carbon Footprint Dashboard</h1>
      
      {/* Total Emissions */}
      <div className="emissions-total">
        <h2>Total Monthly Emissions</h2>
        <div className="total-value">{emissionsData.total} tons CO₂</div>
      </div>

      {/* Emissions Breakdown */}
      <div className="emissions-breakdown">
        <h3>Breakdown by Category</h3>
        <div className="category-grid">
          <div className="category-item">
            <span>Transportation</span>
            <span>{emissionsData.transportation} tons CO₂</span>
          </div>
          <div className="category-item">
            <span>Food</span>
            <span>{emissionsData.food} tons CO₂</span>
          </div>
          <div className="category-item">
            <span>Energy</span>
            <span>{emissionsData.energy} tons CO₂</span>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="chart-container">
        <h3>Monthly Trend</h3>
        <EmissionsChart data={emissionsData.monthlyData} />
      </div>

      {/* Reduction Goal Progress */}
      <div className="reduction-progress">
        <h3>Reduction Goal Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <p>
          {emissionsData.currentProgress}% of {emissionsData.reductionGoal}% goal achieved
        </p>
      </div>
    </div>
  );
};

export default Dashboard;