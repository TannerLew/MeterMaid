// UserReservations.js

import React, { useState, useEffect, useCallback } from "react";
import "./UserReservations.css";

function UserReservations({ userID, reservationsUpdated, onClose }) {
  const [reservations, setReservations] = useState([]);

  // Auto-cancel function to cancel past reservations
  const autoCancelReservation = useCallback(
    (reservationID) => {
      fetch("http://localhost:5000/cancel_reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationID, userID }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(`Reservation ${reservationID} automatically canceled.`);
        })
        .catch((error) => {
          console.error(
            `Error canceling reservation ${reservationID}:`,
            error
          );
        });
    },
    [userID]
  ); // Add userID as a dependency to avoid stale references

  // Memoize fetchReservations using useCallback
  const fetchReservations = useCallback(() => {
    fetch(`http://localhost:5000/user_reservations/${userID}`)
      .then((response) => response.json())
      .then((data) => {
        const now = new Date();

        // Filter expired reservations and send cancellation for each
        const activeReservations = data.filter((res) => {
          const endTime = new Date(res.endTime);
          if (endTime < now) {
            autoCancelReservation(res.reservationID); // Auto-cancel past reservations
            return false; // Filter out expired reservations from display
          }
          return true;
        });

        setReservations(activeReservations);
      })
      .catch((error) => {
        console.error("Error fetching reservations:", error);
      });
  }, [userID, autoCancelReservation]); // Include autoCancelReservation in the dependency array

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations, reservationsUpdated]); // Add reservationsUpdated to the dependency array

  const handleCancelReservation = (reservationID) => {
    if (
      window.confirm("Are you sure you want to cancel this reservation?")
    ) {
      fetch("http://localhost:5000/cancel_reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationID, userID }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          fetchReservations(); // Refresh the list
        })
        .catch((error) => {
          console.error("Error canceling reservation:", error);
        });
    }
  };

  const formatDate = (dateTime) => {
    const dateObj = new Date(dateTime);
    return dateObj.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (dateTime) => {
    const dateObj = new Date(dateTime);
    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
      <div className="reservations-container">
        <div className="reservations-header">
          <h2>My Reservations</h2>
          <button onClick={onClose} className="close-reservations-button">
            X
          </button>
        </div>
        {reservations.length > 0 ? (
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Reservation ID</th>
                <th>Spot ID</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Cancel</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.reservationID}>
                  <td>{res.reservationID}</td>
                  <td>{res.spotID}</td>
                  <td>{formatDate(res.startTime)}</td>
                  <td>{formatTime(res.startTime)}</td>
                  <td>{formatTime(res.endTime)}</td>
                  <td>{res.status}</td>
                  <td>
                    <button
                      onClick={() =>
                        handleCancelReservation(res.reservationID)
                      }
                      className="btn-cancel-reservation"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have no active reservations.</p>
        )}
      </div>
  );
}

export default UserReservations;
