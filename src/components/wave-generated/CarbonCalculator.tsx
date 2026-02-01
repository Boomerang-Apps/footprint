// CarbonCalculator.tsx - Carbon footprint calculator with transport, food, and energy inputs
import React, { useState } from 'react';

interface CarbonData {
  transport: number;
  food: number;
  energy: number;
}

const CarbonCalculator: React.FC = () => {
  const [carbonData, setCarbonData] = useState<CarbonData>({
    transport: 0,
    food: 0,
    energy: 0
  });

  const handleInputChange = (category: keyof CarbonData, value: string) => {
    const numericValue = Math.max(0, parseFloat(value) || 0);
    setCarbonData(prev => ({
      ...prev,
      [category]: numericValue
    }));
  };

  const totalCarbon = carbonData.transport + carbonData.food + carbonData.energy;

  return (
    <div className="carbon-calculator">
      <h2>Carbon Footprint Calculator</h2>
      
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="transport">Transport (kg CO2/month)</label>
          <input
            id="transport"
            type="number"
            min="0"
            step="0.1"
            value={carbonData.transport || ''}
            onChange={(e) => handleInputChange('transport', e.target.value)}
            placeholder="Enter transport emissions"
          />
        </div>

        <div className="input-group">
          <label htmlFor="food">Food (kg CO2/month)</label>
          <input
            id="food"
            type="number"
            min="0"
            step="0.1"
            value={carbonData.food || ''}
            onChange={(e) => handleInputChange('food', e.target.value)}
            placeholder="Enter food emissions"
          />
        </div>

        <div className="input-group">
          <label htmlFor="energy">Energy (kg CO2/month)</label>
          <input
            id="energy"
            type="number"
            min="0"
            step="0.1"
            value={carbonData.energy || ''}
            onChange={(e) => handleInputChange('energy', e.target.value)}
            placeholder="Enter energy emissions"
          />
        </div>
      </div>

      <div className="results-section">
        <h3>Total Carbon Footprint</h3>
        <div className="total-emissions">
          {totalCarbon.toFixed(2)} kg CO2/month
        </div>
        <div className="annual-emissions">
          {(totalCarbon * 12).toFixed(2)} kg CO2/year
        </div>
      </div>
    </div>
  );
};

export default CarbonCalculator;