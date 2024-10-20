import React, { useState, useEffect } from "react";
import "./ReservationForm.css"; // Import the CSS file

function ReservationForm({ spot, userID, onSuccess, onCancel }) {
  const [date, setDate] = useState("");
  const [startTimeOptions, setStartTimeOptions] = useState([]);
  const [endTimeOptions, setEndTimeOptions] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState([]);

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time) => {
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert hour to 12-hour format, handling midnight and noon
    return `${hour}:${minute} ${ampm}`;
  };

  // Function to generate time options
  const generateTimeOptions = () => {
    const now = new Date();
    let currentHour = now.getHours();
    let currentMinutes = Math.ceil(now.getMinutes() / 15) * 15; // Round up to the next 15 minutes

    if (currentMinutes === 60) {
      currentMinutes = 0;
      currentHour++;
    }

    const options = [];
    for (let hour = currentHour; hour < 24; hour++) {
      for (let minutes = currentMinutes; minutes < 60; minutes += 15) {
        const time = `${hour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        options.push(time);
      }
      currentMinutes = 0; // Reset minutes after the first iteration
    }
    return options;
  };

  // Set time options when date changes or page loads
  useEffect(() => {
    if (date) {
      const timeOptions = generateTimeOptions();
      setStartTimeOptions(timeOptions);
      setEndTimeOptions(timeOptions);
    }
  }, [date]);

  // Fetch unavailable times when date changes
  useEffect(() => {
    if (date) {
      fetch(
        `http://localhost:5000/available_times/${spot.spotID}?date=${date}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.unavailableSlots) {
            setUnavailableSlots(data.unavailableSlots);
          } else {
            setUnavailableSlots([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching unavailable times:", error);
        });
    } else {
      setUnavailableSlots([]);
    }
  }, [date, spot.spotID]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Combine date with times
    const formattedStartTime = `${date} ${startTime}`;
    const formattedEndTime = `${date} ${endTime}`;

    // Check if end time is after start time
    if (endTime <= startTime) {
      alert("End time must be after start time");
      return;
    }

    // Check for overlap with unavailable slots
    const reservationStart = parseInt(startTime.replace(":", ""), 10);
    const reservationEnd = parseInt(endTime.replace(":", ""), 10);
    for (const slot of unavailableSlots) {
      const slotStart = parseInt(slot.startTime.replace(":", ""), 10);
      const slotEnd = parseInt(slot.endTime.replace(":", ""), 10);
      if (
        (reservationStart >= slotStart && reservationStart < slotEnd) ||
        (reservationEnd > slotStart && reservationEnd <= slotEnd) ||
        (reservationStart <= slotStart && reservationEnd >= slotEnd)
      ) {
        alert("Selected time overlaps with an existing reservation");
        return;
      }
    }

    const data = {
      userID: userID,
      spotID: spot.spotID,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    };

    fetch("http://localhost:5000/reserve_spot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          alert("Reservation successful");
          // Reset the form
          setDate("");
          setStartTime("");
          setEndTime("");
          // Notify parent component
          onSuccess();
        } else {
          response.json().then((data) => {
            alert(data.message || "Failed to reserve spot");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred");
      });
  };

  // Disable past dates
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="reservation-container">
      <h2>Reserve Spot {spot.spotID}</h2>
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-group">
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setStartTime("");
              setEndTime("");
            }}
            min={today} // Disable past dates
            required
          />
        </div>
        {date && (
          <>
            <div className="form-group">
              <label htmlFor="startTime">Start Time:</label>
              <select
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select Start Time
                </option>
                {startTimeOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {convertTo12HourFormat(option)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time:</label>
              <select
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select End Time
                </option>
                {endTimeOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {convertTo12HourFormat(option)}
                  </option>
                ))}
              </select>
            </div>
            <div className="unavailable-times">
              <h3>Unavailable Times:</h3>
              {unavailableSlots.length > 0 ? (
                <ul>
                  {unavailableSlots.map((slot, index) => (
                    <li key={index}>
                      {convertTo12HourFormat(slot.startTime)} -{" "}
                      {convertTo12HourFormat(slot.endTime)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No reservations for this day.</p>
              )}
            </div>
            <button type="submit" className="btn-reserve">
              Reserve Spot
            </button>
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default ReservationForm;
