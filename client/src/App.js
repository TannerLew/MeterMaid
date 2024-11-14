import React, { useState, useEffect, useCallback } from "react";
import UserForm from "./components/UserForm";
import LoginForm from "./components/LoginForm";
import ParkingSpots from "./components/ParkingSpots";
import ReservationForm from "./components/ReservationForm";
import Header from "./components/Header";
import "./App.css";

// Function to get today's date in 'YYYY-MM-DD' format in local time
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function App() {
  const today = getTodayDate();
  console.log(`Today's Date coming from app: ${today}`);

  // State variables
  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loggedInUserID, setLoggedInUserID] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [currentPage, setCurrentPage] = useState("login");
  const [reservationsUpdated, setReservationsUpdated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [userReservations, setUserReservations] = useState([]);

  // Fetch parking spots availability
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
  }, [fetchParkingSpots, reservationsUpdated]); // Added reservationsUpdated

  // Cancel reservation function
  const cancelReservation = useCallback(
    (reservationID) => {
      fetch("http://localhost:5000/cancel_reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationID, userID: loggedInUserID }),
      })
        .then((response) => response.json())
        .then(() => {
          console.log(`Reservation ${reservationID} canceled.`);
          setReservationsUpdated((prev) => !prev);
        })
        .catch((error) => {
          console.error(`Error canceling reservation ${reservationID}:`, error);
        });
    },
    [loggedInUserID]
  );

  // Fetch user reservations
  const fetchUserReservations = useCallback(() => {
    if (!loggedInUserID) return;

    fetch(`http://localhost:5000/user_reservations/${loggedInUserID}`)
      .then((response) => response.json())
      .then((data) => {
        const now = new Date();

        // Filter active reservations
        const activeReservations = data.filter((res) => {
          const endTime = new Date(res.endTime);
          return endTime > now;
        });

        setUserReservations(activeReservations);
      })
      .catch((error) => {
        console.error("Error fetching reservations:", error);
      });
  }, [loggedInUserID]);

  useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations, reservationsUpdated]); // Added reservationsUpdated

  // Handle spot click
  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
  };

  // Handle reservation success
  const handleReservationSuccess = () => {
    setReservationsUpdated((prev) => !prev);
    setSelectedSpot(null);
    fetchParkingSpots();
  };

  // Handle login
  const handleLogin = (userID, userFirstName) => {
    setLoggedInUserID(userID);
    setFirstName(userFirstName);
    setCurrentPage("reservations");
    setReservationsUpdated((prev) => !prev);
  };

  // Handle logout
  const handleLogout = () => {
    setLoggedInUserID(null);
    setFirstName("");
    setCurrentPage("login");
    setUserReservations([]);
    alert("Logged out successfully");
  };

  // Navigation handlers
  const handleGoToRegister = () => {
    setCurrentPage("register");
  };

  const handleBackToLogin = () => {
    setCurrentPage("login");
  };

  // Cancel reservation handler
  const handleCancelReservation = (reservationID) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      cancelReservation(reservationID);
    }
  };

  return (
    <div>
      <Header
        firstName={firstName}
        onLogout={handleLogout}
        reservations={userReservations}
        onCancelReservation={handleCancelReservation}
      />
      {currentPage === "login" && (
        <LoginForm onLogin={handleLogin} onGoToRegister={handleGoToRegister} />
      )}
      {currentPage === "register" && (
        <UserForm onBackToLogin={handleBackToLogin} />
      )}
      {currentPage === "reservations" && loggedInUserID && (
        <div>
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
              onKeyDown={(e) => e.preventDefault()}
            />
          </div>
          <ParkingSpots
            parkingSpots={parkingSpots}
            handleSpotClick={handleSpotClick}
            selectedDate={selectedDate}
          />
          {selectedSpot && selectedDate && (
            <ReservationForm
              spot={selectedSpot}
              userID={loggedInUserID}
              onSuccess={handleReservationSuccess}
              onCancel={() => setSelectedSpot(null)}
              selectedDate={selectedDate}
              reservationsUpdated={reservationsUpdated}
              activeReservationsCount={userReservations.length} // Pass active reservations count
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
