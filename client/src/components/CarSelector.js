import React from "react";
import { carData } from "./carData"; // Ensure this path is correct

function CarSelector({ onMakeChange, onModelChange, selectedMake, selectedModel }) {
  const makes = Object.keys(carData);
  const models = selectedMake ? carData[selectedMake] : [];

  return (
    <div className="car-selector">
      <div className="form-group">
        <label htmlFor="make">Make:</label>
        <select
          id="make"
          value={selectedMake}
          onChange={(e) => onMakeChange(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Make
          </option>
          {makes.map((make, index) => (
            <option key={index} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="model">Model:</label>
        <select
          id="model"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          required
          disabled={!selectedMake}
        >
          <option value="" disabled>
            {selectedMake ? "Select Model" : "Select Make First"}
          </option>
          {models.map((model, index) => (
            <option key={index} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default CarSelector;
