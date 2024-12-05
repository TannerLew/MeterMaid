import React, { useState } from "react";
import "./Header.css";

function Header({
  firstName,
  onLogout,
  reservations,
  onCancelReservation,
  cars,
  onAddCar,
  onDeleteCar,
}) {
  const [showReservationsDropdown, setShowReservationsDropdown] = useState(false);
  const [showCarsDropdown, setShowCarsDropdown] = useState(false);

  const handleReservationsDropdownClick = () => {
    setShowReservationsDropdown((prev) => !prev);
    setShowCarsDropdown(false);
  };

  const handleCarsDropdownClick = () => {
    setShowCarsDropdown((prev) => !prev);
    setShowReservationsDropdown(false);
  };

  // Helper functions to format date and time
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

  const handleDeleteCar = (carID) => {
    // Show confirmation dialog before deleting
    const confirmed = window.confirm(
      "Are you sure you want to delete this car? This will also delete all reservations related to it."
    );

    if (confirmed) {
      fetch(`http://localhost:5000/delete_car/${carID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            alert(data.message);
            onDeleteCar(carID); // Notify parent to refresh cars and reservations
          }
        })
        .catch((error) => {
          console.error("Error deleting car:", error);
          alert("An error occurred while deleting the car.");
        });
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {firstName ? <span>Welcome, {firstName}</span> : <span>&nbsp;</span>}
      </div>
      <div className="header-center">
        <h1>MeterMaid</h1>
      </div>
      <div className="header-right">
        {firstName && (
          <>
            {/* Reservations Dropdown */}
            <div className="dropdown">
              <button
                onClick={handleReservationsDropdownClick}
                className="dropdown-button"
                aria-haspopup="true"
                aria-expanded={showReservationsDropdown}
              >
                &#128665; Reservations
              </button>
              <div
                className={`dropdown-menu reservations-dropdown ${
                  showReservationsDropdown ? "is-open" : ""
                }`}
                role="menu"
              >
                {reservations.length > 0 ? (
                  <table className="reservations-table">
                    <thead>
                      <tr>
                        <th>Spot #</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Cancel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((res) => (
                        <tr key={res.reservationID}>
                          <td>{res.spotID}</td>
                          <td>{formatDate(res.startTime)}</td>
                          <td>
                            {formatTime(res.startTime)} - {formatTime(res.endTime)}
                          </td>
                          <td>
                            <button
                              onClick={() => onCancelReservation(res.reservationID)}
                              className="btn-cancel-reservation"
                              aria-label={`Cancel reservation at spot ${res.spotID}`}
                            >
                              &#10060; Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-reservations">No active reservations.</div>
                )}
              </div>
            </div>

            {/* Cars Dropdown */}
            <div className="dropdown">
              <button
                onClick={handleCarsDropdownClick}
                className="dropdown-button"
                aria-haspopup="true"
                aria-expanded={showCarsDropdown}
              >
                &#128663; My Cars
              </button>
              <div
                className={`dropdown-menu cars-dropdown ${
                  showCarsDropdown ? "is-open" : ""
                }`}
                role="menu"
              >
                {cars.length > 0 ? (
                  <>
                    <table className="cars-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Make</th>
                          <th>Model</th>
                          <th>License Plate</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cars.map((car) => (
                          <tr key={car.carID}>
                            <td>{car.year}</td>
                            <td>{car.make}</td>
                            <td>{car.model}</td>
                            <td>{car.licensePlate}</td>
                            <td>
                              <button
                                onClick={() => handleDeleteCar(car.carID)}
                                className="btn-delete-car"
                                aria-label={`Delete car ${car.make} ${car.model}`}
                              >
                                &#128465; Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div className="no-cars">No cars added.</div>
                )}
                <button onClick={onAddCar} className="btn-add-car">
                  &#10010; Add Car
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button onClick={onLogout} className="btn-logout" aria-label="Logout">
              &#128682; Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
