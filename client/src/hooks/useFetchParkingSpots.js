// hooks/useFetchParkingSpots.js
import { useState, useEffect } from "react";

const useFetchParkingSpots = () => {
  const [parkingSpots, setParkingSpots] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/parking_spots")
      .then((response) => response.json())
      .then(setParkingSpots)
      .catch((error) => console.error("Error fetching parking spots:", error));
  }, []);

  return parkingSpots;
};

export default useFetchParkingSpots;
