import React, { useState, useEffect } from "react";
import UserForm from "./components/UserForm";
import UsersList from "./components/UsersList";
import ParkingSpots from "./components/ParkingSpots";
import ReservationForm from "./components/ReservationForm";

function App() {
  const [users, setUsers] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);

  // Fetch users from the backend
  const fetchUsers = () => {
    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => console.error("Error fetching users:", error));
  };

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
    fetchUsers();
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

  return (
    <div>
      <UserForm fetchUsers={fetchUsers} />
      <UsersList users={users} />
      <ParkingSpots
        parkingSpots={parkingSpots}
        handleSpotClick={handleSpotClick}
      />
      {selectedSpot && (
        <ReservationForm
          spot={selectedSpot}
          users={users}
          onSuccess={handleReservationSuccess}
          onCancel={() => setSelectedSpot(null)}
        />
      )}
    </div>
  );
}

export default App;
