import React, { useState } from "react";
import CarSelector from "./CarSelector";
import "./AddCarForm.css";

function AddCarForm({ userID, onCarAdded, onCancel }) {
  const [year, setYear] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState(""); // New state for color

  // List of common car colors
  const carColors = [
    "Black", "White", "Silver", "Gray", "Blue", "Red", "Brown", 
    "Green", "Yellow", "Orange", "Gold", "Beige", "Purple", 
    "Pink", "Maroon", "Teal"
  ];

  // Helper function to generate years from the current year back to 1920
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 1920; y--) {
      years.push(y);
    }
    return years;
  };

  const handleMakeChange = (selectedMake) => {
    setMake(selectedMake);
    setModel(""); // Reset model when make changes
  };

  const handleModelChange = (selectedModel) => {
    setModel(selectedModel);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!make || !model || !year || !licensePlate || !color) {
      alert("Please fill out all fields.");
      return;
    }

    const data = {
      userID: userID,
      make: make,
      model: model,
      color: color, // Include color in the data object
      year: parseInt(year, 10),
      licensePlate: licensePlate.trim(),
    };

    // Send request to add car
    fetch("http://localhost:5000/add_car", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return response.json().then((data) => {
          throw new Error(data.message || "Failed to add car");
        });
      })
      .then((data) => {
        alert(data.message);
        if (data.message === "Car added successfully") {
          // Reset form fields
          setYear("");
          setLicensePlate("");
          setMake("");
          setModel("");
          setColor(""); // Reset color field
          if (onCarAdded) onCarAdded();
        }
      })
      .catch((error) => {
        console.error("Error adding car:", error);
        alert(error.message || "An error occurred while adding the car.");
      });
  };

  return (
    <div className="add-car-form-container">
      <form className="add-car-form" onSubmit={handleSubmit}>
        <h2>Add a New Car</h2>
        
        {/* Make and Model Selection */}
        <CarSelector
          onMakeChange={handleMakeChange}
          onModelChange={handleModelChange}
          selectedMake={make}
          selectedModel={model}
        />

        {/* Year Selection */}
        <div className="form-group">
          <label htmlFor="year">Year:</label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Year
            </option>
            {generateYearOptions().map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Color Selection */}
        <div className="form-group">
          <label htmlFor="color">Color:</label>
          <select
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Color
            </option>
            {carColors.map((colorOption, index) => (
              <option key={index} value={colorOption}>
                {colorOption}
              </option>
            ))}
          </select>
        </div>

        {/* License Plate Input */}
        <div className="form-group">
          <label htmlFor="licensePlate">License Plate:</label>
          <input
            type="text"
            id="licensePlate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            required
          />
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button type="submit" className="btn-submit">
            Add Car
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCarForm;
