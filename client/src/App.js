// App.js
import React, { useState, useEffect } from "react";

function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mNumber, setMNumber] = useState("");
  const [users, setUsers] = useState([]); // State variable to hold users

  // Fetch users from the backend
  const fetchUsers = () => {
    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data); // Update the users state
      })
      .catch((error) => console.error("Error fetching users:", error));
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
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
    </div>
  );
}

export default App;
