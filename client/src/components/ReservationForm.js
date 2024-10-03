// components/ReservationForm/ReservationForm.js
import React, { useState } from "react";
import UserSelector from "./UserSelector";
import DateSelector from "./DateSelector";
import TimeSelector from "./TimeSelector";
import UnavailableTimes from "./UnavailableTimes";
import useUnavailableSlots from "../hooks/useUnavailableSlots";

function ReservationForm({ spot, users, onSuccess, onCancel }) {
  const [reservationData, setReservationData] = useState({
    userID: "",
    date: new Date().toISOString().split("T")[0], // Today's date
    startHour: "",
    startMinute: "",
    startPeriod: "AM",
    endHour: "",
    endMinute: "",
    endPeriod: "AM",
  });

  const unavailableSlots = useUnavailableSlots(
    spot.spotID,
    reservationData.date
  );

  const handleChange = (e) => {
    setReservationData({
      ...reservationData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReservationSubmit = (event) => {
    event.preventDefault();

    // Place the validation and submission logic here
    // (Same as previously implemented)

    // Ensure all time fields are filled
    const {
      userID,
      date,
      startHour,
      startMinute,
      startPeriod,
      endHour,
      endMinute,
      endPeriod,
    } = reservationData;

    if (
      !userID ||
      !date ||
      !startHour ||
      !startMinute ||
      !endHour ||
      !endMinute
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Convert 12-hour format to 24-hour format
    const convertTo24Hour = (hour, period) => {
      let hourInt = parseInt(hour, 10);
      if (period === "PM" && hourInt !== 12) {
        hourInt += 12;
      }
      if (period === "AM" && hourInt === 12) {
        hourInt = 0;
      }
      return String(hourInt).padStart(2, "0");
    };

    const startHour24 = convertTo24Hour(startHour, startPeriod);
    const endHour24 = convertTo24Hour(endHour, endPeriod);

    // Combine date and times into datetime strings
    const startTimeStr = `${startHour24}:${startMinute}`;
    const endTimeStr = `${endHour24}:${endMinute}`;
    const startDateTimeStr = `${date} ${startTimeStr}`;
    const endDateTimeStr = `${date} ${endTimeStr}`;

    // Parse the datetime strings into Date objects
    const startDateTime = new Date(`${date}T${startTimeStr}:00`);
    const endDateTime = new Date(`${date}T${endTimeStr}:00`);

    // Validation logic (overlaps, duration, etc.)

    // Check if end time is after start time
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time.");
      return;
    }

    // Check if the duration exceeds 8 hours
    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    if (durationHours > 8) {
      alert("Reservation cannot exceed 8 hours.");
      return;
    }

    // Check for overlapping reservations
    const isTimeAvailable = (start, end) => {
      for (let slot of unavailableSlots) {
        const slotStart = new Date(`${date}T${slot.startTime}:00`);
        const slotEnd = new Date(`${date}T${slot.endTime}:00`);

        if (end > slotStart && start < slotEnd) {
          return false; // Overlaps with an unavailable slot
        }
      }
      return true; // Does not overlap
    };

    if (!isTimeAvailable(startDateTime, endDateTime)) {
      alert("Selected time overlaps with an existing reservation.");
      return;
    }

    // Submit the reservation
    const data = {
      userID,
      spotID: spot.spotID,
      startTime: startDateTimeStr,
      endTime: endDateTimeStr,
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
          alert("Spot reserved successfully");
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

  return (
    <div>
      <h3>Reserve Spot {spot.spotID}</h3>
      <form onSubmit={handleReservationSubmit}>
        <UserSelector
          users={users}
          userID={reservationData.userID}
          onChange={handleChange}
        />
        <br />
        <DateSelector date={reservationData.date} onChange={handleChange} />
        <br />
        <UnavailableTimes unavailableSlots={unavailableSlots} />
        <TimeSelector
          label="Start Time:"
          hourName="startHour"
          minuteName="startMinute"
          periodName="startPeriod"
          hourValue={reservationData.startHour}
          minuteValue={reservationData.startMinute}
          periodValue={reservationData.startPeriod}
          onChange={handleChange}
        />
        <br />
        <TimeSelector
          label="End Time:"
          hourName="endHour"
          minuteName="endMinute"
          periodName="endPeriod"
          hourValue={reservationData.endHour}
          minuteValue={reservationData.endMinute}
          periodValue={reservationData.endPeriod}
          onChange={handleChange}
        />
        <br />
        <button type="submit">Reserve Spot</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default ReservationForm;
