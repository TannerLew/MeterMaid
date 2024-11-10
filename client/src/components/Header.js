import React, { useState } from "react";
import "./Header.css";

function Header({ firstName, onLogout, reservations, onCancelReservation }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownClick = () => {
    setShowDropdown((prev) => !prev);
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
            <div className="dropdown">
              <button onClick={handleDropdownClick} className="dropdown-button">
                Reservations ▼
              </button>
              <div
                className={`dropdown-menu reservations-dropdown ${
                  showDropdown ? "is-open" : ""
                }`}
              >
                {reservations.length > 0 ? (
                  <table className="reservations-table">
                    <thead>
                      <tr>
                        <th>Spot #</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((res) => (
                        <tr key={res.reservationID}>
                          <td>{res.spotID}</td>
                          <td>{formatDate(res.startTime)}</td>
                          <td>
                            {formatTime(res.startTime)} -{" "}
                            {formatTime(res.endTime)}
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                onCancelReservation(res.reservationID)
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
                  <div className="no-reservations">No active reservations.</div>
                )}
              </div>
            </div>
            <button onClick={onLogout} className="btn-logout">
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
