// UserForm.js

import React, { useState } from "react";
import "./UserForm.css"; // Import the CSS file

function UserForm({ onBackToLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mNumber, setMNumber] = useState("");
  const [password, setPassword] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // Track registration status

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      firstName,
      lastName,
      mNumber,
      password,
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
          setPassword("");
          setRegistrationSuccess(true); // Set registration success
        } else {
          response.json().then((data) => {
            alert(data.message || "Failed to add user");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred");
      });
  };

  if (registrationSuccess) {
    return (
      <div className="register-container">
        <h1>Registration Successful</h1>
        <p>Your account has been created successfully.</p>
        <button onClick={onBackToLogin} className="btn-back-to-login">
          Back to Login
        </button>
      </div>
    );
  }

  return (
      <div className="register-container">
        <h1>Register User</h1>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Enter your first name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Enter your last name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="mNumber">M Number:</label>
            <input
              type="text"
              id="mNumber"
              value={mNumber}
              onChange={(e) => setMNumber(e.target.value)}
              required
              placeholder="Enter your M Number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label> {/* Password input for registration */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
          </div>
          <button type="submit" className="btn-register">
            Register
          </button>
        </form>
        <button onClick={onBackToLogin} className="btn-back-to-login">
          Back to Login
        </button>
    </div>
  );
}

export default UserForm;
