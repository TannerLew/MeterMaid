// components/ReservationForm/UnavailableTimes.js
import React from "react";

const UnavailableTimes = ({ unavailableSlots }) => {
  // Function to convert 24-hour time to 12-hour format with AM/PM
  const convertTo12Hour = (time) => {
    const [hour, minute] = time.split(":");
    let hourInt = parseInt(hour, 10);
    const period = hourInt >= 12 ? "PM" : "AM";
    if (hourInt > 12) hourInt -= 12;
    if (hourInt === 0) hourInt = 12;
    const hourStr = String(hourInt).padStart(2, "0");
    return `${hourStr}:${minute} ${period}`;
  };

  if (unavailableSlots.length === 0) {
    return null;
  }

  return (
    <div>
      <h4>Unavailable Times:</h4>
      <ul>
        {unavailableSlots.map((slot, index) => (
          <li key={index}>
            {convertTo12Hour(slot.startTime)} - {convertTo12Hour(slot.endTime)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnavailableTimes;
