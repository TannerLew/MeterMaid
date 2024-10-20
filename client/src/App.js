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
  };

  const handleLogout = () => {
    setLoggedInUserID(null);
    setFirstName("");
    alert("Logged out successfully");
  };

  return (
    <div>
      <Header firstName={firstName} onLogout={handleLogout} />
      {loggedInUserID ? (
        <div>
          {/* Remove the welcome message and logout button here */}
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
      ) : (
        <div>
          <LoginForm onLogin={handleLogin} />
          <UserForm />
        </div>
      )}
    </div>
  );
}

export default App;
