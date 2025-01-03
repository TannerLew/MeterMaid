import React, { useState, useEffect } from "react";
import "./ReservationForm.css"; // Import the CSS file

// Function to create a Date object from a date string in 'YYYY-MM-DD' format in local time
function getDateFromDateString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function ReservationForm({
  spot,
  userID,
  onSuccess,
  onCancel,
  selectedDate,
  reservationsUpdated,
  activeReservationsCount, // Receive the prop
  userCars, // Receive user cars as prop
}) {
  const [startTimeOptions, setStartTimeOptions] = useState([]);
  const [endTimeOptions, setEndTimeOptions] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [selectedCarID, setSelectedCarID] = useState(""); // New state for selected car

  const convertTo12HourFormat = (time) => {
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  // Generate time options based on the selected date
  const generateTimeOptions = (selectedDate) => {
    const now = new Date();
    const selected = getDateFromDateString(selectedDate);
    // Check if the selected date is today
    const isToday = selected.toDateString() === now.toDateString();

    const options = [];
    let startHour = 0;
    let startMinute = 0;

    if (isToday) {
      // Set start time based on the current hour and minutes
      startHour = now.getHours();
      startMinute = Math.ceil(now.getMinutes() / 15) * 15;

      if (startMinute === 60) {
        startMinute = 0;
        startHour++;
      }
    }

    for (let hour = startHour; hour < 24; hour++) {
      for (
        let minutes = hour === startHour ? startMinute : 0;
        minutes < 60;
        minutes += 15
      ) {
        const time = `${hour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        options.push(time);
      }
    }

    return options;
  };

  // Set available time options for start and end times
  useEffect(() => {
    if (selectedDate) {
      const timeOptions = generateTimeOptions(selectedDate);
      setStartTimeOptions(timeOptions);
      setEndTimeOptions(timeOptions);
    }
  }, [selectedDate]);

  // Fetch unavailable times
  useEffect(() => {
    if (selectedDate && spot) {
      fetch(
        `http://localhost:5000/available_times/${spot.spotID}?date=${selectedDate}`
      )
        .then((response) => response.json())
        .then((data) => {
          setUnavailableSlots(data.unavailableSlots || []);
        })
        .catch((error) => {
          console.error("Error fetching unavailable times:", error);
        });
    } else {
      setUnavailableSlots([]);
    }
  }, [selectedDate, spot, reservationsUpdated]); // Include reservationsUpdated

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    if (activeReservationsCount >= 3) {
      alert("You cannot have more than 3 active reservations.");
      return;
    }

    if (!selectedCarID) {
      alert("Please select a car for the reservation.");
      return;
    }

    const formattedStartTime = `${selectedDate} ${startTime}`;
    const formattedEndTime = `${selectedDate} ${endTime}`;

    if (endTime <= startTime) {
      alert("End time must be after start time");
      return;
    }

    // Check for time overlap with unavailable slots
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

    // Prepare data for the reservation request
    const data = {
      userID: userID,
      spotID: spot.spotID,
      carID: selectedCarID, // Include selected car
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    };

    // Send reservation request to the backend
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
          setStartTime("");
          setEndTime("");
          setSelectedCarID(""); // Reset selected car
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

  // If user has reached maximum reservations
  if (activeReservationsCount >= 3) {
    return (
      <div className="reservation-container">
        <h2>Reserve Spot {spot.spotID}</h2>
        <p>You have reached the maximum of 3 active reservations.</p>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="reservation-container">
      <h2>Reserve Spot {spot.spotID}</h2>
      <form onSubmit={handleSubmit} className="reservation-form">
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

        {/* Car Selection Dropdown */}
        <div className="form-group">
          <label htmlFor="car">Select Car:</label>
          <select
            id="car"
            value={selectedCarID}
            onChange={(e) => setSelectedCarID(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Car
            </option>
            {userCars.map((car) => (
              <option key={car.carID} value={car.carID}>
                {car.year} {car.make} {car.model} - {car.licensePlate}
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
      </form>
    </div>
  );
}

export default ReservationForm;
