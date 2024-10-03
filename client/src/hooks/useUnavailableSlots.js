// hooks/useUnavailableSlots.js
import { useState, useEffect } from "react";

const useUnavailableSlots = (spotID, date) => {
  const [unavailableSlots, setUnavailableSlots] = useState([]);

  useEffect(() => {
    if (date) {
      fetch(`http://localhost:5000/available_times/${spotID}?date=${date}`)
        .then((response) => response.json())
        .then((data) => setUnavailableSlots(data.unavailableSlots))
        .catch((error) =>
          console.error("Error fetching unavailable times:", error)
        );
    }
  }, [spotID, date]);

  return unavailableSlots;
};

export default useUnavailableSlots;
