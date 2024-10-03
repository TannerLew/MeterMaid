import React, { useState, useEffect } from "react";

function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mNumber, setMNumber] = useState("");
  const [users, setUsers] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [reservationData, setReservationData] = useState({
    userID: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [showReservationForm, setShowReservationForm] = useState(false);

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

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      firstName,
      lastName,
      mNumber,
    };

    fetch("http://localhost:5000/add_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          alert("User added successfully");
          // Reset the form
          setFirstName("");
          setLastName("");
          setMNumber("");
          // Refresh the users list
          fetchUsers();
        } else {
          alert("Failed to add user");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred");
      });
  };

  const handleSpotClick = (spot) => {
    if (spot.status !== "Available") {
      alert("This spot is not available for reservation.");
      return;
    }
    setSelectedSpot(spot);
    setShowReservationForm(true);
  };

  const handleReservationSubmit = (event) => {
    event.preventDefault();

    const { userID, date, startTime, endTime } = reservationData;

    // Combine date and times into datetime strings
    const startDateTimeStr = `${date} ${startTime}`;
    const endDateTimeStr = `${date} ${endTime}`;

    // Convert strings to Date objects for validation
    const startDateTime = new Date(startDateTimeStr);
    const endDateTime = new Date(endDateTimeStr);

    // Check if end time is after start time
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time.");
      return;
    }

    // Check if the duration is more than 8 hours
    const duration = (endDateTime - startDateTime) / (1000 * 60 * 60); // duration in hours
    if (duration > 8) {
      alert("Reservation cannot exceed 8 hours.");
      return;
    }

    const data = {
      userID,
      spotID: selectedSpot.spotID,
      startTime: startDateTimeStr,
      endTime: endDateTimeStr,
    };

    fetch("http://localhost:5000/reserve_spot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          alert("Spot reserved successfully");
          // Reset the form
          setReservationData({
            userID: "",
            date: "",
            startTime: "",
            endTime: "",
          });
          setShowReservationForm(false);
          // Refresh the parking spots
          fetchParkingSpots();
        } else {
          response.json().then((data) => {
            alert(data.message || "Failed to reserve spot");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred");
      });
  };

  return (
    <div>
      <h1>Add User</h1>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <label>
          First Name:
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Last Name:
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          M Number:
          <input
            type="text"
            value={mNumber}
            onChange={(e) => setMNumber(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Add User</button>
      </form>

      <h2>All Users</h2>
      {/* Display users in a table */}
      <table border="1">
        <thead>
          <tr>
            <th>UserID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>M Number</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userID}>
              <td>{user.userID}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.mNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Parking Spots</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {parkingSpots.map((spot) => (
          <div
            key={spot.spotID}
            onClick={() => handleSpotClick(spot)}
            style={{
              width: "100px",
              height: "100px",
              margin: "10px",
              backgroundColor:
                spot.status === "Available"
                  ? "green"
                  : spot.status === "Reserved"
                  ? "orange"
                  : "red",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: spot.status === "Available" ? "pointer" : "not-allowed",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div>{`Spot ${spot.spotID}`}</div>
              <div>{spot.status}</div>
            </div>
          </div>
        ))}
      </div>

      {showReservationForm && (
        <div>
          <h3>Reserve Spot {selectedSpot.spotID}</h3>
          <form onSubmit={handleReservationSubmit}>
            <label>
              User:
              <select
                value={reservationData.userID}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    userID: e.target.value,
                  })
                }
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.userID} value={user.userID}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <label>
              Date:
              <input
                type="date"
                value={reservationData.date}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    date: e.target.value,
                  })
                }
                required
              />
            </label>
            <br />
            <label>
              Start Time:
              <input
                type="time"
                value={reservationData.startTime}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    startTime: e.target.value,
                  })
                }
                required
              />
            </label>
            <br />
            <label>
              End Time:
              <input
                type="time"
                value={reservationData.endTime}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    endTime: e.target.value,
                  })
                }
                required
              />
            </label>
            <br />
            <button type="submit">Reserve Spot</button>
            <button type="button" onClick={() => setShowReservationForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
