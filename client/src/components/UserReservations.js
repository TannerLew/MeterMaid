import React, { useState, useEffect, useCallback } from "react";
import "./UserReservations.css"; // Import the CSS file

function UserReservations({ userID, reservationsUpdated }) { // Add reservationsUpdated as a prop
  const [reservations, setReservations] = useState([]);

  // Memoize fetchReservations using useCallback
  const fetchReservations = useCallback(() => {
    fetch(`http://localhost:5000/user_reservations/${userID}`)
      .then((response) => response.json())
      .then((data) => {
        setReservations(data);
      })
      .catch((error) => {
        console.error("Error fetching reservations:", error);
      });
  }, [userID]); // Include userID as a dependency

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations, reservationsUpdated]); // Add reservationsUpdated to the dependency array

  const handleCancelReservation = (reservationID) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
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

  return (
    <div className="reservations-container">
      <h2>My Reservations</h2>
      {reservations.length > 0 ? (
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Spot ID</th>
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
                <td>{res.startTime}</td>
                <td>{res.endTime}</td>
                <td>{res.status}</td>
                <td>
                  <button
                    onClick={() => handleCancelReservation(res.reservationID)}
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
