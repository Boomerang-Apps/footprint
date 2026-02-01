// Dashboard.tsx - Main dashboard component with carbon emissions overview and analytics
import React from 'react';

interface EmissionData {
  transport: number;
  food: number;
  energy: number;
}

interface MonthlyData {
  month: string;
  emissions: number;
}

interface DashboardProps {
  totalEmissions?: number;
  categoryData?: EmissionData;
  monthlyTrend?: MonthlyData[];
  reductionGoal?: number;
  currentProgress?: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  totalEmissions = 2450,
  categoryData = { transport: 980, food: 720, energy: 750 },
  monthlyTrend = [
    { month: 'Jan', emissions: 2100 },
    { month: 'Feb', emissions: 2300 },
    { month: 'Mar', emissions: 2200 },
    { month: 'Apr', emissions: 2450 },
  ],
  reductionGoal = 20,
  currentProgress = 12,
}) => {
  const progressPercentage = (currentProgress / reductionGoal) * 100;

  return (
    <div className="dashboard-container p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Carbon Footprint Dashboard</h1>
      
      {/* Total Emissions Display */}
      <div className="total-emissions bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Carbon Emissions</h2>
        <div className="text-4xl font-bold text-blue-600">
          {totalEmissions.toLocaleString()} kg CO₂
        </div>
        <p className="text-gray-500 mt-2">This month</p>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Emissions by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="category-item text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{categoryData.transport} kg</div>
            <div className="text-gray-600">Transport</div>
          </div>
          <div className="category-item text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{categoryData.food} kg</div>
            <div className="text-gray-600">Food</div>
          </div>
          <div className="category-item text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{categoryData.energy} kg</div>
            <div className="text-gray-600">Energy</div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="monthly-trend bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Trend</h2>
        <div className="flex items-end space-x-4 h-40">
          {monthlyTrend.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 w-full rounded-t"
                style={{
                  height: `${(data.emissions / Math.max(...monthlyTrend.map(d => d.emissions))) * 100}%`,
                  minHeight: '20px',
                }}
              ></div>
              <div className="text-sm text-gray-600 mt-2">{data.month}</div>
              <div className="text-xs text-gray-500">{data.emissions}kg</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reduction Goal Progress */}
      <div className="reduction-goal bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Reduction Goal Progress</h2>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Current Progress: {currentProgress}%</span>
            <span>Goal: {reductionGoal}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {progressPercentage >= 100 ? 'Goal achieved!' : `${(reductionGoal - currentProgress).toFixed(1)}% remaining to reach your goal`}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;