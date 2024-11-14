import React, { useState, useEffect, useCallback } from "react";
import UserForm from "./components/UserForm";
import LoginForm from "./components/LoginForm";
import ParkingSpots from "./components/ParkingSpots";
import ReservationForm from "./components/ReservationForm";
import Header from "./components/Header";
import "./App.css";

// Function to get today's date in 'YYYY-MM-DD' format in local time
// This avoids issues with UTC and local date differences
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function App() {
  const today = getTodayDate(); // Get today's date
  console.log(`Today's Date coming from app: ${today}`);

  // State variables for the app
  const [parkingSpots, setParkingSpots] = useState([]); // List of parking spots
  const [selectedSpot, setSelectedSpot] = useState(null); // Currently selected parking spot
  const [loggedInUserID, setLoggedInUserID] = useState(null); // ID of the logged-in user
  const [firstName, setFirstName] = useState(""); // First name of the logged-in user
  const [currentPage, setCurrentPage] = useState("login"); // Current page (login, register, or reservations)
  const [reservationsUpdated, setReservationsUpdated] = useState(false); // Triggers updates to reservations
  const [selectedDate, setSelectedDate] = useState(today); // Date selected for viewing or making reservations
  const [userReservations, setUserReservations] = useState([]); // Reservations of the logged-in user

  // Fetch parking spot availability for the selected date
  const fetchParkingSpots = useCallback(() => {
    fetch(`http://localhost:5000/parking_spots?date=${selectedDate}`)
      .then((response) => response.json())
      .then((data) => {
        setParkingSpots(data); // Update parking spots with fetched data
      })
      .catch((error) => console.error("Error fetching parking spots:", error));
  }, [selectedDate]);

  // Fetch parking spots each time the selected date changes
  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots, reservationsUpdated]);

  // Function to cancel a reservation, wrapped in useCallback for memoization
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
          // Toggle reservationsUpdated to trigger re-fetch
          setReservationsUpdated((prev) => !prev);
        })
        .catch((error) => {
          console.error(`Error canceling reservation ${reservationID}:`, error);
        });
    },
    [loggedInUserID]
  );

  // Fetch reservations for the logged-in user
  const fetchUserReservations = useCallback(() => {
    if (!loggedInUserID) return; // Exit if no user is logged in

    fetch(`http://localhost:5000/user_reservations/${loggedInUserID}`)
      .then((response) => response.json())
      .then((data) => {
        const now = new Date();

        // Filter active reservations, auto-cancel expired ones
        const activeReservations = data.filter((res) => {
          const endTime = new Date(res.endTime);
          if (endTime < now) {
            cancelReservation(res.reservationID); // Auto-cancel expired reservation
            return false;
          }
          return true;
        });

        setUserReservations(activeReservations); // Update active reservations list
      })
      .catch((error) => {
        console.error("Error fetching reservations:", error);
      });
  }, [loggedInUserID, cancelReservation]); // Include cancelReservation in dependencies

  // Fetch user reservations when they log in or reservations are updated
  useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations, reservationsUpdated]);

  // Set the selected parking spot when clicked
  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
  };

  // Handle a successful reservation by refreshing parking spots and reservations
  const handleReservationSuccess = () => {
    setReservationsUpdated((prev) => !prev); // Trigger reservations update
    setSelectedSpot(null); // Clear selected spot
    fetchParkingSpots(); // Refresh parking spot availability
  };

  // Set user data on login and switch to reservations page
  const handleLogin = (userID, userFirstName) => {
    setLoggedInUserID(userID);
    setFirstName(userFirstName);
    setCurrentPage("reservations");
    setReservationsUpdated((prev) => !prev); // Trigger initial reservations fetch
  };

  // Handle logout by clearing user data and resetting to login page
  const handleLogout = () => {
    setLoggedInUserID(null);
    setFirstName("");
    setCurrentPage("login");
    setUserReservations([]);
    alert("Logged out successfully");
  };

  // Navigate to registration page
  const handleGoToRegister = () => {
    setCurrentPage("register");
  };

  // Navigate back to login page from registration page
  const handleBackToLogin = () => {
    setCurrentPage("login");
  };

  // Confirm and cancel a reservation
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
         />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
