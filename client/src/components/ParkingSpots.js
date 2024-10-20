// ParkingSpots.js

import React from "react";
import "./ParkingSpots.css"; // Import the CSS file

function ParkingSpots({ parkingSpots, handleSpotClick }) {
  const getStatusLabel = (status) => {
    switch (status) {
      case "NoReservations":
        return "Available";
      case "QuarterReserved":
        return "25% Reserved";
      case "HalfReserved":
        return "50% Reserved";
      case "ThreeFourthsReserved":
        return "75% Reserved";
      case "FullyReserved":
        return "Fully Reserved";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="parking-container">
      <h2>Parking Spots</h2>
      <div className="parking-grid">
        {parkingSpots.map((spot) => (
          <div
            key={spot.spotID}
            onClick={() => handleSpotClick(spot)}
            className={`parking-spot ${spot.status.toLowerCase()}`}
          >
            <div>
              <div className="spot-id">{`Spot ${spot.spotID}`}</div>
              <div className="spot-status">{getStatusLabel(spot.status)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParkingSpots;
