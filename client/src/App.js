import React, { useState, useEffect, useCallback } from "react";
import UserForm from "./components/UserForm";
import LoginForm from "./components/LoginForm";
import ParkingSpots from "./components/ParkingSpots";
import ReservationForm from "./components/ReservationForm";
import UserReservations from "./components/UserReservations";
import Header from "./components/Header";
import "./App.css"; // Import the CSS file

function App() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date
  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loggedInUserID, setLoggedInUserID] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [currentPage, setCurrentPage] = useState("login");
  const [reservationsUpdated, setReservationsUpdated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today); // Set today's date as default

  // Fetch parking spots availability based on the selected date
  const fetchParkingSpots = useCallback(() => {
    fetch(`http://localhost:5000/parking_spots?date=${selectedDate}`)
      .then((response) => response.json())
      .then((data) => {
        setParkingSpots(data);
      })
      .catch((error) => console.error("Error fetching parking spots:", error));
  }, [selectedDate]);
  

  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]); 

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
  };

  const handleReservationSuccess = () => {
    setReservationsUpdated((prev) => !prev); // Toggle to trigger refresh
    setSelectedSpot(null);
    fetchParkingSpots(); // Refresh spots to update their status
  };

  const handleLogin = (userID, userFirstName) => {
    setLoggedInUserID(userID);
    setFirstName(userFirstName);
    setCurrentPage("reservations");
  };

  const handleLogout = () => {
    setLoggedInUserID(null);
    setFirstName("");
    setCurrentPage("login");
    alert("Logged out successfully");
  };

  const handleGoToRegister = () => {
    setCurrentPage("register");
  };

  const handleBackToLogin = () => {
    setCurrentPage("login");
  };

  return (
    <div>
      <Header firstName={firstName} onLogout={handleLogout} />
      {currentPage === "login" && (
        <LoginForm onLogin={handleLogin} onGoToRegister={handleGoToRegister} />
      )}
      {currentPage === "register" && (
        <UserForm onBackToLogin={handleBackToLogin} />
      )}
      {currentPage === "reservations" && loggedInUserID && (
        <div>
          <UserReservations
            userID={loggedInUserID}
            reservationsUpdated={reservationsUpdated}
          />
          <div className="date-selection-container">
            <h2>Choose Your Reservation Date :</h2>
            <input
              type="date"
              id="reservation-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="date-input"
              required
            />
          </div>
          <ParkingSpots
            parkingSpots={parkingSpots}
            handleSpotClick={handleSpotClick}
            selectedDate={selectedDate} // Pass selectedDate to ParkingSpots
          />
          {selectedSpot && selectedDate && (
            <ReservationForm
              spot={selectedSpot}
              userID={loggedInUserID}
              onSuccess={handleReservationSuccess}
              onCancel={() => setSelectedSpot(null)}
              selectedDate={selectedDate}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
