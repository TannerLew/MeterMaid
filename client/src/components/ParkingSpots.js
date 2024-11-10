import React from "react";
import "./ParkingSpots.css"; // Import the CSS file

function ParkingSpots({ parkingSpots, handleSpotClick }) {
  // Determine the CSS class based on fullness percentage
  const getClassByFullness = (fullnessPercentage) => {
    if (fullnessPercentage === 0) return "reservations-0";
    if (fullnessPercentage <= 10) return "reservations-10";
    if (fullnessPercentage <= 20) return "reservations-20";
    if (fullnessPercentage <= 30) return "reservations-30";
    if (fullnessPercentage <= 40) return "reservations-40";
    if (fullnessPercentage <= 50) return "reservations-50";
    if (fullnessPercentage <= 60) return "reservations-60";
    if (fullnessPercentage <= 70) return "reservations-70";
    if (fullnessPercentage <= 80) return "reservations-80";
    if (fullnessPercentage <= 90) return "reservations-90";
    return "reservations-100";
  };

  return (
    <div className="parking-container">
      <h2>Parking Spots</h2>
      <div className="parking-grid">
        {parkingSpots.map((spot) => {
          const hoursReserved = spot.hoursReserved || 0;
          const totalHours = spot.totalHours || 24; // Assume a 24-hour day if totalHours is missing
          const fullnessPercentage = totalHours ? (hoursReserved / totalHours) * 100 : 0;

          return (
            <div
              key={spot.spotID}
              onClick={() => handleSpotClick(spot)}
              className={`parking-spot ${getClassByFullness(fullnessPercentage)}`}
            >
              <div>
                <div className="spot-id">{`Spot ${spot.spotID}`}</div>
                <div className="spot-status">
                  {`${Math.round(fullnessPercentage)}% Reserved`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParkingSpots;
