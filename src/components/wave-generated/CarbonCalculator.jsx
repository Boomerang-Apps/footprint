// Simple CarbonCalculator component that calculates CO2 emissions based on miles driven
import React, { useState } from 'react';

const CarbonCalculator = () => {
  const [milesDriven, setMilesDriven] = useState('');
  const [co2Emissions, setCo2Emissions] = useState(null);

  // Average CO2 emissions per mile for a typical car (in pounds)
  const CO2_PER_MILE = 0.89;

  const calculateEmissions = (e) => {
    e.preventDefault();
    
    const miles = parseFloat(milesDriven);
    
    if (isNaN(miles) || miles < 0) {
      setCo2Emissions(null);
      return;
    }
    
    const emissions = miles * CO2_PER_MILE;
    setCo2Emissions(emissions.toFixed(2));
  };

  const handleInputChange = (e) => {
    setMilesDriven(e.target.value);
  };

  return (
    <div className="carbon-calculator">
      <h2>Carbon Footprint Calculator</h2>
      
      <form onSubmit={calculateEmissions}>
        <div className="form-group">
          <label htmlFor="miles">Miles Driven:</label>
          <input
            type="number"
            id="miles"
            value={milesDriven}
            onChange={handleInputChange}
            placeholder="Enter miles driven"
            min="0"
            step="0.1"
          />
        </div>
        
        <button type="submit">Calculate CO2 Emissions</button>
      </form>
      
      {co2Emissions !== null && (
        <div className="results">
          <h3>Results:</h3>
          <p>
            <strong>{milesDriven} miles</strong> driven produces approximately{' '}
            <strong>{co2Emissions} pounds</strong> of CO2 emissions.
          </p>
        </div>
      )}
    </div>
  );
};

export default CarbonCalculator;