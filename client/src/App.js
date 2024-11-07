// App.js

import React, { useState, useEffect } from "react";
import UserForm from "./components/UserForm";
import LoginForm from "./components/LoginForm";
import ParkingSpots from "./components/ParkingSpots";
import ReservationForm from "./components/ReservationForm";
import UserReservations from "./components/UserReservations";
import Header from "./components/Header"; // Import the Header component

function App() {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loggedInUserID, setLoggedInUserID] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [currentPage, setCurrentPage] = useState("login"); // Manage current page

  // Fetch parking spots from the backend
  const fetchParkingSpots = () => {
    fetch("http://localhost:5000/parking_spots")
      .then((response) => response.json())
      .then((data) => {
        setParkingSpots(data);
      })
      .catch((error) => console.error("Error fetching parking spots:", error));
  };

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
  };

  const handleReservationSuccess = () => {
    // Refresh parking spots and reset selected spot
    fetchParkingSpots();
    setSelectedSpot(null);
  };

  const handleLogin = (userID, userFirstName) => {
    setLoggedInUserID(userID);
    setFirstName(userFirstName);
    setCurrentPage("reservations"); // Navigate to reservations page after login
  };

  const handleLogout = () => {
    setLoggedInUserID(null);
    setFirstName("");
    setCurrentPage("login"); // Navigate back to login page after logout
    alert("Logged out successfully");
  };

  const handleGoToRegister = () => {
    setCurrentPage("register"); // Navigate to registration page
  };

  const handleBackToLogin = () => {
    setCurrentPage("login"); // Navigate back to login page
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
          <UserReservations userID={loggedInUserID} />
          <ParkingSpots
            parkingSpots={parkingSpots}
            handleSpotClick={handleSpotClick}
          />
          {selectedSpot && (
            <ReservationForm
              spot={selectedSpot}
              userID={loggedInUserID}
              onSuccess={handleReservationSuccess}
              onCancel={() => setSelectedSpot(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
