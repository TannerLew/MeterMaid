import React from "react";

function ParkingSpots({ parkingSpots, handleSpotClick }) {
  const getColor = (status) => {
    switch (status) {
      case "NoReservations":
        return "green";
      case "QuarterReserved":
        return "yellow";
      case "HalfReserved":
        return "orange";
      case "ThreeFourthsReserved":
        return "orangered";
      case "FullyReserved":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div>
      <h2>Parking Spots</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {parkingSpots.map((spot) => (
          <div
            key={spot.spotID}
            onClick={() => handleSpotClick(spot)}
            style={{
              width: "100px",
              height: "100px",
              margin: "10px",
              backgroundColor: getColor(spot.status),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <div>
              <div>{`Spot ${spot.spotID}`}</div>
              <div>{spot.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParkingSpots;
